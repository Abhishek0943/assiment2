// models/Message.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    to: {
      type: String,
      required: true,
      trim: true,
    },
    channel: {
      type: String,
      required: true,
      trim: true,
      enum: ['sms', 'email', 'whatsapp', 'push', 'other'],
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },

    // dedupe key (to|channel|body hash)
    dedupeKey: {
      type: String,
      required: true,
      // unique: true,
      index: true,
    },

    traceId: {
      type: String,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'queued'],
      default: 'pending',
      index: true,
    },

    attempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ensure index (if needed)
// MessageSchema.index({ dedupeKey: 1 }, { unique: true });

module.exports = mongoose.model('Message', MessageSchema);
