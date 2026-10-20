import React from 'react';
import { CONTACT_EMAIL, LegalPage, LegalSection } from '../components/legal/LegalPage';

/** /privacy: what LibVerse collects, why, where it lives and how to remove it (public page) */
export const Privacy = () => (
  <LegalPage
    title="Privacy Policy"
    intro={(
      <>
        LibVerse is a <strong>student portfolio project</strong>: a library management system built to
        show how such an app works. It is run by one person, not a company. This page explains in plain
        language what the app stores about you, why, and how to have it removed.
      </>
    )}
  >
    <LegalSection title="What we collect">
      <p>When you use the full app (not the demo), LibVerse stores:</p>
      <ul>
        <li><strong>Account details:</strong> your name, email address and a password (stored only as a one-way hash, never readable).</li>
        <li><strong>Optional details:</strong> a phone number and an address, if you enter them, and a profile photo, if you upload one.</li>
        <li><strong>Library activity:</strong> the books you borrow, request, reserve, review or add to your wishlist, due dates and returns, fines and the payment receipts you upload, your favourite genres and the notifications the app sends you.</li>
        <li><strong>Sign in with Google:</strong> if you use it, Google shares your Google account&apos;s name, email address and profile picture with LibVerse. We keep your name, email and an account ID that links your Google account to LibVerse. We do not save your Google profile picture, and we never see your Google password.</li>
        <li><strong>Security records:</strong> one-time codes we email you (stored only as a hash, deleted after 10 minutes), and a log of staff actions such as approving a loan.</li>
      </ul>
    </LegalSection>

    <LegalSection title="Why we use it">
      <ul>
        <li>To create your account and sign you in, including emailing you verification, sign-in and password reset codes.</li>
        <li>To run the library: lending, returns, reservations, fines, your digital library card and reminders about due dates.</li>
        <li>To suggest books. The recommendation service gets only the IDs of books you have read and your favourite genres, never your name or email.</li>
        <li>So librarians and admins can help you and keep the library&apos;s records correct.</li>
      </ul>
      <p>We do <strong>not</strong> show ads, we do <strong>not</strong> sell or rent your data, and we do not use it for any purpose other than running LibVerse.</p>
    </LegalSection>

    <LegalSection title="Where it is stored">
      <ul>
        <li><strong>MongoDB Atlas</strong> holds the database, including uploaded photos and receipts.</li>
        <li><strong>Render</strong> runs the app&apos;s server and the book recommendation service.</li>
        <li><strong>Vercel</strong> hosts the website you load in your browser.</li>
        <li><strong>Brevo</strong> delivers the emails LibVerse sends (codes and account messages), so it receives your email address and the message.</li>
        <li><strong>Google</strong> handles &ldquo;Sign in with Google&rdquo; when you choose to use it.</li>
      </ul>
      <p>These providers may store data on servers outside your country. Connections to the app use HTTPS.</p>
    </LegalSection>

    <LegalSection title="Cookies and browser storage">
      <p>
        LibVerse does not use advertising or tracking cookies and has no analytics. To keep you signed in, it saves a
        sign-in token and a copy of your basic profile in your browser&apos;s local storage. It also remembers a few
        harmless display settings there (for example, the book covers on the opening screen, the book-list view and
        whether the scan desk&apos;s sounds are muted). Signing out removes the token and your profile copy. If you
        use the &ldquo;Sign in with Google&rdquo; button, Google&apos;s own script may set Google cookies under
        Google&apos;s privacy policy.
      </p>
    </LegalSection>

    <LegalSection title="The live demo">
      <p>
        The demo site uses shared, fictional accounts and sample data. It does not ask for your name, email or
        password, and anything you change there is wiped every 6 hours. Please don&apos;t type real personal
        details into the demo.
      </p>
    </LegalSection>

    <LegalSection title="How long we keep it and how to delete your account">
      <p>
        Your data stays while your account exists. You can change your name, phone, address and photo yourself in
        your profile. To delete your account, ask your library&apos;s admin (they can switch the account off
        straight away), or email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> from the address on the
        account and your personal details will be removed from the database. A record of past loans and fines,
        without your details, may be kept so the library&apos;s stock and accounts stay correct.
      </p>
    </LegalSection>

    <LegalSection title="Contact">
      <p>
        Questions about your data or this policy: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. If this
        page changes, the &ldquo;Last updated&rdquo; date at the top changes too.
      </p>
    </LegalSection>
  </LegalPage>
);
