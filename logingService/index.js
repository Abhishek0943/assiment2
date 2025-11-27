// logging-service/index.js
const express = require('express');
const { Client } = require('@elastic/elasticsearch');
const cors = require("cors");
const morgan = require("morgan");

const app = express();
app.use(express.json());
app.use(cors())
app.use(morgan('dev'));
const esClient = new Client({ node: process.env.ES_NODE || '', 

 });
const INDEX = 'comm-logs';

app.post('/api/logs', async (req, res) => {
  const { traceId, span, message, meta = {} } = req.body;

  const logEntry = {
    traceId,
    span,
    message,
    meta,
    timestamp: new Date().toISOString(),
  };

  try {
    await esClient.index({
      index: INDEX,
      document: logEntry,
    });
    res.status(201).json({ ok: true });
  } catch (e) {
    console.error('ES log error', e);
    res.status(500).json({ error: 'Failed to write log' });
  }
});

// optional: for React UI
app.get('/api/logs', async (req, res) => {
  const { traceId } = req.query;
  const query = traceId ? { match: { traceId } } : { match_all: {} };

  const { hits } = await esClient.search({
    index: INDEX,
    size: 50,
    query,
  });

  res.json(hits.hits.map(h => h._source));
});

app.listen(process.env.PORT || 4002, () => console.log('Logging Service on 4002'));
