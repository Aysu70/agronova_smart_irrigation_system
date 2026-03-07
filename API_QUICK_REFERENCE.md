# 🔌 API QUICK REFERENCE

Quick lookup for all endpoints in the integrated system.

---

## Authentication Endpoints

### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Farmer",
  "email": "john@farm.com",
  "password": "SecurePass123"
}

Response (201):
{
  "success": true,
  "token": "eyJhbGc..."
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@farm.com",
  "password": "SecurePass123"
}

Response (200):
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "_id": "...",
    "name": "John Farmer",
    "email": "john@farm.com",
    "role": "user"
  }
}
```

### Get Current User Profile
```http
GET /api/auth/me
Authorization: Bearer eyJhbGc...

Response (200):
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Farmer",
    "email": "john@farm.com",
    "role": "user",
    "region": "Northern Region",
    "crops": ["maize", "wheat"],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## HC-05 Bluetooth Endpoints

### Check HC-05 Connection Status
```http
GET /api/bluetooth/status

Response (200):
{
  "success": true,
  "data": {
    "connected": true,
    "device": "HC05_SERIAL_001",
    "port": "COM3",
    "baud": 9600,
    "uptime": 3600
  }
}
```

### Control Pump (ON/OFF)
```http
POST /api/bluetooth/pump
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "action": "ON"  // or "OFF"
}

Response (200):
{
  "success": true,
  "data": {
    "command": "PUMP_ON",
    "status": "sent",
    "timestamp": "2024-01-20T14:30:00Z"
  }
}
```

### Send Custom Command
```http
POST /api/bluetooth/command
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "command": "PUMP_ON"  // or "PUMP_OFF", "GET_STATUS", etc.
}

Response (200):
{
  "success": true,
  "data": {
    "command": "PUMP_ON",
    "status": "sent to device"
  }
}
```

### List Available COM Ports
```http
GET /api/bluetooth/ports

Response (200):
{
  "success": true,
  "data": [
    {
      "path": "COM3",
      "manufacturer": "Bluetooth",
      "serialNumber": "HC05_SERIAL_001"
    },
    {
      "path": "COM4",
      "manufacturer": "FTDI",
      "serialNumber": "FT232R"
    }
  ]
}
```

---

## Device Endpoints

### Get All Devices
```http
GET /api/devices
Authorization: Bearer eyJhbGc...

Response (200):
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "device_1",
      "name": "Main Farm Pump",
      "type": "pump",
      "status": "online",
      "owner": "john@farm.com",
      "lastUpdated": "2024-01-20T14:30:00Z"
    }
  ]
}
```

### Get Device Details
```http
GET /api/devices/device_1
Authorization: Bearer eyJhbGc...

Response (200):
{
  "success": true,
  "data": {
    "_id": "device_1",
    "name": "Main Farm Pump",
    "type": "pump",
    "status": "online",
    "owner": "john@farm.com",
    "location": "North Field",
    "createdAt": "2024-01-01T00:00:00Z",
    "lastUpdated": "2024-01-20T14:30:00Z"
  }
}
```

### Create New Device
```http
POST /api/devices
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "name": "South Field Pump",
  "type": "pump",
  "location": "South Field"
}

Response (201):
{
  "success": true,
  "data": {
    "_id": "device_2",
    "name": "South Field Pump",
    "type": "pump",
    "status": "offline",
    "owner": "john@farm.com",
    "location": "South Field"
  }
}
```

---

## Sensor Data Endpoints

### Get Latest Sensor Data
```http
GET /api/sensors/latest?deviceId=device_1
Authorization: Bearer eyJhbGc...

Response (200):
{
  "success": true,
  "data": {
    "deviceId": "device_1",
    "temperature": 28.5,
    "humidity": 65,
    "soilMoisture": 42,
    "timestamp": "2024-01-20T14:35:00Z"
  }
}
```

