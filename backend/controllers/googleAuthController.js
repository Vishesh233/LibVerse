/**
 * "Sign in with Google" (production only: off on the demo instance and while GOOGLE_CLIENT_ID is unset).
 *
 * The browser sends the ID token from Google Identity Services ({ credential }); nothing else in
 * the body is read, so a role or isDemo can never be chosen by the client. The Google account is
 * identified by its `sub` (googleId), not by its email.
 *
 * Sign-in:
 *  1. an account already connected to this Google account signs in
 *  2. otherwise a STUDENT account with the same email is connected to it, only if Google says the
 *     email is verified (staff accounts are never connected here: they connect from Settings while
 *     signed in; demo accounts never)
 *  3. otherwise a new student account is created (no password; phone asked during onboarding)
 */
const User = require('../models/User');
const { toPublicUser, signToken } = require('../utils/session');
const { nextLibraryId } = require('../utils/libraryId');
const { isGoogleEnabled, verifyGoogleIdToken } = require('../services/googleAuth');
const { createNotification } = require('./notificationController');

const NAME_MAX = 60;
const FAILED = 'Google sign-in failed. Please try again.';
const UNVERIFIED = 'Your Google account email is not verified. Verify it with Google, or sign in with email and password.';
const STAFF_EMAIL = 'This email belongs to a staff account. Sign in with your password, then connect Google in Settings.';
const DEMO = 'Demo accounts cannot use Google sign-in.';
const DEACTIVATED = 'Account is deactivated';

const notConfigured = (res) => res.status(404).json({ success: false, message: 'Route not found' });

/** The verified payload, or null after answering 401 */
const verified = async (req, res) => {
  try {
    return await verifyGoogleIdToken(req.body?.credential);
  } catch (error) {
    res.status(401).json({ success: false, message: FAILED });
    return null;
  }
};

const nameFrom = (payload, email) => {
  const name = typeof payload.name === 'string' ? payload.name.trim().replace(/\s+/g, ' ') : '';
  const fallback = email.split('@')[0].replace(/[._-]+/g, ' ').trim() || 'Library member';
  return (name.length >= 2 ? name : fallback).slice(0, NAME_MAX);
};

const signedIn = (res, user, status = 200, extra = {}) => res.status(status).json({ success: true, token: signToken(user), user: toPublicUser(user), ...extra });

/**
 * @route GET /api/auth/google
 * @desc Whether Google sign-in is available on this server
 * @access Public
 */
exports.getGoogleStatus = (req, res) => {
  res.status(200).json({ success: true, enabled: isGoogleEnabled() });
};

/**
 * @route POST /api/auth/google
 * @desc Sign in (or sign up as a student) with a Google ID token: { credential }
 * @access Public (rate limited)
 */
exports.googleSignIn = async (req, res) => {
  if (!isGoogleEnabled()) return notConfigured(res);
  const payload = await verified(req, res);
  if (!payload) return undefined;
  if (payload.email_verified !== true || typeof payload.email !== 'string') {
    return res.status(403).json({ success: false, message: UNVERIFIED });
  }
  const email = payload.email.trim().toLowerCase();

  try {
    // 1. Already connected
    const connected = await User.findOne({ googleId: payload.sub });
    if (connected) {
      if (connected.isDemo) return res.status(403).json({ success: false, message: DEMO });
      if (connected.isActive === false) return res.status(403).json({ success: false, message: DEACTIVATED });
      return signedIn(res, connected);
    }

    // 2. An existing account with the same email
    const existing = await User.findOne({ email }).select('+googleId');
    if (existing) {
      if (existing.isDemo) return res.status(403).json({ success: false, message: DEMO });
      if (existing.role !== 'student') return res.status(409).json({ success: false, message: STAFF_EMAIL });
      if (existing.isActive === false) return res.status(403).json({ success: false, message: DEACTIVATED });
      if (existing.googleId) {
        return res.status(409).json({ success: false, message: 'This account is connected to a different Google account.' });
      }
      const linked = await User.findOneAndUpdate(
        { _id: existing._id, googleId: { $exists: false }, isDemo: { $ne: true }, role: 'student' },
        { $set: { googleId: payload.sub, googleLinkedAt: new Date() } },
        { new: true }
      );
      if (!linked) return res.status(409).json({ success: false, message: FAILED });
      await createNotification(linked._id, linked.role, 'PASSWORD_CHANGED', 'Google account connected',
        'Your account is now connected to Google: you can sign in with the Google button. If this was not you, contact the library.').catch(() => null);
      return signedIn(res, linked, 200, { linked: true });
    }

    // 3. A new student (role and flags fixed here, never from the request)
    const user = await User.create({
      name: nameFrom(payload, email),
      email,
      role: 'student',
      isDemo: false,
      googleId: payload.sub,
      googleLinkedAt: new Date(),
      hasPassword: false,
      createdWith: 'google',
      emailVerified: true,
      isOnboardingCompleted: false,
      libraryId: await nextLibraryId(),
    });
    return signedIn(res, user, 201, { created: true });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: FAILED }); // a parallel sign-in won
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: 'This Google account\'s email cannot be used here. Sign up with email and password instead.' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route POST /api/auth/google/link
 * @desc Connect Google to the signed-in account (staff too): { credential, currentPassword }
 * @access Private
 */
exports.linkGoogle = async (req, res) => {
  if (!isGoogleEnabled()) return notConfigured(res);
  try {
    const user = await User.findById(req.user.id).select('+password +googleId');
    if (user.googleId) return res.status(409).json({ success: false, message: 'Your account is already connected to Google.' });
    // A stolen session alone must not be able to add a way in
    if (!(await user.matchPassword(req.body?.currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    const payload = await verified(req, res);
    if (!payload) return undefined;
    if (payload.email_verified !== true) return res.status(403).json({ success: false, message: UNVERIFIED });
    if (await User.exists({ googleId: payload.sub })) {
      return res.status(409).json({ success: false, message: 'That Google account is already connected to another LibVerse account.' });
    }
    const linked = await User.findOneAndUpdate(
      { _id: user._id, googleId: { $exists: false }, isDemo: { $ne: true } },
      { $set: { googleId: payload.sub, googleLinkedAt: new Date() } },
      { new: true }
    );
    if (!linked) return res.status(409).json({ success: false, message: 'Your account is already connected to Google.' });
    await createNotification(linked._id, linked.role, 'PASSWORD_CHANGED', 'Google account connected',
      'You can now sign in with Google. If this was not you, change your password and contact the library.').catch(() => null);
    return res.status(200).json({ success: true, message: 'Google account connected', user: toPublicUser(linked) });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'That Google account is already connected to another LibVerse account.' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route DELETE /api/auth/google/link
 * @desc Disconnect Google: { currentPassword }. Only with a password, so nobody is locked out.
 * @access Private
 */
exports.unlinkGoogle = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password +googleId');
    if (!user.googleId) return res.status(400).json({ success: false, message: 'Your account is not connected to Google.' });
    if (!user.password) {
      return res.status(400).json({ success: false, message: 'Set a password first, so you can still sign in after disconnecting Google.' });
    }
    if (!(await user.matchPassword(req.body?.currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    const updated = await User.findByIdAndUpdate(user._id, { $unset: { googleId: 1, googleLinkedAt: 1 } }, { new: true });
    return res.status(200).json({ success: true, message: 'Google account disconnected', user: toPublicUser(updated) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
