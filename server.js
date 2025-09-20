const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3000;

// Database pool for sessions
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

// Middleware
app.use(cors({
  origin: `http://localhost:${PORT}`,
  credentials: true
}));
app.use(express.json());

// Session middleware
app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static files
app.use(express.static('.'));

// Import API routes
const loansHandler = require('./api/loans-local.js');
const paymentsHandler = require('./api/payments-local.js');
const authHandler = require('./api/auth-local.js');
const usersHandler = require('./api/users-local.js');
const borrowerSummaryHandler = require('./api/borrower-summary-local.js');

// Authentication middleware
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

function requireUserOrAdmin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Admin has access to everything
  if (req.session.user.role === 'admin') {
    return next();
  }
  
  // Users can only access their own data
  if (req.session.user.role === 'user') {
    // For borrower_summary, filter by their borrower_id
    req.userBorrowerId = req.session.user.username;
  }
  
  next();
}

// API Routes
app.use('/api/auth', (req, res) => authHandler.handler(req, res));
app.use('/api/users', (req, res) => usersHandler.handler(req, res));
app.use('/api/borrower-summary', requireAuth, (req, res) => borrowerSummaryHandler.handler(req, res));

// Protected routes - loans and payments require admin access
app.use('/api/loans', requireAdmin, (req, res) => loansHandler.handler(req, res));
app.use('/api/payments', requireAdmin, (req, res) => paymentsHandler.handler(req, res));

// Serve HTML files with authentication checks
app.get('/', requireAuth, (req, res) => {
  if (req.session.user.role === 'user') {
    // Redirect users to borrower summary
    return res.redirect('/borrower_summary.html');
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/admin.html', requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/newloan.html', requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'newloan.html'));
});

app.get('/analysis.html', requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'analysis.html'));
});

app.get('/weekly.html', requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'weekly.html'));
});

app.get('/borrower_summary.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'borrower_summary.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: 'local-development' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Loan Management System running on http://localhost:${PORT}`);
  console.log(`📊 Database Admin UI available on http://localhost:8080`);
  console.log(`💾 Database: PostgreSQL on localhost:5432`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});