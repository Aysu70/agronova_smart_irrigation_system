const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['LOW_WATER', 'SENSOR_FAILURE', 'IRRIGATION_START', 'IRRIGATION_STOP', 'BATTERY_LOW', 'POWER_ISSUE'],
    required: true
  },
  severity: {
    type: String,
    enum: ['INFO', 'WARNING', 'CRITICAL'],
    default: 'INFO'
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
alertSchema.index({ timestamp: -1 });
alertSchema.index({ isRead: 1 });

module.exports = mongoose.model('Alert', alertSchema);
