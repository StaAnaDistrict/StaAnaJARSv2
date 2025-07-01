const express = require('express');
const { withConnection } = require('../db');
require('dotenv').config({ path: '../config.env' });

const router = express.Router();

// GET all researches with pagination and search
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const offset = (Math.max(1, parseInt(page) || 1) - 1) * limitNum;
    
    // Enhanced query to include authors, sorted by online_publication_date DESC only
    let query = `
      SELECT r.research_id, r.research_title, r.completion_year, r.completion_month,
             r.abstract, art.type_name, rfc.category_name, r.online_publication_date,
             GROUP_CONCAT(
               CONCAT(rp.last_name, ', ', rp.first_name, ' ', COALESCE(rp.middle_name, '')) 
               ORDER BY ra.author_order 
               SEPARATOR '; '
             ) as authors
      FROM researches r
      LEFT JOIN action_research_types art ON r.action_research_type_id = art.type_id
      LEFT JOIN research_focus_categories rfc ON r.research_focus_category_id = rfc.category_id
      LEFT JOIN research_authors ra ON r.research_id = ra.research_id
      LEFT JOIN researchers_profile rp ON ra.profile_id = rp.profile_id
     GROUP BY r.research_id, r.research_title, r.completion_year, r.completion_month, 
              r.abstract, art.type_name, rfc.category_name, r.online_publication_date
     ORDER BY r.online_publication_date DESC
     LIMIT ${limitNum} OFFSET ${offset}`;

    // If search is present, filter in memory after fetching (for now)
    const [rows] = await withConnection(async (connection) => {
      return await connection.execute(query);
    });

    let filteredResearches = rows;
    if (search && search.trim()) {
      const searchTerm = search.trim().toLowerCase();
      filteredResearches = rows.filter(research => 
        research.research_title && research.research_title.toLowerCase().includes(searchTerm)
      );
    }

    res.json({
      researches: filteredResearches,
      pagination: {
        page: Math.max(1, parseInt(page) || 1),
        limit: limitNum,
        total: filteredResearches.length,
        pages: Math.ceil(filteredResearches.length / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching researches:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET research by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await withConnection(async (connection) => {
      return await connection.execute(
        `SELECT r.*, art.type_name, rfc.category_name
         FROM researches r
         LEFT JOIN action_research_types art ON r.action_research_type_id = art.type_id
         LEFT JOIN research_focus_categories rfc ON r.research_focus_category_id = rfc.category_id
         WHERE r.research_id = ?`,
        [req.params.id]
      );
    });

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Research not found' });
    }

    const research = rows[0];

    // Get authors for this research
    const [authors] = await withConnection(async (connection) => {
      return await connection.execute(
        `SELECT rp.*, ra.is_lead_author, ra.author_order
         FROM research_authors ra
         JOIN researchers_profile rp ON ra.profile_id = rp.profile_id
         WHERE ra.research_id = ?
         ORDER BY ra.author_order`,
        [req.params.id]
      );
    });

    res.json({
      research,
      authors
    });
  } catch (error) {
    console.error('Error fetching research:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST new research
router.post('/', async (req, res) => {
  try {
    const {
      research_title,
      abstract,
      keywords,
      completion_year,
      completion_month,
      online_publication_date,
      journal_issue_number,
      publication_venue,
      volume_issue,
      pages,
      doi,
      research_url,
      action_research_type_id,
      research_focus_category_id,
      authors
    } = req.body;

    // Validate required fields
    if (!research_title || !abstract || !action_research_type_id) {
      return res.status(400).json({ 
        error: 'Research title, abstract, and research type are required' 
      });
    }

    // Use single connection for transaction
    await withConnection(async (connection) => {
      await connection.beginTransaction();

      try {
        // Insert research
        const [result] = await connection.execute(
          `INSERT INTO researches 
           (action_research_type_id, research_title, completion_month, completion_year, 
            abstract, research_focus_category_id, online_publication_date, keywords, 
            journal_issue_number, publication_venue, volume_issue, pages, doi, research_url,
            published_in, published_on) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [action_research_type_id, research_title, completion_month, completion_year,
           abstract, research_focus_category_id, online_publication_date, keywords,
           journal_issue_number, publication_venue || null, volume_issue, pages, doi, research_url,
           req.body.published_in || null, req.body.published_on || null]
        );

        const researchId = result.insertId;

        // Insert authors if provided
        if (authors && Array.isArray(authors) && authors.length > 0) {
          for (let i = 0; i < Math.min(authors.length, 3); i++) {
            const author = authors[i];
            if (author.profile_id) {
              await connection.execute(
                `INSERT INTO research_authors 
                 (research_id, profile_id, is_lead_author, author_order) 
                 VALUES (?, ?, ?, ?)`,
                [researchId, author.profile_id, i === 0, i + 1]
              );
            }
          }
        }

        await connection.commit();

        res.status(201).json({
          message: 'Research added successfully',
          research_id: researchId
        });
      } catch (error) {
        await connection.rollback();
        throw error;
      }
    });
  } catch (error) {
    console.error('Error adding research:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update research
router.put('/:id', async (req, res) => {
  try {
    const {
      research_title,
      abstract,
      keywords,
      completion_year,
      completion_month,
      online_publication_date,
      journal_issue_number,
      publication_venue,
      volume_issue,
      pages,
      doi,
      research_url,
      action_research_type_id,
      research_focus_category_id,
      authors
    } = req.body;

    await withConnection(async (connection) => {
      // Check if research exists
      const [existing] = await connection.execute(
        'SELECT * FROM researches WHERE research_id = ?',
        [req.params.id]
      );

      if (existing.length === 0) {
        return res.status(404).json({ error: 'Research not found' });
      }

      // Start transaction
      await connection.beginTransaction();

      try {
        // Update research
        await connection.execute(
          `UPDATE researches SET 
           action_research_type_id = ?, research_title = ?, completion_month = ?, 
           completion_year = ?, abstract = ?, research_focus_category_id = ?, 
           online_publication_date = ?, keywords = ?, journal_issue_number = ?, 
           publication_venue = ?, volume_issue = ?, pages = ?, doi = ?, research_url = ?,
           published_in = ?, published_on = ?
           WHERE research_id = ?`,
          [action_research_type_id, research_title, completion_month, completion_year,
           abstract, research_focus_category_id, online_publication_date, keywords,
           journal_issue_number, publication_venue, volume_issue, pages, doi, research_url,
           req.body.published_in || null, req.body.published_on || null, req.params.id]
        );

        // Delete existing authors
        await connection.execute(
          'DELETE FROM research_authors WHERE research_id = ?',
          [req.params.id]
        );

        // Insert new authors if provided
        if (authors && Array.isArray(authors) && authors.length > 0) {
          for (let i = 0; i < Math.min(authors.length, 3); i++) {
            const author = authors[i];
            if (author.profile_id) {
              await connection.execute(
                `INSERT INTO research_authors 
                 (research_id, profile_id, is_lead_author, author_order) 
                 VALUES (?, ?, ?, ?)`,
                [req.params.id, author.profile_id, i === 0, i + 1]
              );
            }
          }
        }

        await connection.commit();

        res.json({ message: 'Research updated successfully' });
      } catch (error) {
        await connection.rollback();
        throw error;
      }
    });
  } catch (error) {
    console.error('Error updating research:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE research
router.delete('/:id', async (req, res) => {
  try {
    await withConnection(async (connection) => {
      // Check if research exists
      const [existing] = await connection.execute(
        'SELECT * FROM researches WHERE research_id = ?',
        [req.params.id]
      );

      if (existing.length === 0) {
        return res.status(404).json({ error: 'Research not found' });
      }

      // Start transaction
      await connection.beginTransaction();

      try {
        // Delete authors first (foreign key constraint)
        await connection.execute(
          'DELETE FROM research_authors WHERE research_id = ?',
          [req.params.id]
        );

        // Delete research
        await connection.execute(
          'DELETE FROM researches WHERE research_id = ?',
          [req.params.id]
        );

        await connection.commit();

        res.json({ message: 'Research deleted successfully' });
      } catch (error) {
        await connection.rollback();
        throw error;
      }
    });
  } catch (error) {
    console.error('Error deleting research:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET research categories
router.get('/categories/types', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM action_research_types ORDER BY type_name');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching research types:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET research focus categories
router.get('/categories/focus', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM research_focus_categories ORDER BY category_name');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching focus categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 