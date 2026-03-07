#!/usr/bin/env node

/**
 * AUDIT SYSTEM SETUP GUIDE
 * 
 * This is a quick reference for integrating audit logging into existing controllers.
 * The system is already set up - just follow these patterns.
 */

// ============================================================================
// 1. MINIMAL SETUP - Already Done
// ============================================================================

// ✅ Database Models Created:
//    - AuditLog.js           (tracks all database changes)
//    - BehaviorLog.js        (tracks user actions and system events)

// ✅ Service Created:
//    - auditService.js       (handles all audit operations)

// ✅ Middleware Created:
//    - auditMiddleware.js    (attachAuditContext, logResponseAudit, logErrorAudit)

// ✅ Routes Created:
//    - routes/audit.js       (provides REST API for audit data)

// ✅ Server Updated:
//    - server.js             (integrated middleware and routes)


// ============================================================================
// 2. HOW THE SYSTEM WORKS
// ============================================================================

// Request comes in → attachAuditContext middleware
//   ↓
// Audit context added to req object:
//   - req.auditContext: { ipAddress, userAgent, userId, endpoint, method, startTime }
//   - req.logChange(): Helper function to log database changes
//   - req.logBehavior(): Helper function to log user/system behaviors
//   ↓
// Response processed → logResponseAudit middleware (logs successful calls)
//   ↓
// Error handled → logErrorAudit middleware (logs errors)


// ============================================================================
// 3. STEP-BY-STEP INTEGRATION INTO YOUR CONTROLLERS
// ============================================================================

/**
 * PATTERN 1: Logging a CREATE operation
 */
