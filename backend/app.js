/**
 * The Express app: security headers, CORS, body parsing and routes. No database connection,
 * listening or background jobs here (see server.js), so tests can import it directly.
 */
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const { serveFile } = require('./services/fileStore');
const errorMiddleware = require('./middleware/errorMiddleware');
const { helmetOptions } = require('./config/security');

const app = express();

// Behind a reverse proxy (Render, Nginx...) the client IP is in X-Forwarded-For: set TRUST_PROXY
// to the number of proxies (usually 1) so rate limits count real clients, not the proxy
if (process.env.TRUST_PROXY) {
  const hops = Number(process.env.TRUST_PROXY);
  app.set('trust proxy', Number.isInteger(hops) ? hops : process.env.TRUST_PROXY);
}
app.disable('x-powered-by');
app.use(helmet(helmetOptions()));

// Body limit fits a ~3 MB base64 payment screenshot (book covers and avatars use multipart uploads)
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

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/fines', require('./routes/fineRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));

// Uploaded avatars and covers (MongoDB GridFS, long-lived cache)
app.get('/api/files/:id', serveFile);
// Files uploaded by older versions to the local disk (migrated by scripts/migrateUploadsToGridFS.js)
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: '7d' }));

// Health check for the host (Render): 200 only while the database is connected
const DB_STATES = ['disconnected', 'connected', 'connecting', 'disconnecting'];
app.get('/api/health', (req, res) => {
  const db = DB_STATES[mongoose.connection.readyState] || 'unknown';
  res.set('Cache-Control', 'no-store');
  res.status(db === 'connected' ? 200 : 503).json({
    status: db === 'connected' ? 'ok' : 'degraded',
    db,
    uptimeSeconds: Math.round(process.uptime()),
  });
});

// Error handling middleware
app.use(errorMiddleware);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

module.exports = app;
