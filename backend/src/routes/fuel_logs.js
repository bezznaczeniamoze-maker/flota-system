const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT fl.*, v.name as vehicle_name, u.name as user_name FROM fuel_logs fl LEFT JOIN vehicles v ON fl.vehicle_id = v.id LEFT JOIN users u ON fl.user_id = u.id ORDER BY fl.created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/vehicle/:vehicle_id', async (req, res) => {
  try {
    const result = await pool.query('SELECT fl.*, u.name as user_name FROM fuel_logs fl LEFT JOIN users u ON fl.user_id = u.id WHERE fl.vehicle_id = $1 ORDER BY fl.created_at DESC', [req.params.vehicle_id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { vehicle_id, user_id, liters, cost, km_reading } = req.body;
    if (!vehicle_id || !liters) {
      return res.status(400).json({ error: 'vehicle_id and liters required' });
    }
    const result = await pool.query('INSERT INTO fuel_logs (vehicle_id, user_id, liters, cost, km_reading) VALUES ($1, $2, $3, $4, $5) RETURNING *', [vehicle_id, user_id, liters, cost, km_reading]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
