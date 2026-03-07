# 🔌 AGRANOVA Hardware Integration Guide

## Complete Setup Instructions for Real Hardware Connectivity

This guide will help you integrate **real physical sensors** with the AGRANOVA Smart Irrigation Platform.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Hardware Requirements](#hardware-requirements)
3. [Option 1: Bluetooth (HC-05) Setup](#option-1-bluetooth-hc-05-setup)
4. [Option 2: WiFi (ESP32) Setup](#option-2-wifi-esp32-setup)
5. [Backend Configuration](#backend-configuration)
6. [Frontend Usage](#frontend-usage)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The AGRANOVA platform supports TWO methods for connecting real hardware:

### 1. **Bluetooth (HC-05) - Arduino**
- Uses Web Bluetooth API
- Direct browser-to-device connection
- No server configuration needed
- Supported browsers: Chrome, Edge, Opera

### 2. **WiFi (ESP32)**
- Automatic connection via WiFi
- Sends data to backend server
- More reliable for permanent installations
- Works from anywhere on your network

---

## 🛠️ Hardware Requirements

### For Bluetooth (HC-05) Option:

**Components:**
- Arduino Uno/Nano/Mega
- HC-05 Bluetooth Module
- DHT22 Temperature/Humidity Sensor
- Soil Moisture Sensor (Analog)
- HC-SR04 Ultrasonic Distance Sensor (for water tank level)
- 5V Relay Module (for pump control)
- Jumper wires
- Breadboard
- 5V Power supply

**Wiring Diagram:**
```
HC-05 Module:
- HC-05 TX  → Arduino Pin 10 (RX)
- HC-05 RX  → Arduino Pin 11 (TX) via voltage divider (5V to 3.3V!)
- HC-05 VCC → 5V
- HC-05 GND → GND

DHT22 Sensor:
- DATA → Arduino Pin 2
- VCC  → 5V
- GND  → GND

Soil Moisture:
- AO   → Arduino Pin A0
- VCC  → 5V
- GND  → GND

HC-SR04 Ultrasonic:
- TRIG → Arduino Pin 7
- ECHO → Arduino Pin 8
- VCC  → 5V
- GND  → GND

Relay Module (Pump):
- IN   → Arduino Pin 12
- VCC  → 5V
- GND  → GND
```

### For WiFi (ESP32) Option:

**Components:**
- ESP32 Development Board
- DHT22 Temperature/Humidity Sensor
- Soil Moisture Sensor (Analog)
- HC-SR04 Ultrasonic Distance Sensor
- 5V Relay Module
- Jumper wires
- Breadboard
- Micro USB cable

**Wiring Diagram:**
```
DHT22:
- DATA → GPIO 4
- VCC  → 3.3V
- GND  → GND

Soil Moisture:
- AO   → GPIO 34 (ADC1_CH6)
- VCC  → 3.3V
- GND  → GND

HC-SR04:
- TRIG → GPIO 5
- ECHO → GPIO 18
- VCC  → 5V (use VIN pin from ESP32)
- GND  → GND

Relay:
- IN   → GPIO 19
- VCC  → 5V (use VIN pin)
- GND  → GND
```

---

## 📱 Option 1: Bluetooth (HC-05) Setup

### Step 1: Install Arduino IDE
1. Download from https://www.arduino.cc/en/software
2. Install for your operating system

### Step 2: Install Required Libraries
Open Arduino IDE → Tools → Manage Libraries → Install:
- `DHT sensor library` by Adafruit
- `Adafruit Unified Sensor`

### Step 3: Upload Arduino Code
1. Open the file: `/hardware/arduino_hc05_bluetooth/arduino_hc05_bluetooth.ino`
2. Connect your Arduino via USB
3. Select your board: Tools → Board → Arduino Uno (or your model)
4. Select your port: Tools → Port → (select the COM port)
5. Click Upload (→) button
6. Wait for "Done uploading"

### Step 4: Configure HC-05 Module
**IMPORTANT:** Configure HC-05 name before first use:

1. Enter AT Command Mode:
   - Disconnect VCC from HC-05
   - Hold KEY/EN button on HC-05
   - Reconnect VCC (LED should blink slowly)
   
2. Open Serial Monitor (115200 baud)
3. Send these commands:
   ```
   AT
   AT+NAME=HC-05
   AT+UART=9600,0,0
   ```

### Step 5: Test Connection
1. Power on your Arduino with HC-05
2. Open Chrome/Edge browser
3. Go to: `http://localhost:3001/devices`
4. Click "Connect to HC-05 Device"
5. Select your HC-05 from the list
6. You should see live sensor data!

---

## 📡 Option 2: WiFi (ESP32) Setup

### Step 1: Install ESP32 Board Support
1. Open Arduino IDE
2. File → Preferences
3. Add to "Additional Board Manager URLs":
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
4. Tools → Board → Boards Manager
5. Search "ESP32" and install "ESP32 by Espressif"

### Step 2: Install Required Libraries
Tools → Manage Libraries → Install:
- `DHT sensor library` by Adafruit
- `Adafruit Unified Sensor`
- `ArduinoJson` by Benoit Blanchon
- `WebSockets` by Markus Sattler

### Step 3: Configure ESP32 Code
1. Open `/hardware/esp32_wifi/esp32_wifi.ino`
2. **IMPORTANT:** Update these lines:

```cpp
// Line 23-24: Your WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";        // Replace with your WiFi name
const char* password = "YOUR_WIFI_PASSWORD"; // Replace with your WiFi password

// Line 27-28: Your server address
const char* serverUrl = "http://YOUR_SERVER_IP:5001/api/hardware/data";
const char* wsServerHost = "YOUR_SERVER_IP";

// Line 32: Change device ID (make it unique)
const String deviceId = "AGRO_ESP32_001";  // e.g., "AGRO_ESP32_FARM_01"
```

**How to find YOUR_SERVER_IP:**
- Windows: Open CMD and type `ipconfig` (look for IPv4 Address)
- Mac/Linux: Open Terminal and type `ifconfig` or `ip addr`
- Example: `192.168.1.100`

### Step 4: Upload to ESP32
1. Connect ESP32 via USB
2. Tools → Board → ESP32 Dev Module
3. Tools → Port → (select COM port)
4. Click Upload
5. Wait for completion

### Step 5: Monitor Serial Output
1. Tools → Serial Monitor (115200 baud)
2. Press RESET button on ESP32
3. You should see:
   ```
   ==================================
   AGRANOVA ESP32 WiFi Sensor Module
   ==================================
   Connecting to WiFi: YourNetworkName
   ✓ WiFi Connected!
   IP Address: 192.168.1.XXX
   ```

### Step 6: Verify Data Reception
1. Watch Serial Monitor for "✓ Response: 200"
2. Check backend console for "Data received"
3. Open dashboard - you should see live data!

---

## ⚙️ Backend Configuration

### 1. Ensure Backend is Running
```bash
cd backend
npm start
```

Server should show:
```
╔═══════════════════════════════════════════════════╗
║          🌱 AGRANOVA API SERVER 🌱               ║
║  Status: RUNNING                                  ║
║  Port: 5001                                      ║
╚═══════════════════════════════════════════════════╝
```

### 2. Test API Endpoint
Open browser or Postman:
```
GET http://localhost:5001/api/health
```

Should return:
```json
{
  "success": true,
  "message": "AGRANOVA API is running"
}
```

### 3. Database Connection
The backend automatically supports both:
- MongoDB (production)
- Demo mode (if MongoDB not connected)

---

## 🌐 Frontend Usage

### Access the Platform
1. Start frontend:
   ```bash
   cd frontend
   npm start
   ```

2. Open browser: `http://localhost:3001`

3. Login with your account

4. Go to: **Device Connection** page (menu or `/devices`)

### Connect Bluetooth Device
1. Select "Bluetooth (HC-05)"
2. Click "Connect to HC-05 Device"
3. Browser will show available devices
4. Select your HC-05
5. ✅ Connected! Data will appear instantly

### View WiFi Device
1. Select "WiFi (ESP32)"
2. ESP32 automatically appears when online
3. Data updates every 5 seconds

### Control Pump
- Click "Pump ON" to activate irrigation
- Click "Pump OFF" to stop
- Commands sent instantly to hardware

### View Dashboard
- Go to Dashboard page
- See real-time sensor widgets
- Data updates automatically via WebSocket

---

## 🔧 Troubleshooting

### Bluetooth Issues

**Problem:** "Web Bluetooth is not supported"
- **Solution:** Use Chrome, Edge, or Opera browser (NOT Firefox or Safari)

**Problem:** HC-05 not appearing in device list
- **Solution:** 
  1. Check HC-05 is powered (LED blinking)
  2. Check baud rate is 9600
  3. Rename device using AT commands
  4. Try pairing from Windows Bluetooth first

**Problem:** Connection drops frequently
- **Solution:**
  1. Check power supply (needs stable 5V)
  2. Keep distance < 10 meters
  3. Remove obstacles between device and computer

### WiFi (ESP32) Issues

**Problem:** ESP32 won't connect to WiFi
- **Solution:**
  1. Double-check SSID and password (case-sensitive!)
  2. ESP32 only supports 2.4GHz WiFi (NOT 5GHz)
  3. Check router allows ESP32 MAC address
  4. Try hotspot from phone as test

**Problem:** "Failed to connect to server"
- **Solution:**
  1. Verify server IP is correct
  2. Ensure backend is running
  3. Check firewall isn't blocking port 5001
  4. Ping server from ESP32 network

**Problem:** Data not appearing on dashboard
- **Solution:**
  1. Check Serial Monitor - is data being sent?
  2. Check backend console - is it received?
  3. Verify deviceId matches in database
  4. Refresh browser page

### Sensor Reading Issues

**Problem:** DHT22 reads NaN or 0
- **Solution:**
  1. Check wiring (DATA pin correct?)
  2. Add 10kΩ pull-up resistor between DATA and VCC
  3. Try different DHT22 sensor

**Problem:** Soil moisture always 0 or 100
- **Solution:**
  1. Calibrate sensor (adjust map() values in code)
  2. Insert sensor into actual soil
  3. Check analog pin connection

**Problem:** Tank level incorrect
- **Solution:**
  1. Adjust TANK_HEIGHT_CM in code
  2. Ensure ultrasonic sensor is mounted properly
  3. Check there's no obstacle in front

---

## 📊 Database Collections

When devices connect, these collections are created:

### `connecteddevices` Collection
```json
{
  "_id": "ObjectId",
  "deviceId": "AGRO_ESP32_001",
  "userId": "user_id",
  "deviceName": "ESP32 Field Sensor",
  "connectionType": "wifi",
  "status": "online",
  "lastSeen": "2026-02-12T10:30:00.000Z",
  "lastSensorData": {
    "soil": 45,
    "temperature": 26,
    "humidity": 60,
    "tankLevel": 80,
    "pumpStatus": "ON"
  }
}
```

### `realtimesensordata` Collection
```json
{
  "_id": "ObjectId",
  "deviceId": "AGRO_ESP32_001",
  "userId": "user_id",
  "soil": 45,
  "temperature": 26,
  "humidity": 60,
  "tankLevel": 80,
  "pumpStatus": "ON",
  "connectionType": "wifi",
  "timestamp": "2026-02-12T10:30:00.000Z"
}
```

---

## 🔒 Security Features

✅ Device ownership validation  
✅ User-specific device isolation  
✅ JWT authentication for API calls  
✅ Device ID verification  
✅ Secure WebSocket rooms  

Each user can only see and control their own devices.

---

## 🚀 Production Deployment

### For ESP32 in Production:
1. Use static IP for server
2. Set up port forwarding if accessing remotely
3. Use HTTPS instead of HTTP
4. Implement OTA (Over-The-Air) updates
5. Add device authentication tokens

### Recommended Infrastructure:
- Backend: Deploy on VPS or cloud (AWS, DigitalOcean)
- Database: MongoDB Atlas
- Frontend: Vercel or Netlify
- SSL Certificate: Let's Encrypt

---

## 📞 Support

If you encounter issues:
1. Check Serial Monitor output
2. Check browser console (F12)
3. Check backend console
4. Verify all wiring connections
5. Test each sensor individually

---

## ✅ Quick Start Checklist

### Bluetooth (HC-05):
- [ ] Arduino IDE installed
- [ ] Libraries installed (DHT, Adafruit Unified Sensor)
- [ ] Code uploaded to Arduino
- [ ] HC-05 configured and paired
- [ ] Chrome/Edge browser used
- [ ] Backend running
- [ ] Frontend running
- [ ] Connected via Web Bluetooth

### WiFi (ESP32):
- [ ] ESP32 board support installed
- [ ] Libraries installed (DHT, ArduinoJson, WebSockets)
- [ ] WiFi credentials updated in code
- [ ] Server IP updated in code
- [ ] Device ID customized
- [ ] Code uploaded to ESP32
- [ ] ESP32 connected to WiFi
- [ ] Data appearing on dashboard

---

## 🎉 Success!

Once everything is working, you should see:
- ✅ Real-time sensor values on dashboard
- ✅ Live updates every few seconds
- ✅ Pump control working
- ✅ Device status indicators
- ✅ Historical data graphs

**Your AGRANOVA Smart Irrigation System is now fully operational with real hardware! 🌱💧**
