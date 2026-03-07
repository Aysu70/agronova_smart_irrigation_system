# 🚀 AGRANOVA - Complete Setup & Run Instructions

## ✅ What You Have Now

A complete, production-ready smart agriculture platform with:
- ✨ Modern React frontend with TailwindCSS
- 🔥 Node.js/Express backend with MongoDB
- ⚡ Real-time WebSocket updates
- 🤖 AI agricultural assistant
- 👥 Farmer community features
- 📊 Advanced analytics
- 💧 Smart irrigation control

---

## 📋 Quick Reference

### Project Structure
```
c:\Users\ACER\agronova_smart_irrigation_system\
├── backend/          ← Node.js API server
├── frontend/         ← React application
├── QUICKSTART.md     ← Fast setup guide
├── FEATURES.md       ← Feature documentation
└── README.md         ← Main documentation
```

### Default Ports
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **MongoDB**: mongodb://localhost:27017

---

## 🎯 Step-by-Step Execution

### Step 1: Install Dependencies

**Backend (First Terminal):**
```powershell
cd c:\Users\ACER\agronova_smart_irrigation_system\backend
npm install
```

**Frontend (Second Terminal):**
```powershell
cd c:\Users\ACER\agronova_smart_irrigation_system\frontend
npm install
```

### Step 2: Configure Environment

**Backend Configuration:**
```powershell
cd c:\Users\ACER\agronova_smart_irrigation_system\backend
Copy-Item .env.example .env
notepad .env
```

Edit `.env` with these values:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/agranova
JWT_SECRET=agranova_secret_key_2024_change_in_production
OPENAI_API_KEY=your_openai_key_or_leave_empty
FRONTEND_URL=http://localhost:3000
```

**Frontend Configuration:**
```powershell
cd c:\Users\ACER\agronova_smart_irrigation_system\frontend
Copy-Item .env.example .env
```

The frontend `.env` file should contain:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### Step 3: Start MongoDB

**Option A - Windows Service:**
```powershell
net start MongoDB
```

**Option B - Manual Start:**
```powershell
# Create data directory if it doesn't exist
New-Item -ItemType Directory -Force -Path C:\data\db

# Start MongoDB
mongod --dbpath C:\data\db
```

**Option C - MongoDB Atlas (Cloud):**
- Go to https://cloud.mongodb.com
- Create free cluster
- Get connection string
- Update `MONGODB_URI` in backend/.env

### Step 4: Start Backend Server

Open PowerShell terminal:
```powershell
cd c:\Users\ACER\agronova_smart_irrigation_system\backend
npm run dev
```

**Expected Output:**
```
╔═══════════════════════════════════════════════════╗
║          🌱 AGRANOVA API SERVER 🌱               ║
║  Status: RUNNING                                  ║
║  Port: 5000                                       ║
║  Environment: development                         ║
║  Database: Connected                              ║
║  WebSocket: Active                                ║
╚═══════════════════════════════════════════════════╝

