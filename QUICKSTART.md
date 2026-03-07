# 🚀 Quick Start Guide - AGRANOVA

This guide will help you get AGRANOVA up and running in less than 10 minutes!

## ⚡ Prerequisites Quick Check

Before starting, make sure you have:

- ✅ **Node.js** (v18+) - Run `node --version` to check
- ✅ **MongoDB** (v6+) - Run `mongod --version` to check
- ✅ **npm** or **yarn** - Run `npm --version` to check

Don't have these? [See detailed installation guide](SETUP.md)

## 📝 Step-by-Step Setup

### 1️⃣ Install Backend Dependencies (2 minutes)

Open PowerShell/Terminal and run:

```powershell
# Navigate to backend folder
cd c:\Users\ACER\agronova_smart_irrigation_system\backend

# Install dependencies
npm install

# Create environment file
Copy-Item .env.example .env

# Edit .env file (use notepad or any text editor)
notepad .env
```

**Edit the .env file and set:**
```env
MONGODB_URI=mongodb://localhost:27017/agranova
JWT_SECRET=agranova_secret_key_2024
OPENAI_API_KEY=optional_your_key_here
```

### 2️⃣ Install Frontend Dependencies (2 minutes)

```powershell
# Navigate to frontend folder
cd ..\frontend

# Install dependencies
npm install

# Create environment file
Copy-Item .env.example .env

# No need to edit .env for local development
```

### 3️⃣ Start MongoDB (1 minute)

**Option A: MongoDB as Windows Service**
```powershell
net start MongoDB
```

**Option B: Manual Start**
```powershell
mongod --dbpath C:\data\db
```

**Option C: MongoDB Atlas (Cloud)**
- Use your MongoDB Atlas connection string in backend/.env

### 4️⃣ Start the Backend Server (30 seconds)

Open a **new** PowerShell window:

```powershell
cd c:\Users\ACER\agronova_smart_irrigation_system\backend
npm run dev
```

You should see:
```
╔═══════════════════════════════════════════════════╗
║          🌱 AGRANOVA API SERVER 🌱               ║
║  Status: RUNNING                                  ║
║  Port: 5000                                       ║
╚═══════════════════════════════════════════════════╝
```

### 5️⃣ Start the Frontend (30 seconds)

Open **another** PowerShell window:

```powershell
cd c:\Users\ACER\agronova_smart_irrigation_system\frontend
npm start
```

Your browser will automatically open to `http://localhost:3000`

## 🎉 First Time Setup

### Create Your Account

1. Click **"Sign up"** on the login page
2. Fill in your details:
   - **Name**: Your name
   - **Email**: your@email.com
   - **Password**: At least 6 characters
   - **Region**: e.g., California, USA
   - **Crops**: e.g., Wheat, Corn, Tomatoes
3. Click **"Create Account"**

You'll be automatically logged in!

## 🎮 Quick Tour

### 1. Dashboard
- View real-time sensor data
- Monitor soil moisture, temperature, humidity
- Check water tank level
- See pump and solar panel status

### 2. Irrigation Control
- Switch between **Automatic** and **Manual** modes
- **Automatic**: Set moisture threshold (e.g., 30%)
- **Manual**: Control pump directly with timer

### 3. Analytics
- View historical data charts
- See moisture trends, temperature patterns
- Export data as CSV

### 4. Community
- Join farmer groups
- Chat in real-time
- Ask and answer questions

### 5. AI Assistant
- Ask farming questions
- Get instant advice
- Agriculture topics only!

## 🧪 Testing the System

### Test Sensor Data
The system automatically generates simulated sensor data every 10 seconds. Watch your dashboard update in real-time!

### Test Irrigation
1. Go to **Irrigation Control**
2. Switch to **Manual Mode**
3. Set timer to 5 minutes
4. Click **"Start"**
5. Watch the pump status change!

### Test AI Assistant
1. Go to **AI Assistant**
2. Ask: "What's the best irrigation schedule for tomatoes?"
3. Get instant advice!

## 🔧 Common Issues & Solutions

### Issue: MongoDB Connection Failed

**Solution:**
```powershell
# Check if MongoDB is running
Get-Process mongod

# If not running, start it
net start MongoDB
```

### Issue: Port 3000 or 5000 Already in Use

**Solution for Backend (Port 5000):**
Edit `backend/.env`:
```env
PORT=5001
```

**Solution for Frontend (Port 3000):**
Edit `frontend/package.json`:
```json
"scripts": {
  "start": "set PORT=3001 && react-scripts start"
}
```

### Issue: Cannot Find Module

**Solution:**
```powershell
# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install
```

### Issue: WebSocket Not Connecting

**Solution:**
1. Ensure both backend and frontend are running
2. Check browser console for errors
3. Refresh the page (Ctrl + F5)

## 🎯 What to Do Next?

### 1. Explore Features
- Create a group in Community
- Ask the AI assistant about your crops
- View analytics for different time periods

### 2. Customize Settings
- Set your preferred moisture threshold
- Configure irrigation schedule
- Update your profile

### 3. Invite Team Members
- Share the registration link
- Collaborate in group chats
- Share knowledge in Q&A forum

## 📸 Expected Results

After setup, you should see:

**Dashboard:**
- Sensor cards with live data
- Water tank gauge (circular)
- Pump status (Active/Inactive)
- Solar panel status

**Real-time Updates:**
- Data refreshes every 10 seconds
- No page reload needed
- Smooth animations

## 🆘 Still Need Help?

### Check Logs

**Backend Logs:**
- Look at the terminal where backend is running
- Check for error messages

**Frontend Logs:**
- Open browser DevTools (F12)
- Check Console tab

### Restart Everything

```powershell
# Stop all (Ctrl+C in each terminal)

# Restart MongoDB
net start MongoDB

# Restart backend
cd backend
npm run dev

# Restart frontend (in new terminal)
cd frontend
npm start
```

## 📚 Additional Resources

- [Full Setup Guide](SETUP.md)
- [API Documentation](API.md)
- [Features Documentation](FEATURES.md)

## ✅ Setup Checklist

- [ ] Node.js installed
- [ ] MongoDB installed and running
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Backend .env configured
- [ ] Frontend .env configured
- [ ] Backend server running (port 5000)
- [ ] Frontend server running (port 3000)
- [ ] Account created
- [ ] Dashboard loading correctly
- [ ] Real-time updates working

## 🎊 Congratulations!

You've successfully set up AGRANOVA! 

Start exploring and enjoy smart farming! 🌱

---

**Need help?** Open an issue or contact support.
