/**
 * Build-time settings for the two Vercel sites (the full app and the live demo).
 *  VITE_DEMO_MODE=true      this build is the live demo: it never shows the password form, even
 *                           while the demo API is asleep
 *  VITE_FULL_APP_URL        demo site: where "Sign in / Create your own account" goes
 *  VITE_DEMO_APP_URL        full app: where /demo goes
 */
const url = (value) => (typeof value === 'string' ? value.trim().replace(/\/+$/, '') : '');

export const IS_DEMO_BUILD = String(import.meta.env.VITE_DEMO_MODE || '').trim().toLowerCase() === 'true';
export const FULL_APP_URL = url(import.meta.env.VITE_FULL_APP_URL);
export const DEMO_APP_URL = url(import.meta.env.VITE_DEMO_APP_URL);

/** The full app's sign-in page, or '' when VITE_FULL_APP_URL is not set */
export const fullAppLoginUrl = () => (FULL_APP_URL ? `${FULL_APP_URL}/login` : '');
