/**
 * The test database: MONGODB_URI_TEST, and only if the database name ends in "_test"
 * (so a test run can never touch a real database).
 */
const testDbUri = () => {
  const uri = (process.env.MONGODB_URI_TEST || '').trim();
  if (!uri) {
    throw new Error('Set MONGODB_URI_TEST to a throwaway database, e.g. mongodb://127.0.0.1:27017/libverse_jest_test');
  }
  let name;
  try {
    name = new URL(uri).pathname.replace(/^\//, '');
  } catch (e) {
    throw new Error('MONGODB_URI_TEST is not a valid MongoDB URI');
  }
  if (!/_test$/.test(name)) {
    throw new Error(`Refusing to run tests: the database name in MONGODB_URI_TEST must end in "_test" (got "${name || '(none)'}")`);
  }
  return { uri, name };
};

module.exports = { testDbUri };
