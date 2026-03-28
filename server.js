const express = require('express');
const mysqlRoute = require('./routes/mysql');
const mssqlRoute = require('./routes/mssql');
const mongodbRoute = require('./routes/mongodb');

const app = express();
const PORT = process.env.PORT || 3333;

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({ status: 'DB Proxy running' });
});

// ── Query routes ─────────────────────────────────────────────────────────────
app.use('/query/mysql', mysqlRoute);
app.use('/query/mssql', mssqlRoute);
app.use('/query/mongodb', mongodbRoute);

// ── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`DB Proxy Server listening on port ${PORT}`);
});
