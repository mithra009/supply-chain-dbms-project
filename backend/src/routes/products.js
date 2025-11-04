const express = require('express');
const pool = require('../db');
const { authenticate, adminOnly } = require('../middleware/auth');
const router = express.Router();

// List products (client & admin)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Products');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: create product
router.post('/', authenticate, adminOnly, async (req, res) => {
  try {
    const { name, category, unit_price } = req.body;
    const [result] = await pool.query('INSERT INTO Products (name,category,unit_price) VALUES (?,?,?)', [name,category,unit_price]);
    res.json({ prod_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: update product
router.put('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, unit_price } = req.body;
    await pool.query('UPDATE Products SET name=?, category=?, unit_price=? WHERE prod_id=?', [name,category,unit_price,id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: delete product
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM Products WHERE prod_id=?', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    // Check if it's a foreign key constraint error
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      res.status(400).json({ 
        error: 'Cannot delete product: It has inventory records or order history. Please remove all inventory and complete/cancel all orders first.' 
      });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

module.exports = router;
