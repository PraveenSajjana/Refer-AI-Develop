const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authMiddleware, optionalAuth } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Get all internships
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { search, remote_only, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM internships WHERE is_active = TRUE';
    const params = [];

    if (search) {
      query += ' AND (title LIKE ? OR company_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (remote_only === 'true') {
      query += ' AND is_remote = TRUE';
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [internships] = await pool.query(query, params);
    res.json(internships);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get internships' });
  }
});

// Get internship by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const [internships] = await pool.query('SELECT * FROM internships WHERE id = ?', [req.params.id]);

    if (internships.length === 0) {
      return res.status(404).json({ error: 'Internship not found' });
    }

    res.json(internships[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get internship' });
  }
});

// Create internship
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, company_name, location, is_remote, duration, stipend_min, stipend_max, description, skills_required, openings } = req.body;

    if (!title || !company_name) {
      return res.status(400).json({ error: 'Title and company_name are required' });
    }

    const id = uuidv4();

    await pool.query(
      `INSERT INTO internships (id, title, company_name, location, is_remote, duration, stipend_min, stipend_max, description, skills_required, openings, posted_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title, company_name, location || null, is_remote || false, duration || null,
       stipend_min || null, stipend_max || null, description || null,
       JSON.stringify(skills_required || []), openings || 1, req.user.id]
    );

    const [created] = await pool.query('SELECT * FROM internships WHERE id = ?', [id]);
    res.status(201).json(created[0]);
  } catch (error) {
    console.error('Create internship error:', error);
    res.status(500).json({ error: 'Failed to create internship' });
  }
});

module.exports = router;
