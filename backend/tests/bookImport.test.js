// Bulk CSV book import: the quote-aware parser, row validation, duplicates, the import itself,
// the audit entry and the optional Open Library cover check (fetch is faked: no network)
const { as, api, connect, disconnect, reset, makeUser, makeBook } = require('./helpers');
const Book = require('../models/Book');
const AuditLog = require('../models/AuditLog');
const { parseCsv, parseRecords } = require('../utils/csvParse');
const { isIsbn13 } = require('../services/bookImportService');

/** A valid ISBN-13 from 12 digits (adds the check digit) */
const isbn = (twelve) => {
  const sum = [...twelve].reduce((s, d, i) => s + Number(d) * (i % 2 ? 3 : 1), 0);
  return `${twelve}${(10 - (sum % 10)) % 10}`;
};
const HEADER = 'title,author,genre,isbn,year,publisher,pages,copies,description,location';

let lib;
beforeAll(connect);
afterAll(disconnect);
beforeEach(async () => {
  await reset();
  lib = await makeUser('librarian');
});
afterEach(() => jest.restoreAllMocks());

describe('CSV parser', () => {
  test('quotes, doubled quotes, commas and line breaks inside quotes, CRLF, BOM, blank lines', () => {
    const text = '﻿title,Author , Genre\r\n"Hello, World","Say ""hi""",Fiction\r\n\r\n"Two\nlines",  Plain  ,"x"\n';
    const { headers, rows } = parseCsv(text);
    expect(headers).toEqual(['title', 'author', 'genre']);
    expect(rows).toHaveLength(2);
    expect(rows[0].values).toEqual({ title: 'Hello, World', author: 'Say "hi"', genre: 'Fiction' });
    expect(rows[1].values.title).toBe('Two\nlines');
    expect(rows[1].values.author).toBe('Plain');
    expect(rows[1].line).toBe(4);
  });

  test('empty quoted fields, a last line without a line break, CR-only line ends', () => {
    expect(parseRecords('a,"",c\rd,e,f').map((r) => r.fields)).toEqual([['a', '', 'c'], ['d', 'e', 'f']]);
    expect(parseRecords('"only"').map((r) => r.fields)).toEqual([['only']]);
  });

  test('broken quoting is reported with its line', () => {
    expect(() => parseRecords('a,b\n"never closed,c')).toThrow(/Line 2: a quoted field is never closed/);
    expect(() => parseRecords('a,"b"x,c')).toThrow(/text after a closing quote/);
    expect(() => parseRecords('a,b"c,d')).toThrow(/quote in the middle/);
  });

  test('ISBN-13 check digit', () => {
    expect(isIsbn13('9780306406157')).toBe(true);
    expect(isIsbn13('9780306406158')).toBe(false);
    expect(isIsbn13('0306406152')).toBe(false);
  });
});

