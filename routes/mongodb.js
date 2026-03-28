const { Router } = require('express');
const { MongoClient } = require('mongodb');

const router = Router();

const PROJECTION = {
  _id: 0,
  sender: 1,
  receiver: 1,
  msgdata: 1,
  time: 1,
  smsc_id: 1,
  coding: 1,
  client_msg_id: 1,
  service: 1,
};

router.post('/', async (req, res) => {
  const { host, port, user, password, database, table } = req.body;

  if (!host || !user || !password || !database || !table) {
    return res.status(400).json({ error: 'Missing required fields', rows: [] });
  }

  const uri = `mongodb://${encodeURIComponent(user)}:${encodeURIComponent(
    password
  )}@${host}:${port || 27017}/${database}?authSource=admin`;

  let client;
  try {
    client = new MongoClient(uri, {
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
    });

    await client.connect();

    const db = client.db(database);
    const rows = await db
      .collection(table)
      .find({}, { projection: PROJECTION })
      .toArray();

    res.json({ rows });
  } catch (err) {
    console.error('[MongoDB Error]', err.message);
    res.status(500).json({ error: err.message, rows: [] });
  } finally {
    if (client) await client.close().catch(() => {});
  }
});

module.exports = router;
