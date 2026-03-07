# 🔧 BLUETOOTH & DATABASE FIXES - Comprehensive Guide

## ✅ What Was Fixed

### 1. **Database Connection Issues**
- ✅ Increased timeout from 3 seconds to 10 seconds (serverSelectionTimeoutMS)
- ✅ Added retry logic with up to 3 attempts
- ✅ Better error messages with specific solutions
- ✅ Connection status monitoring
- ✅ Detailed logging for troubleshooting

### 2. **Bluetooth HC-05 Discovery Issues**
- ✅ Enhanced error handling with specific error diagnosis
- ✅ Better user guidance when HC-05 not found
- ✅ Multiple optional service UUIDs for compatibility
- ✅ Clear console messages for diagnostics
- ✅ Support for all Bluetooth device types

### 3. **Health Check Endpoint**
- ✅ Enhanced `/api/health` endpoint with database status
- ✅ Real-time connection diagnostics
- ✅ Server uptime information

---

## 🔍 TROUBLESHOOTING DATABASE ISSUES

### Problem: "ECONNREFUSED 127.0.0.1:27017"

**Cause:** MongoDB is not running

**Solution - Windows:**

#### Option 1: Using MongoDB Service (Recommended)
```powershell
# Check if MongoDB service exists and is running
Get-Service MongoDB

# If service exists, start it
net start MongoDB

# If service doesn't exist, install MongoDB first
# Download from: https://www.mongodb.com/try/download/community
```

#### Option 2: Start MongoDB Manually
```powershell
# Create data directory
New-Item -ItemType Directory -Force -Path C:\data\db

# Start MongoDB manually
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --dbpath C:\data\db
```

#### Option 3: Use MongoDB Atlas (Cloud - Recommended for Beginners)
1. Go to: https://cloud.mongodb.com
2. Create a free account
3. Create a free cluster
4. Get the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/agranova`)
5. Update `backend/.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agranova
```
6. Restart the backend server

### Problem: "Authentication Failed"

**Cause:** Wrong credentials in connection string

**Solution:**
1. Check your MONGODB_URI in `backend/.env`
2. Ensure username and password are correct
3. Verify special characters are URL-encoded
4. Make sure user has access to the `agranova` database

### Problem: "Connection Timeout"

**Cause:** MongoDB is running but not responding

**Solution:**
1. Check if MongoDB service is actually running:
```powershell
Get-Process mongod
```

2. Check MongoDB logs for errors
3. Ensure MongoDB is listening on localhost:27017
4. Try restarting MongoDB:
```powershell
net stop MongoDB
net start MongoDB
```

### Problem: "Failed to load devices" or "Cannot login" 

**Cause:** Database not connected but API endpoint called

**Solution:**
The application automatically runs in **demo mode** without a database. To use full features:
1. Ensure MongoDB is running ✓
2. Check `backend/.env` MONGODB_URI
3. Restart the backend server with: `npm start`
4. Check the console for `✅ MongoDB Connected` message

---

## 🔍 TROUBLESHOOTING BLUETOOTH HC-05 ISSUES

### Problem: "No Bluetooth Devices Found"

**Cause 1: HC-05 Module Not Powered On**
- Check power supply to Arduino with HC-05
- LED on HC-05 should be blinking (if powered)
- Check USB connection to Arduino

**Solution:**
1. Ensure HC-05 module has power
2. Check USB cable is properly connected to Arduino
3. HC-05 LED should blink red when powered
4. Try power cycling the Arduino

**Cause 2: HC-05 Not in Discoverable Mode**
- HC-05 might be already paired

**Solution:**
1. **Windows - Reset Bluetooth pairing:**
   - Open Settings → Bluetooth & devices
   - Find "HC-05" in paired devices
   - Click on it and select "Remove device"
   - Power cycle the HC-05 (unplug for 10 seconds)
   - Try connecting again

2. **Check HC-05 Status:**
   - Initially: HC-05 blinks slowly (not paired) - **Good!**
   - After pairing: HC-05 blinks fast or is steady - May need reset

**Cause 3: Bluetooth Disabled on Computer**
- Windows Bluetooth might be disabled

**Solution:**
1. Check Windows Settings → Bluetooth & devices
2. Ensure Bluetooth is turned ON
3. Make sure Bluetooth device is enabled (not airplane mode)

**Cause 4: Browser Doesn't Support Web Bluetooth**
- Using wrong browser or version

**Solution:**
- Use **Chrome 56+**, **Edge 79+**, or **Opera 43+**
- Update your browser to latest version
- Enable Bluetooth support if needed

### Problem: "GATT Server Connection Failed"

**Cause:** HC-05 module not responding properly

**Solutions:**
1. **Check HC-05 Wiring:**
   - TX → Arduino RX
   - RX → Arduino TX (with voltage divider)
   - GND → Arduino GND
   - VCC → Arduino 5V

2. **Check Arduino Code:**
   - Verify baud rate is 9600 (correct for HC-05)
   - Check Serial.begin(9600) in setup()

3. **Restart HC-05:**
   - Power cycle the module (unplug 10 seconds)
   - Reconnect USB Arduino

4. **Check UART Communication:**
   - Open Arduino Serial Monitor
   - Set baud rate to 9600
   - Should see JSON sensor data being printed
   - If nothing prints, check TX/RX connections

### Problem: "Device Selection Was Cancelled"

**Cause:** User clicked Cancel in device picker

**Solution:**
Simply try again - Click "Connect Bluetooth" button and select the HC-05 device from the list

### Problem: "Bluetooth Permission Denied"

**Cause:** Browser or Windows blocked Bluetooth access

**Solution:**
1. Check browser permissions
2. In Chrome: Settings → Privacy → Site settings → Bluetooth
3. Allow the website to access Bluetooth
4. Grant system permissions when prompted

---

## 🔧 QUICK DIAGNOSTIC STEPS

### Test Database Connection

1. **In Terminal:**
```powershell
# Test if MongoDB is running on default port
Test-NetConnection localhost -Port 27017

