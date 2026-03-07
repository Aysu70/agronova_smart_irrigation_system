const mongoose = require('mongoose');

const adminAlertSchema = new mongoose.Schema({
  systemId: {
    type: String,
    required: true
  },
  systemOwnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ownerName: {
    type: String,
    required: true
  },
  region: {
    type: String,
    required: true
  },
  alertType: {
    type: String,
    enum: [
      'SENSOR_OFFLINE',
      'DEVICE_NOT_RESPONDING',
      'NO_DATA_RECEIVED',
      'NETWORK_FAILURE',
      'FIRMWARE_ERROR',
      'HARDWARE_FAULT',
      'BATTERY_CRITICAL',
      'SOLAR_MALFUNCTION',
      'SYSTEM_OFFLINE'
    ],
    required: true
  },
  severity: {
    type: String,
    enum: ['INFO', 'WARNING', 'CRITICAL'],
    default: 'WARNING'
  },
  message: {
    type: String,
    required: true
  },
  details: {
    type: String,
    default: ''
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: {
    type: Date
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
adminAlertSchema.index({ systemId: 1, createdAt: -1 });
adminAlertSchema.index({ isRead: 1, isResolved: 1 });
adminAlertSchema.index({ alertType: 1 });

module.exports = mongoose.model('AdminAlert', adminAlertSchema);
