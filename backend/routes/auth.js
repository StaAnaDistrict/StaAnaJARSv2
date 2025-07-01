const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { withConnection } = require('../db');
require('dotenv').config({ path: '../config.env' });

const router = express.Router();

// Track if initialization has been attempted and completed
let initializationAttempted = false;
let initializationComplete = false;

// Initialize users table if it doesn't exist
async function initializeUsersTable() {
  if (initializationAttempted) {
    console.log('⚠️ Users table initialization already attempted, skipping...');
    return;
  }
  initializationAttempted = true;
  try {
    await withConnection(async (connection) => {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS users (
          user_id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE,
          role ENUM('admin', 'editor', 'viewer') DEFAULT 'viewer',
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      // Check if admin user exists, if not create default admin
      const [existingAdmin] = await connection.execute(
        'SELECT * FROM users WHERE username = ?',
        ['JARS_Admin']
      );
      if (existingAdmin.length === 0) {
        const hashedPassword = await bcrypt.hash('StaAnaJars2025', 12);
        await connection.execute(
          'INSERT INTO users (username, password_hash, email, role) VALUES (?, ?, ?, ?)',
          ['JARS_Admin', hashedPassword, 'admin@staana-jars.com', 'admin']
        );
        console.log('✅ Default admin user created');
      } else {
        console.log('✅ Admin user already exists');
      }
      initializationComplete = true;
    });
  } catch (error) {
    console.error('Error initializing users table:', error);
    // Do not throw error to prevent server crash or pool block
  }
}

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user still exists and is active
    const [users] = await withConnection(async (connection) => {
      return await connection.execute(
        'SELECT user_id, username, role FROM users WHERE user_id = ? AND is_active = TRUE',
        [decoded.userId]
      );
    });

    if (users.length === 0) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    // Find user by username
    const [users] = await withConnection(async (connection) => {
      return await connection.execute(
        'SELECT * FROM users WHERE username = ? AND is_active = TRUE',
        [username]
      );
    });
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = users[0];
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.user_id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/register (admin only)
router.post('/register', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { username, password, email, role = 'viewer' } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check if username already exists
    const [existingUsers] = await withConnection(async (connection) => {
      return await connection.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
    });

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert new user
    const [result] = await withConnection(async (connection) => {
      return await connection.execute(
        'INSERT INTO users (username, password_hash, email, role) VALUES (?, ?, ?, ?)',
        [username, hashedPassword, email, role]
      );
    });

    res.status(201).json({
      message: 'User created successfully',
      userId: result.insertId
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await withConnection(async (connection) => {
      return await connection.execute(
        'SELECT user_id, username, email, role, created_at FROM users WHERE user_id = ?',
        [req.user.user_id]
      );
    });

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: users[0]
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  // JWT tokens are stateless, so we just return success
  // In a production environment, you might want to implement a token blacklist
  res.json({ message: 'Logout successful' });
});

// PUT /api/auth/change-password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }

    // Get current user with password hash
    const [users] = await withConnection(async (connection) => {
      return await connection.execute(
        'SELECT password_hash FROM users WHERE user_id = ?',
        [req.user.user_id]
      );
    });

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await withConnection(async (connection) => {
      await connection.execute(
        'UPDATE users SET password_hash = ? WHERE user_id = ?',
        [hashedNewPassword, req.user.user_id]
      );
    });

    res.json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a protected admin endpoint to initialize the users table manually
router.post('/admin/init-db', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await initializeUsersTable();
    res.json({ message: 'Users table initialization attempted.' });
  } catch (error) {
    res.status(500).json({ error: 'Initialization failed.' });
  }
});

module.exports = { router, authenticateToken, requireAdmin }; 