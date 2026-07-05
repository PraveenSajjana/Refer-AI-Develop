const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Badge type to display name mapping
const BADGE_NAMES = {
  first_referral: 'First Referral',
  profile_complete: 'Profile Complete',
  resume_uploaded: 'Resume Uploaded',
  mock_interview: 'Mock Interview',
  assessment_passed: 'Assessment Passed',
  referral_accepted: 'Referral Accepted',
  hired: 'Hired',
  community_contributor: 'Community Contributor',
  top_scorer: 'Top Scorer',
  referral_readiness_75: 'Referral Ready',
};

// Get user's earned badges
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [badges] = await pool.query(
      'SELECT * FROM user_badges WHERE user_id = ? ORDER BY awarded_at DESC',
      [req.user.id]
    );
    res.json(badges);
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({ error: 'Failed to get badges' });
  }
});

// Earn a badge
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { badge_type } = req.body;

    // Check if already earned
    const [existing] = await pool.query(
      'SELECT * FROM user_badges WHERE user_id = ? AND badge_type = ?',
      [req.user.id, badge_type]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Badge already earned' });
    }

    const id = uuidv4();
    const badge_name = BADGE_NAMES[badge_type] || badge_type;

    await pool.query(
      'INSERT INTO user_badges (id, user_id, badge_type, badge_name, awarded_at) VALUES (?, ?, ?, ?, NOW())',
      [id, req.user.id, badge_type, badge_name]
    );

    // Award points based on badge type
    const badgePoints = {
      first_referral: 50,
      profile_complete: 100,
      resume_uploaded: 30,
      mock_interview: 40,
      assessment_passed: 50,
      referral_accepted: 100,
      hired: 500,
      community_contributor: 75,
      top_scorer: 100,
      referral_readiness_75: 150,
    };

    const points = badgePoints[badge_type] || 25;
    await pool.query(
      'UPDATE users SET points = COALESCE(points, 0) + ? WHERE id = ?',
      [points, req.user.id]
    );

    const [created] = await pool.query('SELECT * FROM user_badges WHERE id = ?', [id]);
    res.status(201).json(created[0]);
  } catch (error) {
    console.error('Earn badge error:', error);
    res.status(500).json({ error: 'Failed to earn badge' });
  }
});

module.exports = router;