describe('preview', () => {
  test('staff only', async () => {
    expect((await api().post('/api/books/import/preview').send({ csv: HEADER })).status).toBe(401);
    expect((await as(await makeUser('student')).post('/api/books/import/preview').send({ csv: HEADER })).status).toBe(403);
    expect((await as(await makeUser('admin')).post('/api/books/import/preview').send({ csv: `${HEADER}\nA,B,Fiction,,,,,,,` })).status).toBe(200);
  });

  test('file-level problems: empty, missing columns, no rows, too many rows, bad quoting', async () => {
    const preview = (csv) => as(lib).post('/api/books/import/preview').send({ csv });
    expect((await preview('')).body.message).toMatch(/empty/);
    expect((await preview({ not: 'text' })).status).toBe(400);
    const missing = await preview('title,isbn\nA,123');
    expect(missing.status).toBe(400);
    expect(missing.body.message).toMatch(/Missing columns: author, genre/);
    expect((await preview(HEADER)).body.message).toMatch(/no books/);
    const many = `title,author,genre\n${Array.from({ length: 1001 }, (_, i) => `T${i},A,Fiction`).join('\n')}`;
    expect((await preview(many)).body.message).toMatch(/at most 1000/);
    expect((await preview('title,author,genre\n"A,B,Fiction')).body.message).toMatch(/could not be read as CSV/);
  });

  test('row validation, duplicates (catalogue and file) and nothing written', async () => {
    const taken = isbn('978030640615');
    await makeBook({ title: 'The Hobbit', author: 'J. R. R. Tolkien', isbn: taken });
    await makeBook({ title: 'Removed Book', author: 'Gone', isActive: false, isbn: isbn('978000000001') });
    const good = isbn('978111111111');
    const rows = [
      `Good Book,Ann Writer,fiction,${good.slice(0, 3)}-${good.slice(3)},2020,Pub,320,3,"A fine, long description",Shelf A-1`, // 2 ready
      'Clean Code 2,Bob,AI and Machine Learning,,,,,,,', // 3 ready (genre alias, copies default 1)
      'Bad Genre,X,Poetry,,,,,,,', // 4
      `Bad ISBN,X,Fiction,${good.slice(0, 12)}0,,,,,,`, // 5 wrong check digit
      'Isbn Ten,X,Fiction,0306406152,,,,,,', // 6 ISBN-10
      ',No Title,Fiction,,3000,,0,0,,', // 7 several errors
      `Other Title,Other Author,Fiction,${taken},,,,,,`, // 8 ISBN taken in catalogue
      'the  hobbit!,j r r tolkien,Fiction,,,,,,,', // 9 same title+author as catalogue
      `Copy Of Good,Someone,Fiction,${good},,,,,,`, // 10 same ISBN as line 2
      'clean code 2,BOB,Programming,,,,,,,', // 11 same title+author as line 3
      'Removed Book,Gone,Fiction,,,,,,,', // 12 removed book still counts
      'Extra,Fields,Fiction,,,,,,,,,surplus', // 13 more values than columns
      "'=Formula Title,Someone,Fiction,,,,,,,", // 14 ready, leading ' removed
    ];
    const before = await Book.countDocuments();
    const r = await as(lib).post('/api/books/import/preview').send({ csv: `${HEADER}\n${rows.join('\n')}` });
    expect(r.status).toBe(200);
    const byLine = Object.fromEntries(r.body.rows.map((row) => [row.line, row]));
    expect(byLine[2]).toMatchObject({ status: 'ready', book: { genre: 'Fiction', isbn: good, publicationYear: 2020, pages: 320, totalCopies: 3, location: 'Shelf A-1' } });
    expect(byLine[3]).toMatchObject({ status: 'ready', book: { genre: 'AI & Machine Learning', totalCopies: 1 } });
    expect(byLine[4].errors).toEqual(['Unknown genre "Poetry"']);
    expect(byLine[5].errors).toEqual(['ISBN must be a valid 13-digit ISBN']);
    expect(byLine[6].errors[0]).toMatch(/ISBN-10/);
    expect(byLine[7].status).toBe('error');
    expect(byLine[7].errors).toEqual(expect.arrayContaining(['Title is required', expect.stringMatching(/Year must be between/), expect.stringMatching(/Pages must be/), expect.stringMatching(/Copies must be/)]));
    expect(byLine[8]).toMatchObject({ status: 'duplicate', errors: ['Same ISBN as "The Hobbit"'] });
    expect(byLine[9].status).toBe('duplicate');
    expect(byLine[9].errors[0]).toMatch(/Already in the catalogue: "The Hobbit"/);
    expect(byLine[10].errors).toEqual(['Same ISBN as line 2 of this file']);
    expect(byLine[11].errors).toEqual(['Same title and author as line 3 of this file']);
    expect(byLine[12].errors[0]).toMatch(/removed from the catalogue/);
    expect(byLine[13].errors[0]).toMatch(/more values than there are columns/);
    expect(byLine[14]).toMatchObject({ status: 'ready', book: { title: '=Formula Title' } });
    expect(r.body.summary).toEqual({ total: 13, ready: 3, errors: 5, duplicates: 5 });
    expect(r.body.columns.found).toEqual(['title', 'author', 'genre', 'isbn', 'year', 'publisher', 'pages', 'copies', 'description', 'location']);
    expect(r.body.genres).toContain('Fiction');
    expect(await Book.countDocuments()).toBe(before);
  });

  test('header aliases and unknown columns', async () => {
    const r = await as(lib).post('/api/books/import/preview')
      .send({ csv: 'Book Title,Authors,Category,Publication Year,Total Copies,Shelf,Notes\nDune,Frank Herbert,Fiction,1965,2,B-4,ignored' });
    expect(r.body.rows[0]).toMatchObject({ status: 'ready', book: { title: 'Dune', author: 'Frank Herbert', publicationYear: 1965, totalCopies: 2, location: 'B-4' } });
    expect(r.body.columns.ignored).toEqual(['notes']);
  });
});