const example1_create = async (req, res) => {
  try {
    // Create the document
    const user = new User(req.body);
    await user.save();

    // Method 1: Using the middleware helper (easiest)
    await req.logChange({
      action: 'CREATE',
      collectionName: 'User',
      documentId: user._id,
      newValues: req.body,
      reason: 'User registration'
    });

    // Method 2: Using AuditService directly (if not using middleware)
    const AuditService = require('../services/auditService');
    await AuditService.logChange({
      action: 'CREATE',
      collectionName: 'User',
      documentId: user._id,
      userId: req.user.id,
      userEmail: req.user.email,
      newValues: req.body,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({ success: true, data: user });
  } catch (error) {
    await req.logChange({
      action: 'CREATE',
      collectionName: 'User',
      newValues: req.body,
      status: 'FAILED',
      errorMessage: error.message
    });
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * PATTERN 2: Logging an UPDATE operation
 */
const example2_update = async (req, res) => {
  try {
    const oldValues = doc.toObject();
    
    // Make changes
    doc.name = req.body.name;
    doc.email = req.body.email;
    await doc.save();

    // Get changed fields
    const changedFields = Object.keys(req.body).filter(
      key => oldValues[key] !== req.body[key]
    );

    // Log with before/after comparison
    await req.logChange({
      action: 'UPDATE',
      collectionName: 'User',
      documentId: doc._id,
      oldValues,
      newValues: doc.toObject(),
      changedFields,
      reason: 'Profile updated by user'
    });

    res.json({ success: true, data: doc });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * PATTERN 3: Logging a DELETE operation
 */
const example3_delete = async (req, res) => {
  try {
    const doc = await User.findByIdAndDelete(req.params.id);

    if (doc) {
      await req.logChange({
        action: 'DELETE',
        collectionName: 'User',
        documentId: req.params.id,
        oldValues: doc.toObject(),
        reason: 'User account deleted'
      });
    }

    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * PATTERN 4: Logging user behavior
 */
const example4_behavior = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ email: username });

    if (user && await user.comparePassword(password)) {
      const token = generateToken(user);

      // Log successful login
      await req.logBehavior({
        action: 'USER_LOGIN_SUCCESS',
        category: 'AUTHENTICATION',
        relatedEntityType: 'User',
        relatedEntityId: user._id,
        description: `User ${user.email} logged in`,
        result: 'SUCCESS',
        data: {
          email: user.email,
          role: user.role
        },
        severity: 'LOW'
      });

      return res.json({ success: true, token });
    } else {
      // Log failed login attempt
      await req.logBehavior({
        action: 'USER_LOGIN_FAILED',
        category: 'AUTHENTICATION',
        description: `Login failed for ${username}`,
        result: 'FAILED',
        data: { attemptedEmail: username },
        severity: 'HIGH'
      });

      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATTERN 5: Logging errors as behaviors
 */
const example5_error_tracking = async (req, res) => {
  try {
    // Some operation
  } catch (error) {
    // Log as a behavior for monitoring
    await req.logBehavior({
      action: 'OPERATION_ERROR',
      category: 'SYSTEM_EVENT',
      description: `Error occurred: ${error.message}`,
      result: 'FAILED',
      errorDetails: error.stack,
      severity: 'HIGH'
    });

    res.status(500).json({ success: false, message: error.message });
  }
};


// ============================================================================
// 4. QUICK COPY-PASTE EXAMPLES FOR YOUR CONTROLLERS
// ============================================================================

// Example: Device Creation Route
const deviceCreateRoute = async (req, res) => {
  try {
    // Validate
    if (!req.body.name) throw new Error('Device name required');

    // Create
    const device = new Device(req.body);
    device.userId = req.user.id;
    await device.save();

    // Log change - ADD THIS LINE
    await req.logChange({
      action: 'CREATE',
      collectionName: 'Device',
      documentId: device._id,
      newValues: req.body
    });

    // Log behavior - ADD THIS LINE
    await req.logBehavior({
      action: 'DEVICE_CREATED',
      category: 'DEVICE_OPERATION',
      relatedEntityType: 'Device',
      relatedEntityId: device._id,
      description: `Created device: ${device.name}`,
      severity: 'LOW'
    });

    res.status(201).json({ success: true, data: device });
  } catch (error) {
    // Log failed change
    await req.logChange({
      action: 'CREATE',
      collectionName: 'Device',
      newValues: req.body,
      status: 'FAILED',
      errorMessage: error.message
    });
    res.status(400).json({ success: false, message: error.message });
  }
};


// ============================================================================
// 5. IMPLEMENTATION CHECKLIST
// ============================================================================

const checklist = {
  'Already Done': [
    '✅ Database models created (AuditLog, BehaviorLog)',
    '✅ AuditService created with 20+ helper methods',
    '✅ Audit middleware added to server',
    '✅ Audit routes added to server',
    '✅ server.js updated'
  ],
  'To Do - Optional Enhancements': [
    '[ ] Update authController.js to log login/logout behaviors',
    '[ ] Update deviceController.js to log all CRUD operations',
    '[ ] Update irrigationController.js to log irrigation events',
    '[ ] Update orderController.js to log orders and payments',
    '[ ] Update adminController.js to log admin actions',
    '[ ] Create an admin dashboard to view audit logs',
    '[ ] Create alerts for critical changes',
    '[ ] Set up automated reports',
    '[ ] Create data export functionality'
  ]
};


// ============================================================================
// 6. API EXAMPLES - HOW TO QUERY AUDIT DATA
// ============================================================================

/**
 * Get audit trail for a document
 */
const query1 = `GET /api/audit/changes/Device/507f1f77bcf86cd799439011`;
// Returns: Array of all changes to this device

/**
 * Search audit logs
 */
const query2 = `GET /api/audit/search?action=UPDATE&collection=Device&limit=50`;
// Returns: All device updates in the last period

/**
 * Get user's activity
 */
const query3 = `GET /api/audit/user-changes?limit=100`;
// Returns: All changes made by the authenticated user

/**
 * Get behavior logs for a user
 */
const query4 = `GET /api/audit/behaviors?category=AUTHENTICATION`;
// Returns: All authentication events for current user

/**
 * Get admin summary
 */
const query5 = `GET /api/audit/summary?days=30`;
// Returns: Summary of changes over last 30 days


// ============================================================================
// 7. MONITORING & ANALYTICS IDEAS
// ============================================================================

const analyticsIdeas = {
  'Security Monitoring': [
    'Failed login attempts per user',
    'Unusual access patterns',
    'Bulk delete operations',
    'Admin action audit trail',
    'Permission escalations'
  ],
  'Performance Monitoring': [
    'Average execution time per operation',
    'Slow queries and operations',
    'Error rates by operation type',
    'Most popular endpoints',
    'Peak usage times'
  ],
  'Compliance & Audit': [
    'Who changed what and when',
    'Document version history',
    'Data deletion history',
    'User access logs',
    'Admin action logs'
  ],
  'Business Intelligence': [
    'User behavior patterns',
    'Most modified entities',
    'Device lifecycle tracking',
    'Irrigation effectiveness',
    'System usage statistics'
  ]
};


// ============================================================================
// 8. CONFIGURATION OPTIONS
// ============================================================================

// To change TTL (time to live) for automatic deletion:
// Edit AuditLog.js line 52:   ttl: 7776000  // Change this (in seconds)
// Edit BehaviorLog.js line 69: ttl: 15552000 // Change this (in seconds)

// To change log levels or categories:
// Edit the enum values in AuditLog.js and BehaviorLog.js

// To disable auto-logging of certain behaviors:
// Edit logResponseAudit middleware in auditMiddleware.js


// ============================================================================
// 9. PRODUCTION CONSIDERATIONS
// ============================================================================

const productionNotes = {
  'Performance': [
    'Audit logs use TTL indexes - old logs are auto-deleted',
    'Consider separate database collection for logs if very high volume',
    'Add search indexes for common queries',
    'Archive logs periodically for long-term storage'
  ],
  'Security': [
    'Never log passwords, API keys, or sensitive PII',
    'Filter sensitive data before logging',
    'Restrict audit log access to admins',
    'Encrypt audit logs if storing sensitive operations',
    'Monitor for suspicious patterns automatically'
  ],
  'Compliance': [
    'Keep audit logs as per regulations (GDPR: 90+ days)',
    'Document all data processing activities',
    'Provide audit reports upon request',
    'Implement data retention policies',
    'Regular backup of audit logs'
  ]
};


console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║         AUDIT & BEHAVIOR LOGGING SYSTEM SETUP             ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');
console.log('✅ SYSTEM IS READY TO USE');
console.log('');
console.log('Quick Start:');
console.log('  1. In your controllers, use: await req.logChange({...})');
console.log('  2. For behaviors, use: await req.logBehavior({...})');
console.log('  3. Query audit data via /api/audit/* endpoints');
console.log('');
console.log('See AUDIT_SYSTEM_DOCUMENTATION.md for complete reference');
console.log('See EXAMPLE_CONTROLLER_WITH_AUDIT.js for implementation examples');
console.log('');

module.exports = { checklist, analyticsIdeas, productionNotes };
