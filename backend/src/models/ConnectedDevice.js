const mongoose = require('mongoose');

const connectedDeviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deviceName: {
    type: String,
    required: true,
    trim: true
  },
  connectionType: {
    type: String,
    enum: ['bluetooth', 'wifi'],
    required: true
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'error'],
    default: 'offline'
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  lastSensorData: {
    soil: { type: Number, default: null },
    temperature: { type: Number, default: null },
    humidity: { type: Number, default: null },
    tankLevel: { type: Number, default: null },
    pumpStatus: { type: String, enum: ['ON', 'OFF'], default: 'OFF' }
  },
  metadata: {
    ipAddress: String,
    macAddress: String,
    firmwareVersion: String,
    bluetoothAddress: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
connectedDeviceSchema.index({ userId: 1, status: 1 });
connectedDeviceSchema.index({ deviceId: 1, userId: 1 });
connectedDeviceSchema.index({ lastSeen: -1 });

// Method to check if device is online (seen within last 2 minutes)
connectedDeviceSchema.methods.isOnline = function() {
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
  return this.lastSeen > twoMinutesAgo;
};

// Static method to mark offline devices
connectedDeviceSchema.statics.markOfflineDevices = async function() {
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
  await this.updateMany(
    { lastSeen: { $lt: twoMinutesAgo }, status: 'online' },
    { status: 'offline' }
  );
};

module.exports = mongoose.model('ConnectedDevice', connectedDeviceSchema);
