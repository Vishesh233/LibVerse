/**
 * CSV export helpers (no dependencies). Output is RFC 4180 style with CRLF line ends and a
 * UTF-8 byte order mark, so Excel opens it as UTF-8 and shows ₹ correctly.
 */

export const CSV_BOM = '﻿';

// Text that a spreadsheet would run as a formula (=, +, -, @, tab, carriage return)
const FORMULA_START = /^[=+\-@\t\r]/;

/**
 * One CSV cell: empty for null/undefined, numbers as they are, text quoted when it holds a comma,
 * quote, line break or edge spaces (quotes doubled). Text that looks like a formula is prefixed
 * with ' so it is shown, never run.
 * @param {*} value
 * @returns {string}
 */
export const csvCell = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  let text = value instanceof Date ? value.toISOString() : String(value);
  if (FORMULA_START.test(text)) text = `'${text}`;
  if (/[",\r\n]/.test(text) || text !== text.trim()) return `"${text.replace(/"/g, '""')}"`;
  return text;
};

/**
 * Build CSV text (with BOM) from column definitions and rows.
 * @param {{ label: string, value: (row: object) => * }[]} columns
 * @param {object[]} rows
 * @returns {string}
 */
export const toCsv = (columns, rows) => {
  const header = columns.map((c) => csvCell(c.label)).join(',');
  const body = rows.map((row) => columns.map((c) => csvCell(c.value(row))).join(','));
  return CSV_BOM + [header, ...body].join('\r\n') + '\r\n';
};

/**
 * Save CSV text as a file in the browser.
 * @param {string} filename - e.g. 'libverse-loans-2026-01-01-to-2026-10-18.csv'
 * @param {string} csv - from toCsv
 */
export const downloadCsv = (filename, csv) => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
