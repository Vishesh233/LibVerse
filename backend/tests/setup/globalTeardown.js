// Once per run: leave nothing behind
const mongoose = require('mongoose');
const { testDbUri } = require('./testDb');

module.exports = async () => {
  const { uri, name } = testDbUri();
  const conn = await mongoose.createConnection(uri, { serverSelectionTimeoutMS: 5000 }).asPromise();
  if (conn.db.databaseName === name) await conn.dropDatabase();
  await conn.close();
};
