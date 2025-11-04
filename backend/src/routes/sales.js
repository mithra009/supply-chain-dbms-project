const express = require('express');
const pool = require('../db');
const router = express.Router();

// Get all sales
router.get('/', async (req, res) => {
  try{
    const [rows] = await pool.query('SELECT * FROM Sales ORDER BY created_at DESC');
    res.json(rows);
  }catch(err){ console.error(err); res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
