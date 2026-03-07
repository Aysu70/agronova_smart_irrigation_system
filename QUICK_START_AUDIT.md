# Database Audit System - Quick Start Guide

## 🚀 What You Do NOW

Your database now automatically logs **all changes and behaviors**.

### Start Using It - 2 Simple Functions

#### 1. Log a Database Change
```javascript
await req.logChange({
  action: 'CREATE|UPDATE|DELETE',
  collectionName: 'User|Device|Order',
  documentId: doc._id,
  newValues: doc.toObject(),  // For CREATE/UPDATE
  oldValues: oldDoc.toObject() // For UPDATE/DELETE
});
```

#### 2. Log a User Action
```javascript
await req.logBehavior({
  action: 'DEVICE_CREATED',
  category: 'DEVICE_OPERATION',
  description: 'User created a new irrigation device',
  severity: 'LOW'
});
```

---

## 📋 What Gets Tracked

### Automatically Logged (No Code Needed)
✅ Every API request (method, endpoint, user, IP)  
✅ Every response (success/failure, execution time)  
✅ Every error that occurs  
✅ When users authenticate  

### You Should Add Logging For
📝 Device creation/updates/deletion  
📝 Irrigation system operations  
📝 Sensor data anomalies  
📝 Order processing  
📝 Important user actions  
📝 Admin operations  

---

## 📚 Real Code Examples

### Example 1: Create a Device
```javascript
// In your controller
router.post('/devices', auth, async (req, res) => {
  try {
    // Create the device
    const device = new Device(req.body);
    device.userId = req.user.id;
    await device.save();

    // ADD THESE 2 LINES:
    await req.logChange({
      action: 'CREATE',
      collectionName: 'Device',
      documentId: device._id,
      newValues: req.body
    });

    await req.logBehavior({
      action: 'DEVICE_CREATED',
      category: 'DEVICE_OPERATION',
      relatedEntityId: device._id,
      description: `Created device: ${device.name}`
    });

    res.status(201).json({ success: true, data: device });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
```

### Example 2: Update a Device
```javascript
router.put('/devices/:id', auth, async (req, res) => {
  try {
    // Get old version for comparison
    const oldDevice = await Device.findById(req.params.id);
    const oldValues = oldDevice.toObject();

    // Update the device
    Object.assign(oldDevice, req.body);
    await oldDevice.save();

    // ADD THIS:
    await req.logChange({
      action: 'UPDATE',
      collectionName: 'Device',
      documentId: oldDevice._id,
      oldValues,
      newValues: oldDevice.toObject(),
      changedFields: Object.keys(req.body).filter(
        key => oldValues[key] !== req.body[key]
      )
    });

    res.json({ success: true, data: oldDevice });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
```

### Example 3: Delete a Device
```javascript
router.delete('/devices/:id', auth, async (req, res) => {
  try {
    const device = await Device.findByIdAndDelete(req.params.id);

    // ADD THIS:
    await req.logChange({
      action: 'DELETE',
      collectionName: 'Device',
      documentId: req.params.id,
      oldValues: device.toObject()
    });

    await req.logBehavior({
      action: 'DEVICE_DELETED',
      category: 'DEVICE_OPERATION',
      relatedEntityId: req.params.id,
      description: `Deleted device: ${device.name}`,
      severity: 'MEDIUM'
    });

    res.json({ success: true, message: 'Device deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
```

### Example 4: Track Login Behavior
```javascript
// In authController.js
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    
    if (user && await user.comparePassword(req.body.password)) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

      // ADD THIS:
      await req.logBehavior({
        action: 'USER_LOGIN_SUCCESS',
        category: 'AUTHENTICATION',
        relatedEntityId: user._id,
        description: `User ${user.email} logged in`,
        severity: 'LOW'
      });

      return res.json({ success: true, token });
    }

    // ADD THIS FOR FAILED LOGIN:
    await req.logBehavior({
      action: 'USER_LOGIN_FAILED',
      category: 'AUTHENTICATION',
      description: `Failed login attempt for ${req.body.email}`,
      result: 'FAILED',
      severity: 'HIGH'
    });

    res.status(401).json({ success: false, message: 'Invalid credentials' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
```

---

## 🔍 Query Audit Data

### Get Change History for a Document
```bash
curl "http://localhost:5000/api/audit/changes/Device/507f1f77bcf86cd799439011"
```

**What you get:**
- Complete history of changes
- Who made each change
- When it happened
- What specifically changed
- Before/after values

### Search All Audit Logs (Admin)
```bash
curl "http://localhost:5000/api/audit/search?action=DELETE&collection=Device&limit=50"
```

**Filter by:**
- `action`: CREATE, UPDATE, DELETE
- `collection`: Device, User, Order, etc.
- `status`: SUCCESS, FAILED
- `userId`: specific user
- `startDate` & `endDate`: date range
- `limit` & `skip`: pagination

### Get User's Activity
```bash
curl "http://localhost:5000/api/audit/user-changes?limit=100"
```

### Get Statistics
```bash
curl "http://localhost:5000/api/audit/summary?days=7"
```

**Returns:**
- Total changes in period
- Changes by action type
- Changes by collection
- Most active users
- Failed operations count

### Get User Behaviors
```bash
curl "http://localhost:5000/api/audit/behaviors?category=AUTHENTICATION"
```

