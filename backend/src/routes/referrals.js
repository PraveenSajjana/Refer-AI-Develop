const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Get referral requests (for candidate or employee)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const role = req.user.role;
    let query, params;

    if (role === 'employee') {
      query = 'SELECT * FROM referral_requests WHERE employee_id = ? ORDER BY created_at DESC';
      params = [req.user.id];
    } else {
      query = 'SELECT * FROM referral_requests WHERE candidate_id = ? ORDER BY created_at DESC';
      params = [req.user.id];
    }

    const [requests] = await pool.query(query, params);
    res.json(requests);
  } catch (error) {
    console.error('Get referrals error:', error);
    res.status(500).json({ error: 'Failed to get referrals' });
  }
});

// Create referral request
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { employee_id, job_id, cover_letter, candidate_message } = req.body;

    const id = uuidv4();

    await pool.query(
      'INSERT INTO referral_requests (id, candidate_id, employee_id, job_id, cover_letter, candidate_message) VALUES (?, ?, ?, ?, ?, ?)',
      [id, req.user.id, employee_id, job_id || null, cover_letter || null, candidate_message || null]
    );

    const [created] = await pool.query('SELECT * FROM referral_requests WHERE id = ?', [id]);
    res.status(201).json(created[0]);
  } catch (error) {
    console.error('Create referral error:', error);
    res.status(500).json({ error: 'Failed to create referral request' });
  }
});

// Update referral status
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { status, employee_notes } = req.body;

    const [existing] = await pool.query(
      'SELECT * FROM referral_requests WHERE id = ? AND (employee_id = ? OR candidate_id = ?)',
      [req.params.id, req.user.id, req.user.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Referral request not found or unauthorized' });
    }

    await pool.query(
      'UPDATE referral_requests SET status = ?, employee_notes = ? WHERE id = ?',
      [status, employee_notes || null, req.params.id]
    );

    const [updated] = await pool.query('SELECT * FROM referral_requests WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Update referral error:', error);
    res.status(500).json({ error: 'Failed to update referral' });
  }
});

// Get employees list (for finding referrers)
router.get('/employees', authMiddleware, async (req, res) => {
  try {
    const { search } = req.query;

    let query = `
      SELECT u.id, u.full_name, u.avatar_url, ep.company, ep.designation, ep.trust_score, ep.total_referrals, ep.successful_referrals
      FROM users u
      JOIN employee_profiles ep ON u.id = ep.user_id
      WHERE u.role = 'employee'
    `;
    const params = [];

    if (search) {
      query += ' AND (u.full_name LIKE ? OR ep.company LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' LIMIT 50';

    const [employees] = await pool.query(query, params);
    res.json(employees);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Failed to get employees' });
  }
});

module.exports = router;
