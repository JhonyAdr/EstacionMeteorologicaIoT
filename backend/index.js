import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Guardar una predicción
app.post('/api/predicciones', async (req, res) => {
  const { fecha, temperatura, humedad, presion, lluvia, frio, confort } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO historial_predicciones (fecha, temperatura, humedad, presion, lluvia, frio, confort)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [fecha, temperatura, humedad, presion, lluvia, frio, confort]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener el historial de predicciones
app.get('/api/predicciones', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, fecha, temperatura, humedad, presion, lluvia, frio, confort
       FROM historial_predicciones
       ORDER BY fecha DESC
       LIMIT 20`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
}); 