✅ MongoDB Connected: localhost:27017
🚀 Starting sensor data simulation...
```

**Keep this terminal open!**

### Step 5: Start Frontend Application

Open a **NEW** PowerShell terminal:
```powershell
cd c:\Users\ACER\agronova_smart_irrigation_system\frontend
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view agranova-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.x:3000
```

**Your browser will automatically open to http://localhost:3000**

---

## 🎮 Using the Application

### First Time Setup

1. **Create Account:**
   - Click "Sign up" on login page
   - Fill in your details:
     - Name: John Doe
     - Email: john@example.com
     - Password: password123
     - Region: California, USA
     - Crops: Tomatoes, Wheat, Corn
   - Click "Create Account"

2. **You're In!**
   - Automatically logged in
   - Redirected to Dashboard

### Exploring Features

#### 🏠 Dashboard
- **View**: Real-time sensor data updates every 10 seconds
- **See**: Soil moisture, temperature, humidity
- **Monitor**: Water tank, pump, solar panel status
- **Watch**: Data automatically refresh

#### 💧 Irrigation Control
- **Automatic Mode**:
  1. Set moisture threshold (e.g., 30%)
  2. Click "Save Configuration"
  3. System auto-irrigates when needed

- **Manual Mode**:
  1. Switch to Manual Mode
  2. Set timer (5-60 minutes)
  3. Click "Start"
  4. Watch pump activate!

#### 📊 Analytics
- Select time period (24h/7d/30d)
- View charts
- Export data as CSV
- Analyze trends

#### 👥 Community
- **Groups**: Create or join farmer groups
- **Chat**: Real-time messaging
- **Q&A**: Ask and answer questions
- **Tags**: Organize by topics

#### 🤖 AI Assistant
- Ask agricultural questions
- Get instant advice
- Examples:
  - "How do I improve soil pH?"
  - "What's the best fertilizer for tomatoes?"
  - "When should I irrigate corn?"

---

## 🧪 Testing the System

### Test 1: Sensor Data
1. Go to Dashboard
2. Watch sensor cards update automatically
3. Notice timestamp changing
4. See moisture, temperature, humidity values

### Test 2: Pump Control
1. Go to Irrigation Control
2. Switch to Manual Mode
3. Set timer to 5 minutes
4. Click "Start"
5. See pump status change to "ON"
6. Go back to Dashboard
7. Pump status shows "Active"

### Test 3: Automatic Irrigation
1. Go to Irrigation Control
2. Switch to Automatic Mode
3. Set threshold to 70%
4. Save Configuration
5. Wait for moisture to drop below 70%
6. Pump will auto-activate!

### Test 4: Alerts
1. Wait for low water alert (tank < 20%)
2. See notification appear
3. Check notification icon in navbar
4. Alerts update in real-time

### Test 5: Community
1. Go to Community
2. Click "+" to create group
3. Name: "Tomato Growers"
4. Create and join
5. Send a message
6. See it appear instantly!

### Test 6: AI Assistant
1. Go to AI Assistant
2. Ask: "What's the best irrigation method for vegetables?"
3. Get detailed response
4. Try: "Tell me about politics" (should refuse)

---

## 📱 Development Tips

### Hot Reload
- **Frontend**: Changes auto-reload in browser
- **Backend**: nodemon auto-restarts server
- Edit files and see changes immediately!

### Browser Developer Tools
Press `F12` or `Ctrl+Shift+I`:
- **Console**: See logs and errors
- **Network**: View API calls
- **Application**: Check localStorage

### API Testing
Use browser or Postman:
```
Health Check: http://localhost:5000/api/health
Latest Sensors: http://localhost:5000/api/sensors/latest (needs auth)
```

### Database Management
```powershell
# Connect to MongoDB
mongo

# Use AGRANOVA database
use agranova

# List collections
show collections

# View users
db.users.find().pretty()

# View sensor data
db.sensordatas.find().sort({timestamp:-1}).limit(5).pretty()
```

---

## 🐛 Troubleshooting

### Problem: "MongoDB connection failed"

**Solution 1 - Check if running:**
```powershell
Get-Process mongod
```

**Solution 2 - Start MongoDB:**
```powershell
net start MongoDB
```

**Solution 3 - Use MongoDB Atlas:**
Update `MONGODB_URI` in backend/.env with Atlas connection string

### Problem: "Port 5000 already in use"

**Solution:**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /F /PID <PID_NUMBER>
```

**Or** change port in backend/.env:
```env
PORT=5001
```

### Problem: "Module not found"

**Solution:**
```powershell
# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install
```

### Problem: "WebSocket connection failed"

**Checklist:**
- ✅ Backend server running?
- ✅ Frontend server running?
- ✅ Correct URLs in frontend/.env?
- ✅ Browser console shows errors?

**Solution:**
1. Stop both servers (Ctrl+C)
2. Restart backend first
3. Then restart frontend
4. Hard refresh browser (Ctrl+F5)

### Problem: "Cannot login"

**Solution:**
1. Check backend terminal for errors
2. Verify MongoDB is running
3. Check network tab in browser DevTools
4. Try creating new account

### Problem: "Sensor data not updating"

**Solution:**
1. Check backend terminal
2. Look for "sensor_update" emissions
3. Refresh browser
4. Check WebSocket connection status (top-right)

---

## 🔒 Production Deployment

### Before Deploying:

1. **Change Secrets:**
   ```env
   JWT_SECRET=your_very_secure_random_string_here
   ```

2. **Set Production MongoDB:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agranova
   ```

3. **Configure CORS:**
   Update `FRONTEND_URL` in backend/.env

4. **Build Frontend:**
   ```powershell
   cd frontend
   npm run build
   ```

5. **Environment:**
   ```env
   NODE_ENV=production
   ```

### Hosting Options:

**Backend:**
- Heroku
- Railway
- DigitalOcean
- AWS EC2
- Azure

**Frontend:**
- Vercel (Recommended)
- Netlify
- GitHub Pages
- Firebase Hosting

**Database:**
- MongoDB Atlas (Recommended)
- mLab
- Self-hosted

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│              (React + TailwindCSS)              │
│              http://localhost:3000              │
└───────────────┬─────────────────────────────────┘
                │
                │ HTTP REST API
                │ WebSocket
                │
┌───────────────▼─────────────────────────────────┐
│                   Backend                        │
│              (Node.js + Express)                │
│              http://localhost:5000              │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │  Routes → Controllers → Services         │  │
│  │  WebSocket Server (Socket.io)           │  │
│  │  Authentication (JWT)                     │  │
│  │  AI Integration (OpenAI)                 │  │
│  └──────────────────────────────────────────┘  │
└───────────────┬─────────────────────────────────┘
                │
                │ Mongoose ODM
                │
┌───────────────▼─────────────────────────────────┐
│                  MongoDB                         │
│         mongodb://localhost:27017               │
│                                                  │
│  Collections:                                    │
│  • users                                        │
│  • sensordatas                                  │
│  • irrigationconfigs                            │
│  • alerts                                       │
│  • groups                                       │
│  • messages                                     │
│  • questions                                    │
└─────────────────────────────────────────────────┘
```

