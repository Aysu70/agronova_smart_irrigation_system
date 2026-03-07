const mongoose = require('mongoose');

const realTimeSensorDataSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  soil: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  temperature: {
    type: Number,
    required: true,
    min: -50,
    max: 100
  },
  humidity: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  tankLevel: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  pumpStatus: {
    type: String,
    enum: ['ON', 'OFF'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  connectionType: {
    type: String,
    enum: ['bluetooth', 'wifi'],
    required: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
realTimeSensorDataSchema.index({ userId: 1, timestamp: -1 });
realTimeSensorDataSchema.index({ deviceId: 1, timestamp: -1 });
realTimeSensorDataSchema.index({ timestamp: -1 });

// TTL index - automatically delete data older than 30 days
realTimeSensorDataSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('RealTimeSensorData', realTimeSensorDataSchema);
