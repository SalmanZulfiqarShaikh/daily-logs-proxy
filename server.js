const express = require('express');
const mysql = require('mysql2/promise');
const sql = require('mssql');
const { MongoClient } = require('mongodb');

const app = express();
app.use(express.json());

// MySQL
app.post('/query/mysql', async (req, res) => {
  const { host, port, user, password, database, table } = req.body;
  try {
    const conn = await mysql.createConnection({ host, port: Number(port), user, password, database });
    const [rows] = await conn.execute(`SELECT sender, receiver, msgdata, time, smsc_id, coding, client_msg_id FROM \`${table}\``);
    await conn.end();
    res.json({ rows });
  } catch (e) {
    res.status(500).json({ error: e.message, rows: [] });
  }
});

// MSSQL
app.post('/query/mssql', async (req, res) => {
  const { host, port, user, password, database, table } = req.body;
  try {
    const pool = await sql.connect({
      server: host,
      port: Number(port),
      user, password, database,
      options: { encrypt: false, trustServerCertificate: true },
      connectionTimeout: 20000,
      requestTimeout: 60000
    });
    const result = await pool.request()
      .query(`SELECT sender, receiver, msgdata, time, smsc_id, coding, client_msg_id FROM [${table}]`);
    await sql.close();
    res.json({ rows: result.recordset });
  } catch (e) {
    await sql.close().catch(() => {});
    res.status(500).json({ error: e.message, rows: [] });
  }
});

// MongoDB
app.post('/query/mongodb', async (req, res) => {
  const { host, port, user, password, database, table } = req.body;
  const uri = `mongodb://${user}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const rows = await client.db(database).collection(table)
      .find({}, { projection: { sender:1, receiver:1, msgdata:1, time:1, smsc_id:1, coding:1, client_msg_id:1 } })
      .toArray();
    await client.close();
    res.json({ rows });
  } catch (e) {
    await client.close().catch(() => {});
    res.status(500).json({ error: e.message, rows: [] });
  }
});

// Health check
app.get('/', (req, res) => res.json({ status: 'DB Proxy running' }));

app.listen(process.env.PORT || 3333, () => console.log('DB Proxy running...'));