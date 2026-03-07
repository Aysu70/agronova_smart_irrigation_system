# 🚀 AGRANOVA - Quick Start Guide

## ⚠️ IMPORTANT: MongoDB Must Be Running!

### Option 1: Start MongoDB Service

```powershell
# If MongoDB is installed as a service
Start-Service MongoDB
```

### Option 2: Start MongoDB Manually

```powershell
# If MongoDB is installed but not as a service
# Open Command Prompt as Administrator and run:
"C:\Program Files\MongoDB\Server\<version>\bin\mongod.exe" --dbpath="C:\data\db"
```

### Option 3: Install MongoDB (if not installed)

1. Download from: https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB will auto-start

### Verify MongoDB is Running

```powershell
# Try connecting with mongo shell
mongo --version

# Or check processes
Get-Process -Name mongod
```

---

## 🏃 Start the System (3 Commands)

### Terminal 1: Seed Database (First Time Only)

```powershell
cd backend
npm run seed
```

**Expected output:**
```
🌱 Connecting to MongoDB...
✅ Connected to MongoDB
🗑️  Clearing existing data...
✅ Existing data cleared
👥 Creating users...
✅ Created 4 users
📦 Creating devices...
✅ Created 4 devices
🛒 Creating sample orders...
✅ Created 3 orders
🚰 Creating irrigation systems...
✅ Created 5 irrigation systems
💬 Creating discussions...
✅ Created 4 discussions
✅ Added sample replies

🎉 Database seeded successfully!

📧 Login credentials:
   Admin: admin@agranova.com / admin123
   User 1: rashad@farmer.com / user123
   User 2: leyla@farm.az / user123
   User 3: kamran@agro.az / user123
```

### Terminal 2: Start Backend

```powershell
cd backend
npm run dev
```

**Expected output:**
```
╔═══════════════════════════════════════════════════╗
║                                                   ║
║          🌱 AGRANOVA API SERVER 🌱               ║
║                                                   ║
║  Status: RUNNING                                  ║
║  Port: 5001                                       ║
║  Environment: development                         ║
║  Database: Connected                              ║
║  WebSocket: Active                                ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
```

### Terminal 3: Start Frontend

```powershell
cd frontend
npm start
```

**Browser opens automatically to:** http://localhost:3001

---

## 🎯 What to Test First

### 1. Login as Admin
- Email: admin@agranova.com
- Password: admin123
- You'll see: **Admin Dashboard** with stats

### 2. Check Users
- Sidebar → **Users**
- See all registered users
- Real data from database!

### 3. Check Orders
- Sidebar → **Orders**
- See 3 sample orders
- Click "View" to see order details
- All data from MongoDB!

### 4. Check Map
- Sidebar → **Devices**
- See Azerbaijan map in **English**
- 5 device markers show irrigation systems

### 5. Logout and Login as Regular User
- Click profile → **Logout**
- Login as: rashad@farmer.com / user123

### 6. Order a Device (NEW FEATURE!)
- Sidebar → **Shop Devices**
- Browse 4 available devices
- Click "Order Now" on any device
- Fill in shipping info
- Submit order
- **Order is saved to database!**

### 7. Check Your Order Appears in Admin
- Logout
- Login as admin again
- Go to **Orders**
- **See the new order you just placed!** ✅

### 8. Post in Community Forum (REDESIGNED!)
- Login as regular user
- Sidebar → **Community**
- Click "New Discussion"
- Select category: "Irrigation Problems"
- Post your question
- **Refresh page - your post persists!** ✅

---

## 🐛 Troubleshooting

### Seed Script Hangs or Shows "Connecting to MongoDB..."
**Problem:** MongoDB is not running

**Solutions:**
1. Start MongoDB service: `Start-Service MongoDB`
2. Or manually start mongod.exe
3. Or install MongoDB from official website

### Backend Error: "ECONNREFUSED 127.0.0.1:27017"
**Problem:** MongoDB is not accessible

**Solution:** Follow MongoDB start instructions above

### Port Already in Use
**Backend (5001):**
```powershell
netstat -ano | findstr :5001
# Find PID and kill it
taskkill /PID <PID> /F
```

**Frontend (3001):**
```powershell
netstat -ano | findstr :3001
# Find PID and kill it
taskkill /PID <PID> /F
```

### "Failed to load devices" or "Failed to load orders"
**Problem:** Backend not running or wrong port

**Solution:**
1. Make sure backend is running on port 5001
2. Check `frontend/.env` has `REACT_APP_API_URL=http://localhost:5001/api`

---

## ✅ Success Checklist

- [ ] MongoDB is running
- [ ] Database seeded (users, devices, orders created)
- [ ] Backend server running on port 5001
- [ ] Frontend running on port 3001
- [ ] Can login as admin
- [ ] Can see users in admin panel
- [ ] Can see orders in admin panel
- [ ] Map shows English labels
- [ ] Can order device as regular user
- [ ] Order appears in admin orders
- [ ] Can post in community forum
- [ ] Posts persist after refresh

---

## 🎉 That's It!

Your AGRANOVA system is now running with:
- ✅ Real MongoDB database
- ✅ Persistent user accounts
- ✅ Device ordering system
- ✅ Professional community forum
- ✅ English map
- ✅ Real admin-user interaction

**Everything is production-ready!** 🚀
