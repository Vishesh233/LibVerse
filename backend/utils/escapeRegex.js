/**
 * Escape a user-supplied string so it is matched literally inside a RegExp / $regex.
 * Prevents invalid patterns (e.g. "(" -> 500) and regex denial-of-service.
 * @param {String} value
 * @returns {String}
 */
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Read a query/body value as a plain string. Objects and arrays (e.g. ?genre[$ne]=x or
 * ?genre=a&genre=b) are treated as absent, so they can never become Mongo operators.
 * @param {*} value
 * @returns {String|undefined} - Trimmed string, or undefined when absent/empty/not a string
 */
const toQueryString = (value) => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

/**
 * Parse page/limit for list endpoints: page >= 1, 1 <= limit <= max.
 * @param {*} page
 * @param {*} limit
 * @param {Number} defaultLimit
 * @param {Number} max
 * @returns {{ page: Number, limit: Number, skip: Number }}
 */
const toPagination = (page, limit, defaultLimit = 10, max = 100) => {
  const p = Math.max(1, parseInt(toQueryString(page), 10) || 1);
  const l = Math.min(max, Math.max(1, parseInt(toQueryString(limit), 10) || defaultLimit));
  return { page: p, limit: l, skip: (p - 1) * l };
};

module.exports = { escapeRegex, toQueryString, toPagination };