# Should show:
# TcpTestSucceeded : True
```

2. **In Browser:**
Open: `http://localhost:5001/api/health`

Expected response:
```json
{
  "success": true,
  "message": "AGRANOVA API is running",
  "database": {
    "connected": true,
    "status": "✅ Connected"
  }
}
```

### Test Bluetooth Connection

1. **Check Browser Support:**
   - Open browser console (F12)
   - Run: `'bluetooth' in navigator`
   - Should return: `true`

2. **Check HC-05 Power:**
   - Look for LED on HC-05
   - Should be blinking (not steady, not off)

3. **Check Pairing Status:**
   - Open Windows Settings → Bluetooth & devices
   - HC-05 should NOT be in the paired devices list
   - If it is, remove it and restart

### Check Backend Logs

When you start the backend, you should see:

```
🔗 Attempting MongoDB connection to: mongodb://localhost:27017/agranova
✅ MongoDB Connected: localhost:27017
📚 Database: agranova
```

If you see red X (❌) or warning (⚠️), database is not connected.

---

## 📋 SETUP CHECKLIST

### Database Setup ✓

- [ ] MongoDB is installed (or MongoDB Atlas account created)
- [ ] MongoDB is running (`net start MongoDB` or mongod.exe)
- [ ] `backend/.env` has correct MONGODB_URI
- [ ] Backend server shows `✅ MongoDB Connected` in console
- [ ] `http://localhost:5001/api/health` returns `connected: true`

### Bluetooth Setup ✓

- [ ] Arduino with HC-05 is connected via USB
- [ ] HC-05 LED is blinking (powered on)
- [ ] HC-05 is NOT paired with Windows (or removed from paired devices)
- [ ] Browser is Chrome 56+, Edge 79+, or Opera 43+
- [ ] Computer Bluetooth is enabled
- [ ] Arduino code has `Serial.begin(9600)` for HC-05

### Software Setup ✓

- [ ] Backend server running: `npm start` in backend directory
- [ ] Frontend server running: `npm start` in frontend directory
- [ ] Both servers show no errors in console
- [ ] Frontend can reach http://localhost:3001

---

## 🚀 TESTING THE FIX

### Full Test Procedure

1. **Start MongoDB:**
```powershell
net start MongoDB
```

2. **Start Backend:**
```powershell
cd backend
npm start
```

Wait for: `✅ MongoDB Connected`

3. **Start Frontend (new terminal):**
```powershell
cd frontend
npm start
```

4. **Power On HC-05:**
- Plug in Arduino with HC-05
- Check HC-05 LED blinking

5. **Test in Browser:**
- Go to: http://localhost:3001
- Log in
- Go to Dashboard
- Click "Connect Bluetooth"
- Select HC-05 from device list
- Should show "Connected" status

### Expected Behavior

✅ **Successful Connection:**
- Purple "Scanning..." badge appears
- "🔍 Scanning for Bluetooth devices..." toast shows
- Device picker opens
- HC-05 appears in list
- Connection succeeds
- Green "Connected" badge appears
- Sensor data updates in real-time

❌ **If Something Fails:**
- Read error message in browser console (F12)
- Check backend terminal for database errors
- Follow troubleshooting steps above

---

## 🔄 CONNECTION FLOW

```
┌─────────────────────────────────────┐
│   User Clicks "Connect Bluetooth"   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Check Web Bluetooth API Support    │
│  (Chrome, Edge, Opera required)     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Scan for Bluetooth Devices         │
│  (acceptAllDevices: true)           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  User Selects from Device List      │
│  (HC-05 should appear here)         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Connect to GATT Server             │
│  (Bluetooth connection)             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Get FFE0 Service & FFE1 Char       │
│  (HC-05 UART service)              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Start Notifications                │
│  (Listen for sensor data)           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  ✅ Connected!                      │
│  Sensor data flowing in real-time   │
└─────────────────────────────────────┘
```

---

## 📞 SUPPORT RESOURCES

### Database
- MongoDB Documentation: https://docs.mongodb.com
- MongoDB Atlas: https://cloud.mongodb.com
- Mongoose: https://mongoosejs.com

### Bluetooth
- Web Bluetooth API: https://webbluetoothcg.github.io/web-bluetooth/
- HC-05 Documentation: https://components101.com/wireless/hc-05-bluetooth-module
- Arduino Serial: https://www.arduino.cc/en/Reference/Serial

### Forum & Help
- Arduino Forum: https://forum.arduino.cc
- Stack Overflow: Search "HC-05 Arduino"
- GitHub Issues: Report issues in project repo

---

## 📝 Version Info

- **Last Updated:** February 12, 2026
- **Database Timeout:** 10 seconds (increased from 3)
- **Retry Attempts:** 3 attempts with 2-second delay
- **Bluetooth:** Web Bluetooth API (Chrome 56+)
- **Status:** ✅ Production Ready

---

## ✨ Next Steps

After fixing these issues:

1. **Seed Database** (optional):
```powershell
cd backend
npm run seed
```

2. **Test Full Application:**
   - Login with created user
   - Test all features
   - Check console for errors

3. **Monitor Logs:**
   - Keep backend terminal visible
   - Watch for connection issues
   - Handle gracefully if MongoDB goes down

4. **Optimize Performance:**
   - Enable caching for APIs
   - Use connection pooling
   - Monitor database performance

