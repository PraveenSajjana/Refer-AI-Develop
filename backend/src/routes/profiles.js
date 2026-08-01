const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Get candidate profile
router.get('/candidate', authMiddleware, async (req, res) => {
  try {
    const [profiles] = await pool.query(
      'SELECT * FROM candidate_profiles WHERE user_id = ?',
      [req.user.id]
    );

    if (profiles.length === 0) {
      return res.json(null);
    }

    res.json(profiles[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Create/Update candidate profile
router.post('/candidate', authMiddleware, async (req, res) => {
  try {
    console.log("/candidate req: ", req.body);
    
    const [existing] = await pool.query(
      'SELECT id FROM candidate_profiles WHERE user_id = ?',
      [req.user.id]
    );

    const fields = ['phone', 'location', 'linkedin_url', 'github_url', 'portfolio_url', 'headline', 'bio', 'years_experience', 'current_role_title', 'current_company', 'skills', 'resume_url', 'resume_score', 'linkedin_score', 'ats_score', 'assessment_score', 'interview_score', 'profile_completeness', 'referral_readiness_score', 'recommendation'];

    if (existing.length > 0) {
      // Update
      const updates = fields.map(f => `${f} = ?`).join(', ');
      const values = fields.map(f => {
        const val = req.body[f];
        if (f === 'skills' && Array.isArray(val)) {
          return JSON.stringify(val);
        }
        return val !== undefined ? val : null;
      });
      values.push(req.user.id);

      await pool.query(`UPDATE candidate_profiles SET ${updates} WHERE user_id = ?`, values);

      const [updated] = await pool.query('SELECT * FROM candidate_profiles WHERE user_id = ?', [req.user.id]);
      res.json(updated[0]);
    } else {
      // Create
      const id = uuidv4();
      const values = [id, req.user.id];
      const placeholders = ['?', '?'];
      const fieldNames = ['id', 'user_id'];

      for (const f of fields) {
        if (req.body[f] !== undefined) {
          fieldNames.push(f);
          placeholders.push('?');
          values.push(f === 'skills' && Array.isArray(req.body[f]) ? JSON.stringify(req.body[f]) : req.body[f]);
        }
      }

      await pool.query(
        `INSERT INTO candidate_profiles (${fieldNames.join(', ')}) VALUES (${placeholders.join(', ')})`,
        values
      );

      const [created] = await pool.query('SELECT * FROM candidate_profiles WHERE user_id = ?', [req.user.id]);
      res.status(201).json(created[0]);
    }
  } catch (error) {
    console.error('Save profile error:', error);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

// Get employee profile
router.get('/employee', authMiddleware, async (req, res) => {
  try {
    const [profiles] = await pool.query(
      'SELECT * FROM employee_profiles WHERE user_id = ?',
      [req.user.id]
    );
    res.json(profiles[0] || null);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Create/Update employee profile
router.post('/employee', authMiddleware, async (req, res) => {
  try {
    const { company, designation, company_email, linkedin_url } = req.body;

    // Update user role to employee if not already
    await pool.query(
      "UPDATE users SET role = 'employee' WHERE id = ?",
      [req.user.id]
    );

    const [existing] = await pool.query(
      'SELECT id FROM employee_profiles WHERE user_id = ?',
      [req.user.id]
    );

    if (existing.length > 0) {
      await pool.query(
        'UPDATE employee_profiles SET company = ?, designation = ?, company_email = ?, linkedin_url = ? WHERE user_id = ?',
        [company, designation, company_email || null, linkedin_url || null, req.user.id]
      );

      const [updated] = await pool.query('SELECT * FROM employee_profiles WHERE user_id = ?', [req.user.id]);
      res.json(updated[0]);
    } else {
      const id = uuidv4();
      await pool.query(
        `INSERT INTO employee_profiles (id, user_id, company, designation, company_email, linkedin_url, trust_score, total_referrals, successful_referrals, linkedin_verified, company_email_verified)
         VALUES (?, ?, ?, ?, ?, ?, 50, 0, 0, FALSE, FALSE)`,
        [id, req.user.id, company, designation, company_email || null, linkedin_url || null]
      );

      const [created] = await pool.query('SELECT * FROM employee_profiles WHERE user_id = ?', [req.user.id]);
      res.status(201).json(created[0]);
    }
  } catch (error) {
    console.error('Save profile error:', error);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

// Education routes
router.get('/education', authMiddleware, async (req, res) => {
  try {
    const [education] = await pool.query('SELECT * FROM education WHERE user_id = ?', [req.user.id]);
    res.json(education);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get education' });
  }
});

router.post('/education', authMiddleware, async (req, res) => {
  try {
    const id = uuidv4();
    const { institution, degree, field, start_year, end_year, grade } = req.body;

    await pool.query(
      'INSERT INTO education (id, user_id, institution, degree, field, start_year, end_year, grade) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, req.user.id, institution, degree, field || null, start_year || null, end_year || null, grade || null]
    );

    const [created] = await pool.query('SELECT * FROM education WHERE id = ?', [id]);
    res.status(201).json(created[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add education' });
  }
});

router.put('/education/:id', authMiddleware, async (req, res) => {
  try {
    const { institution, degree, field, start_year, end_year, grade } = req.body;

    await pool.query(
      'UPDATE education SET institution = ?, degree = ?, field = ?, start_year = ?, end_year = ?, grade = ? WHERE id = ? AND user_id = ?',
      [institution, degree, field || null, start_year || null, end_year || null, grade || null, req.params.id, req.user.id]
    );

    const [updated] = await pool.query('SELECT * FROM education WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update education' });
  }
});

router.delete('/education/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM education WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete education' });
  }
});

// Work experience routes
router.get('/experience', authMiddleware, async (req, res) => {
  try {
    const [experience] = await pool.query('SELECT * FROM work_experience WHERE user_id = ?', [req.user.id]);
    res.json(experience);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get experience' });
  }
});

router.post('/experience', authMiddleware, async (req, res) => {
  try {
    const id = uuidv4();
    const { company, role, location, start_date, end_date, is_current, description } = req.body;

    await pool.query(
      'INSERT INTO work_experience (id, user_id, company, role, location, start_date, end_date, is_current, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, req.user.id, company, role, location || null, start_date || null, end_date || null, is_current || false, description || null]
    );

    const [created] = await pool.query('SELECT * FROM work_experience WHERE id = ?', [id]);
    res.status(201).json(created[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add experience' });
  }
});

router.put('/experience/:id', authMiddleware, async (req, res) => {
  try {
    const { company, role, location, start_date, end_date, is_current, description } = req.body;

    await pool.query(
      'UPDATE work_experience SET company = ?, role = ?, location = ?, start_date = ?, end_date = ?, is_current = ?, description = ? WHERE id = ? AND user_id = ?',
      [company, role, location || null, start_date || null, end_date || null, is_current || false, description || null, req.params.id, req.user.id]
    );

    const [updated] = await pool.query('SELECT * FROM work_experience WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update experience' });
  }
});

router.delete('/experience/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM work_experience WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete experience' });
  }
});

// Projects routes
router.get('/projects', authMiddleware, async (req, res) => {
  try {
    const [projects] = await pool.query('SELECT * FROM projects WHERE user_id = ?', [req.user.id]);
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get projects' });
  }
});

router.post('/projects', authMiddleware, async (req, res) => {
  try {
    const id = uuidv4();
    const { title, description, tech_stack, url, github_url } = req.body;

    await pool.query(
      'INSERT INTO projects (id, user_id, title, description, tech_stack, url, github_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, req.user.id, title, description || null, JSON.stringify(tech_stack || []), url || null, github_url || null]
    );

    const [created] = await pool.query('SELECT * FROM projects WHERE id = ?', [id]);
    res.status(201).json(created[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add project' });
  }
});

router.delete('/projects/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM projects WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Certifications routes
router.get('/certifications', authMiddleware, async (req, res) => {
  try {
    const [certs] = await pool.query('SELECT * FROM certifications WHERE user_id = ?', [req.user.id]);
    res.json(certs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get certifications' });
  }
});

router.post('/certifications', authMiddleware, async (req, res) => {
  try {
    const id = uuidv4();
    const { name, issuer, issue_date, expiry_date, credential_id, credential_url } = req.body;

    await pool.query(
      'INSERT INTO certifications (id, user_id, name, issuer, issue_date, expiry_date, credential_id, credential_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, req.user.id, name, issuer || null, issue_date || null, expiry_date || null, credential_id || null, credential_url || null]
    );

    const [created] = await pool.query('SELECT * FROM certifications WHERE id = ?', [id]);
    res.status(201).json(created[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add certification' });
  }
});

router.delete('/certifications/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM certifications WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete certification' });
  }
});

// Get student profile
router.get('/student', authMiddleware, async (req, res) => {
  try {
    const [profiles] = await pool.query('SELECT * FROM student_profiles WHERE user_id = ?', [req.user.id]);
    res.json(profiles[0] || null);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get student profile' });
  }
});

// Create/Update student profile
router.post('/student', authMiddleware, async (req, res) => {
  try {
    const { college, degree, branch, graduation_year, cgpa, github_url, linkedin_url, resume_url, skills } = req.body;

    const [existing] = await pool.query('SELECT id FROM student_profiles WHERE user_id = ?', [req.user.id]);

    if (existing.length > 0) {
      await pool.query(
        `UPDATE student_profiles SET college = ?, degree = ?, branch = ?, graduation_year = ?,
         cgpa = ?, github_url = ?, linkedin_url = ?, resume_url = ?, skills = ? WHERE user_id = ?`,
        [college || null, degree || null, branch || null, graduation_year || null,
         cgpa || null, github_url || null, linkedin_url || null, resume_url || null,
         JSON.stringify(skills || []), req.user.id]
      );
    } else {
      const { v4: uuidv4 } = require('uuid');
      const id = uuidv4();
      await pool.query(
        `INSERT INTO student_profiles (id, user_id, college, degree, branch, graduation_year, cgpa, github_url, linkedin_url, resume_url, skills)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, req.user.id, college || null, degree || null, branch || null,
         graduation_year || null, cgpa || null, github_url || null,
         linkedin_url || null, resume_url || null, JSON.stringify(skills || [])]
      );
    }

    const [updated] = await pool.query('SELECT * FROM student_profiles WHERE user_id = ?', [req.user.id]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Save student profile error:', error);
    res.status(500).json({ error: 'Failed to save student profile' });
  }
});

module.exports = router;
