const mongoose = require('mongoose');

const irrigationConfigSchema = new mongoose.Schema({
  mode: {
    type: String,
    enum: ['AUTOMATIC', 'MANUAL'],
    default: 'AUTOMATIC'
  },
  moistureThreshold: {
    type: Number,
    default: 30,
    min: 0,
    max: 100
  },
  manualTimer: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: false
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('IrrigationConfig', irrigationConfigSchema);