### Get Sensor History
```http
GET /api/sensors/history?deviceId=device_1&limit=24&period=hourly
Authorization: Bearer eyJhbGc...

Response (200):
{
  "success": true,
  "count": 24,
  "data": [
    {
      "temperature": 28.5,
      "humidity": 65,
      "soilMoisture": 42,
      "timestamp": "2024-01-20T14:00:00Z"
    },
    ...
  ]
}
```

---

## Admin Endpoints (Admin Only)

### List All Users
```http
GET /api/admin/enhanced/users
Authorization: Bearer eyJhbGc...

Response (200):
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "user_1",
      "name": "John Farmer",
      "email": "john@farm.com",
      "role": "admin",
      "region": "Northern Region",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Get User Details
```http
GET /api/admin/enhanced/users/user_1
Authorization: Bearer eyJhbGc...

Response (200):
{
  "success": true,
  "data": {
    "_id": "user_1",
    "name": "John Farmer",
    "email": "john@farm.com",
    "role": "admin",
    "region": "Northern Region",
    "crops": ["maize", "wheat"],
    "devices": ["device_1", "device_2"],
    "createdAt": "2024-01-01T00:00:00Z",
    "lastLogin": "2024-01-20T14:30:00Z"
  }
}
```

### Change User Role
```http
PUT /api/admin/enhanced/users/user_2/role
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "role": "admin"  // or "user"
}

Response (200):
{
  "success": true,
  "message": "User role updated to admin",
  "data": {
    "_id": "user_2",
    "email": "user2@farm.com",
    "role": "admin"
  }
}
```

### Delete User
```http
DELETE /api/admin/enhanced/users/user_3
Authorization: Bearer eyJhbGc...

Response (200):
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "_id": "user_3",
    "email": "deleted_user@farm.com"
  }
}
```

### Get All Devices (Admin View)
```http
GET /api/admin/enhanced/devices
Authorization: Bearer eyJhbGc...

Response (200):
{
  "success": true,
  "count": 12,
  "data": [
    {
      "_id": "device_1",
      "name": "Farm Pump 1",
      "type": "pump",
      "owner": "john@farm.com",
      "status": "online",
      "lastData": {
        "temperature": 28.5,
        "humidity": 65
      }
    }
  ]
}
```

### Get System Status
```http
GET /api/admin/enhanced/system-status
Authorization: Bearer eyJhbGc...

Response (200):
{
  "success": true,
  "data": {
    "timestamp": "2024-01-20T14:35:00Z",
    "status": "healthy",
    "users": {
      "total": 8,
      "online": 3,
      "admins": 2
    },
    "devices": {
      "total": 12,
      "online": 11,
      "offline": 1
    },
    "database": {
      "connected": true,
      "responseTime": 2
    },
    "hc05Bridge": {
      "connected": true,
      "port": "COM3",
      "lastData": "2024-01-20T14:34:50Z"
    }
  }
}
```

### Broadcast Alert to All Users
```http
POST /api/admin/enhanced/broadcast-alert
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "title": "System Maintenance",
  "message": "System will be down for 30 minutes on Jan 25 at 10 PM",
  "severity": "warning"  // "info", "warning", "error"
}

