// delivery-service/index.js
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const Delivery = require('./src/model');
const cors = require("cors");
const morgan = require("morgan");
const { default: sendEmail } = require('./src/sendEmai');
const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
async function sendSms({ to, body }) {
  return client.messages.create({
    from: process.env.TWILIO_SMS_NUMBER, // Twilio number
    to,                                  // "+91XXXXXXXXXX"
    body,
  });
}

async function sendWhatsapp({ to, body }) {
  return client.messages.create({
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`, // Twilio WA number
    to: `whatsapp:${to}`,                                   // e.g. "whatsapp:+91XXXXXXXXXX"
    body,
  });
}
const app = express();
app.use(express.json());
app.use(cors())
app.use(morgan('dev'));
mongoose.connect(process.env.DB);

const LOG_URL = process.env.LOG_URL || '';

function log(traceId, span, message, meta = {}) {
  axios.post(LOG_URL, { traceId, span, message, meta }).catch(() => {});
}

// simple retry config
const MAX_ATTEMPTS = 3;

async function simulateSend(channel, to, body) {
  // just pretend some calls fail randomly
  if (Math.random() < 0.3) {
    throw new Error('Simulated provider failure');
  }
  if (channel ==="email"){
    sendEmail({email:to, subject:"this is for test",html :body })
  } else if (channel === "sms") {
    await sendSms({ to, body });

  } else if (channel === "whatsapp") {
    await sendWhatsapp({ to, body });

  } else{

    throw new Error('Simulated provider failure');
  }
  return true
}

app.post('/api/deliver', async (req, res) => {
  const { messageId, to, channel, body, traceId } = req.body;
  let attempts = 0;

  while (attempts < MAX_ATTEMPTS) {
    attempts++;
    try {
      log(traceId, 'delivery', 'Attempting send', { attempts, channel, to });
      await simulateSend(channel, to, body);
      await Delivery.create({ messageId, to, channel, body, status: 'sent', attempts });
      log(traceId, 'delivery', 'Send success', { messageId, attempts });
      return res.json({ status: 'sent', attempts });
    } catch (e) {
      log(traceId, 'delivery', 'Send attempt failed', { attempts, error: e.message });
      if (attempts === MAX_ATTEMPTS) {
        await Delivery.create({ messageId, to, channel, body, status: 'failed', attempts });
        return res.status(500).json({ status: 'failed', attempts });
      }
    }
  }
});

app.listen(process.env.PORT|| 4001, () => console.log('Delivery Service on 4001'));
