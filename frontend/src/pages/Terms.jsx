import React from 'react';
import { Link } from 'react-router-dom';
import { CONTACT_EMAIL, LegalPage, LegalSection } from '../components/legal/LegalPage';

/** /terms: fair use, the demo and no warranty (public page) */
export const Terms = () => (
  <LegalPage
    title="Terms of Use"
    intro={(
      <>
        LibVerse is a <strong>student portfolio project</strong>, offered free of charge to show how a library
        management system works. By using the app or the demo you agree to these terms. They are short, so please
        read them.
      </>
    )}
  >
    <LegalSection title="Fair use">
      <ul>
        <li>Use LibVerse only for borrowing and managing library books, or to try the app out.</li>
        <li>Keep your sign-in details to yourself, and give your real name and an email address you own.</li>
        <li>Don&apos;t try to break, overload or get around the app&apos;s security, access other people&apos;s accounts, or send spam through it.</li>
        <li>Don&apos;t upload anything illegal, offensive or that you don&apos;t have the right to share (for example in profile photos, reviews or receipts).</li>
      </ul>
      <p>Accounts that break these rules may be deactivated.</p>
    </LegalSection>

    <LegalSection title="The live demo">
      <ul>
        <li>The demo uses shared, fictional accounts and sample data, so other visitors can see what you change there.</li>
        <li><strong>All demo data resets every 6 hours</strong>, and some actions (such as changing passwords or deleting books) are switched off.</li>
        <li>Please don&apos;t enter real personal information in the demo.</li>
      </ul>
    </LegalSection>

    <LegalSection title="No warranty">
      <p>
        LibVerse is provided <strong>&ldquo;as is&rdquo;</strong>, without any warranty. It runs on free hosting, so
        it may be slow to start, unavailable at times, or change or stop without notice. Data could be lost, so
        don&apos;t rely on it as the only record of anything important. As far as the law allows, the author is not
        liable for any loss or damage from using it.
      </p>
    </LegalSection>

    <LegalSection title="Your data">
      <p>
        How LibVerse handles personal data is explained in the <Link to="/privacy">Privacy Policy</Link>.
      </p>
    </LegalSection>

    <LegalSection title="Changes and contact">
      <p>
        These terms may be updated; the &ldquo;Last updated&rdquo; date at the top shows when. Questions:{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </LegalSection>
  </LegalPage>
);
