const express = require('express');
const pool = require('../db');
const { authenticate, adminOnly } = require('../middleware/auth');
const router = express.Router();

// Get inventory listing (optionally filter by prod_id or wh_id)
router.get('/', async (req, res) => {
  try {
    const { prod_id, wh_id } = req.query;
    let sql = 'SELECT i.*, p.name as product_name, w.location as warehouse FROM Inventory i JOIN Products p ON i.prod_id = p.prod_id JOIN Warehouses w ON i.wh_id = w.wh_id';
    const params = [];
    const filters = [];
    if (prod_id) { filters.push('i.prod_id = ?'); params.push(prod_id); }
    if (wh_id) { filters.push('i.wh_id = ?'); params.push(wh_id); }
    if (filters.length) sql += ' WHERE ' + filters.join(' AND ');
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Update stock (e.g., after receiving goods)
router.put('/:id/stock', authenticate, adminOnly, async (req, res) => {
  try {
    const { id } = req.params; // inv_id
    const { stock_qty } = req.body;
    await pool.query('UPDATE Inventory SET stock_qty=?, last_updated=CURRENT_TIMESTAMP WHERE inv_id=?', [stock_qty,id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get low stock items (admin)
router.get('/low', authenticate, adminOnly, async (req, res) => {
  try{
    const [rows] = await pool.query('SELECT i.*, p.name as product_name, w.location as warehouse FROM Inventory i JOIN Products p ON i.prod_id = p.prod_id JOIN Warehouses w ON i.wh_id = w.wh_id WHERE i.stock_qty < i.safety_stock');
    res.json(rows);
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