### Get Behavior Statistics
```bash
curl "http://localhost:5000/api/audit/behaviors/summary?days=30"
```

---

## 🎯 Common Tasks

### "Who changed this device?"
```javascript
const changes = await AuditService.getDocumentHistory('Device', deviceId);
console.log(changes); // Shows all changes with user info
```

### "What did user X do today?"
```javascript
const changes = await AuditService.getUserChanges(userId);
console.log(changes);
```

### "Show me all failed operations"
```javascript
const failed = await AuditService.getFailedChanges(50);
console.log(failed);
```

### "Get changes in last 7 days"
```bash
curl "http://localhost:5000/api/audit/search?startDate=2024-02-05&endDate=2024-02-12"
```

### "Get all device deletes"
```bash
curl "http://localhost:5000/api/audit/search?action=DELETE&collection=Device"
```

---

## 📊 Dashboard Data

Once you add logging to your controllers, you can create dashboards showing:

**Security:**
- Failed login attempts
- Unauthorized access attempts
- Bulk delete operations
- Admin actions

**Operations:**
- Devices created/updated/deleted per day
- Most modified entities
- System uptime/errors
- User activity patterns

**Business:**
- Orders processed
- Irrigation events
- Sensor readings
- Device utilization

**Performance:**
- API response times
- Operation counts
- Error rates
- Peak usage times

---

## 🔧 Configuration

### Change Data Retention
Edit these files:
- `AuditLog.js` line 52: `ttl: 7776000` (90 days)
- `BehaviorLog.js` line 69: `ttl: 15552000` (180 days)

Default TTL values (in seconds):
- 90 days = 7,776,000 seconds
- 180 days = 15,552,000 seconds
- 30 days = 2,592,000 seconds
- 1 year = 31,536,000 seconds

### Add New Behavior Categories
Edit `BehaviorLog.js` to add new categories in the enum.

### Add New Action Types
Just use any string you want - no need to register them!

---

## ⚠️ Important Notes

### 1. Never Log Sensitive Data
```javascript
// ❌ WRONG - Don't log passwords!
await req.logChange({
  newValues: { password: req.body.password }
});

// ✅ RIGHT - Only log what matters
await req.logChange({
  newValues: { email: req.body.email }
});
```

### 2. Logging Never Breaks Your App
```javascript
// If logging fails, your API still works
// So you don't need to worry about try-catch
await req.logChange({ ... }); // Errors are silently logged
```

### 3. Use Severity Levels
```javascript
// LOW - Normal operations
await req.logBehavior({ action: 'DEVICE_READ', severity: 'LOW' });

// MEDIUM - Updates and modifications
await req.logBehavior({ action: 'DEVICE_UPDATE', severity: 'MEDIUM' });

// HIGH - Deletions and sensitive operations
await req.logBehavior({ action: 'DEVICE_DELETE', severity: 'HIGH' });

// CRITICAL - Security events
await req.logBehavior({ action: 'FAILED_LOGIN_ATTEMPT', severity: 'CRITICAL' });
```

### 4. Include Context
```javascript
// ✅ GOOD - Includes context
await req.logChange({
  reason: 'Device location updated by user',
  data: { previousLocation: 'Field A', newLocation: 'Field B' }
});

// ✅ GOOD - Descriptive
await req.logBehavior({
  description: 'Started irrigation for Field A with 2-hour duration'
});
```

---

## 🚀 Implementation Priority

### Phase 1 (Critical)
- [ ] User authentication (login/logout)
- [ ] Device CRUD operations
- [ ] Admin actions

### Phase 2 (Important)
- [ ] Irrigation events
- [ ] Order processing
- [ ] User profile updates

### Phase 3 (Nice to Have)
- [ ] Sensor readings
- [ ] Community interactions
- [ ] Read operations (very verbose)

---

## 📞 Quick Reference

| Need | Use |
|------|-----|
| Log a CREATE | `req.logChange({ action: 'CREATE' })` |
| Log an UPDATE | `req.logChange({ action: 'UPDATE', oldValues, newValues })` |
| Log a DELETE | `req.logChange({ action: 'DELETE', oldValues })` |
| Log a user action | `req.logBehavior({ action: 'X', category: 'Y' })` |
| Get doc history | `AuditService.getDocumentHistory(collection, id)` |
| Get user changes | `AuditService.getUserChanges(userId)` |
| Search logs | `AuditService.searchAuditLogs({ filters })` |
| Get summary | `AuditService.getAuditSummary(days)` |

---

## 📖 Full Documentation

For complete details, see:
- [AUDIT_SYSTEM_DOCUMENTATION.md](./AUDIT_SYSTEM_DOCUMENTATION.md) - Complete API reference
- [EXAMPLE_CONTROLLER_WITH_AUDIT.js](./EXAMPLE_CONTROLLER_WITH_AUDIT.js) - Real examples
- [AUDIT_SYSTEM_SETUP_GUIDE.js](./AUDIT_SYSTEM_SETUP_GUIDE.js) - Implementation guide

---

## ✅ System Status

- ✅ Models created
- ✅ Service layer ready
- ✅ Middleware integrated
- ✅ API routes active
- ✅ Auto-cleanup configured
- ✅ Ready to use!

**Start adding logging to your controllers now!**
