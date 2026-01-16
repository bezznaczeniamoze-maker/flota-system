const express = require('express');
const cors = require('cors');
const pool = require('./db');
const vehiclesRouter = require('./routes/vehicles');
const fuelLogsRouter = require('./routes/fuel_logs');
const authRouter = require('./routes/auth');

const app = express();

app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as now');
    res.json({ status: 'ok', db_time: result.rows[0].now });
  } catch (e) {
    res.status(500).json({ status: 'db_error', error: e.message });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/fuel-logs', fuelLogsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
