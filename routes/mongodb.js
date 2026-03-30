const { Router } = require('express');
const { MongoClient } = require('mongodb');

const router = Router();

router.post('/', async (req, res) => {
  const { host, port, user, password, database, table, columns } = req.body;

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

    let projection = {};
    if (columns && columns !== '*') {
      columns.split(',').forEach(c => {
        const field = c.trim();
        if (field) projection[field] = 1;
      });
      if (Object.keys(projection).length > 0 && projection._id === undefined) {
        projection._id = 0;
      }
    }
    const findOptions = Object.keys(projection).length > 0 ? { projection } : {};

    const db = client.db(database);
    const rows = await db
      .collection(table)
      .find({}, findOptions)
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
