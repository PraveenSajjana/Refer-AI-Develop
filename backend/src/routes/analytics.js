const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Get user assessments
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [assessments] = await pool.query(
      'SELECT * FROM assessments WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(assessments);
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({ error: 'Failed to get assessments' });
  }
});

// Get assessment by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [assessments] = await pool.query(
      'SELECT * FROM assessments WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (assessments.length === 0) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    res.json(assessments[0]);
  } catch (error) {
    console.error('Get assessment error:', error);
    res.status(500).json({ error: 'Failed to get assessment' });
  }
});

// Create/Start assessment
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { assessment_type, title, questions, total_questions, time_limit, job_id } = req.body;

    const id = uuidv4();

    await pool.query(
      `INSERT INTO assessments (id, user_id, job_id, assessment_type, title, questions, total_questions, time_limit, status, started_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'in_progress', NOW())`,
      [id, req.user.id, job_id || null, assessment_type, title, JSON.stringify(questions || []), total_questions || 0, time_limit || 30]
    );

    const [created] = await pool.query('SELECT * FROM assessments WHERE id = ?', [id]);
    res.status(201).json(created[0]);
  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({ error: 'Failed to create assessment' });
  }
});

// Submit/Complete assessment
router.put('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const { score, integrity_score } = req.body;

    await pool.query(
      'UPDATE assessments SET status = ?, score = ?, integrity_score = ?, completed_at = NOW() WHERE id = ? AND user_id = ?',
      ['completed', score, integrity_score || 100, req.params.id, req.user.id]
    );

    // Update candidate profile assessment score
    await pool.query(
      'UPDATE candidate_profiles SET assessment_score = ? WHERE user_id = ?',
      [score, req.user.id]
    );

    const [updated] = await pool.query('SELECT * FROM assessments WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Complete assessment error:', error);
    res.status(500).json({ error: 'Failed to complete assessment' });
  }
});

module.exports = router;
