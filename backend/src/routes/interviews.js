const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Get user interviews
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [interviews] = await pool.query(
      'SELECT * FROM interview_sessions WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get interviews' });
  }
});

// Create interview session
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { mode, interview_type, questions, job_id } = req.body;

    const id = uuidv4();

    await pool.query(
      `INSERT INTO interview_sessions (id, user_id, job_id, mode, interview_type, questions, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [id, req.user.id, job_id || null, mode || 'text', interview_type || 'technical', JSON.stringify(questions || [])]
    );

    const [created] = await pool.query('SELECT * FROM interview_sessions WHERE id = ?', [id]);
    res.status(201).json(created[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create interview' });
  }
});

// Complete interview
router.put('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const {
      answers,
      technical_score,
      communication_score,
      confidence_score,
      problem_solving_score,
      overall_score,
      report
    } = req.body;

    await pool.query(
      `UPDATE interview_sessions
       SET status = 'completed', answers = ?, technical_score = ?, communication_score = ?,
           confidence_score = ?, problem_solving_score = ?, overall_score = ?, report = ?, completed_at = NOW()
       WHERE id = ? AND user_id = ?`,
      [JSON.stringify(answers || []), technical_score, communication_score,
       confidence_score, problem_solving_score, overall_score, JSON.stringify(report || {}),
       req.params.id, req.user.id]
    );

    // Update candidate profile interview score
    await pool.query(
      'UPDATE candidate_profiles SET interview_score = ? WHERE user_id = ?',
      [overall_score, req.user.id]
    );

    const [updated] = await pool.query('SELECT * FROM interview_sessions WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete interview' });
  }
});

module.exports = router;
