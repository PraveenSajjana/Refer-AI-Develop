const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// Get platform stats (admin only)
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get counts from database
    const [[usersResult]] = await pool.query('SELECT COUNT(*) as count FROM users');
    const [[jobsResult]] = await pool.query('SELECT COUNT(*) as count FROM jobs');
    const [[referralsResult]] = await pool.query('SELECT COUNT(*) as count FROM referral_requests');
    const [[companiesResult]] = await pool.query('SELECT COUNT(*) as count FROM companies');

    // Get additional stats
    const [[candidatesResult]] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'candidate'");
    const [[employeesResult]] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'employee'");
    const [[recruitersResult]] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'recruiter'");
    const [[studentsResult]] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'student'");

    // Get referral status breakdown
    const [referralStatuses] = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM referral_requests
      GROUP BY status
    `);

    // Get recent activity (last 7 days)
    const [[newUsersWeek]] = await pool.query(`
      SELECT COUNT(*) as count FROM users
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);
    const [[newReferralsWeek]] = await pool.query(`
      SELECT COUNT(*) as count FROM referral_requests
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    // Get top companies by referrals
    const [topCompanies] = await pool.query(`
      SELECT c.name, COUNT(r.id) as referral_count
      FROM companies c
      LEFT JOIN referral_requests r ON 1=0
      GROUP BY c.id, c.name
      ORDER BY referral_count DESC
      LIMIT 5
    `);

    // Get monthly growth data (last 6 months)
    const [monthlyGrowth] = await pool.query(`
      SELECT
        DATE_FORMAT(created_at, '%b') as month,
        COUNT(*) as users
      FROM users
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m'), DATE_FORMAT(created_at, '%b')
      ORDER BY MIN(created_at)
    `);

    res.json({
      totals: {
        users: usersResult.count,
        jobs: jobsResult.count,
        referrals: referralsResult.count,
        companies: companiesResult.count,
      },
      usersByRole: {
        candidates: candidatesResult.count,
        employees: employeesResult.count,
        recruiters: recruitersResult.count,
        students: studentsResult.count,
      },
      referralStatuses: referralStatuses.reduce((acc, r) => {
        acc[r.status] = r.count;
        return acc;
      }, {}),
      recentActivity: {
        newUsersWeek: newUsersWeek.count,
        newReferralsWeek: newReferralsWeek.count,
      },
      topCompanies: topCompanies,
      monthlyGrowth: monthlyGrowth,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Get public stats (no auth required)
router.get('/public', async (req, res) => {
  try {
    const [[usersResult]] = await pool.query('SELECT COUNT(*) as count FROM users');
    const [[jobsResult]] = await pool.query('SELECT COUNT(*) as count FROM jobs');
    const [[companiesResult]] = await pool.query('SELECT COUNT(*) as count FROM companies');

    res.json({
      users: usersResult.count,
      jobs: jobsResult.count,
      companies: companiesResult.count,
    });
  } catch (error) {
    console.error('Get public stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

module.exports = router;
