# Database Audit & Behavior Tracking System

## Overview

This comprehensive system automatically logs all database changes and user behaviors, providing complete audit trails for compliance, debugging, and analytics.

## What Gets Logged

### 1. **Audit Logs (AuditLog model)**
Tracks all database changes:
- **CREATE**: New documents added
- **UPDATE**: Existing documents modified (stores before/after values)
- **DELETE**: Documents removed
- **BULK_UPDATE**: Multiple documents changed
- **RESTORE**: Document versions restored

Each audit log includes:
- What changed (field names, old values, new values)
- Who made the change (user ID, email)
- When it happened (timestamp)
- Where it came from (IP address, user agent)
- Why it changed (optional reason)
- Status (success/failed)

### 2. **Behavior Logs (BehaviorLog model)**
Tracks user actions and system events:
- User authentication (login, logout)
- User activities (all API calls with results)
- Device operations (creation, modification, activation)
- Irrigation processes (started, stopped, configured)
- Sensor data readings and anomalies
- Community interactions (posts, comments, ratings)
- Commerce activities (orders, payments)
- Admin actions
- System events

Each behavior log includes:
- Action type and category
- Actor (user ID, role)
- Related entities
- Action result (success/failed)
- Execution time
- Severity level (LOW, MEDIUM, HIGH, CRITICAL)
- Error details if applicable

## Data Retention

- **AuditLog**: Automatically deleted after 90 days (configurable via TTL)
- **BehaviorLog**: Automatically deleted after 180 days (configurable via TTL)

## API Endpoints

### Audit Log Endpoints

```
GET /api/audit/changes/:collectionName/:documentId
- Get complete audit history for a specific document
- Query params: limit (default: 50)

GET /api/audit/user-changes
- Get all changes made by current user
- Query params: limit (default: 100)

GET /api/audit/search
- Search audit logs with filters
- Admin only
- Query params:
  - action: CREATE|READ|UPDATE|DELETE
  - collection: collection name
  - userId: user ID
  - status: SUCCESS|FAILED
  - startDate: ISO date string
  - endDate: ISO date string
  - limit: max results (default: 50)
  - skip: offset (default: 0)

GET /api/audit/summary
- Get audit summary statistics
- Admin only
- Query params: days (default: 7)

GET /api/audit/failed-changes
- Get all failed changes
- Admin only
- Query params: limit (default: 50)

GET /api/audit/version/:collectionName/:documentId/:versionIndex
- Get a specific version of a document
- versionIndex: 0 for latest, 1 for second latest, etc.
```

### Behavior Log Endpoints

```
GET /api/audit/behaviors
- Get behavior logs for current user
- Query params:
  - category: AUTHENTICATION|USER_ACTIVITY|DEVICE_OPERATION|etc
  - limit: max results (default: 100)

GET /api/audit/behaviors/search
- Search behavior logs with filters
- Admin only
- Query params:
  - action: specific action name
  - category: category filter
  - userId: user ID
  - result: SUCCESS|FAILED|PENDING|CANCELLED
  - severity: LOW|MEDIUM|HIGH|CRITICAL
  - startDate: ISO date string
  - endDate: ISO date string
  - limit: max results (default: 50)
  - skip: offset (default: 0)

GET /api/audit/behaviors/summary
- Get behavior summary statistics
- Admin only
- Query params: days (default: 7)
```

## Using the Audit System in Controllers

### Logging Database Changes

```javascript
// In your controller/route handler
const AuditService = require('../services/auditService');

// When creating a document
const newUser = new User(userData);
await newUser.save();

await AuditService.logChange({
  action: 'CREATE',
  collectionName: 'User',
  documentId: newUser._id,
  userId: req.user.id,
  userEmail: req.user.email,
  newValues: userData,
  ipAddress: req.ip,
  userAgent: req.get('user-agent'),
  reason: 'User self-registration'
});

// When updating a document
const oldUser = { ...user.toObject() };
user.name = 'New Name';
await user.save();

const changedFields = Object.keys(userData).filter(
  key => oldUser[key] !== userData[key]
);

await AuditService.logChange({
  action: 'UPDATE',
  collectionName: 'User',
  documentId: user._id,
  userId: req.user.id,
  userEmail: req.user.email,
  oldValues: oldUser,
  newValues: user.toObject(),
  changedFields
});

// When deleting a document
await AuditService.logChange({
  action: 'DELETE',
  collectionName: 'User',
  documentId: userId,
  userId: req.user.id,
  userEmail: req.user.email,
  oldValues: user.toObject()
});
```

### Using req.logChange() Helper

The easier way using middleware helpers:

```javascript
// In your controller
router.post('/users', auth, async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    
    // Use the helper from auditMiddleware
    await req.logChange({
      action: 'CREATE',
      collectionName: 'User',
      documentId: newUser._id,
      newValues: req.body
    });
    
    res.json({ success: true, data: newUser });
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
});
```

### Logging User Behaviors

