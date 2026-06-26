const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authMiddleware, optionalAuth } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Get all forum posts
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, search, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT fp.*, u.full_name as author_name
      FROM forum_posts fp
      JOIN users u ON fp.author_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      query += ' AND fp.category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (fp.title LIKE ? OR fp.content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY fp.is_pinned DESC, fp.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [posts] = await pool.query(query, params);
    res.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Failed to get posts' });
  }
});

// Get single post
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const [posts] = await pool.query(`
      SELECT fp.*, u.full_name as author_name
      FROM forum_posts fp
      JOIN users u ON fp.author_id = u.id
      WHERE fp.id = ?
    `, [req.params.id]);

    if (posts.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Increment views
    await pool.query('UPDATE forum_posts SET views = views + 1 WHERE id = ?', [req.params.id]);

    res.json(posts[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get post' });
  }
});

// Create post
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const id = uuidv4();

    await pool.query(
      'INSERT INTO forum_posts (id, author_id, title, content, category, tags) VALUES (?, ?, ?, ?, ?, ?)',
      [id, req.user.id, title, content, category || 'general', JSON.stringify(tags || [])]
    );

    const [posts] = await pool.query(`
      SELECT fp.*, u.full_name as author_name
      FROM forum_posts fp
      JOIN users u ON fp.author_id = u.id
      WHERE fp.id = ?
    `, [id]);

    res.status(201).json(posts[0]);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Toggle like
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    await pool.query(
      'UPDATE forum_posts SET upvotes = upvotes + 1 WHERE id = ?',
      [req.params.id]
    );

    const [posts] = await pool.query('SELECT upvotes FROM forum_posts WHERE id = ?', [req.params.id]);
    res.json({ upvotes: posts[0]?.upvotes || 0 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to like post' });
  }
});

// Get replies
router.get('/:id/replies', async (req, res) => {
  try {
    const [replies] = await pool.query(`
      SELECT fr.*, u.full_name as author_name
      FROM forum_replies fr
      JOIN users u ON fr.author_id = u.id
      WHERE fr.post_id = ?
      ORDER BY fr.created_at ASC
    `, [req.params.id]);

    res.json(replies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get replies' });
  }
});

// Create reply
router.post('/:id/replies', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const id = uuidv4();

    await pool.query(
      'INSERT INTO forum_replies (id, post_id, author_id, content) VALUES (?, ?, ?, ?)',
      [id, req.params.id, req.user.id, content]
    );

    // Update reply count
    await pool.query('UPDATE forum_posts SET reply_count = reply_count + 1 WHERE id = ?', [req.params.id]);

    const [replies] = await pool.query(`
      SELECT fr.*, u.full_name as author_name
      FROM forum_replies fr
      JOIN users u ON fr.author_id = u.id
      WHERE fr.id = ?
    `, [id]);

    res.status(201).json(replies[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create reply' });
  }
});

module.exports = router;
