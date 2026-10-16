const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorMiddleware = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// JWT_SECRET is required - refuse to start without it (value is never logged)
if (!process.env.JWT_SECRET || !process.env.JWT_SECRET.trim()) {
  console.error('FATAL: JWT_SECRET environment variable is missing or empty. Set it in backend/.env before starting the server.');
  process.exit(1);
}

// Connect to database
connectDB();

const app = express();

// Middleware - body limit fits a ~3 MB base64 payment screenshot (book covers and avatars use multipart uploads)
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// CORS allowlist: CORS_ORIGINS (comma-separated), defaulting to the local Vite dev server.
// Requests without an Origin header (curl, server-to-server) are allowed.
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Not an error: the browser simply gets no Access-Control-Allow-Origin header and blocks the response
      return callback(null, false);
    },
  })
);

// Routes
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const fineRoutes = require('./routes/fineRoutes');
const adminRoutes = require('./routes/adminRoutes');
const profileRoutes = require('./routes/profileRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/wishlist', wishlistRoutes);

app.use('/uploads', express.static('uploads'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend server is running' });
});

// Error handling middleware
app.use(errorMiddleware);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