---

## 📚 File Structure Reference

### Backend Key Files:
```
backend/
├── src/
│   ├── server.js              ← Main entry point
│   ├── config/
│   │   ├── database.js        ← MongoDB connection
│   │   └── socket.js          ← WebSocket setup
│   ├── models/                ← Database schemas
│   ├── routes/                ← API endpoints
│   ├── controllers/           ← Business logic
│   ├── middleware/            ← Authentication
│   └── services/              ← Background services
├── package.json
└── .env                       ← Configuration
```

### Frontend Key Files:
```
frontend/
├── src/
│   ├── index.jsx              ← Entry point
│   ├── App.jsx                ← Main component
│   ├── pages/                 ← Page components
│   ├── components/            ← Reusable components
│   ├── context/               ← State management
│   ├── services/              ← API calls
│   └── utils/                 ← Helper functions
├── public/
│   └── index.html
├── package.json
└── .env                       ← Configuration
```

---

## 🎓 Learning Resources

### Technologies Used:

**Frontend:**
- React: https://react.dev
- TailwindCSS: https://tailwindcss.com
- Recharts: https://recharts.org
- Socket.io Client: https://socket.io/docs/v4/client-api/

**Backend:**
- Node.js: https://nodejs.org/docs
- Express.js: https://expressjs.com
- MongoDB: https://docs.mongodb.com
- Mongoose: https://mongoosejs.com
- Socket.io: https://socket.io/docs/v4/

---

## 🎯 Next Steps

### For Development:
1. ✅ Explore all features
2. ✅ Test with different scenarios
3. ✅ Modify components as needed
4. ✅ Add custom features
5. ✅ Integrate real IoT devices

### For Production:
1. ✅ Change all secrets
2. ✅ Set up MongoDB Atlas
3. ✅ Deploy backend
4. ✅ Deploy frontend
5. ✅ Configure domain
6. ✅ Set up SSL certificate
7. ✅ Monitor performance

### For Presentation:
1. ✅ Prepare demo account
2. ✅ Create sample data
3. ✅ Test all features
4. ✅ Prepare screenshots
5. ✅ Write presentation notes

---

## 🆘 Getting Help

### Documentation:
- [README.md](README.md) - Overview
- [QUICKSTART.md](QUICKSTART.md) - Fast setup
- [FEATURES.md](FEATURES.md) - Feature details

### Common Commands:

**Start Everything:**
```powershell
# Terminal 1: MongoDB
net start MongoDB

# Terminal 2: Backend
cd backend
npm run dev

# Terminal 3: Frontend
cd frontend
npm start
```

**Stop Everything:**
```powershell
# In each terminal: Ctrl+C
# Then: net stop MongoDB
```

**Reset Database:**
```powershell
mongo
use agranova
db.dropDatabase()
exit
```

---

## ✅ Success Checklist

- [ ] MongoDB running
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Backend .env configured
- [ ] Frontend .env configured
- [ ] Backend server running (✅ in terminal)
- [ ] Frontend server running (browser opens)
- [ ] Account created
- [ ] Dashboard shows data
- [ ] Real-time updates working
- [ ] Pump control works
- [ ] Charts display
- [ ] Chat works
- [ ] AI assistant responds

---

## 🎉 Congratulations!

You now have a **complete, professional-grade smart agriculture platform**!

### What You've Built:
- ✨ Modern, responsive web application
- 🔥 Secure backend API
- ⚡ Real-time data streaming
- 📊 Advanced analytics
- 👥 Social features
- 🤖 AI integration
- 💼 Production-ready code

### Perfect For:
- 🎓 University projects
- 🚀 Startup prototypes
- 💼 Portfolio showcase
- 🏆 Competitions
- 📱 IoT integration
- 🌱 Actual farming!

---

**Made with ❤️ for sustainable agriculture**

**Start farming smarter! 🌱🚀**
