# SERVER.JS INTEGRATION GUIDE

This file shows **EXACTLY** what to add to `backend/src/server.js` to integrate all the new services.

---

## 📍 WHERE TO ADD CODE

Your current `server.js` structure looks like:

```javascript
// 1. IMPORTS (at top)
const express = require('express');
const cors = require('cors');
... etc ...

// 2. DATABASE SETUP
connectDB();

// 3. SOCKET.IO SETUP
const io = require('socket.io')(...);

// 4. EXISTING ROUTES
app.use('/api/auth', require('./routes/auth'));
app.use('/api/devices', require('./routes/devices'));
... etc ...

// 5. SERVER START
app.listen(PORT, () => { ... });
```

---

## 🔴 ADDITION #1: Import New Services

**LOCATION:** Top of file, after other `require` statements

**ADD THIS:**

```javascript
// HC-05 Bluetooth Bridge & Real-Time Sync Services
const HC05Bridge = require('./services/hc05Bridge');
const SyncService = require('./services/syncService');
```

**EXAMPLE (how it looks with existing code):**

```javascript
const express = require('express');
const cors = require('cors');
const app = express();
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');

// 👇 ADD THESE TWO LINES 👇
const HC05Bridge = require('./services/hc05Bridge');
const SyncService = require('./services/syncService');

connectDB();
```

---

## 🟠 ADDITION #2: Initialize Services After Socket.io

**LOCATION:** After `const io = require('socket.io')(...)` setup, usually right after line saying `io.on('connection', ...)`

**DO THIS:**

Find this block in your server.js:
```javascript
const io = require('socket.io')(server, {
  cors: { origin: "http://localhost:3000", credentials: true }
});

io.on('connection', (socket) => {
  console.log('New client connected');
  // ... socket event handlers ...
});
```

And add this AFTER that `io.on('connection')` block:

```javascript
// Initialize HC-05 Bluetooth Bridge
console.log('🔌 Initializing HC-05 Bridge...');
const hc05Port = process.env.HC05_PORT || 'COM3';
const hc05Bridge = new HC05Bridge(io, null);

hc05Bridge.start(hc05Port)
  .then(() => console.log('✅ HC-05 Bridge started successfully'))
  .catch(err => {
    console.warn('⚠️  HC-05 Bridge startup warning:', err.message);
    console.warn('💡 HC-05 may not be available. Update .env HC05_PORT if needed.');
  });

// Initialize Real-Time Sync Service
console.log('📡 Initializing Sync Service...');
const syncService = new SyncService(io);

// Make services available throughout app
app.set('hc05Bridge', hc05Bridge);
app.set('syncService', syncService);

console.log('✅ Services initialized');
```

**FULL EXAMPLE:**

```javascript
const io = require('socket.io')(server, {
  cors: { origin: "http://localhost:3000", credentials: true }
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// 👇 ADD EVERYTHING BELOW 👇

// Initialize HC-05 Bluetooth Bridge
console.log('🔌 Initializing HC-05 Bridge...');
const hc05Port = process.env.HC05_PORT || 'COM3';
const hc05Bridge = new HC05Bridge(io, null);

hc05Bridge.start(hc05Port)
  .then(() => console.log('✅ HC-05 Bridge started successfully'))
  .catch(err => {
    console.warn('⚠️  HC-05 Bridge startup warning:', err.message);
    console.warn('💡 HC-05 may not be available. Update .env HC05_PORT if needed.');
  });

// Initialize Real-Time Sync Service
console.log('📡 Initializing Sync Service...');
const syncService = new SyncService(io);

// Make services available throughout app
app.set('hc05Bridge', hc05Bridge);
app.set('syncService', syncService);

console.log('✅ Services initialized');
```

---

## 🟡 ADDITION #3: Add New Routes

**LOCATION:** After existing routes (after auth, devices, sensors routes, etc.)

**ADD THIS:**

```javascript
// Bluetooth Bridge Routes (HC-05 control and status)
const bluetoothRoutes = require('./routes/bluetooth');
bluetoothRoutes.init(hc05Bridge, syncService);
app.use('/api/bluetooth', bluetoothRoutes);

// Enhanced Admin Routes (with authorization enforcement)
app.use('/api/admin/enhanced', require('./routes/adminEnhanced'));
```

**EXAMPLE (how it looks with existing routes):**

```javascript
// Existing routes
app.use('/api/auth', authRoutes);
app.use('/api/devices', require('./routes/devices'));
app.use('/api/sensors', require('./routes/sensors'));
app.use('/api/community', require('./routes/community'));

// 👇 ADD THESE 👇

// Bluetooth Bridge Routes (HC-05 control and status)
const bluetoothRoutes = require('./routes/bluetooth');
bluetoothRoutes.init(hc05Bridge, syncService);
app.use('/api/bluetooth', bluetoothRoutes);

// Enhanced Admin Routes (with authorization enforcement)
app.use('/api/admin/enhanced', require('./routes/adminEnhanced'));
```

