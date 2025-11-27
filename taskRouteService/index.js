const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const crypto = require('crypto');
const Message = require('./src/model');
const cors = require("cors");
const morgan = require("morgan");

const app = express();
app.use(express.json());
app.use(cors())
app.use(morgan('dev'));
mongoose.connect(process.env.DB);

const DELIVERY_URL = process.env.DELIVERY_URL || '';
const LOG_URL = process.env.LOG_URL || '';

function log(traceId, span, message, meta = {}) {
  axios.post(LOG_URL, { traceId, span, message, meta }).catch(() => {});
}

app.post('/api/messages', async (req, res) => {
  const { to, channel, body } = req.body;

  // 1. validation
  if (!to || !channel || !body) {
    return res.status(400).json({ error: 'to, channel, body are required' });
  }

  const traceId = crypto.randomUUID();

  // strong dedupe key
  const dedupeKey = crypto
    .createHash('sha256')
    .update(`${to}|${channel}|${body}`)
    .digest('hex');

  try {
    const existing = await Message.findOne({ dedupeKey });
    if (existing) {
      await log(traceId, 'router', 'Duplicate message ignored (pre-check)', {
        messageId: existing._id,
      });
      return res.status(200).json({
        status: 'duplicate_ignored',
        messageId: existing._id,
      });
    }
    let msg;
    try {
      msg = await Message.create({
        to,
        channel,
        body,
        dedupeKey,
        status: 'pending',
        traceId,
      });
    } catch (e) {
      if (e.code === 11000 && e.keyPattern && e.keyPattern.dedupeKey) {
        const dup = await Message.findOne({ dedupeKey });
        await log(traceId, 'router', 'Duplicate message ignored (E11000)', {
          messageId: dup?._id,
        });
        return res.status(200).json({
          status: 'duplicate_ignored',
          messageId: dup?._id,
        });
      }

      await log(traceId, 'router', 'Internal error (create)', { error: e.message });
      return res.status(500).json({ error: 'Internal server error' });
    }

    await log(traceId, 'router', 'Message accepted', {
      messageId: msg._id,
      channel,
    });

    const deliveryPayload = {
      messageId: msg._id,
      to,
      channel,
      body,
      traceId,
    };

    try {
      const { data } = await axios.post(DELIVERY_URL, deliveryPayload);

      await Message.findByIdAndUpdate(msg._id, {
        status: data.status || 'sent',
        attempts: data.attempts ?? 1,
      });

      await log(traceId, 'router', 'Delivery success response', {
        messageId: msg._id,
        status: data.status,
      });

      return res.json({
        messageId: msg._id,
        status: data.status || 'sent',
      });
    } catch (err) {
      console.error('Delivery error:', err.message);

      await Message.findByIdAndUpdate(msg._id, {
        status: 'failed',
        $inc: { attempts: 1 },
      });

      await log(traceId, 'router', 'Delivery failed after retries', {
        error: err.message,
        messageId: msg._id,
      });

      return res.status(502).json({ error: 'Delivery failed' });
    }
  } catch (e) {
    console.error('Unexpected error in /api/messages:', e);
    await log(traceId, 'router', 'Internal error (outer)', { error: e.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
});


app.listen(process.env.PORT || 4000, () => console.log('Task Router on 4000'));