```javascript
// Manual behavior logging
await AuditService.logBehavior({
  action: 'USER_LOGIN_SUCCESS',
  category: 'AUTHENTICATION',
  userId: user._id,
  userRole: user.role,
  description: `User logged in from ${req.ip}`,
  result: 'SUCCESS',
  data: { loginMethod: 'email' }
});

// Using req.logBehavior() helper
await req.logBehavior({
  action: 'DEVICE_CREATED',
  category: 'DEVICE_OPERATION',
  relatedEntityType: 'Device',
  relatedEntityId: device._id,
  description: `Created new device: ${device.name}`,
  data: { deviceType: device.type }
});
```

## Database Schemas

### AuditLog Schema

```json
{
  "action": "CREATE|READ|UPDATE|DELETE|BULK_UPDATE|RESTORE",
  "collectionName": "User",
  "documentId": "ObjectId",
  "userId": "ObjectId (ref: User)",
  "userEmail": "string",
  "oldValues": { ... },
  "newValues": { ... },
  "changedFields": ["field1", "field2"],
  "ipAddress": "string",
  "userAgent": "string",
  "reason": "string",
  "status": "SUCCESS|FAILED|PENDING",
  "errorMessage": "string",
  "metadata": { ... },
  "createdAt": "Date (TTL: 90 days)"
}
```

### BehaviorLog Schema

```json
{
  "action": "USER_LOGIN|DEVICE_CREATED|...",
  "category": "AUTHENTICATION|USER_ACTIVITY|DEVICE_OPERATION|...",
  "userId": "ObjectId (ref: User)",
  "userRole": "admin|user",
  "relatedEntityType": "Device|Order|IrrigationSystem|...",
  "relatedEntityId": "ObjectId",
  "description": "string",
  "result": "SUCCESS|FAILED|PENDING|CANCELLED",
  "data": { ... },
  "ipAddress": "string",
  "userAgent": "string",
  "endpoint": "/api/devices",
  "method": "GET|POST|PUT|PATCH|DELETE",
  "executionTimeMs": 150,
  "errorDetails": "string",
  "severity": "LOW|MEDIUM|HIGH|CRITICAL",
  "createdAt": "Date (TTL: 180 days)"
}
```

## Querying Audit Data

### Get Document History
```javascript
const history = await AuditService.getDocumentHistory('User', userId);
// Returns: Array of all changes to the User document, newest first
```

### Get User's Changes
```javascript
const changes = await AuditService.getUserChanges(userId);
// Returns: All changes made by this user
```

### Get User's Behaviors
```javascript
const behaviors = await AuditService.getUserBehaviors(userId, 'AUTHENTICATION');
// Returns: All authentication behaviors for this user
```

### Search Audit Logs
```javascript
const results = await AuditService.searchAuditLogs({
  action: 'UPDATE',
  collectionName: 'Device',
  status: 'FAILED',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
  limit: 100
});
```

### Get Statistics
```javascript
// Audit summary
const stats = await AuditService.getAuditSummary(7);
// {
//   period: 'Last 7 days',
//   totalChanges: 1234,
//   changesByAction: [ { _id: 'UPDATE', count: 800 }, ... ],
//   changesByCollection: [ { _id: 'Device', count: 450 }, ... ],
//   topUsers: [ ... ],
//   failedChanges: 12
// }

// Behavior summary
const behaviorStats = await AuditService.getBehaviorSummary(7);
// {
//   period: 'Last 7 days',
//   totalBehaviors: 5432,
//   behaviorsByCategory: [ ... ],
//   behaviorsByAction: [ ... ],
//   failedBehaviors: 23,
//   criticalEvents: 2
// }
```

## Best Practices

1. **Always log important actions**: User authentication, data modifications, sensitive operations
2. **Include context**: Add reason, metadata, or description for debugging
3. **Use severity levels**: Mark critical operations with HIGH/CRITICAL severity
4. **Handle errors gracefully**: Logging should never break your main operation
5. **Clean old data**: TTL indexes automatically remove old logs (90/180 days)
6. **Query efficiently**: Use compound indexes for common searches
7. **Protect sensitive data**: Don't log passwords, API keys, or PII
8. **Monitor regularly**: Check audit summary statistics for anomalies

## Example: Complete Controller Integration

See [example-controller-with-audit.js](./example-controller-with-audit.js) for a complete example of a controller using the audit system.

## Compliance & Audit Trail

This system provides:
- ✅ Complete audit trail for all database changes
- ✅ User activity tracking
- ✅ Error tracking and analysis
- ✅ Performance monitoring (execution times)
- ✅ IP address and device fingerprinting
- ✅ Automatic data retention/deletion (GDPR compliant)
- ✅ Search and filtering capabilities
- ✅ Statistical analysis and reporting
- ✅ Admin dashboard ready data

## Monitoring Dashboard Data

The system generates data that can be visualized:
- Changes per day/week/month
- Most modified collections
- Most active users
- Failed operations rate
- User behavior patterns
- System performance metrics
- Error frequency and types
- Security event detection
