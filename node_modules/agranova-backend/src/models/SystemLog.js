const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema({
  systemId: {
    type: String,
    required: true,
    index: true
  },
  logType: {
    type: String,
    enum: ['INFO', 'WARNING', 'ERROR', 'SYSTEM', 'SENSOR', 'NETWORK'],
    default: 'INFO'
  },
  action: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries - keep only last 1000 logs per system
systemLogSchema.index({ systemId: 1, timestamp: -1 });

module.exports = mongoose.model('SystemLog', systemLogSchema);
