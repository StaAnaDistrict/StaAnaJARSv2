const express = require('express');
const multer = require('multer');
const path = require('path');
const { pool, withConnection } = require('../db');
require('dotenv').config({ path: '../config.env' });
const fs = require('fs');

const router = express.Router();

// Simple in-memory cache for researchers
let researchersCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Always save to the frontend directory
    const dir = path.join(__dirname, '../../frontend/researchers/profilepictures');
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile_picture-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Helper function to get cached researchers
async function getCachedResearchers() {
  const now = Date.now();
  
  // Return cache if it's still valid
  if (researchersCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log('📦 Returning cached researchers data');
    return researchersCache;
  }
  
  // Fetch fresh data
  console.log('🔄 Fetching fresh researchers data from database');
  try {
    const [rows] = await withConnection(async (connection) => {
      return await connection.execute('SELECT * FROM researchers_profile ORDER BY last_name, first_name');
    });
    
    // Update cache
    researchersCache = rows;
    cacheTimestamp = now;
    console.log(`✅ Cached ${rows.length} researchers`);
    
    return rows;
  } catch (error) {
    console.error('❌ Error fetching researchers for cache:', error);
    // Return stale cache if available, otherwise throw
    if (researchersCache) {
      console.log('⚠️ Returning stale cache due to database error');
      return researchersCache;
    }
    throw error;
  }
}

// Clear cache when researchers are modified
function clearCache() {
  researchersCache = null;
  cacheTimestamp = null;
  console.log('🗑️ Researchers cache cleared');
}

