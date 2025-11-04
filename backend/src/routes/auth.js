const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'replace-this-secret';

// Register (admin or client) - for quick seeds only. In production, restrict registration.
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const [rows] = await pool.query('SELECT user_id FROM Users WHERE email=?', [email]);
    if (rows.length) return res.status(400).json({ error: 'Email already exists' });

    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query('INSERT INTO Users (name,email,password_hash,role) VALUES (?,?,?,?)', [name,email,password_hash,role||'client']);
    res.json({ user_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query('SELECT user_id, name, email, password_hash, role FROM Users WHERE email=?', [email]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ user_id: user.user_id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
