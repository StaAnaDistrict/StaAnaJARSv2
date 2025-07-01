const express = require('express');
const { pool } = require('../db');
const { authenticateToken, requireAdmin } = require('./auth');
require('dotenv').config({ path: '../config.env' });

const router = express.Router();

// Apply authentication to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/dashboard - Get admin dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    // Get summary statistics
    const stats = {
      totalResearchers: 0,
      totalResearch: 0,
      recentResearch: [],
      recentResearchers: []
    };

    res.json({
      message: 'Admin dashboard data',
      stats,
      user: req.user
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/users - Get all users (admin only)
router.get('/users', async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT user_id, username, email, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );

    res.json({
      users: users.map(user => ({
        ...user,
        password_hash: undefined // Don't send password hashes
      }))
    });
  } catch (error) {
    console.error('Users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/users/:id - Update user status
router.put('/users/:id', async (req, res) => {
  try {
    const { is_active, role } = req.body;
    const userId = req.params.id;

    await pool.execute(
      'UPDATE users SET is_active = ?, role = ? WHERE user_id = ?',
      [is_active, role, userId]
    );

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent deleting the last admin user
    const [admins] = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE role = "admin" AND is_active = TRUE'
    );

    const [userToDelete] = await pool.execute(
      'SELECT role FROM users WHERE user_id = ?',
      [userId]
    );

    if (admins[0].count <= 1 && userToDelete[0]?.role === 'admin') {
      return res.status(400).json({ error: 'Cannot delete the last admin user' });
    }

    await pool.execute('DELETE FROM users WHERE user_id = ?', [userId]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 