/**
 * HTTP security settings shared by the API (helmet) and the frontend host (same CSP, see
 * frontend/vercel.json): one place that says what the app is allowed to load.
 *
 * The app loads: its own JS/CSS, Google Fonts (CSS from fonts.googleapis.com, files from
 * fonts.gstatic.com), book covers from Open Library (redirected to *.archive.org) or any HTTPS URL
 * staff paste, avatars and uploaded covers from the API origin, and calls the API origin.
 */
const rateLimit = require('express-rate-limit');

const csv = (value) => (value || '').split(',').map((v) => v.trim()).filter(Boolean);

// The origin(s) the frontend calls for /api and loads /uploads from
const apiOrigins = () => {
  const explicit = csv(process.env.CSP_API_ORIGINS);
  if (explicit.length) return explicit;
  const port = process.env.PORT || 5001;
  return [`http://localhost:${port}`, `http://127.0.0.1:${port}`];
};

/** Content-Security-Policy directives for the app (helmet format) */
const cspDirectives = ({ api = apiOrigins(), production = process.env.NODE_ENV === 'production' } = {}) => ({
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'"],
  // React and framer-motion set style attributes; Google Fonts serves the font CSS
  styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
  imgSrc: ["'self'", 'data:', 'blob:', 'https:', ...api],
  connectSrc: ["'self'", ...api],
  mediaSrc: ["'self'", 'blob:'],
  workerSrc: ["'self'", 'blob:'],
  objectSrc: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"],
  frameAncestors: ["'none'"],
  // Only over HTTPS: in development the API is plain http://localhost
  upgradeInsecureRequests: production ? [] : null,
});

/** The same policy as a header value (for static hosts and tests) */
const cspHeader = (options) => Object.entries(cspDirectives(options))
  .filter(([, values]) => values !== null)
  .map(([key, values]) => [key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`), ...values].join(' ').trim())
  .join('; ');

/** helmet() options for the API */
const helmetOptions = () => ({
  contentSecurityPolicy: { useDefaults: false, directives: cspDirectives() },
  // The frontend runs on another origin and shows /uploads images: allow cross-origin reads of them
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
});

const tooMany = (message) => (req, res) => res.status(429).json({ success: false, message });
const minutes = (n) => n * 60 * 1000;
// Limits can be raised for load tests: e.g. RATE_LIMIT_LOGIN=100 (requests per window)
const limit = (name, fallback) => Number(process.env[`RATE_LIMIT_${name}`]) || fallback;

/**
 * Rate limits for the endpoints attackers hammer (per client IP; behind a proxy set TRUST_PROXY).
 * Login counts only failed attempts.
 */
const rateLimiters = () => ({
  login: rateLimit({
    windowMs: minutes(15), limit: limit('LOGIN', 10), skipSuccessfulRequests: true,
    standardHeaders: 'draft-7', legacyHeaders: false,
    handler: tooMany('Too many login attempts. Try again in 15 minutes.'),
  }),
  signup: rateLimit({
    windowMs: minutes(60), limit: limit('SIGNUP', 10),
    standardHeaders: 'draft-7', legacyHeaders: false,
    handler: tooMany('Too many sign-ups from this network. Try again later.'),
  }),
  passwordChange: rateLimit({
    windowMs: minutes(15), limit: limit('PASSWORD_CHANGE', 5),
    standardHeaders: 'draft-7', legacyHeaders: false,
    handler: tooMany('Too many password change attempts. Try again in 15 minutes.'),
  }),
  forgotPassword: rateLimit({
    windowMs: minutes(15), limit: limit('FORGOT_PASSWORD', 5),
    standardHeaders: 'draft-7', legacyHeaders: false,
    handler: tooMany('Too many password reset requests. Try again in 15 minutes.'),
  }),
  // Entering the emailed code (each code also allows only 5 guesses)
  resetPassword: rateLimit({
    windowMs: minutes(15), limit: limit('RESET_PASSWORD', 10),
    standardHeaders: 'draft-7', legacyHeaders: false,
    handler: tooMany('Too many attempts. Try again in 15 minutes.'),
  }),
  // One-click demo sign-in (demo instance only); every click counts
  demoLogin: rateLimit({
    windowMs: minutes(15), limit: limit('DEMO_LOGIN', 30),
    standardHeaders: 'draft-7', legacyHeaders: false,
    handler: tooMany('Too many demo sign-ins from this network. Try again in 15 minutes.'),
  }),
});

/**
 * Write requests (anything but GET/HEAD/OPTIONS) per demo account, not per IP: visitors share the
 * demo accounts, so this caps what one account can change in 15 minutes. Used by protect().
 * The limit is read per request (RATE_LIMIT_DEMO_WRITES), so tests can lower it.
 */
const demoWriteLimiter = () => rateLimit({
  windowMs: minutes(15),
  limit: () => limit('DEMO_WRITES', 60),
  keyGenerator: (req) => `demo-user:${req.user._id}`,
  standardHeaders: 'draft-7', legacyHeaders: false,
  handler: tooMany('Too many changes from this demo account. Try again in 15 minutes.'),
});

module.exports = { cspDirectives, cspHeader, helmetOptions, rateLimiters, demoWriteLimiter, apiOrigins };
