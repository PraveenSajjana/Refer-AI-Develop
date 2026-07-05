const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const { analyzeResume } = require('../services/resumeParser');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads/resumes');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for local file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userDir = path.join(uploadsDir, req.user.id);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
    }
  }
});

// Get resume analyses
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [analyses] = await pool.query(
      'SELECT * FROM resume_analyses WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      [req.user.id]
    );
    res.json(analyses);
  } catch (error) {
    console.error('Get analyses error:', error);
    res.status(500).json({ error: 'Failed to get resume analyses' });
  }
});

// Upload and analyze resume
router.post('/upload', authMiddleware, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    const fileType = file.originalname.split('.').pop().toLowerCase();

    // Generate the URL for the stored file
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3001}`;
    const resumeUrl = `${baseUrl}/uploads/resumes/${req.user.id}/${file.filename}`;

    // Read file for analysis
    const fileBuffer = fs.readFileSync(file.path);

    // Analyze the resume
    const analysis = await analyzeResume(fileBuffer, fileType);

    // Store analysis in database
    const id = uuidv4();

    await pool.query(
      `INSERT INTO resume_analyses (
        id, user_id, resume_url, extracted_skills, experience_years, education_data,
        certifications, projects_data, resume_score, missing_skills, suggestions,
        ats_score, ats_keywords_missing, ats_suggestions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        req.user.id,
        resumeUrl,
        JSON.stringify(analysis.extracted_skills),
        analysis.experience_years,
        JSON.stringify(analysis.education_data),
        JSON.stringify([]),
        JSON.stringify([]),
        analysis.resume_score,
        JSON.stringify(analysis.missing_skills),
        JSON.stringify(analysis.suggestions),
        analysis.ats_score,
        JSON.stringify(analysis.ats_keywords_missing),
        JSON.stringify(analysis.ats_suggestions)
      ]
    );

    // Update candidate profile scores
    try {
      await pool.query(
        'UPDATE candidate_profiles SET resume_score = ?, ats_score = ? WHERE user_id = ?',
        [analysis.resume_score, analysis.ats_score, req.user.id]
      );
    } catch (updateError) {
      console.warn('Could not update candidate profile:', updateError.message);
    }

    const [created] = await pool.query('SELECT * FROM resume_analyses WHERE id = ?', [id]);

    res.status(201).json({
      ...created[0],
      extracted_text: analysis.text,
      soft_skills: analysis.soft_skills
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze resume' });
  }
});

// Get latest analysis
router.get('/latest', authMiddleware, async (req, res) => {
  try {
    const [analyses] = await pool.query(
      'SELECT * FROM resume_analyses WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [req.user.id]
    );
    if (analyses.length === 0) {
      return res.status(404).json({ error: 'No resume analysis found' });
    }
    res.json(analyses[0]);
  } catch (error) {
    console.error('Get latest error:', error);
    res.status(500).json({ error: 'Failed to get latest analysis' });
  }
});

// Delete a resume analysis
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // Get the analysis to find the file
    const [analyses] = await pool.query(
      'SELECT * FROM resume_analyses WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (analyses.length > 0) {
      const analysis = analyses[0];

      // Try to delete the file if it exists locally
      if (analysis.resume_url) {
        try {
          const urlParts = analysis.resume_url.split('/');
          const filename = urlParts.pop();
          const userId = urlParts.pop();
          const filePath = path.join(uploadsDir, userId, filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (fileError) {
          console.warn('Could not delete resume file:', fileError.message);
        }
      }
    }

    const [result] = await pool.query(
      'DELETE FROM resume_analyses WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json({ message: 'Analysis deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete analysis' });
  }
});

module.exports = router;