---

## 🟢 ADDITION #4: Update Socket.io Event Handler (Optional Enhancement)

**LOCATION:** Inside the `io.on('connection', (socket) => { ... })` block

**ADD THIS (inside the connection handler):**

```javascript
// Register user connection for real-time sync
socket.on('user:login', (userId) => {
  syncService.registerUserConnection(userId, socket.id);
  socket.join(`user:${userId}`); // Socket.io room for user-specific events
  console.log(`✓ User ${userId} registered for real-time updates`);
});

// Handle device subscriptions
socket.on('device:subscribe', (userId, deviceId) => {
  syncService.subscribeToDevice(userId, deviceId);
  socket.join(`device:${deviceId}`); // Socket.io room for device updates
});

// Handle user disconnect
socket.on('disconnect', () => {
  // Note: SyncService will clean up via user logout
  console.log('Client disconnected:', socket.id);
});
```

**FULL EXAMPLE:**

```javascript
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // 👇 ADD THESE 👇
  
  // Register user connection for real-time sync
  socket.on('user:login', (userId) => {
    syncService.registerUserConnection(userId, socket.id);
    socket.join(`user:${userId}`);
    console.log(`✓ User ${userId} registered for real-time updates`);
  });

  // Handle device subscriptions
  socket.on('device:subscribe', (userId, deviceId) => {
    syncService.subscribeToDevice(userId, deviceId);
    socket.join(`device:${deviceId}`);
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});
```

---

## 🔵 ADDITION #5: Create/Update .env File

**LOCATION:** `backend/.env`

**ADD/UPDATE THESE:**

```env
# Database
MONGODB_URI=mongodb://localhost:27017/agranova
DB_NAME=agranova

# Server
PORT=5001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development

# HC-05 Serial Port
# Windows: COM3, COM4, COM5, etc. (find in Device Manager)
# Linux: /dev/ttyUSB0, /dev/ttyAMA0, etc.
# Mac: /dev/cu.HC-05-DevB, etc.
HC05_PORT=COM3

# Optional: HC-05 Configuration
HC05_BAUD=9600
HC05_TIMEOUT=5000
```

**EXAMPLE (complete .env):**

```
MONGODB_URI=mongodb://localhost:27017/agranova
DB_NAME=agranova
PORT=5001
JWT_SECRET=agranova-local-dev-secret-key
NODE_ENV=development
HC05_PORT=COM3
HC05_BAUD=9600
HC05_TIMEOUT=5000
```

---

## ✅ VERIFICATION CHECKLIST

After making all changes, verify:

```bash
# 1. Check syntax is valid
npm start

# 2. Look for these logs:
✅ MongoDB Connected
🔌 Initializing HC-05 Bridge...
✅ HC-05 Bridge started successfully
📡 Initializing Sync Service...
✅ Services initialized
✓ Backend running on port 5001

# 3. Test endpoints
curl http://localhost:5001/api/bluetooth/status
# Should return: {success: true, data: {connected: true, ...}}

curl http://localhost:5001/api/admin/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
# Should return list of users (or 403 if not admin)
```

---

## 🚨 COMMON MISTAKES

| Mistake | Fix |
|---------|-----|
| `Cannot find module 'hc05Bridge'` | Make sure you ran `npm install serialport` in backend |
| `blueprintRoutes is not defined` | Check you added the require line for bluetooth routes |
| HC-05 never connects | Verify COM port in `.env` matches Device Manager |
| Routes return 404 | Make sure you added `app.use()` lines |
| Services not initialized | Check you called `new HC05Bridge()` AFTER socket.io setup |

---

## 📋 REQUIRED ADDITIONS (Summary)

You MUST add 5 things:

1. ✅ **Import statements** - Add 2 requires at top
2. ✅ **Service initialization** - Create HC05Bridge and SyncService instances
3. ✅ **Make services available** - `app.set()` so routes can access them
4. ✅ **Add routes** - Register bluetooth and admin routes
5. ✅ **Update .env** - Add HC05_PORT and other config

---

## 🎯 TOTAL LINES TO ADD

- Addition #1 (imports): 2 lines
- Addition #2 (initialization): 20 lines
- Addition #3 (routes): 6 lines
- Addition #4 (socket events): 15 lines
- Addition #5 (.env): 5 lines

**Total: ~48 lines**

---

## 💾 OPTIONAL: Use This Template

If you want to see a complete server.js template, ask and I can provide the full working version with all additions integrated.

