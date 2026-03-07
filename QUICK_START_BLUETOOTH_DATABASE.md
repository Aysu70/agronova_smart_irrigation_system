# 🚀 QUICK START - Database & Bluetooth Setup

## ⚡ Prerequisites Check (Run This First!)

```powershell
# Windows PowerShell
.\verify-setup.ps1
```

This will check:
- ✅ Node.js installed
- ✅ MongoDB running
- ✅ Ports available
- ✅ Configuration files
- ✅ Dependencies installed
- ✅ Bluetooth service

---

## 1️⃣ START MONGODB

Choose ONE option:

### Option A: MongoDB Service (Simplest)
```powershell
net start MongoDB
```

Check if it worked:
```powershell
Get-Process mongod
```

### Option B: Start MongoDB Manually
```powershell
# Create data directory
New-Item -ItemType Directory -Force -Path C:\data\db

# Start MongoDB
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --dbpath C:\data\db
```

### Option C: MongoDB Atlas (Cloud - No Installation Needed)
1. Go to: https://cloud.mongodb.com
2. Create free account
3. Create free cluster (M0)
4. Get connection string
5. Update `backend/.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agranova
```

---

## 2️⃣ VERIFY MONGODB IS CONNECTED

Open browser and go to:
```
http://localhost:5001/api/health
```

**Expected Response:**
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

If database is not connected, check:
- [ ] MongoDB is running (`Get-Process mongod`)
- [ ] Correct MONGODB_URI in `backend/.env`
- [ ] Port 27017 not blocked
- [ ] No typos in connection string

---

## 3️⃣ START BACKEND SERVER

```powershell
cd backend
npm start
```

**Expected Console Output:**
```
🔗 Attempting MongoDB connection to: mongodb://localhost:27017/agranova
✅ MongoDB Connected: localhost:27017
📚 Database: agranova

╔═══════════════════════════════════════════════════╗
║          🌱 AGRANOVA API SERVER 🌱               ║
║  Status: RUNNING                                  ║
║  Port: 5001                                      ║
╚═══════════════════════════════════════════════════╝
```

---

## 4️⃣ START FRONTEND SERVER

Open **NEW PowerShell window** and run:

```powershell
cd frontend
npm start
```

**Expected Output:**
```
webpack compiled with warnings
You can now view agranova in the browser.
  Local: http://localhost:3001
```

---

## 5️⃣ PREPARE HC-05 MODULE

1. **Check Hardware:**
   - [ ] Arduino connected via USB
   - [ ] HC-05 module wired to Arduino:
     - TX → Arduino RX (pin 0)
     - RX → Arduino TX (pin 1) with voltage divider
     - GND → Arduino GND
     - VCC → Arduino 5V
   - [ ] Arduino code has `Serial.begin(9600)`

2. **Check HC-05 Power:**
   - [ ] LED on HC-05 is blinking (not steady, not off)
   - [ ] If not blinking, check power connections

3. **Clear Pairing (if needed):**
   - Go to Windows Settings → Bluetooth & devices
   - Find "HC-05" in paired devices
   - Click and select "Remove device"
   - Restart HC-05 (unplug for 10 seconds)

---

## 6️⃣ TEST BLUETOOTH CONNECTION

1. Open: http://localhost:3001
2. Log in with credentials
3. Go to Dashboard
4. Scroll to top "Hardware Connection Panel"
5. Click "Connect Bluetooth"

**Expected Process:**
```
1. Purple "Scanning..." badge appears
2. Toast: "🔍 Scanning for Bluetooth devices..."
3. Browser device picker opens
4. HC-05 appears in list (might be named "HC-05" or "AIRDUINO")
5. Click HC-05 to select
6. 2-3 seconds connecting...
7. Toast: "✅ Connected to HC-05"
8. Green "Connected" badge
9. Sensor data starts updating
```

---

## ❌ Troubleshooting

### "Cannot find HC-05"
- [ ] HC-05 powered and LED blinking?
- [ ] Arduino USB cable connected?
- [ ] Removed from Windows paired devices?
- [ ] Using Chrome/Edge/Opera?
- [ ] Computer Bluetooth enabled?

**Solution:**
- Restart Arduino (unplug for 5 sec)
- Remove HC-05 from Windows Bluetooth
- Try again

### "MongoDB Connection Failed"
- [ ] MongoDB running? `Get-Process mongod`
- [ ] MONGODB_URI correct in `.env`?
- [ ] Port 27017 available? `Test-NetConnection localhost -Port 27017`

**Solution:**
- Start MongoDB: `net start MongoDB`
- Fix `.env` file
- Restart backend server

### "Port already in use"
```powershell
# Find process on port
netstat -ano | findstr :5001

# Kill it (replace PID)
taskkill /PID 12345 /F

# Or change port in backend/.env
PORT=5002
```

---

## ✅ Verification Checklist

After everything is running:

Database:
- [ ] Backend shows `✅ MongoDB Connected`
- [ ] `/api/health` shows `connected: true`
- [ ] Can login successfully

Bluetooth:
- [ ] HC-05 LED blinking
- [ ] "Connect Bluetooth" button works
- [ ] Device appears in picker
- [ ] Shows "Connected" status
- [ ] Sensor data updating (values changing)

Servers:
- [ ] Backend running on port 5001
- [ ] Frontend running on port 3001
- [ ] No errors in browser console (F12)
- [ ] No errors in backend terminal

---

## 📞 Still Having Issues?

1. **Check Console Errors:**
   - Browser: Press F12 → Console tab
   - Backend: Look at terminal output

2. **Check Logs:**
   - MongoDB logs: Check MongoDB service logs
   - Backend: All errors printed to terminal

3. **Read Full Guide:**
   - See: `BLUETOOTH_DATABASE_FIXES.md` for comprehensive troubleshooting

4. **Restart Everything:**
   - Stop frontend (Ctrl+C)
   - Stop backend (Ctrl+C)
   - Stop MongoDB (`net stop MongoDB`)
   - Start MongoDB again
   - Start backend
   - Start frontend
   - Try again

---

## 🎉 Success!

If all checks pass and connection works, you're ready to:
- [ ] Add real HC-05 sensors
- [ ] Test pump control
- [ ] Monitor soil moisture, temperature, humidity
- [ ] Check real-time updates
- [ ] Deploy to production

Enjoy your smart irrigation system! 🌱💧

