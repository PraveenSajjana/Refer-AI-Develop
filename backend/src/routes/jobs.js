const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authMiddleware, optionalAuth } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Get all jobs
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { search, location, type, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM jobs WHERE is_active = TRUE';
    const params = [];

    if (search) {
      query += ' AND (title LIKE ? OR company_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (location) {
      query += ' AND location LIKE ?';
      params.push(`%${location}%`);
    }

    if (type) {
      query += ' AND job_type = ?';
      params.push(type);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [jobs] = await pool.query(query, params);
    res.json(jobs);
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Failed to get jobs' });
  }
});

// Get job by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const [jobs] = await pool.query('SELECT * FROM jobs WHERE id = ?', [req.params.id]);

    if (jobs.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Increment views
    await pool.query('UPDATE jobs SET views = views + 1 WHERE id = ?', [req.params.id]);

    res.json(jobs[0]);
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Failed to get job' });
  }
});

// Create job
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      title, company_name, location, job_type, experience_min, experience_max,
      salary_min, salary_max, description, skills_required, company_id
    } = req.body;

    if (!title || !company_name) {
      return res.status(400).json({ error: 'Title and company_name are required' });
    }

    const id = uuidv4();

    await pool.query(
      `INSERT INTO jobs (id, title, company_id, company_name, location, job_type,
       experience_min, experience_max, salary_min, salary_max, description, skills_required, posted_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, title, company_id || null, company_name, location || null, job_type || 'full_time',
        experience_min || 0, experience_max || 5, salary_min || null, salary_max || null,
        description || null, JSON.stringify(skills_required || []), req.user.id
      ]
    );

    const [jobs] = await pool.query('SELECT * FROM jobs WHERE id = ?', [id]);
    res.status(201).json(jobs[0]);
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// Update job
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const [jobs] = await pool.query('SELECT * FROM jobs WHERE id = ? AND posted_by = ?', [req.params.id, req.user.id]);

    if (jobs.length === 0) {
      return res.status(404).json({ error: 'Job not found or unauthorized' });
    }

    const fields = [];
    const values = [];

    const allowedFields = ['title', 'company_name', 'location', 'job_type', 'experience_min', 'experience_max', 'salary_min', 'salary_max', 'description', 'skills_required', 'is_active', 'is_featured'];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(field === 'skills_required' ? JSON.stringify(req.body[field]) : req.body[field]);
      }
    }

    if (fields.length > 0) {
      values.push(req.params.id);
      await pool.query(`UPDATE jobs SET ${fields.join(', ')} WHERE id = ?`, values);
    }

    const [updated] = await pool.query('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

// Delete job
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM jobs WHERE id = ? AND posted_by = ?', [req.params.id, req.user.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Job not found or unauthorized' });
    }

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

module.exports = router;
