const mongoose = require('mongoose');

const behaviorLogSchema = new mongoose.Schema({
  // Action information
  action: {
    type: String,
    required: true,
    index: true,
    // Examples: 'USER_LOGIN', 'DEVICE_CREATED', 'IRRIGATION_STARTED', 'SENSOR_READING', etc.
  },
  
  category: {
    type: String,
    enum: [
      'AUTHENTICATION',
      'USER_ACTIVITY',
      'DEVICE_OPERATION',
      'IRRIGATION',
      'SENSOR_DATA',
      'COMMUNITY',
      'COMMERCE',
      'ADMIN_ACTION',
      'SYSTEM_EVENT'
    ],
    required: true,
    index: true
  },
  
  // Actor information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    default: null // For system-triggered actions
  },
  userRole: String,
  
  // Related entities
  relatedEntityType: String, // e.g., 'Device', 'IrrigationSystem', 'Order'
  relatedEntityId: mongoose.Schema.Types.ObjectId,
  
  // Event details
  description: String,
  result: {
    type: String,
    enum: ['SUCCESS', 'FAILED', 'PENDING', 'CANCELLED'],
    default: 'SUCCESS'
  },
  
  // Data
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Request context
  ipAddress: String,
  userAgent: String,
  endpoint: String,
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    default: 'POST'
  },
  
  // Performance metrics
  executionTimeMs: Number,
  
  // Status/Error
  errorDetails: String,
  
  // Timestamp
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
    ttl: 15552000 // Auto-delete after 180 days
  },
  
  // Severity level
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  }
});

// Compound indexes
behaviorLogSchema.index({ action: 1, createdAt: -1 });
behaviorLogSchema.index({ userId: 1, category: 1, createdAt: -1 });
behaviorLogSchema.index({ category: 1, createdAt: -1 });
behaviorLogSchema.index({ relatedEntityType: 1, relatedEntityId: 1 });

module.exports = mongoose.model('BehaviorLog', behaviorLogSchema);
