const express = require('express');
const pool = require('../db');
const router = express.Router();
const { authenticate, adminOnly } = require('../middleware/auth');

// Admin: create purchase order
router.post('/', async (req, res) => {
  try {
    const { supplier_id, prod_id, qty, expected_date } = req.body;
    const [result] = await pool.query('INSERT INTO Orders (supplier_id, prod_id, qty, expected_date, status) VALUES (?,?,?,?,?)', [supplier_id, prod_id, qty, expected_date || null, 'Placed']);
    res.json({ order_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Placed, Delivered, Completed, Cancelled
    await pool.query('UPDATE Orders SET status=? WHERE order_id=?', [status, id]);
    // If status is Delivered, admin should call an endpoint to increase inventory (or you could add auto behavior here)
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// List orders
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT o.*, s.company_name, p.name as product_name FROM Orders o LEFT JOIN Suppliers s ON o.supplier_id = s.supplier_id LEFT JOIN Products p ON o.prod_id = p.prod_id ORDER BY o.created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: receive order and increase inventory
router.put('/:id/receive', authenticate, adminOnly, async (req, res) => {
  try{
    const { id } = req.params;
    const { wh_id } = req.body; // warehouse to receive into
    const [[order]] = await pool.query('SELECT * FROM Orders WHERE order_id=?', [id]);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Increase inventory for order.prod_id at wh_id
    const [invRows] = await pool.query('SELECT * FROM Inventory WHERE prod_id=? AND wh_id=?', [order.prod_id, wh_id]);
    if (invRows.length){
      await pool.query('UPDATE Inventory SET stock_qty = stock_qty + ?, last_updated=CURRENT_TIMESTAMP WHERE prod_id=? AND wh_id=?', [order.qty, order.prod_id, wh_id]);
    }else{
      await pool.query('INSERT INTO Inventory (prod_id, wh_id, stock_qty, safety_stock) VALUES (?,?,?,?)', [order.prod_id, wh_id, order.qty, 0]);
    }

    await pool.query('UPDATE Orders SET status=? WHERE order_id=?', ['Delivered', id]);
    res.json({ ok: true });
  }catch(err){ console.error(err); res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
