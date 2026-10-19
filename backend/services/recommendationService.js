/**
 * Client for the AI recommendation service (ai-service).
 *
 * Enabled only when AI_SERVICE_URL and AI_SERVICE_TOKEN are both set. The service holds just the
 * catalogue: it is trained on server start and again (debounced) after a book is created, edited
 * or deleted. Each recommendation request sends the reader's history with it and waits at most
 * AI_TIMEOUT_MS; any failure is thrown so the caller can fall back to the MongoDB genre logic.
 *
 * AI_CATALOG (optional) names this backend's catalogue in the service, so several backends can
 * share one service without mixing their books (e.g. "demo" and "production").
 */
const axios = require('axios');
const mongoose = require('mongoose');
const Book = require('../models/Book');
const Transaction = require('../models/Transaction');

const AI_TIMEOUT_MS = 1500;
const TRAIN_TIMEOUT_MS = 15000;
const RETRAIN_DEBOUNCE_MS = Number(process.env.AI_RETRAIN_DEBOUNCE_MS) || 5000;
// Loans that count as a borrow (popularity) - requests and rejections do not
const BORROWED_STATUSES = ['issued', 'return_requested', 'payment_pending', 'returned'];

const config = () => {
  const url = (process.env.AI_SERVICE_URL || '').trim().replace(/\/+$/, '');
  const token = (process.env.AI_SERVICE_TOKEN || '').trim();
  const catalog = (process.env.AI_CATALOG || '').trim();
  return url && token ? { url, token, body: catalog ? { catalog } : {} } : null;
};

const isEnabled = () => Boolean(config());

let retrainTimer = null;
let training = null; // the in-flight training promise, so concurrent triggers share one run
let lastState = null; // last logged availability, so a down service is logged once, not per request

const logState = (state, detail) => {
  if (state === lastState) return;
  lastState = state;
  if (state === 'up') console.log('AI recommendations: service available');
  else console.warn(`AI recommendations: using the MongoDB fallback (${detail})`);
};

// Status / network reason without the URL or headers (never logs the token)
const describe = (error) => (error.response ? `HTTP ${error.response.status}` : error.code || error.message);

/** The catalogue as the AI service wants it: active books with text fields and a borrow count */
const catalogue = async () => {
  const [books, borrows] = await Promise.all([
    Book.find({ isActive: true }).select('title author genre description').lean(),
    Transaction.aggregate([
      { $match: { status: { $in: BORROWED_STATUSES } } },
      { $group: { _id: '$bookId', n: { $sum: 1 } } },
    ]),
  ]);
  const borrowsBy = new Map(borrows.map((b) => [String(b._id), b.n]));
  return books.map((b) => ({
    id: String(b._id),
    title: b.title || '',
    author: b.author || '',
    genre: b.genre || '',
    description: b.description || '',
    popularity: borrowsBy.get(String(b._id)) || 0,
  }));
};

/** Send the whole catalogue to the AI service. Resolves to the number of books trained, or 0 when disabled/failed. */
const trainNow = () => {
  const cfg = config();
  if (!cfg) return Promise.resolve(0);
  if (training) return training;
  training = (async () => {
    try {
      const books = await catalogue();
      if (!books.length) return 0;
      const res = await axios.post(`${cfg.url}/api/train`, { books, ...cfg.body }, {
        headers: { 'X-Service-Token': cfg.token },
        timeout: TRAIN_TIMEOUT_MS,
        maxBodyLength: 20 * 1024 * 1024,
      });
      logState('up');
      return res.data?.trained || books.length;
    } catch (error) {
      logState('down', `training failed: ${describe(error)}`);
      return 0;
    } finally {
      training = null;
    }
  })();
  return training;
};

/** Retrain a little later; repeated calls (e.g. several book edits) collapse into one run */
const scheduleRetrain = () => {
  if (!isEnabled()) return;
  clearTimeout(retrainTimer);
  retrainTimer = setTimeout(() => {
    retrainTimer = null;
    trainNow();
  }, RETRAIN_DEBOUNCE_MS);
  retrainTimer.unref?.();
};

// The AI service may start after the backend (or wake up slowly on a free host): retry the first
// training with these waits, then rely on the retrain that a 409 from /api/recommend triggers
const STARTUP_RETRY_MS = [2000, 5000, 15000, 30000, 60000, 120000];

/** Train once the database is connected (server start); never blocks or throws */
const trainOnStartup = () => {
  if (!isEnabled()) {
    logState('off', 'AI_SERVICE_URL / AI_SERVICE_TOKEN not set');
    return;
  }
  const attempt = async (n) => {
    if (await trainNow()) return;
    if (n >= STARTUP_RETRY_MS.length) return;
    const timer = setTimeout(() => attempt(n + 1), STARTUP_RETRY_MS[n]);
    timer.unref?.();
  };
  const go = () => { attempt(0); };
  if (mongoose.connection.readyState === 1) go();
  else mongoose.connection.once('open', go);
};

/**
 * Ranked recommendations from the AI service: [{ id, reason, score, basis }].
 * Throws when the service is unconfigured, slow (> AI_TIMEOUT_MS), untrained or failing.
 */
const recommend = async ({ readIds = [], favouriteGenres = [], excludeIds = [], limit = 6 }) => {
  const cfg = config();
  if (!cfg) throw new Error('AI service not configured');
  try {
    const res = await axios.post(`${cfg.url}/api/recommend`, {
      readIds: readIds.map(String),
      favouriteGenres,
      excludeIds: excludeIds.map(String),
      limit,
      ...cfg.body,
    }, { headers: { 'X-Service-Token': cfg.token }, timeout: AI_TIMEOUT_MS });
    logState('up');
    return Array.isArray(res.data?.recommendations) ? res.data.recommendations : [];
  } catch (error) {
    // 409: the service restarted and lost its catalogue - train it again for the next request
    if (error.response?.status === 409) trainNow();
    logState('down', describe(error));
    throw error;
  }
};

module.exports = { isEnabled, trainNow, scheduleRetrain, trainOnStartup, recommend, AI_TIMEOUT_MS };
