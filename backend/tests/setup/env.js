// Runs before every test file: a known environment, never the developer's backend/.env
const { testDbUri } = require('./testDb');

const { uri } = testDbUri();
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = uri;
process.env.MONGO_URI = uri;
process.env.JWT_SECRET = 'jest-only-secret-not-used-anywhere-else';
process.env.JWT_EXPIRE = '1h';
process.env.REMINDERS_ENABLED = 'false';
process.env.CORS_ORIGINS = 'http://localhost:3000';
// The AI service is off unless a test turns it on (recommendations.test.js runs a fake one)
delete process.env.AI_SERVICE_URL;
delete process.env.AI_SERVICE_TOKEN;
delete process.env.TRUST_PROXY;
process.env.AI_RETRAIN_DEBOUNCE_MS = '100';
