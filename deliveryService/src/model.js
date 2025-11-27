// models/Delivery.js
const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  messageId: String,
  to: String,
  channel: String,
  body: String,
  status: { type: String, enum: ['sent', 'failed'], default: 'sent' },
  attempts: Number,
}, { timestamps: true });

module.exports = mongoose.model('Delivery', deliverySchema);
