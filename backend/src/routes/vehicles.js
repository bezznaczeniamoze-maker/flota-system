const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vehicles ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vehicles WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, plate, type, fuel_tank_capacity } = req.body;
    if (!name || !plate) {
      return res.status(400).json({ error: 'Name and plate required' });
    }
    const result = await pool.query(
      'INSERT INTO vehicles (name, plate, type, fuel_tank_capacity) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, plate, type || 'car', fuel_tank_capacity || 50]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, plate, type, fuel_tank_capacity } = req.body;
    const result = await pool.query(
      'UPDATE vehicles SET name = $1, plate = $2, type = $3, fuel_tank_capacity = $4 WHERE id = $5 RETURNING *',
      [name, plate, type, fuel_tank_capacity, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM vehicles WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json({ success: true, message: 'Vehicle deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
