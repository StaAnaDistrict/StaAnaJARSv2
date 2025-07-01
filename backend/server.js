const express = require('express');
const cors = require('cors');
const path = require('path');
const { pool, testConnection } = require('./db');
require('dotenv').config({ path: './config.env' });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
const researchersRoutes = require('./routes/researchers');
const researchesRoutes = require('./routes/researches');
const { router: authRoutes } = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const recognitionsRoutes = require('./routes/recognitions');
const usersRoutes = require('./routes/users');

app.use('/api/researchers', researchersRoutes);
app.use('/api/researches', researchesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/recognitions', recognitionsRoutes);
app.use('/api/users', usersRoutes);

// Serve static files AFTER API routes
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve static HTML files
app.get('*.html', (req, res) => {
  const filePath = path.join(__dirname, req.path);
  res.sendFile(filePath);
});

// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Dynamic research template routes
app.get('/action-research/school-based/schb-published-template.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'action-research/school-based/schb-published-template.html'));
});

app.get('/action-research/district-based/disb-published-template.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'action-research/district-based/disb-published-template.html'));
});

app.get('/action-research/division-based/divb-published-template.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'action-research/division-based/divb-published-template.html'));
});

app.get('/action-research/berf-grantee/berf-published-template.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'action-research/berf-grantee/berf-published-template.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Static files served from: ${__dirname}`);
  testConnection();
});

module.exports = app; 