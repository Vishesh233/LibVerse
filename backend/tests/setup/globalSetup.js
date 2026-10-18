// Once per run: check the test database is reachable and start from an empty one
const mongoose = require('mongoose');
const { testDbUri } = require('./testDb');

module.exports = async () => {
  const { uri, name } = testDbUri();
  const conn = await mongoose.createConnection(uri, { serverSelectionTimeoutMS: 5000 }).asPromise();
  if (conn.db.databaseName !== name) throw new Error('Connected to an unexpected database');
  await conn.dropDatabase();
  await conn.close();
};