Response (200):
{
  "success": true,
  "message": "Alert broadcast to 3 connected users",
  "data": {
    "title": "System Maintenance",
    "sentAt": "2024-01-20T14:35:00Z",
    "recipientCount": 3
  }
}
```

---

## WebSocket Real-Time Events

### Client → Server Events

#### User Login (Subscribe to updates)
```javascript
socket.emit('user:login', {
  userId: 'user_1',
  timestamp: new Date()
});
```

#### Subscribe to Device Updates
```javascript
socket.emit('device:subscribe', {
  userId: 'user_1',
  deviceId: 'device_1'
});
```

#### Send Pump Control
```javascript
socket.emit('pump:control', {
  action: 'ON',  // or 'OFF'
  deviceId: 'device_1',
  timestamp: new Date()
});
```

### Server → Client Events

#### Sensor Data Update
```javascript
socket.on('sensor:update', (data) => {
  console.log(data);
  // {
  //   deviceId: 'device_1',
  //   temperature: 28.5,
  //   humidity: 65,
  //   soilMoisture: 42,
  //   timestamp: '2024-01-20T14:35:00Z'
  // }
});
```

#### Pump Status Changed
```javascript
socket.on('pump:status', (data) => {
  console.log(data);
  // {
  //   deviceId: 'device_1',
  //   status: 'ON',
  //   timestamp: '2024-01-20T14:35:00Z'
  // }
});
```

#### Admin Alert
```javascript
socket.on('admin:alert', (alert) => {
  console.log(alert);
  // {
  //   title: 'System Maintenance',
  //   message: 'System will be down...',
  //   severity: 'warning',
  //   sentAt: '2024-01-20T14:35:00Z'
  // }
});
```

#### User Connected/Disconnected
```javascript
socket.on('user:connected', (data) => {
  console.log(`${data.userName} is now online`);
});

socket.on('user:disconnected', (data) => {
  console.log(`${data.userName} went offline`);
});
```

---

## HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK - Request succeeded | GET successful, command sent |
| 201 | Created - Resource created | User registered, device created |
| 400 | Bad Request - Invalid input | Missing required field |
| 401 | Unauthorized - No token | Missing Authorization header |
| 403 | Forbidden - No permission | Regular user accessing admin route |
| 404 | Not Found - Resource missing | Device ID doesn't exist |
| 500 | Server Error | Database connection failed |
| 503 | Service Unavailable | HC-05 not connected |

---

## Common Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "error_code"
}
```

---

## Authentication Header

All protected routes require:
```
Authorization: Bearer {JWT_TOKEN}
```

### Example using curl:
```bash
curl -H "Authorization: Bearer eyJhbGc..." \
     http://localhost:5001/api/admin/users
```

### Example using JavaScript:
```javascript
fetch('/api/admin/users', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /api/auth/register | 3 | per hour |
| POST /api/auth/login | 5 | per 15min |
| POST /api/bluetooth/command | 10 | per second |
| GET /api/sensors/history | 100 | per minute |

---

## Testing with cURL Examples

### Test User Registration
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@farm.com",
    "password": "password123"
  }'
```

### Test HC-05 Status
```bash
curl http://localhost:5001/api/bluetooth/status
```

### Test Admin Access (with token)
```bash
curl http://localhost:5001/api/admin/enhanced/users \
  -H "Authorization: Bearer {YOUR_TOKEN_HERE}"
```

### Test Pump Control
```bash
curl -X POST http://localhost:5001/api/bluetooth/pump \
  -H "Authorization: Bearer {YOUR_TOKEN_HERE}" \
  -H "Content-Type: application/json" \
  -d '{"action": "ON"}'
```

### Test Admin Alert
```bash
curl -X POST http://localhost:5001/api/admin/enhanced/broadcast-alert \
  -H "Authorization: Bearer {YOUR_ADMIN_TOKEN_HERE}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Alert",
    "message": "This is a test",
    "severity": "info"
  }'
```

---

## Environment Variables

Required in `backend/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/agranova
DB_NAME=agranova
PORT=5001
JWT_SECRET=your-secret-key-here
NODE_ENV=development
HC05_PORT=COM3
HC05_BAUD=9600
```

---

## API Documentation Sources

- **Authentication**: `backend/routes/auth.js`
- **Devices**: `backend/routes/devices.js`
- **Sensors**: `backend/routes/sensors.js`
- **Bluetooth**: `backend/routes/bluetooth.js`
- **Admin**: `backend/routes/adminEnhanced.js`
- **Devices Controllers**: `backend/controllers/deviceController.js`
- **Admin Controllers**: `backend/controllers/adminController.js`

