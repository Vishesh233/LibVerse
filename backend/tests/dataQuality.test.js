// Catalogue data quality: the description/ISBN/year clean-up script (idempotent) and the API
// storing ISBNs as digits with a single publicationYear field
const mongoose = require('mongoose');
const { as, connect, disconnect, reset, makeUser, makeBook } = require('./helpers');
const Book = require('../models/Book');
const { run, planFor } = require('../scripts/applyDescriptionRewrite');

let lib;
beforeAll(connect);
afterAll(disconnect);
beforeEach(async () => {
  await reset();
  lib = await makeUser('librarian');
});

const books = () => mongoose.connection.db.collection('books');
// Older documents as they are stored (publishedYear is no longer in the schema)
const legacy = async (extra) => {
  const doc = {
    title: 'Legacy Book', author: 'Old Author', genre: 'Fiction', isbn: '978-0-306-40615-7',
    description: 'Copied blurb.', publishedYear: 1999, totalCopies: 1, availableCopies: 1, issuedCopies: 0, heldCopies: 0, isActive: true, ...extra,
  };
  // undefined = leave the field out (the driver would store null)
  Object.keys(doc).forEach((k) => doc[k] === undefined && delete doc[k]);
  const { insertedId } = await books().insertOne(doc);
  return insertedId;
};

describe('applyDescriptionRewrite', () => {
  test('plan: description, digits-only ISBN, year merged into publicationYear, publishedYear removed', () => {
    expect(planFor({ description: 'New.', isbn: '978-0306406157' }, { description: 'Old.', isbn: '978-0306406157', publishedYear: 1999 }))
      .toEqual({ set: { description: 'New.', isbn: '9780306406157', publicationYear: 1999 }, unset: { publishedYear: '' } });
    expect(planFor({ description: 'Same.', isbn: '9780306406157', publicationYear: 2001 }, { description: 'Same.', isbn: '9780306406157', publicationYear: 2001 })).toBeNull();
  });

  test('dry run writes nothing; apply writes once; a second run changes nothing', async () => {
    const id = await legacy();
    const id2 = await legacy({ title: 'Second', isbn: '9781593279929', publishedYear: undefined, publicationYear: 2019, description: 'Old two.' });
    const entries = [
      { _id: String(id), title: 'Legacy Book', author: 'Old Author', isbn: '9780306406157', publicationYear: 1999, description: 'An original description.' },
      { _id: String(id2), title: 'Second', author: 'Old Author', isbn: '9781593279929', publicationYear: 2019, description: 'Another original one.' },
    ];

    const dry = await run(books(), entries);
    expect(dry).toMatchObject({ matched: 2, changed: 2, description: 2, isbn: 1, publicationYear: 1, publishedYearRemoved: 1, skipped: [] });
    expect((await books().findOne({ _id: id })).description).toBe('Copied blurb.');

    const applied = await run(books(), entries, { apply: true });
    expect(applied.changed).toBe(2);
    const doc = await books().findOne({ _id: id });
    expect(doc).toMatchObject({ description: 'An original description.', isbn: '9780306406157', publicationYear: 1999 });
    expect(doc).not.toHaveProperty('publishedYear');

    const again = await run(books(), entries, { apply: true });
    expect(again).toMatchObject({ matched: 2, upToDate: 2, changed: 0 });
  });

  test('skips a renamed book and an unknown id; keeps an ISBN another book already has', async () => {
    const id = await legacy();
    await makeBook({ title: 'Holder', isbn: '9780306406157' });
    const report = await run(books(), [
      { _id: String(id), title: 'Legacy Book', isbn: '978-0306406157', description: 'Fresh text.' },
      { _id: String(id), title: 'Renamed Since', description: 'x' },
      { _id: String(new mongoose.Types.ObjectId()), title: 'Ghost', description: 'x' },
    ], { apply: true });
    expect(report).toMatchObject({ changed: 1, isbn: 0, description: 1 });
    expect(report.skipped).toHaveLength(2);
    expect(report.isbnKept[0]).toMatch(/already belongs to "Holder"/);
    const doc = await books().findOne({ _id: id });
    expect(doc).toMatchObject({ isbn: '978-0-306-40615-7', description: 'Fresh text.' });
  });
});

describe('API', () => {
  const body = (extra) => ({ title: 'Form Book', author: 'Someone', genre: 'Science', totalCopies: 2, ...extra });

  test('a new book: ISBN stored as digits, duplicates found whatever the hyphens', async () => {
    const r = await as(lib).post('/api/books').send(body({ isbn: '978-0-306-40615-7', publicationYear: 2004 }));
    expect(r.status).toBe(201);
    expect(r.body.book).toMatchObject({ isbn: '9780306406157', publicationYear: 2004 });
    expect(r.body.book).not.toHaveProperty('publishedYear');
    const dup = await as(lib).post('/api/books').send(body({ title: 'Other', isbn: '978 0306406157' }));
    expect(dup.status).toBe(400);
  });

  test('publishedYear from older clients becomes publicationYear', async () => {
    const created = await as(lib).post('/api/books').send(body({ isbn: '9781593279929', publishedYear: 2015 }));
    expect(created.body.book.publicationYear).toBe(2015);
    const edited = await as(lib).put(`/api/books/${created.body.book._id}`).send({ publishedYear: 2019, isbn: '978-1-59327-992-9' });
    expect(edited.status).toBe(200);
    expect(edited.body.book).toMatchObject({ publicationYear: 2019, isbn: '9781593279929' });
    const stored = await Book.findById(created.body.book._id).lean();
    expect(stored).not.toHaveProperty('publishedYear');
  });
});
