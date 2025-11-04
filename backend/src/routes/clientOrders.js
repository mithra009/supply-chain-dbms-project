const express = require('express');
const pool = require('../db');
const router = express.Router();

// Place a client order -> inserts into ClientOrders (trigger will create Sales & update Inventory)
router.post('/', async (req, res) => {
  try {
    const { user_id, prod_id, wh_id, qty } = req.body;
    if (!user_id || !prod_id || !wh_id || !qty) return res.status(400).json({ error: 'Missing fields' });

    // Validate stock exists and is sufficient before inserting
    const [invRows] = await pool.query('SELECT inv_id, stock_qty, safety_stock FROM Inventory WHERE prod_id=? AND wh_id=? FOR UPDATE', [prod_id, wh_id]);
    if (!invRows.length) return res.status(400).json({ error: 'No inventory for this product at selected warehouse' });
    const inv = invRows[0];
    if (inv.stock_qty < qty) return res.status(400).json({ error: 'Insufficient stock' });

    // Insert client order. The DB trigger will insert into Sales and decrement Inventory.
    const [result] = await pool.query('INSERT INTO ClientOrders (user_id, prod_id, wh_id, qty) VALUES (?,?,?,?)', [user_id, prod_id, wh_id, qty]);

    // After insert, check current stock and let admin know via logs; admin can query /api/inventory/low
    const [after] = await pool.query('SELECT stock_qty, safety_stock FROM Inventory WHERE prod_id=? AND wh_id=?', [prod_id, wh_id]);
    const current = after[0];
    if (current && current.stock_qty < current.safety_stock){
      console.log(`Low stock alert: prod ${prod_id} at wh ${wh_id} now ${current.stock_qty} (< ${current.safety_stock})`);
    }

    res.json({ corder_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// View client's orders
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.query('SELECT * FROM ClientOrders WHERE user_id=? ORDER BY created_at DESC', [userId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: View all client orders
router.get('/all', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM ClientOrders ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
