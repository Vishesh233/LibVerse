const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// JWT_SECRET is required - refuse to start without it (value is never logged)
if (!process.env.JWT_SECRET || !process.env.JWT_SECRET.trim()) {
  console.error('FATAL: JWT_SECRET environment variable is missing or empty. Set it in backend/.env before starting the server.');
  process.exit(1);
}

const connectDB = require('./config/db');
const app = require('./app');

// Connect to database
connectDB();

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// On start, then hourly: reservation expiry (always) and due-soon / overdue reminders (at most one run per day)
require('./jobs/reminders').startReminderJob();

// Send the catalogue to the AI recommendation service once the database is up (no-op when it is not configured)
require('./services/recommendationService').trainOnStartup();
