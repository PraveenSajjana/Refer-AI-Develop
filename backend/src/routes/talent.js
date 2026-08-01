const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// Talent search — returns candidates with profile scores
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search, skill, exp, recommendation } = req.query;

    let query = `
      SELECT u.id, u.full_name, u.email, u.avatar_url,
             cp.location, cp.headline, cp.bio, cp.years_experience,
             cp.current_role_title, cp.current_company,
             cp.skills, cp.resume_score, cp.ats_score,
             cp.linkedin_score, cp.assessment_score, cp.interview_score,
             cp.referral_readiness_score, cp.recommendation,
             cp.linkedin_url, cp.github_url, cp.portfolio_url
      FROM users u
      JOIN candidate_profiles cp ON u.id = cp.user_id
      WHERE u.role = 'candidate'
    `;
    const params = [];

    if (search) {
      query += ' AND (u.full_name LIKE ? OR cp.current_role_title LIKE ? OR cp.headline LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (skill) {
      query += ' AND JSON_SEARCH(cp.skills, "one", ?) IS NOT NULL';
      params.push(skill);
    }

    if (exp) {
      if (exp === '0-2') {
        query += ' AND cp.years_experience BETWEEN 0 AND 2';
      } else if (exp === '3-5') {
        query += ' AND cp.years_experience BETWEEN 3 AND 5';
      } else if (exp === '6+') {
        query += ' AND cp.years_experience >= 6';
      }
    }

    if (recommendation) {
      query += ' AND cp.recommendation = ?';
      params.push(recommendation);
    }

    query += ' ORDER BY cp.referral_readiness_score DESC LIMIT 100';

    const [candidates] = await pool.query(query, params);
    res.json(candidates);
  } catch (error) {
    console.error('Talent search error:', error);
    res.status(500).json({ error: 'Failed to search talent' });
  }
});

module.exports = router;