// GET all researchers with pagination and search, or featured researchers
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', featured } = req.query;
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const offset = (Math.max(1, parseInt(page) || 1) - 1) * limitNum;

    if (featured === '1') {
      // Featured researchers: most published, then by highest research category
      // Category priority: BERF (4), Division-based (3), District-based (2), School-based (1)
      const categoryPriority = `CASE art.type_name
        WHEN 'BERF Grantee' THEN 4
        WHEN 'Division-Based' THEN 3
        WHEN 'District-Based' THEN 2
        WHEN 'School-Based' THEN 1
        ELSE 0 END`;
      const query = `
        SELECT rp.profile_id, rp.first_name, rp.middle_name, rp.last_name, rp.position, rp.profile_picture,
               COUNT(DISTINCT r.research_id) AS research_count,
               MAX(${categoryPriority}) AS max_category_priority
        FROM researchers_profile rp
        LEFT JOIN research_authors ra ON rp.profile_id = ra.profile_id
        LEFT JOIN researches r ON ra.research_id = r.research_id
        LEFT JOIN action_research_types art ON r.action_research_type_id = art.type_id
        GROUP BY rp.profile_id, rp.first_name, rp.middle_name, rp.last_name, rp.position, rp.profile_picture
        ORDER BY research_count DESC, max_category_priority DESC, rp.last_name ASC, rp.first_name ASC
        LIMIT ${limitNum} OFFSET ${offset}`;
      const [rows] = await withConnection(async (connection) => {
        return await connection.execute(query);
      });
      return res.json({ researchers: rows });
    }

    // Default: all researchers with pagination and search
    // Simple query without complex parameters
    let query = 'SELECT profile_id, last_name, first_name, middle_name, email_address, profile_picture, school_affiliation FROM researchers_profile';
    const queryParams = [];

    // Add search functionality
    if (search && search.trim()) {
      query += ' WHERE last_name LIKE ? OR first_name LIKE ? OR email_address LIKE ?';
      const searchTerm = `%${search.trim()}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY last_name, first_name';

    console.log('🔍 Executing simple query:', query);

    const [rows] = await withConnection(async (connection) => {
      return await connection.execute(query, queryParams);
    });

    // Apply pagination in memory
    const total = rows.length;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const researchers = rows.slice(offset, offset + limitNum);

    res.json({
      researchers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching researchers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET researcher by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await withConnection(async (connection) => {
      return await connection.execute(
        'SELECT * FROM researchers_profile WHERE profile_id = ?',
        [req.params.id]
      );
    });
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Researcher not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching researcher:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST new researcher
router.post('/', upload.single('profile_picture'), async (req, res) => {
  try {
    console.log('📝 Adding new researcher...');
    console.log('📊 Request body:', req.body);
    console.log('📁 File:', req.file);

    const {
      lastName,
      firstName,
      middleName,
      position,
      schoolAffiliation,
      schoolAddress,
      emailAddress,
      highestDegree,
      yearsInService
    } = req.body;

    // Validate required fields
    if (!lastName || !firstName || !emailAddress) {
      console.log('❌ Missing required fields:', { lastName, firstName, emailAddress });
      return res.status(400).json({ error: 'Last name, first name, and email are required' });
    }

    // Handle profile picture upload
    let profile_picture = null;
    if (req.file) {
      // Always use the relative path for the frontend
      profile_picture = `researchers/profilepictures/${req.file.filename}`;
    }

    console.log('🔍 Inserting researcher with data:', {
      profile_picture,
      lastName,
      firstName,
      middleName,
      position,
      schoolAffiliation,
      schoolAddress,
      emailAddress,
      highestDegree,
      yearsInService
    });

    await withConnection(async (connection) => {
      const [result] = await connection.execute(
        `INSERT INTO researchers_profile 
         (profile_picture, last_name, first_name, middle_name, position, school_affiliation, 
          school_address, email_address, highest_degree_attained, years_in_service) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [profile_picture, lastName, firstName, middleName, position, schoolAffiliation, 
         schoolAddress, emailAddress, highestDegree, yearsInService]
      );

      console.log('✅ Researcher added successfully with ID:', result.insertId);
      
      // Clear cache since we added a new researcher
      clearCache();

      res.status(201).json({
        message: 'Researcher added successfully',
        profile_id: result.insertId
      });
    });
  } catch (error) {
    console.error('❌ Error adding researcher:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Email address already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// PUT update researcher
router.put('/:id', upload.single('profile_picture'), async (req, res) => {
  try {
    const {
      lastName,
      firstName,
      middleName,
      position,
      schoolAffiliation,
      schoolAddress,
      emailAddress,
      highestDegree,
      yearsInService
    } = req.body;

    await withConnection(async (connection) => {
      // Check if researcher exists
      const [existing] = await connection.execute(
        'SELECT * FROM researchers_profile WHERE profile_id = ?',
        [req.params.id]
      );

      if (existing.length === 0) {
        return res.status(404).json({ error: 'Researcher not found' });
      }

      // Handle profile picture upload
      let profile_picture = existing[0].profile_picture;
      if (req.file) {
        // Always use the relative path for the frontend
        profile_picture = `researchers/profilepictures/${req.file.filename}`;
      }

      await connection.execute(
        `UPDATE researchers_profile SET 
         profile_picture = ?, last_name = ?, first_name = ?, middle_name = ?, position = ?, 
         school_affiliation = ?, school_address = ?, email_address = ?, 
         highest_degree_attained = ?, years_in_service = ?
         WHERE profile_id = ?`,
        [profile_picture, lastName, firstName, middleName, position, schoolAffiliation, 
         schoolAddress, emailAddress, highestDegree, yearsInService, req.params.id]
      );

      // Clear cache since we updated a researcher
      clearCache();

      res.json({ message: 'Researcher updated successfully' });
    });
  } catch (error) {
    console.error('Error updating researcher:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Email address already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// POST update researcher (for file uploads)
router.post('/:id', upload.single('profile_picture'), async (req, res) => {
  console.log('POST /api/researchers/:id hit', req.params.id, req.file, req.body);
  try {
    const {
      lastName,
      firstName,
      middleName,
      position,
      schoolAffiliation,
      schoolAddress,
      emailAddress,
      highestDegree,
      yearsInService
    } = req.body;

    await withConnection(async (connection) => {
      // Check if researcher exists
      const [existing] = await connection.execute(
        'SELECT * FROM researchers_profile WHERE profile_id = ?',
        [req.params.id]
      );

      if (existing.length === 0) {
        return res.status(404).json({ error: 'Researcher not found' });
      }

      // Handle profile picture upload
      let profile_picture = existing[0].profile_picture;
      if (req.file) {
        // Always use the relative path for the frontend
        profile_picture = `researchers/profilepictures/${req.file.filename}`;
      }

      await connection.execute(
        `UPDATE researchers_profile SET 
         profile_picture = ?, last_name = ?, first_name = ?, middle_name = ?, position = ?, 
         school_affiliation = ?, school_address = ?, email_address = ?, 
         highest_degree_attained = ?, years_in_service = ?
         WHERE profile_id = ?`,
        [profile_picture, lastName, firstName, middleName, position, schoolAffiliation, 
         schoolAddress, emailAddress, highestDegree, yearsInService, req.params.id]
      );

      // Clear cache since we updated a researcher
      clearCache();

      res.json({ message: 'Researcher updated successfully' });
    });
  } catch (error) {
    console.error('Error updating researcher (POST):', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Email address already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// DELETE researcher
router.delete('/:id', async (req, res) => {
  try {
    await withConnection(async (connection) => {
      // Check if researcher exists
      const [existing] = await connection.execute(
        'SELECT * FROM researchers_profile WHERE profile_id = ?',
        [req.params.id]
      );

      if (existing.length === 0) {
        return res.status(404).json({ error: 'Researcher not found' });
      }

      // Check if researcher has any research publications
      const [researchCount] = await connection.execute(
        'SELECT COUNT(*) as count FROM research_authors WHERE profile_id = ?',
        [req.params.id]
      );

      if (researchCount[0].count > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete researcher with existing research publications' 
        });
      }

      await connection.execute(
        'DELETE FROM researchers_profile WHERE profile_id = ?',
        [req.params.id]
      );

      // Clear cache since we deleted a researcher
      clearCache();

      res.json({ message: 'Researcher deleted successfully' });
    });
  } catch (error) {
    console.error('Error deleting researcher:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET researcher's publications
router.get('/:id/publications', async (req, res) => {
  try {
    const [rows] = await withConnection(async (connection) => {
      return await connection.execute(
        `SELECT r.*, ra.is_lead_author, ra.author_order
         FROM researches r
         JOIN research_authors ra ON r.research_id = ra.research_id
         WHERE ra.profile_id = ?
         ORDER BY r.completion_year DESC, ra.author_order`,
        [req.params.id]
      );
    });
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching researcher publications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET researcher's recognitions
router.get('/:id/recognitions', async (req, res) => {
  try {
    const [rows] = await withConnection(async (connection) => {
      return await connection.execute(
        'SELECT * FROM recognitions WHERE profile_id = ? ORDER BY year_received DESC',
        [req.params.id]
      );
    });
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching researcher recognitions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 