const { Router } = require('express');
const sql = require('mssql');

const router = Router();

const QUERY_COLUMNS =
  'sender, receiver, msgdata, time, smsc_id, coding, client_msg_id, service';

router.post('/', async (req, res) => {
  const { host, port, user, password, database, table } = req.body;

  if (!host || !user || !password || !database || !table) {
    return res.status(400).json({ error: 'Missing required fields', rows: [] });
  }

  let pool;
  try {
    pool = await sql.connect({
      server: host,
      port: port || 1433,
      user,
      password,
      database,
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
      connectionTimeout: 10000,
      requestTimeout: 15000,
    });

    const result = await pool.request().query(
      `SELECT ${QUERY_COLUMNS} FROM [${table}]`
    );

    res.json({ rows: result.recordset });
  } catch (err) {
    console.error('[MSSQL Error]', err.message);
    res.status(500).json({ error: err.message, rows: [] });
  } finally {
    if (pool) await pool.close().catch(() => {});
  }
});

module.exports = router;
