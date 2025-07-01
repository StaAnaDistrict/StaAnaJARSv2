const express = require('express');
const router = express.Router();
const { withConnection } = require('../db');

// GET all recognitions
router.get('/', async (req, res) => {
  try {
    const { researcher_id } = req.query;
    let query = `
      SELECT r.*, rp.last_name, rp.first_name, rp.middle_name
      FROM recognitions r
      JOIN researchers_profile rp ON r.profile_id = rp.profile_id
    `;
    const queryParams = [];
    if (researcher_id) {
      query += ' WHERE r.profile_id = ?';
      queryParams.push(researcher_id);
    }
    query += ' ORDER BY r.year_received DESC';
    
    const [rows] = await withConnection(async (connection) => {
      return await connection.execute(query, queryParams);
    });
    res.json(rows);
  } catch (error) {
    console.error('Error fetching recognitions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET recognition by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await withConnection(async (connection) => {
      return await connection.execute(
        'SELECT * FROM recognitions WHERE recognition_id = ?',
        [req.params.id]
      );
    });

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Recognition not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching recognition:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST new recognition
router.post('/', async (req, res) => {
  try {
    const { profile_id, recognition_title, awarding_body, year_received, description } = req.body;

    if (!profile_id || !recognition_title || !awarding_body || !year_received) {
      return res.status(400).json({ 
        error: 'Profile ID, recognition title, awarding body, and year are required' 
      });
    }

    await withConnection(async (connection) => {
      const [result] = await connection.execute(
        `INSERT INTO recognitions 
         (profile_id, recognition_name, awarding_body, year_received, details) 
         VALUES (?, ?, ?, ?, ?)`,
        [profile_id, recognition_title, awarding_body, year_received, description || null]
      );

      res.status(201).json({
        message: 'Recognition added successfully',
        recognition_id: result.insertId
      });
    });
  } catch (error) {
    console.error('Error adding recognition:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update recognition
router.put('/:id', async (req, res) => {
  try {
    const { recognition_title, awarding_body, year_received, description } = req.body;

    await withConnection(async (connection) => {
      const [existing] = await connection.execute(
        'SELECT * FROM recognitions WHERE recognition_id = ?',
        [req.params.id]
      );

      if (existing.length === 0) {
        return res.status(404).json({ error: 'Recognition not found' });
      }

      await connection.execute(
        `UPDATE recognitions SET 
         recognition_name = ?, awarding_body = ?, year_received = ?, details = ?
         WHERE recognition_id = ?`,
        [recognition_title, awarding_body, year_received, description || null, req.params.id]
      );

      res.json({ message: 'Recognition updated successfully' });
    });
  } catch (error) {
    console.error('Error updating recognition:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE recognition
router.delete('/:id', async (req, res) => {
  try {
    await withConnection(async (connection) => {
      const [existing] = await connection.execute(
        'SELECT * FROM recognitions WHERE recognition_id = ?',
        [req.params.id]
      );

      if (existing.length === 0) {
        return res.status(404).json({ error: 'Recognition not found' });
      }

      await connection.execute(
        'DELETE FROM recognitions WHERE recognition_id = ?',
        [req.params.id]
      );

      res.json({ message: 'Recognition deleted successfully' });
    });
  } catch (error) {
    console.error('Error deleting recognition:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 