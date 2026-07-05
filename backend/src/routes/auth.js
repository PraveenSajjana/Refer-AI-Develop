const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { hashPassword, comparePassword, generateToken, authMiddleware } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name, role = 'candidate' } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password, and full_name are required' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const id = uuidv4();
    const password_hash = hashPassword(password);

    await pool.query(
      'INSERT INTO users (id, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)',
      [id, email, password_hash, full_name, role]
    );

    // In register route after inserting user:
if (role === 'employee') {
  console.log('Creating employee profile for user ID:', id, role);
  await pool.query(
    `INSERT INTO employee_profiles (id, user_id, trust_score, total_referrals, successful_referrals)
     VALUES (UUID(), ?, 50, 0, 0)`,
    [id]
  );
}


    const token = generateToken({ id, email, role });

    res.status(201).json({
      message: 'User registered successfully',
      user: { id, email, full_name, role },
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const [users] = await pool.query(
      'SELECT id, email, password_hash, full_name, role, is_verified, points, plan, created_at FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    if (!comparePassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        is_verified: user.is_verified,
        points: user.points,
        plan: user.plan,
        created_at: user.created_at,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, email, full_name, avatar_url, role, is_verified, points, plan, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Update user
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { full_name, avatar_url } = req.body;

    await pool.query(
      'UPDATE users SET full_name = ?, avatar_url = ? WHERE id = ?',
      [full_name, avatar_url, req.user.id]
    );

    const [users] = await pool.query(
      'SELECT id, email, full_name, avatar_url, role, is_verified, points, plan, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json(users[0]);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

module.exports = router;
