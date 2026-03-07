const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
  soilMoisture: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  temperature: {
    type: Number,
    required: true
  },
  humidity: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  waterTankLevel: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  pumpStatus: {
    type: String,
    enum: ['ON', 'OFF'],
    default: 'OFF'
  },
  solarPanelStatus: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'CHARGING'],
    default: 'ACTIVE'
  },
  solarPanelAngle: {
    type: Number,
    default: 0
  },
  batteryLevel: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient time-based queries
sensorDataSchema.index({ timestamp: -1 });

module.exports = mongoose.model('SensorData', sensorDataSchema);
