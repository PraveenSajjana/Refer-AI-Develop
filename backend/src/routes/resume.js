const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Get resume analyses
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [analyses] = await pool.query(
      'SELECT * FROM resume_analyses WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      [req.user.id]
    );
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get resume analyses' });
  }
});

// Create resume analysis
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      resume_url,
      extracted_skills,
      experience_years,
      education_data,
      certifications,
      projects_data,
      resume_score,
      missing_skills,
      suggestions,
      ats_score,
      ats_keywords_missing,
      ats_suggestions
    } = req.body;

    const id = uuidv4();

    await pool.query(
      `INSERT INTO resume_analyses (id, user_id, resume_url, extracted_skills, experience_years, education_data,
       certifications, projects_data, resume_score, missing_skills, suggestions, ats_score, ats_keywords_missing, ats_suggestions)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, req.user.id, resume_url || null,
        JSON.stringify(extracted_skills || []), experience_years || 0,
        JSON.stringify(education_data || []), JSON.stringify(certifications || []),
        JSON.stringify(projects_data || []), resume_score || 0,
        JSON.stringify(missing_skills || []), JSON.stringify(suggestions || []),
        ats_score || 0, JSON.stringify(ats_keywords_missing || []), JSON.stringify(ats_suggestions || [])
      ]
    );

    // Update candidate profile scores
    await pool.query(
      'UPDATE candidate_profiles SET resume_score = ?, ats_score = ? WHERE user_id = ?',
      [resume_score || 0, ats_score || 0, req.user.id]
    );

    const [created] = await pool.query('SELECT * FROM resume_analyses WHERE id = ?', [id]);
    res.status(201).json(created[0]);
  } catch (error) {
    console.error('Create resume analysis error:', error);
    res.status(500).json({ error: 'Failed to create resume analysis' });
  }
});

module.exports = router;
