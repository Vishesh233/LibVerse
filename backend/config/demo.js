/**
 * Live demo instance (DEMO_MODE=true): one-click sign-in as the seeded demo accounts, no password
 * login, signup or password reset. Read on every request, so tests can switch it.
 */
const isDemoMode = () => (process.env.DEMO_MODE || '').trim().toLowerCase() === 'true';

const DEMO_DISABLED = 'Disabled in demo mode';

// The JSON body for a blocked action (code lets the frontend tell it apart from other 403s)
const demoDisabledBody = { success: false, code: 'DEMO_MODE', message: DEMO_DISABLED };

module.exports = { isDemoMode, DEMO_DISABLED, demoDisabledBody };
