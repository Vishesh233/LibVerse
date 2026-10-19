/**
 * CSV parsing (RFC 4180 style, no dependencies): comma separated, fields optionally in double
 * quotes, "" inside quotes is a quote, quoted fields may hold commas and line breaks. Accepts
 * CRLF, LF or CR line ends and a UTF-8 byte order mark (Excel).
 */

class CsvError extends Error {}

/**
 * Split CSV text into records of raw string fields.
 * @param {string} text
 * @returns {{ fields: string[], line: number }[]} records with the line each one starts on (1-based)
 * @throws {CsvError} an unterminated quoted field, or text after a closing quote
 */
const parseRecords = (text) => {
  const src = String(text).replace(/^﻿/, '');
  const records = [];
  let fields = [];
  let field = '';
  let line = 1;
  let startLine = 1;
  let i = 0;
  let quoted = false; // inside a quoted field
  let wasQuoted = false; // current field was quoted (only a separator may follow the closing quote)

  const endField = () => { fields.push(field); field = ''; wasQuoted = false; };
  const endRecord = () => {
    endField();
    // Blank lines (one empty field) are skipped
    if (!(fields.length === 1 && fields[0] === '')) records.push({ fields, line: startLine });
    fields = [];
  };

  while (i < src.length) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i += 2; continue; }
        quoted = false; wasQuoted = true; i += 1; continue;
      }
      if (c === '\n' || (c === '\r' && src[i + 1] !== '\n')) line += 1;
      field += c;
      i += 1;
      continue;
    }
    if (c === '"') {
      if (field.trim() !== '' || wasQuoted) throw new CsvError(`Line ${line}: a quote in the middle of a field (wrap the whole field in quotes and double the quote: "")`);
      field = ''; // spaces before the opening quote are ignored
      quoted = true;
      i += 1;
      continue;
    }
    if (c === ',') { endField(); i += 1; continue; }
    if (c === '\r' || c === '\n') {
      endRecord();
      i += c === '\r' && src[i + 1] === '\n' ? 2 : 1;
      line += 1;
      startLine = line;
      continue;
    }
    if (wasQuoted) {
      if (c === ' ' || c === '\t') { i += 1; continue; } // spaces after the closing quote are ignored
      throw new CsvError(`Line ${line}: text after a closing quote`);
    }
    field += c;
    i += 1;
  }
  if (quoted) throw new CsvError(`Line ${startLine}: a quoted field is never closed`);
  if (field !== '' || fields.length || wasQuoted) endRecord();
  return records;
};

/**
 * Parse CSV with a header row into objects keyed by normalised header names
 * (lower case, spaces/underscores/dashes removed: "Publication Year" -> "publicationyear").
 * @param {string} text
 * @returns {{ headers: string[], rows: { line: number, values: Object<string,string> }[] }}
 */
const parseCsv = (text) => {
  const records = parseRecords(text);
  if (!records.length) return { headers: [], rows: [] };
  const headers = records[0].fields.map((h) => h.trim().toLowerCase().replace(/[\s_-]+/g, ''));
  const rows = records.slice(1).map(({ fields, line }) => {
    const values = {};
    headers.forEach((h, idx) => { if (h && values[h] === undefined) values[h] = (fields[idx] ?? '').trim(); });
    return { line, values, extraFields: Math.max(0, fields.length - headers.length) };
  });
  return { headers, rows };
};

module.exports = { parseCsv, parseRecords, CsvError };
