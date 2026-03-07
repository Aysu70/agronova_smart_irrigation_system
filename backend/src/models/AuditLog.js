const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  // Core audit information
  action: {
    type: String,
    enum: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'BULK_UPDATE', 'RESTORE'],
    required: true,
    index: true
  },
  
  // What was changed
  collectionName: {
    type: String,
    required: true,
    index: true
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  
  // Who made the change
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    default: null // For system actions
  },
  userEmail: String,
  
  // What changed
  oldValues: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  newValues: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  changedFields: [String], // List of field names that changed
  
  // Context
  ipAddress: String,
  userAgent: String,
  reason: String, // Optional reason for the change
  
  // Status
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED', 'PENDING'],
    default: 'SUCCESS'
  },
  errorMessage: String,
  
  // Timestamp
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
    ttl: 7776000 // Auto-delete after 90 days (in seconds: 90*24*60*60)
  },
  
  // Additional context
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

// Compound index for efficient queries
auditLogSchema.index({ collectionName: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ documentId: 1, action: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
