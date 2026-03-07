const mongoose = require('mongoose');

const irrigationSystemSchema = new mongoose.Schema({
  systemId: {
    type: String,
    required: true,
    unique: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ownerName: {
    type: String,
    required: true
  },
  region: {
    type: String,
    required: true
  },
  location: {
    latitude: {
      type: Number,
      required: true,
      default: 0
    },
    longitude: {
      type: Number,
      required: true,
      default: 0
    }
  },
  // Current sensor readings
  soilMoisture: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  temperature: {
    type: Number,
    default: 0
  },
  humidity: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  waterTankLevel: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  pumpStatus: {
    type: String,
    enum: ['ON', 'OFF', 'ERROR'],
    default: 'OFF'
  },
  batteryLevel: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  solarStatus: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'CHARGING', 'ERROR'],
    default: 'ACTIVE'
  },
  // System health and status
  systemStatus: {
    type: String,
    enum: ['Online', 'Offline', 'Warning', 'Critical'],
    default: 'Offline'
  },
  systemHealth: {
    type: String,
    enum: ['Normal', 'Warning', 'Critical'],
    default: 'Normal'
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  // Technical status flags (Admin only)
  sensorOnline: {
    type: Boolean,
    default: true
  },
  deviceResponding: {
    type: Boolean,
    default: true
  },
  networkStatus: {
    type: String,
    enum: ['Connected', 'Disconnected', 'Poor'],
    default: 'Connected'
  },
  firmwareVersion: {
    type: String,
    default: '1.0.0'
  },
  hardwareStatus: {
    type: String,
    enum: ['OK', 'Warning', 'Fault'],
    default: 'OK'
  },
  // Metadata
  installDate: {
    type: Date,
    default: Date.now
  },
  lastMaintenance: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
irrigationSystemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Determine system health based on conditions
irrigationSystemSchema.methods.calculateSystemHealth = function() {
  const now = Date.now();
  const timeSinceActive = now - this.lastActive.getTime();
  const fiveMinutes = 5 * 60 * 1000;
  const thirtyMinutes = 30 * 60 * 1000;

  // Critical conditions
  if (!this.sensorOnline || !this.deviceResponding || this.hardwareStatus === 'Fault') {
    this.systemHealth = 'Critical';
    this.systemStatus = 'Critical';
    return 'Critical';
  }

  // Warning conditions
  if (
    timeSinceActive > thirtyMinutes ||
    this.networkStatus === 'Poor' ||
    this.hardwareStatus === 'Warning' ||
    this.batteryLevel < 20
  ) {
    this.systemHealth = 'Warning';
    this.systemStatus = 'Warning';
    return 'Warning';
  }

  // Offline check
  if (timeSinceActive > fiveMinutes) {
    this.systemStatus = 'Offline';
    this.systemHealth = 'Warning';
    return 'Warning';
  }

  // Normal
  this.systemHealth = 'Normal';
  this.systemStatus = 'Online';
  return 'Normal';
};

module.exports = mongoose.model('IrrigationSystem', irrigationSystemSchema);
