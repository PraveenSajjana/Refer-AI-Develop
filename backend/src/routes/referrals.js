const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Badge type to display name and points mapping
const BADGE_CONFIG = {
  first_referral: { name: 'First Referral', points: 50 },
  referral_accepted: { name: 'Referral Accepted', points: 100 },
  hired: { name: 'Hired', points: 500 },
};

// Helper function to award a badge if not already earned
async function awardBadge(userId, badgeType, pool) {
  try {
    // Check if already earned
    const [existing] = await pool.query(
      'SELECT * FROM user_badges WHERE user_id = ? AND badge_type = ?',
      [userId, badgeType]
    );

    if (existing.length > 0) {
      return null; // Already has this badge
    }

    const config = BADGE_CONFIG[badgeType];
    if (!config) return null;

    const id = uuidv4();
    await pool.query(
      'INSERT INTO user_badges (id, user_id, badge_type, badge_name, awarded_at) VALUES (?, ?, ?, ?, NOW())',
      [id, userId, badgeType, config.name]
    );

    // Award points
    await pool.query(
      'UPDATE users SET points = COALESCE(points, 0) + ? WHERE id = ?',
      [config.points, userId]
    );

    return { badge_type: badgeType, badge_name: config.name, points: config.points };
  } catch (error) {
    console.error('Error awarding badge:', error);
    return null;
  }
}

// Get referral requests (for candidate or employee)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const role = req.user.role;
    let query, params;

    if (role === 'employee') {
      query = `
        SELECT r.*,
               u.full_name as candidate_name,
               u.avatar_url as candidate_avatar,
               j.title as job_title,
               j.company_name as job_company
        FROM referral_requests r
        LEFT JOIN users u ON r.candidate_id = u.id
        LEFT JOIN jobs j ON r.job_id = j.id
        WHERE r.employee_id = ?
        ORDER BY r.created_at DESC
      `;
      params = [req.user.id];
    } else {
      query = `
        SELECT r.*,
               u.full_name as employee_name,
               u.avatar_url as employee_avatar,
               ep.company as employee_company,
               ep.designation as employee_designation,
               j.title as job_title,
               j.company_name as job_company
        FROM referral_requests r
        LEFT JOIN users u ON r.employee_id = u.id
        LEFT JOIN employee_profiles ep ON r.employee_id = ep.user_id
        LEFT JOIN jobs j ON r.job_id = j.id
        WHERE r.candidate_id = ?
        ORDER BY r.created_at DESC
      `;
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

    // Validate employee_id is a valid UUID
    if (!employee_id || !UUID_REGEX.test(employee_id)) {
      return res.status(400).json({ error: 'Invalid employee ID format' });
    }

    // Verify the employee exists and has employee role
    const [employees] = await pool.query(
      `SELECT u.id, u.full_name, u.role, ep.company, ep.designation
       FROM users u
       LEFT JOIN employee_profiles ep ON u.id = ep.user_id
       WHERE u.id = ?`,
      [employee_id]
    );

    if (employees.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const employee = employees[0];
    if (employee.role !== 'employee') {
      return res.status(400).json({ error: 'User is not an employee' });
    }

    // Validate job_id if provided
    if (job_id && !UUID_REGEX.test(job_id)) {
      return res.status(400).json({ error: 'Invalid job ID format' });
    }

    // Check for existing pending referral request
    const [existing] = await pool.query(
      `SELECT * FROM referral_requests
       WHERE candidate_id = ? AND employee_id = ? AND status = 'requested'`,
      [req.user.id, employee_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'You already have a pending referral request with this employee' });
    }

    const id = uuidv4();

    await pool.query(
      `INSERT INTO referral_requests
       (id, candidate_id, employee_id, job_id, cover_letter, candidate_message, status)
       VALUES (?, ?, ?, ?, ?, ?, 'requested')`,
      [id, req.user.id, employee_id, job_id || null, cover_letter || null, candidate_message || null]
    );

    // Award first_referral badge if this is the candidate's first referral request
    const [previousRequests] = await pool.query(
      'SELECT COUNT(*) as count FROM referral_requests WHERE candidate_id = ?',
      [req.user.id]
    );

    let badgeAwarded = null;
    if (previousRequests[0].count === 1) {
      // This is their first referral request
      badgeAwarded = await awardBadge(req.user.id, 'first_referral', pool);
    }

    const [created] = await pool.query('SELECT * FROM referral_requests WHERE id = ?', [id]);
    res.status(201).json({ ...created[0], badge_awarded: badgeAwarded });
  } catch (error) {
    console.error('Create referral error:', error);
    res.status(500).json({ error: 'Failed to create referral request' });
  }
});

