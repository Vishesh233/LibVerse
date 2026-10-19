import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, useInView } from 'framer-motion';
import { authAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useDemoMode } from '../hooks/useDemoMode';
import { useEmailCodes } from '../hooks/useEmailCodes';
import { useResendTimer } from '../hooks/useResendTimer';
import { useApiWake } from '../hooks/useApiWake';
import { GoogleSignInButton, useGoogleSignIn } from '../components/GoogleSignInButton';
import { LogoMark } from '../components/LogoMark';
import { CodeField } from '../components/auth/CodeField';
import { VerifyEmailForm } from '../components/auth/VerifyEmailForm';
import { FullAppLink } from '../components/demo/FullAppLink';
import { DemoWakeScreen } from '../components/demo/DemoWakeScreen';

// Generate particles for background
const PARTICLES = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  animationDelay: `${Math.random() * 10}s`,
  animationDuration: `${10 + Math.random() * 10}s`,
  opacity: 0.2 + Math.random() * 0.3
}));

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_SECONDS = 60;

// Live demo instance: one button per role, signed in by the server (no password)
const DEMO_ROLES = [
  { role: 'student', label: 'View as Student', hint: 'Borrow, reserve, pay a fine, see your library card' },
  { role: 'librarian', label: 'View as Librarian', hint: 'Approve requests, run the QR desk, verify payments' },
  { role: 'admin', label: 'View as Admin', hint: 'Dashboards, analytics, reports and the audit log' },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [resetByEmail, setResetByEmail] = useState(false);
  const [demoRole, setDemoRole] = useState(null);
  const demoMode = useDemoMode();
  const googleEnabled = useGoogleSignIn();
  // Email features: "Email me a code" sign-in, and the verify screen for unverified sign-ups
  const emailCodes = useEmailCodes();
  const [method, setMethod] = useState('password'); // 'password' | 'code'
  const [codeSent, setCodeSent] = useState(false);
  const [loginCode, setLoginCode] = useState('');
  const [resendIn, setResendIn] = useResendTimer(0);
  const [verifyEmail, setVerifyEmail] = useState(null); // the email waiting for its sign-up code
  // Demo: the free API may be asleep; after 3 s show the "Waking up" screen and keep checking
  const wake = useApiWake(demoMode === true);

  useEffect(() => {
    authAPI.getPasswordResetStatus().then((r) => setResetByEmail(Boolean(r.data?.enabled))).catch(() => {});
  }, []);

  const navigate = useNavigate();
  const { login } = useAuth();
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true });

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const validate = () => {
    const next = {};
    if (!email.trim()) next.email = 'Enter your email address';
    else if (!EMAIL_RE.test(email.trim())) next.email = 'Enter a valid email address';
    if (method === 'password' && !password) next.password = 'Enter your password';
    if (method === 'code' && codeSent && !/^\d{6}$/.test(loginCode)) next.code = 'Enter the 6-digit code from the email';
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const goHome = (user) => {
    if (user?.role === 'admin') {
      navigate('/admin');
    } else if (user?.role === 'librarian') {
      navigate('/librarian');
    } else if (user?.role === 'student' && !user?.isOnboardingCompleted) {
      navigate('/student/onboarding');
    } else {
      navigate('/student/dashboard');
    }
  };

  // Sign in with Google: an existing account (or a connected student account) signs in; a new
  // Google user becomes a student and goes through onboarding (phone and genres)
  const [googleBusy, setGoogleBusy] = useState(false);
  const handleGoogle = async (credential) => {
    setGoogleBusy(true);
    setError('');
    try {
      const response = await authAPI.googleLogin(credential);
      const { token, user } = response.data;
      login(user, token);
      toast.success(response.data.created ? 'Welcome to LibVerse!' : 'Signed in with Google');
      goHome(user);
    } catch (err) {
      const message = err.response?.data?.message || 'Google sign-in failed. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setGoogleBusy(false);
    }
  };

  const handleDemo = async (role) => {
    setDemoRole(role);
    setError('');
    try {
      const response = await authAPI.demoLogin(role);
      const { token, user } = response.data;
      login(user, token);
      goHome(user);
    } catch (err) {
      const message = err.response?.data?.message || 'Could not open the demo. Try again in a moment.';
      setError(message);
      toast.error(message);
    } finally {
      setDemoRole(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login({ email: email.trim(), password });
      const { token, user } = response.data;
      login(user, token);
      toast.success('Signed in successfully');
      goHome(user);
    } catch (err) {
      // Right password, email not confirmed yet: the code screen (the server has sent a fresh code)
      if (err.response?.status === 403 && err.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        setVerifyEmail(err.response.data.email || email.trim());
        toast.info('Please verify your email');
        return;
      }
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerified = (user, token) => {
    login(user, token);
    toast.success('Email verified. Welcome to LibVerse!');
    goHome(user);
  };

  // "Email me a code": the same answer whether or not the email has an account
  const sendLoginCode = async () => {
    setLoading(true);
    setError('');
    try {
      await authAPI.requestLoginCode(email.trim());
      setCodeSent(true);
      setLoginCode('');
      setResendIn(RESEND_SECONDS);
    } catch (err) {
      const message = err.response?.data?.message || 'The code could not be sent. Try again.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!codeSent) {
      sendLoginCode();
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await authAPI.loginWithCode(email.trim(), loginCode);
      const { token, user } = response.data;
      login(user, token);
      toast.success('Signed in successfully');
      goHome(user);
    } catch (err) {
      const message = err.response?.data?.message || 'Sign-in failed. Try again.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const chooseMethod = (next) => {
    setMethod(next);
    setError('');
    setFieldErrors({});
  };

  return (
    <div className="login-background">
      {/* Animated Background Elements */}
      <div className="login-bg-gradient login-bg-gradient-1" />
      <div className="login-bg-gradient login-bg-gradient-2" />
      <div className="login-bg-gradient login-bg-gradient-3" />
      
      {/* Floating Blobs */}
      <div className="login-blob login-blob-1" />
      <div className="login-blob login-blob-2" />
      <div className="login-blob login-blob-3" />
      
      {/* Light Beams */}
      <div className="login-light-beam login-light-beam-1" />
      <div className="login-light-beam login-light-beam-2" />
      <div className="login-light-beam login-light-beam-3" />
      
      {/* Floating Particles */}
      {PARTICLES.map((particle) => (
        <div
          key={particle.id}
          className="login-particle"
          style={{
            left: particle.left,
            opacity: particle.opacity,
            animationDelay: particle.animationDelay,
            animationDuration: particle.animationDuration
          }}
        />
      ))}

      {/* Live demo: the way to the full app, top-right */}
      {demoMode === true && (
        <div className="fixed right-3 top-3 z-20 sm:right-5 sm:top-5">
          <FullAppLink />
        </div>
      )}

      {/* Main Content: scrolls inside the fixed background, so a tall card is never clipped */}
      <div className="auth-scroll">
      <div className="auth-center">
        <motion.div
          ref={cardRef}
          className="login-card auth-card"
          style={{
            transform: `perspective(1000px) rotateY(${mousePosition.x * 2}deg) rotateX(${-mousePosition.y * 2}deg)`
          }}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Branding Section */}
          <motion.div className="auth-brand text-center" variants={itemVariants}>
            {/* lg on tall screens, md when the viewport is 860px or shorter (CSS picks one) */}
            <div className="auth-logo">
              <LogoMark size="lg" className="auth-logo-lg" />
              <LogoMark size="md" className="auth-logo-md" />
            </div>
            <h1 className="brand-wordmark auth-wordmark font-bold">
              Lib<span className="brand-wordmark-accent">Verse</span>
            </h1>
            <p className="text-sm text-slate-400 tracking-wide">Smart Library Management System</p>
            <p className="auth-tagline text-xs text-muted mt-1 tracking-wider">Read • Borrow • Discover</p>
          </motion.div>

          {/* Welcome Section */}
          {!verifyEmail && (
          <motion.div className="auth-welcome" variants={itemVariants}>
            <h2 className="auth-heading font-display font-bold text-white">{demoMode ? 'Explore LibVerse' : 'Welcome back'}</h2>
            <p className="text-sm text-slate-400">{demoMode ? 'Pick a role. No account or password needed.' : 'Sign in to continue to your portal'}</p>
          </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              role="alert"
              className="mb-4 p-3 bg-rose-500/10 text-rose-200 rounded-xl border border-rose-500/20 text-sm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {error}
            </motion.div>
          )}

          {/* Until the server says which instance this is, show neither the form nor the demo buttons */}
          {demoMode === null && (
            <div className="flex flex-col items-center gap-3 py-8 text-sm text-slate-400" role="status" aria-live="polite">
              <span className="login-spinner" />
              Connecting to the library...
            </div>
          )}

          {/* Live demo, server still asleep after 3 s: the wake-up screen (then "Try again") */}
          {demoMode === true && (wake.state === 'waking' || wake.state === 'failed') && (
            <DemoWakeScreen state={wake.state} elapsed={wake.elapsed} onRetry={wake.retry} />
          )}

          {/* Live demo: only the three role buttons */}
          {demoMode === true && (wake.state === 'checking' || wake.state === 'ready') && (
            <motion.div className="auth-form" variants={itemVariants}>
              {DEMO_ROLES.map(({ role, label, hint }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleDemo(role)}
                  disabled={demoRole !== null}
                  className="login-button"
                  aria-describedby={`demo-hint-${role}`}
                >
                  <span className="flex flex-col items-center gap-0.5">
                    <span className="flex items-center gap-2">
                      {demoRole === role && <span className="login-spinner" />}
                      {demoRole === role ? 'Opening the demo...' : label}
                    </span>
                    <span id={`demo-hint-${role}`} className="text-xs font-normal text-white/75">{hint}</span>
                  </span>
                </button>
              ))}
              <p className="text-center text-sm text-slate-400">This is a demo with sample data. Data resets every 6 hours.</p>
            </motion.div>
          )}

          {/* Sign-up not confirmed yet: enter the emailed code */}
          {demoMode === false && verifyEmail && (
            <VerifyEmailForm
              email={verifyEmail}
              onVerified={handleVerified}
              onBack={() => { setVerifyEmail(null); setPassword(''); }}
              backLabel="Back to sign in"
            />
          )}

          {/* Password or emailed code (the tabs only when the server can send email) */}
          {demoMode === false && !verifyEmail && emailCodes && (
            <div role="tablist" aria-label="Sign-in method" className="mb-4 grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1">
              {[['password', 'Password'], ['code', 'Email code']].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  id={`signin-tab-${key}`}
                  aria-selected={method === key}
                  aria-controls="signin-panel"
                  onClick={() => chooseMethod(key)}
                  className={`min-h-[40px] rounded-lg text-sm font-medium transition-colors ${method === key ? 'bg-indigo-500/25 text-white shadow-inner' : 'text-slate-400 hover:text-white'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Sign in with an emailed code */}
          {demoMode === false && !verifyEmail && emailCodes && method === 'code' && (
            <motion.form id="signin-panel" role="tabpanel" aria-labelledby="signin-tab-code" onSubmit={handleCodeSubmit} noValidate className="auth-form" variants={itemVariants}>
              <div>
                <label htmlFor="code-email" className="field-label">Email address</label>
                <div className="relative">
                  <input
                    type="email"
                    id="code-email"
                    name="email"
                    autoComplete="email"
                    value={email}
                    readOnly={codeSent}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    placeholder="you@example.com"
                    required
                    aria-invalid={fieldErrors.email ? true : undefined}
                    aria-describedby={fieldErrors.email ? 'code-email-error' : undefined}
                    className={`login-input ${codeSent ? 'opacity-70' : ''}`}
                  />
                  <div className="login-input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                </div>
                {fieldErrors.email && <p id="code-email-error" className="field-error">{fieldErrors.email}</p>}
              </div>

              {codeSent ? (
                <>
                  <p className="rounded-xl border border-emerald-400/20 bg-emerald-500/[0.07] p-3 text-sm text-emerald-100" role="status">
                    If an account uses this email, a 6-digit code is on its way. It expires in 10 minutes.
                  </p>
                  <CodeField
                    id="login-code"
                    value={loginCode}
                    onChange={(value) => { setLoginCode(value); if (fieldErrors.code) setFieldErrors((prev) => ({ ...prev, code: undefined })); }}
                    error={fieldErrors.code}
                    autoFocus
                  />
                </>
              ) : (
                <p className="text-sm text-slate-400">We&apos;ll email you a 6-digit code. No password needed.</p>
              )}

              <button type="submit" disabled={loading} className="login-button">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="login-spinner" />
                    {codeSent ? 'Signing in...' : 'Sending...'}
                  </span>
                ) : (codeSent ? 'Sign in' : 'Email me a code')}
              </button>

              {codeSent && (
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <button type="button" className="text-slate-400 hover:text-white" onClick={() => { setCodeSent(false); setLoginCode(''); setError(''); }}>
                    Use another email
                  </button>
                  <button
                    type="button"
                    className="font-medium text-indigo-300 hover:text-white disabled:cursor-not-allowed disabled:text-slate-500"
                    disabled={loading || resendIn > 0}
                    onClick={sendLoginCode}
                  >
                    {resendIn > 0 ? `Resend code in ${resendIn}s` : 'Resend code'}
                  </button>
                </div>
              )}
            </motion.form>
          )}

          {/* Login Form */}
          {demoMode === false && !verifyEmail && (method === 'password' || !emailCodes) && (
          <motion.form
            onSubmit={handleSubmit}
            noValidate
            className="auth-form"
            variants={itemVariants}
            {...(emailCodes ? { id: 'signin-panel', role: 'tabpanel', 'aria-labelledby': 'signin-tab-password' } : {})}
          >
            {/* Email Input */}
            <motion.div variants={itemVariants}>
              <label htmlFor="email" className="field-label">Email address</label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="you@example.com"
                  required
                  aria-invalid={fieldErrors.email ? true : undefined}
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                  className="login-input"
                />
                <div className="login-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
              </div>
              {fieldErrors.email && <p id="email-error" className="field-error">{fieldErrors.email}</p>}
            </motion.div>

            {/* Password Input */}
            <motion.div variants={itemVariants}>
              <label htmlFor="password" className="field-label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="Enter your password"
                  required
                  aria-invalid={fieldErrors.password ? true : undefined}
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                  className="login-input !pr-11"
                />
                <div className="login-input-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="login-password-toggle"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && <p id="password-error" className="field-error">{fieldErrors.password}</p>}
            </motion.div>

            {/* Self-service reset only when the server can send email; otherwise staff reset passwords */}
            <motion.p className="text-sm text-slate-400" variants={itemVariants}>
              {resetByEmail ? (
                <Link to="/forgot-password" state={{ email: email.trim() }} className="font-medium text-indigo-300 transition-colors hover:text-white">
                  Forgot your password?
                </Link>
              ) : (
                'Forgot your password? Ask your librarian or admin to reset it.'
              )}
            </motion.p>

            {/* Login Button */}
            <motion.div variants={itemVariants}>
              <button
                type="submit"
                disabled={loading}
                className="login-button"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="login-spinner" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Access Dashboard
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                )}
              </button>
            </motion.div>
          </motion.form>
          )}

          {/* Other ways in (both sign-in methods) */}
          {demoMode === false && !verifyEmail && (
            <div className="auth-form mt-4">
              {/* Divider */}
              <div className="auth-divider" role="separator">or</div>

              {googleEnabled && <GoogleSignInButton text="signin_with" onCredential={handleGoogle} disabled={googleBusy || loading} />}

              {/* Sign Up Link */}
              <motion.p className="text-center text-sm text-slate-400" variants={itemVariants}>
                New here?{' '}
                <Link to="/signup" className="text-indigo-300 hover:text-white font-medium transition-colors">
                  Create an account
                </Link>
              </motion.p>
            </div>
          )}

          {/* Footer */}
          <motion.div className="auth-footer" variants={itemVariants}>
            <p className="text-xs text-muted text-center">
              Version 1.0 • © 2026 LibVerse
            </p>
          </motion.div>
        </motion.div>
      </div>
      </div>
    </div>
  );
};