describe('import', () => {
  const csv = () => [
    HEADER,
    `Import One,Writer A,Science,${isbn('978222222222')},2019,Pub,200,4,Desc one,C-1`,
    `Import Two,Writer B,History,${isbn('978333333333')},,,,1,,`,
    'Broken,Writer C,Nope,,,,,,,',
  ].join('\n');

  test('creates the valid rows with stock, writes one audit entry, skips the rest; a second run adds nothing', async () => {
    const r = await as(lib).post('/api/books/import').send({ csv: csv() });
    expect(r.status).toBe(201);
    expect(r.body).toMatchObject({ imported: 2, skipped: 1, copies: 5, covers: null });
    expect(r.body.rows.map((row) => row.status)).toEqual(['imported', 'imported', 'error']);
    const one = await Book.findOne({ title: 'Import One' }).lean();
    expect(one).toMatchObject({ author: 'Writer A', genre: 'Science', totalCopies: 4, availableCopies: 4, issuedCopies: 0, heldCopies: 0, publicationYear: 2019, pages: 200, location: 'C-1', isActive: true });
    expect(String(one._id)).toBe(String(r.body.rows[0].bookId));

    const logs = await AuditLog.find({ action: 'book.import' }).lean();
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({ actorId: lib._id, targetType: 'System', meta: { imported: 2, skipped: 1, copies: 5 } });
    expect(logs[0].summary).toMatch(/Imported 2 books \(5 copies\) from CSV, 1 row skipped/);

    // New books show up in the staff list right away
    expect((await as(lib).get('/api/books?q=Import')).body.total).toBe(2);

    const again = await as(lib).post('/api/books/import').send({ csv: csv() });
    expect(again.status).toBe(200);
    expect(again.body.imported).toBe(0);
    expect(again.body.rows.map((row) => row.status)).toEqual(['duplicate', 'duplicate', 'error']);
    expect(await AuditLog.countDocuments({ action: 'book.import' })).toBe(1);
  });

  test('students cannot import', async () => {
    expect((await as(await makeUser('student')).post('/api/books/import').send({ csv: csv() })).status).toBe(403);
    expect(await Book.countDocuments()).toBe(0);
  });

  test('optional cover check sets imageUrl only where Open Library has a cover', async () => {
    const withCover = isbn('978222222222');
    const calls = [];
    jest.spyOn(global, 'fetch').mockImplementation(async (url, opts) => {
      calls.push({ url: String(url), method: opts?.method });
      return { ok: String(url).includes(withCover) };
    });
    const r = await as(lib).post('/api/books/import').send({ csv: csv(), checkCovers: true });
    expect(r.body.covers).toEqual({ checked: 2, found: 1 });
    expect(calls.every((c) => c.method === 'HEAD' && c.url.startsWith('https://covers.openlibrary.org/b/isbn/') && c.url.endsWith('-M.jpg?default=false'))).toBe(true);
    expect((await Book.findOne({ title: 'Import One' })).imageUrl).toBe(`https://covers.openlibrary.org/b/isbn/${withCover}-M.jpg`);
    expect((await Book.findOne({ title: 'Import Two' })).imageUrl).toBeUndefined();
  });

  test('a cover lookup that fails or times out does not stop the import', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('network down'));
    const r = await as(lib).post('/api/books/import').send({ csv: csv(), checkCovers: true });
    expect(r.body).toMatchObject({ imported: 2, covers: { checked: 2, found: 0 } });
  });
});
