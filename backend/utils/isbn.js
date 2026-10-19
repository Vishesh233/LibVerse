/**
 * ISBNs are stored as digits only (an ISBN-10 may end in X): "978-0-13-235088-4" -> "9780132350884".
 */

/** Spaces and hyphens removed, X upper-cased; anything else is left for validation to judge */
const normaliseIsbn = (value) => String(value ?? '').replace(/[\s-]/g, '').toUpperCase();

/** A 13-digit ISBN (978/979) whose check digit is right */
const isIsbn13 = (isbn) => {
  if (!/^97[89]\d{10}$/.test(isbn)) return false;
  const sum = [...isbn.slice(0, 12)].reduce((s, d, i) => s + Number(d) * (i % 2 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10 === Number(isbn[12]);
};

module.exports = { normaliseIsbn, isIsbn13 };
