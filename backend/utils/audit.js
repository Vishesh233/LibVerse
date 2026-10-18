const AuditLog = require('../models/AuditLog');

const EMAIL_PATTERN = /[^\s@<>"'(),;:]+@[^\s@<>"'(),;:]+\.[A-Za-z]{2,}/g;
const BLOCKED_META_KEYS = /^(email|password|token|screenshot|paymentScreenshot)$/i;
const MAX_META_JSON = 2000;

/** Short, single-line summary with anything that looks like an email removed */
const cleanSummary = (text) =>
  String(text || '')
    .replace(EMAIL_PATTERN, '[email hidden]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300);

/** Flat copy of meta without sensitive keys; dropped when it would be large */
const cleanMeta = (meta) => {
  if (!meta || typeof meta !== 'object') return undefined;
  const out = {};
  for (const [key, value] of Object.entries(meta)) {
    if (BLOCKED_META_KEYS.test(key) || value === undefined) continue;
    out[key] = typeof value === 'string' ? cleanSummary(value) : value;
  }
  if (!Object.keys(out).length) return undefined;
  try {
    return JSON.stringify(out).length <= MAX_META_JSON ? out : undefined;
  } catch {
    return undefined;
  }
};

/**
 * Record a staff action. Never throws and never blocks the action it describes:
 * a failed write is logged and ignored.
 * @param {Object} req - Express request (req.user is the actor)
 * @param {String} action - one of AuditLog.AUDIT_ACTIONS
 * @param {{ type: String, id?: * }} target - e.g. { type: 'Transaction', id }
 * @param {String} summary - short text, e.g. 'Approved issue of "Dune" for Asha K'
 * @param {Object} [meta] - small details (amounts, changed fields)
 * @returns {Promise<Object|null>} the entry, or null when it could not be written
 */
const audit = async (req, action, target, summary, meta) => {
  try {
    const actor = req?.user;
    if (!actor?._id) return null;
    return await AuditLog.create({
      actorId: actor._id,
      actorRole: actor.role,
      action,
      targetType: target?.type || 'System',
      targetId: target?.id || undefined,
      summary: cleanSummary(summary) || action,
      meta: cleanMeta(meta),
    });
  } catch (error) {
    console.error(`Audit log write failed (${action}):`, error.message);
    return null;
  }
};

/** "Asha K (LIB-1234)" for audit summaries: name and library ID only, never the email */
const personLabel = (user) => {
  if (!user) return 'a student';
  const name = user.name || 'a user';
  return user.libraryId ? `${name} (${user.libraryId})` : name;
};

module.exports = { audit, personLabel, cleanSummary };
