# 🔌 AGRANOVA Hardware Integration - Complete Implementation

## ✅ PRODUCTION-READY REAL HARDWARE CONNECTIVITY

This implementation provides **REAL** sensor integration with your physical Arduino/ESP32 devices.

---

## 📁 Folder Structure

```
agronova_smart_irrigation_system/
│
├── hardware/                          # ← NEW: Hardware code
│   ├── arduino_hc05_bluetooth/       # Arduino with HC-05 Bluetooth
│   │   └── arduino_hc05_bluetooth.ino
│   └── esp32_wifi/                   # ESP32 with WiFi
│       └── esp32_wifi.ino
│
├── backend/
│   └── src/
│       ├── models/
│       │   ├── ConnectedDevice.js     # ← NEW: Device model
│       │   └── RealTimeSensorData.js  # ← NEW: Sensor data model
│       ├── controllers/
│       │   └── hardwareController.js  # ← NEW: Hardware API
│       ├── routes/
│       │   └── hardware.js            # ← NEW: Hardware routes
│       ├── config/
│       │   └── socket.js              # ← UPDATED: WebSocket enhancements
│       └── server.js                  # ← UPDATED: Added hardware routes
│
├── frontend/
│   └── src/
│       ├── pages/
│       │   └── DeviceConnection.jsx   # ← NEW: Device connection UI
│       ├── services/
│       │   ├── hardwareService.js     # ← NEW: Hardware API service
│       │   └── bluetoothService.js    # ← NEW: Web Bluetooth service
│       └── App.jsx                    # ← UPDATED: Added /devices route
│
└── HARDWARE_SETUP_GUIDE.md           # ← NEW: Complete setup instructions
```

---

## 🚀 Quick Start

### 1. Start Backend Server
```bash
cd backend
npm start
```

Server runs on: **http://localhost:5001**

### 2. Start Frontend Server
```bash
cd frontend
npm start
```

Frontend runs on: **http://localhost:3001**

### 3. Open Device Connection Page
Navigate to: **http://localhost:3001/devices**

---

## 🔧 Hardware Options

### Option A: Bluetooth (HC-05)

**What you need:**
- Arduino Uno/Nano/Mega
- HC-05 Bluetooth module
- DHT22, Soil moisture, Ultrasonic sensors
- Relay for pump control

**How to use:**
1. Upload `/hardware/arduino_hc05_bluetooth/arduino_hc05_bluetooth.ino`
2. Open Chrome/Edge browser
3. Go to Device Connection page
4. Click "Connect to HC-05 Device"
5. Select your device from list
6. ✅ Live data appears instantly!

### Option B: WiFi (ESP32)

**What you need:**
- ESP32 development board
- DHT22, Soil moisture, Ultrasonic sensors
- Relay for pump control

**How to use:**
1. Edit `/hardware/esp32_wifi/esp32_wifi.ino`:
   - Set WiFi SSID and password
   - Set server IP address
   - Set unique device ID
2. Upload to ESP32
3. ESP32 automatically connects
4. ✅ Data appears on dashboard!

---

## 📡 API Endpoints

### Public Endpoint (for ESP32)
```http
POST /api/hardware/data
Content-Type: application/json

{
  "deviceId": "AGRO_ESP32_001",
  "soil": 45,
  "temperature": 26,
  "humidity": 60,
  "tankLevel": 80,
  "pumpStatus": "ON"
}
```

### Protected Endpoints (require authentication)

**Register Device**
```http
POST /api/hardware/register
Authorization: Bearer <token>

{
  "deviceId": "AGRO_ESP32_001",
  "deviceName": "Field Sensor 1",
  "connectionType": "wifi"
}
```

**Get User's Devices**
```http
GET /api/hardware/devices
Authorization: Bearer <token>
```

**Control Pump**
```http
POST /api/hardware/devices/:deviceId/pump
Authorization: Bearer <token>

{
  "command": "ON"  // or "OFF"
}
```

**Get Sensor History**
```http
GET /api/hardware/devices/:deviceId/history?hours=24&limit=100
Authorization: Bearer <token>
```

**Get Latest Reading**
```http
GET /api/hardware/devices/:deviceId/latest
Authorization: Bearer <token>
```

---

## 🔌 WebSocket Events

