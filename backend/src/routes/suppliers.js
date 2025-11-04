const express = require('express');
const pool = require('../db');
const { authenticate, adminOnly } = require('../middleware/auth');
const router = express.Router();

// List suppliers
router.get('/', async (req, res) => {
  try{
    const [rows] = await pool.query('SELECT * FROM Suppliers');
    res.json(rows);
  }catch(err){ console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// Admin create
router.post('/', authenticate, adminOnly, async (req, res) => {
  try{
    const { company_name, rating } = req.body;
    const [result] = await pool.query('INSERT INTO Suppliers (company_name, rating) VALUES (?,?)', [company_name, rating||3]);
    res.json({ supplier_id: result.insertId });
  }catch(err){ console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// Admin update
router.put('/:id', authenticate, adminOnly, async (req, res) => {
  try{
    const { id } = req.params;
    const { company_name, rating } = req.body;
    await pool.query('UPDATE Suppliers SET company_name=?, rating=? WHERE supplier_id=?', [company_name, rating, id]);
    res.json({ ok: true });
  }catch(err){ console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// Admin delete
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try{
    const { id } = req.params;
    await pool.query('DELETE FROM Suppliers WHERE supplier_id=?', [id]);
    res.json({ ok: true });
  }catch(err){ console.error(err); res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
