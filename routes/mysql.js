const { Router } = require('express');
const mysql = require('mysql2/promise');

const router = Router();

router.post('/', async (req, res) => {
  const { host, port, user, password, database, table, columns } = req.body;

  if (!host || !user || !password || !database || !table) {
    return res.status(400).json({ error: 'Missing required fields', rows: [] });
  }

  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      port: port || 3306,
      user,
      password,
      database,
      connectTimeout: 10000,
    });

    const selectCols = columns || '*';
    const [rows] = await connection.execute(
      `SELECT ${selectCols} FROM \`${table}\``
    );

    res.json({ rows });
  } catch (err) {
    console.error('[MySQL Error]', err.message);
    res.status(500).json({ error: err.message, rows: [] });
  } finally {
    if (connection) await connection.end().catch(() => {});
  }
});

module.exports = router;