### Client → Server
```javascript
// Join user room for real-time updates
socket.emit('join', userId);

// Join device room (for hardware)
socket.emit('join_device', deviceId);
```

### Server → Client
```javascript
// Real-time sensor data update
socket.on('sensor:update', (data) => {
  console.log('Latest sensor data:', data);
  // {
  //   deviceId: "AGRO_ESP32_001",
  //   deviceName: "Field Sensor 1",
  //   data: {
  //     soil: 45,
  //     temperature: 26,
  //     humidity: 60,
  //     tankLevel: 80,
  //     pumpStatus: "ON"
  //   },
  //   timestamp: "2026-02-12T10:30:00.000Z"
  // }
});

// Pump control command (to hardware)
socket.on('pump:command', (data) => {
  console.log('Pump command:', data.command);
  // Execute command on physical relay
});
```

---

## 🗄️ Database Models

### ConnectedDevice Model
```javascript
{
  deviceId: String,        // Unique device identifier
  userId: ObjectId,        // Owner of the device
  deviceName: String,      // Friendly name
  connectionType: String,  // 'bluetooth' or 'wifi'
  status: String,          // 'online', 'offline', 'error'
  lastSeen: Date,          // Last communication timestamp
  lastSensorData: {
    soil: Number,
    temperature: Number,
    humidity: Number,
    tankLevel: Number,
    pumpStatus: String
  },
  metadata: {
    ipAddress: String,
    macAddress: String,
    bluetoothAddress: String
  }
}
```

### RealTimeSensorData Model
```javascript
{
  deviceId: String,
  userId: ObjectId,
  soil: Number,            // 0-100%
  temperature: Number,     // Celsius
  humidity: Number,        // 0-100%
  tankLevel: Number,       // 0-100%
  pumpStatus: String,      // 'ON' or 'OFF'
  connectionType: String,
  timestamp: Date
}
```

---

## 🔐 Security Features

✅ **Device Ownership Validation**
- Each device is linked to a specific user
- Users can only see and control their own devices

✅ **JWT Authentication**
- All API calls (except ESP32 data endpoint) require authentication

✅ **Device ID Verification**
- Backend validates device existence before accepting data

✅ **WebSocket Room Isolation**
- Each user has private WebSocket room
- Data only broadcast to device owner

✅ **Status Tracking**
- Devices automatically marked offline after 2 minutes of inactivity
- Real-time status updates

---

## 📊 Features Implemented

### Backend Features
- [x] Device registration and management
- [x] Real-time sensor data reception
- [x] WebSocket broadcasting to specific users
- [x] Sensor data history with TTL (auto-delete after 30 days)
- [x] Pump control via API and WebSocket
- [x] Device online/offline detection
- [x] User-device ownership validation
- [x] Audit logging integration

### Frontend Features
- [x] Web Bluetooth API integration (HC-05)
- [x] Device connection UI (Bluetooth/WiFi toggle)
- [x] Real-time sensor data display
- [x] Device status indicators (online/offline)
- [x] Connected devices list
- [x] Pump ON/OFF controls
- [x] WebSocket real-time updates
- [x] Device deletion
- [x] Connection error handling
- [x] Browser compatibility checks

### Hardware Code Features
- [x] Arduino code for HC-05 Bluetooth
- [x] ESP32 code for WiFi connectivity
- [x] JSON data formatting
- [x] Sensor data reading (DHT22, Soil, Ultrasonic)
- [x] Pump relay control
- [x] Serial debugging output
- [x] WiFi auto-reconnect
- [x] HTTP POST with error handling
- [x] WebSocket support
- [x] Command reception from server

---

## 🧪 Testing Checklist

### Backend Testing
```bash
# Test health endpoint
curl http://localhost:5001/api/health

# Test device registration (replace TOKEN)
curl -X POST http://localhost:5001/api/hardware/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"deviceId":"TEST_001","deviceName":"Test Device","connectionType":"wifi"}'

# Test data reception (simulate ESP32)
curl -X POST http://localhost:5001/api/hardware/data \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"TEST_001","soil":45,"temperature":26,"humidity":60,"tankLevel":80,"pumpStatus":"ON"}'
```

