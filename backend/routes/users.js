const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { withConnection } = require('../db');

// GET all users
router.get('/', async (req, res) => {
  try {
    const [rows] = await withConnection(async (connection) => {
      return await connection.execute(
        'SELECT user_id, username, role, email, is_active, created_at FROM users ORDER BY username'
      );
    });
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET user by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await withConnection(async (connection) => {
      return await connection.execute(
        'SELECT user_id, username, role, email, is_active FROM users WHERE user_id = ?',
        [req.params.id]
      );
    });

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST new user (registration)
router.post('/', async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username and password are required' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user as administrator (all registrations are admin except the main JARS_Admin)
    await withConnection(async (connection) => {
      await connection.execute(
        'INSERT INTO users (username, password_hash, role, email, is_active) VALUES (?, ?, ?, ?, ?)',
        [username, hashedPassword, 'admin', email || null, false]
      );
    });

    res.status(201).json({ 
      message: 'User registered successfully. Pending admin approval.' 
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update user
router.put('/:id', async (req, res) => {
  try {
    const { username, password, role, email, is_active } = req.body;

    await withConnection(async (connection) => {
      // Check if user exists
      const [existing] = await connection.execute(
        'SELECT * FROM users WHERE user_id = ?',
        [req.params.id]
      );

      if (existing.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Prepare update data
      let updateQuery = 'UPDATE users SET username = ?, role = ?, email = ?, is_active = ?';
      let queryParams = [username, role, email || null, is_active];

      // Include password update if provided
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateQuery += ', password_hash = ?';
        queryParams.push(hashedPassword);
      }

      updateQuery += ' WHERE user_id = ?';
      queryParams.push(req.params.id);

      await connection.execute(updateQuery, queryParams);

      res.json({ message: 'User updated successfully' });
    });
  } catch (error) {
    console.error('Error updating user:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Username already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// PUT approve user
router.put('/:id/approve', async (req, res) => {
  try {
    await withConnection(async (connection) => {
      // Check if user exists
      const [existing] = await connection.execute(
        'SELECT * FROM users WHERE user_id = ?',
        [req.params.id]
      );

      if (existing.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      await connection.execute(
        'UPDATE users SET is_active = TRUE WHERE user_id = ?',
        [req.params.id]
      );

      res.json({ message: 'User approved successfully' });
    });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT reject user
router.put('/:id/reject', async (req, res) => {
  try {
    await withConnection(async (connection) => {
      // Check if user exists
      const [existing] = await connection.execute(
        'SELECT * FROM users WHERE user_id = ?',
        [req.params.id]
      );

      if (existing.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Delete the user instead of just marking as inactive
      await connection.execute(
        'DELETE FROM users WHERE user_id = ?',
        [req.params.id]
      );

      res.json({ message: 'User rejected and deleted successfully' });
    });
  } catch (error) {
    console.error('Error rejecting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE user
router.delete('/:id', async (req, res) => {
  try {
    await withConnection(async (connection) => {
      // Check if user exists
      const [existing] = await connection.execute(
        'SELECT * FROM users WHERE user_id = ?',
        [req.params.id]
      );

      if (existing.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Prevent deletion of admin user
      if (existing[0].username === 'JARS_Admin') {
        return res.status(400).json({ error: 'Cannot delete the main administrator account' });
      }

      await connection.execute(
        'DELETE FROM users WHERE user_id = ?',
        [req.params.id]
      );

      res.json({ message: 'User deleted successfully' });
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 