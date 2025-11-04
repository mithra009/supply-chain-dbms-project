const express = require('express');
const pool = require('../db');
const { authenticate, adminOnly } = require('../middleware/auth');
const router = express.Router();

// list
router.get('/', async (req, res) => {
  try{ const [rows] = await pool.query('SELECT * FROM Warehouses'); res.json(rows); }catch(err){ console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// create
router.post('/', authenticate, adminOnly, async (req, res) => {
  try{ const { location } = req.body; const [r] = await pool.query('INSERT INTO Warehouses (location) VALUES (?)', [location]); res.json({ wh_id: r.insertId }); }catch(err){ console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// update
router.put('/:id', authenticate, adminOnly, async (req, res) => {
  try{ const { id } = req.params; const { location } = req.body; await pool.query('UPDATE Warehouses SET location=? WHERE wh_id=?', [location, id]); res.json({ ok: true }); }catch(err){ console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// delete
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try{ 
    const { id } = req.params; 
    await pool.query('DELETE FROM Warehouses WHERE wh_id=?', [id]); 
    res.json({ ok: true }); 
  }catch(err){ 
    console.error(err); 
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      res.status(400).json({ error: 'Cannot delete warehouse: It has active orders or sales records. Please complete/cancel all orders first.' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

module.exports = router;