// Update referral status
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { status, employee_notes } = req.body;

    // Validate status
    const validStatuses = ['requested', 'accepted', 'rejected', 'referred', 'shortlisted', 'interview', 'offer', 'hired'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const [existing] = await pool.query(
      'SELECT * FROM referral_requests WHERE id = ? AND (employee_id = ? OR candidate_id = ?)',
      [req.params.id, req.user.id, req.user.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Referral request not found or unauthorized' });
    }

    const previousStatus = existing[0].status;
    const candidateId = existing[0].candidate_id;
    const employeeId = existing[0].employee_id;

    await pool.query(
      'UPDATE referral_requests SET status = ?, employee_notes = ?, updated_at = NOW() WHERE id = ?',
      [status, employee_notes || null, req.params.id]
    );

    // Award badges based on status transitions
    let badgeAwarded = null;

    if (status === 'accepted' && previousStatus !== 'accepted') {
      // Award referral_accepted badge to candidate
      badgeAwarded = await awardBadge(candidateId, 'referral_accepted', pool);

      // Update employee's total_referrals count
      await pool.query(
        'UPDATE employee_profiles SET total_referrals = COALESCE(total_referrals, 0) + 1 WHERE user_id = ?',
        [employeeId]
      );
    }

    if (status === 'hired' && previousStatus !== 'hired') {
      // Award hired badge to candidate
      badgeAwarded = await awardBadge(candidateId, 'hired', pool);

      // Update employee's successful_referrals count
      await pool.query(
        'UPDATE employee_profiles SET successful_referrals = COALESCE(successful_referrals, 0) + 1 WHERE user_id = ?',
        [employeeId]
      );
    }

    const [updated] = await pool.query('SELECT * FROM referral_requests WHERE id = ?', [req.params.id]);
    res.json({ ...updated[0], badge_awarded: badgeAwarded });
  } catch (error) {
    console.error('Update referral error:', error);
    res.status(500).json({ error: 'Failed to update referral' });
  }
});

// Get employees list (for finding referrers)
router.get('/employees', authMiddleware, async (req, res) => {
  try {
    const { search, company } = req.query;

   let query = `
      SELECT u.id, u.full_name, u.avatar_url,
             COALESCE(ep.company, 'Not Set') as company,
             COALESCE(ep.designation, 'Not Set') as designation,
             COALESCE(ep.trust_score, 50) as trust_score,
             COALESCE(ep.total_referrals, 0) as total_referrals,
             COALESCE(ep.successful_referrals, 0) as successful_referrals,
             COALESCE(ep.linkedin_verified, FALSE) as linkedin_verified,
             COALESCE(ep.company_email_verified, FALSE) as company_email_verified
      FROM users u
      LEFT JOIN employee_profiles ep ON u.id = ep.user_id
      WHERE u.role = 'employee'
    `;
    const params = [];

    if (search) {
      query += ' AND (u.full_name LIKE ? OR ep.company LIKE ? OR ep.designation LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (company) {
      query += ' AND ep.company LIKE ?';
      params.push(`%${company}%`);
    }

    query += ' ORDER BY ep.successful_referrals DESC, ep.trust_score DESC LIMIT 50';

    const [employees] = await pool.query(query, params);
    res.json(employees);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Failed to get employees' });
  }
});

// Get a specific employee by ID
router.get('/employees/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({ error: 'Invalid employee ID format' });
    }

    const [employees] = await pool.query(
      `SELECT u.id, u.full_name, u.avatar_url, ep.company, ep.designation,
              ep.trust_score, ep.total_referrals, ep.successful_referrals,
              ep.linkedin_verified, ep.company_email_verified, ep.linkedin_url
       FROM users u
       JOIN employee_profiles ep ON u.id = ep.user_id
       WHERE u.id = ? AND u.role = 'employee'`,
      [id]
    );

    if (employees.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(employees[0]);
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ error: 'Failed to get employee' });
  }
});

module.exports = router;