### Frontend Testing
1. Open http://localhost:3001/devices
2. Select "Bluetooth" tab
3. Click "Connect to HC-05 Device"
4. Verify device list appears
5. Connect and verify data display
6. Test pump controls
7. Switch to "WiFi" tab
8. Verify ESP32 appears when connected

### Hardware Testing
**Arduino HC-05:**
1. Open Serial Monitor (9600 baud)
2. Verify sensor readings print
3. Verify JSON format correct
4. Test `PUMP_ON` command
5. Test `PUMP_OFF` command

**ESP32:**
1. Open Serial Monitor (115200 baud)
2. Verify WiFi connection
3. Verify "✓ Response: 200"
4. Check backend receives data
5. Test pump commands from web

---

## 🎯 Key Integration Points

### 1. **Hardware → Backend**
- HC-05: Browser Web Bluetooth → Frontend → Backend API
- ESP32: WiFi → Direct HTTP POST → Backend API

### 2. **Backend → Frontend**
- Socket.io WebSocket rooms
- Event: `sensor:update` → Dashboard updates
- Real-time data broadcast to specific user

### 3. **Frontend → Hardware**
- Bluetooth: Web Bluetooth API direct commands
- WiFi: API call → Backend → WebSocket → ESP32

---

## 📈 Performance

### Data Update Frequency
- **HC-05 Bluetooth:** Every 2 seconds
- **ESP32 WiFi:** Every 5 seconds
- **Configurable** in hardware code

### Database Optimization
- Compound indexes on userId + timestamp
- TTL index for auto-cleanup (30 days)
- Efficient aggregation queries

### WebSocket Efficiency
- Room-based broadcasting (not global)
- Only relevant users receive updates
- Minimal bandwidth usage

---

## 🌐 Browser Compatibility

### Web Bluetooth (HC-05)
✅ Chrome 56+  
✅ Edge 79+  
✅ Opera 43+  
❌ Firefox (not supported)  
❌ Safari (not supported)  

### WiFi (ESP32)
✅ All browsers (uses HTTP/WebSocket)

---

## 🔄 Data Flow Diagram

```
┌─────────────┐     Bluetooth      ┌──────────┐
│   Arduino   │◄──────────────────►│ Browser  │
│   + HC-05   │    Web BLE API     │ Chrome   │
└─────────────┘                     └────┬─────┘
                                         │
                                         │ HTTP/WS
                                         ▼
┌─────────────┐      WiFi          ┌──────────┐      WebSocket      ┌──────────┐
│    ESP32    │───────HTTP────────►│  Backend │◄────────────────────│Dashboard │
│   Sensors   │        POST        │  Node.js │     socket.io       │ React UI │
└─────────────┘                     └────┬─────┘                     └──────────┘
                                         │
                                         ▼
                                    ┌──────────┐
                                    │ MongoDB  │
                                    │ Database │
                                    └──────────┘
```

---

## 🏆 Production Readiness

### ✅ Completed
- Robust error handling
- Connection retry logic
- Device ownership security
- Data validation
- Audit logging
- WebSocket rooms
- Database indexing
- TTL for data cleanup
- Status monitoring
- Browser compatibility checks

### 🚀 Ready for Deployment
- Deploy backend on VPS/Cloud
- Use MongoDB Atlas for database
- Configure firewall rules
- Set up SSL certificates
- Update ESP32 server URLs
- Test from production environment

---

## 📞 Support & Resources

### Documentation
- `/HARDWARE_SETUP_GUIDE.md` - Complete setup instructions
- Arduino code comments - Inline documentation
- ESP32 code comments - Inline documentation

### Libraries Used
- **Arduino:** DHT sensor library, SoftwareSerial
- **ESP32:** WiFi, HTTPClient, ArduinoJson, WebSockets
- **Backend:** Express, Socket.io, Mongoose
- **Frontend:** React, Axios, Web Bluetooth API

---

## 🎉 You're All Set!

Your AGRANOVA platform now has **PRODUCTION-READY** hardware integration:

✅ Connect real Arduino/ESP32 devices  
✅ See live sensor data on dashboard  
✅ Control pump remotely  
✅ Historical data tracking  
✅ Secure device ownership  
✅ Real-time WebSocket updates  

**Start connecting your hardware and monitor your irrigation system in real-time! 🌱💧**
