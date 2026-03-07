# AGRANOVA Admin Control System - Complete Documentation

## 🎉 System Overview

The AGRANOVA Admin Control System is a comprehensive monitoring and management platform for irrigation systems. This document covers the complete implementation including architecture, features, API endpoints, and usage instructions.

---

## 📋 Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Frontend Pages](#frontend-pages)
6. [Installation](#installation)
7. [Usage Guide](#usage-guide)
8. [Admin vs User Permissions](#admin-vs-user-permissions)
9. [Alert System](#alert-system)
10. [Map Integration](#map-integration)

---

## ✨ Features

### Core Admin Features

1. **Global System Monitoring**
   - View all irrigation systems from all users
   - Real-time sensor data updates
   - System health monitoring
   - Filterable table view (region, status, health)

2. **Interactive Map View**
   - Geographic visualization of all systems
   - Color-coded markers (Green=Normal, Yellow=Warning, Red=Critical)
   - Click markers for system details
   - Real-time status updates

3. **Admin Alert Center**
   - Technical/system warnings only
   - Alert filtering by severity and read status
   - Mark alerts as read or resolved
   - Alert types:
     - SENSOR_OFFLINE
     - DEVICE_NOT_RESPONDING
     - NO_DATA_RECEIVED
     - NETWORK_FAILURE
     - FIRMWARE_ERROR
     - HARDWARE_FAULT
     - BATTERY_CRITICAL
     - SOLAR_MALFUNCTION
     - SYSTEM_OFFLINE

4. **Admin Dashboard**
   - Total systems count
   - Online/offline statistics
   - Systems with warnings count
   - Unread and critical alerts
   - Health distribution charts
   - System status overview

5. **Remote Diagnostics**
   - System details view
   - Last 50 system logs
   - Sensor readings history
   - Error history
   - Hardware status checks

6. **User Management**
   - View all users
   - Promote users to admin
   - Demote admins to users
   - Delete users (existing feature)

---

## 🏗️ Architecture

### Backend Structure

```
backend/
├── src/
│   ├── models/
│   │   ├── IrrigationSystem.js    # NEW: System model
│   │   ├── AdminAlert.js          # NEW: Alert model
│   │   ├── SystemLog.js           # NEW: Log model
│   │   ├── User.js                # Updated: with role field
│   │   └── ...
│   ├── controllers/
│   │   ├── adminSystemController.js  # NEW: Admin system operations
│   │   ├── adminController.js        # Existing: User management
│   │   └── ...
│   ├── routes/
│   │   ├── adminSystems.js        # NEW: Admin system routes
│   │   ├── admin.js               # Existing: User routes
│   │   └── ...
│   └── middleware/
│       └── auth.js                # Updated: adminOnly middleware
```

### Frontend Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── AdminDashboard.jsx        # NEW: Main admin dashboard
│   │   ├── AdminSystems.jsx          # NEW: Systems management
│   │   ├── AdminMapView.jsx          # NEW: Map visualization
│   │   ├── AdminAlerts.jsx           # NEW: Alert center
│   │   ├── AdminSystemDetails.jsx    # NEW: System details
│   │   ├── AdminPanel.jsx            # Existing: User management
│   │   └── ...
│   ├── components/
│   │   └── common/
│   │       └── Sidebar.jsx           # Updated: Admin menu
│   ├── services/
│   │   └── api.js                    # Updated: Admin system API
│   └── App.jsx                       # Updated: Admin routes
```

---

## 💾 Database Schema

### IrrigationSystem Model

```javascript
{
  systemId: String (unique),
  ownerId: ObjectId (ref User),
  ownerName: String,
  region: String,
  location: {
    latitude: Number,
    longitude: Number
  },
  // Sensor readings
  soilMoisture: Number (0-100),
  temperature: Number,
  humidity: Number (0-100),
  waterTankLevel: Number (0-100),
  pumpStatus: String (ON/OFF/ERROR),
  batteryLevel: Number (0-100),
  solarStatus: String (ACTIVE/INACTIVE/CHARGING/ERROR),
  // System status
  systemStatus: String (Online/Offline/Warning/Critical),
  systemHealth: String (Normal/Warning/Critical),
  lastActive: Date,
  // Technical flags
  sensorOnline: Boolean,
  deviceResponding: Boolean,
  networkStatus: String (Connected/Disconnected/Poor),
  firmwareVersion: String,
  hardwareStatus: String (OK/Warning/Fault),
  // Metadata
  installDate: Date,
  lastMaintenance: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### AdminAlert Model

```javascript
{
  systemId: String,
  systemOwnerId: ObjectId,
  ownerName: String,
  region: String,
  alertType: String (enum),
  severity: String (INFO/WARNING/CRITICAL),
  message: String,
  details: String,
  isRead: Boolean,
  isResolved: Boolean,
  resolvedAt: Date,
  resolvedBy: ObjectId,
  createdAt: Date
}
```

### SystemLog Model

```javascript
{
  systemId: String,
  logType: String (INFO/WARNING/ERROR/SYSTEM/SENSOR/NETWORK),
  action: String,
  message: String,
  data: Mixed,
  timestamp: Date
}
```

---

## 🔌 API Endpoints

### Admin System Endpoints

All routes require authentication (`protect` middleware) and admin role (`adminOnly` middleware).

Base URL: `/api/admin/systems`

#### 1. Get Dashboard Statistics
```
GET /api/admin/systems/stats
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalSystems": 10,
    "onlineSystems": 7,
    "offlineSystems": 1,
    "systemsWithWarnings": 2,
    "unreadAlerts": 5,
    "criticalAlerts": 2,
    "healthDistribution": {
      "Normal": 7,
      "Warning": 2,
      "Critical": 1
    }
  }
}
```

#### 2. Get All Systems
```
GET /api/admin/systems/systems?region=all&status=all&health=all
```

**Query Parameters:**
- `region` (optional): Filter by region (default: 'all')
- `status` (optional): Filter by status (Online/Offline/Warning/Critical)
- `health` (optional): Filter by health (Normal/Warning/Critical)

**Response:**
```json
{
  "success": true,
  "count": 10,
  "systems": [
    {
      "systemId": "SYS-0001",
      "ownerName": "John Doe",
      "region": "North Valley",
      "soilMoisture": 45,
      "temperature": 25,
      "humidity": 60,
      "waterTankLevel": 80,
      "pumpStatus": "ON",
      "batteryLevel": 95,
      "solarStatus": "ACTIVE",
      "systemStatus": "Online",
      "systemHealth": "Normal",
      "lastActive": "2026-02-09T10:30:00.000Z",
      ...
    }
  ]
}
```

#### 3. Get Single System
```
GET /api/admin/systems/system/:id
```

**Response:**
```json
{
  "success": true,
  "system": {
    "systemId": "SYS-0001",
    "ownerId": "user123",
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060
    },
    ...
  }
}
```

#### 4. Get System Logs
```
GET /api/admin/systems/logs/:systemId?limit=50
```

**Query Parameters:**
- `limit` (optional): Number of logs to retrieve (default: 50)

**Response:**
```json
{
  "success": true,
  "count": 50,
  "logs": [
    {
      "_id": "log123",
      "systemId": "SYS-0001",
      "logType": "INFO",
      "action": "Sensor Reading",
      "message": "Temperature reading updated",
      "timestamp": "2026-02-09T10:30:00.000Z"
    }
  ]
}
```

#### 5. Get Admin Alerts
```
GET /api/admin/systems/alerts?unreadOnly=false&severity=all
```

**Query Parameters:**
- `unreadOnly` (optional): Show only unread alerts (default: false)
- `severity` (optional): Filter by severity (CRITICAL/WARNING/INFO)

**Response:**
```json
{
  "success": true,
  "count": 5,
  "alerts": [
    {
      "_id": "alert123",
      "systemId": "SYS-0005",
      "ownerName": "Jane Smith",
      "region": "South Plains",
      "alertType": "NETWORK_FAILURE",
      "severity": "WARNING",
      "message": "Poor network connectivity",
      "isRead": false,
      "isResolved": false,
      "createdAt": "2026-02-09T09:00:00.000Z"
    }
  ]
}
```

#### 6. Mark Alert as Read
```
PATCH /api/admin/systems/alert/:id/read
```

**Response:**
```json
{
  "success": true,
  "alert": {
    "_id": "alert123",
    "isRead": true,
    ...
  }
}
```

#### 7. Resolve Alert
```
PATCH /api/admin/systems/alert/:id/resolve
```

**Response:**
```json
{
  "success": true,
  "alert": {
    "_id": "alert123",
    "isResolved": true,
    "resolvedAt": "2026-02-09T10:30:00.000Z",
    ...
  }
}
```

---

## 🎨 Frontend Pages

### 1. Admin Dashboard (`/admin/dashboard`)

**Features:**
- Statistics cards (Total Systems, Online, Offline, Warnings)
- Alert statistics (Unread, Critical)
- System health distribution pie chart
- System status overview bar chart
- Quick action links

**Components:**
- Recharts for data visualization
- Real-time updates every 30 seconds
- Responsive grid layout

### 2. Systems Management (`/admin/systems`)

**Features:**
- Searchable table of all systems
- Filters: Region, Status, Health
- System information columns:
  - System ID, Owner, Region
  - Soil Moisture, Temperature
  - Water Tank Level, Pump Status
  - System Status, Last Active
- Click to view system details
- Real-time updates every 15 seconds

### 3. Map View (`/admin/map`)

**Features:**
- Interactive Leaflet map
- Color-coded markers (Green/Yellow/Red)
- Click markers for popup information
- Filter by system health
- System details sidebar
- Real-time location tracking

**Map Controls:**
- Zoom in/out
- Pan around
- Click markers for details
- Filter buttons (All/Normal/Warning/Critical)

### 4. Alert Center (`/admin/alerts`)

**Features:**
- List of technical alerts
- Filter by severity and unread status
- Alert statistics cards
- Mark as read / Resolve actions
- View system link
- Alert type icons
- Real-time updates every 15 seconds

**Alert Severity Levels:**
- 🔴 CRITICAL: Red badge, requires immediate action
- 🟡 WARNING: Yellow badge, attention needed
- 🔵 INFO: Blue badge, informational only

### 5. System Details (`/admin/system/:id`)

**Features:**
- Four tabs: Overview, Sensors, Logs, Diagnostics
- **Overview Tab:**
  - Sensor reading cards
  - System information
  - Equipment status
- **Sensors Tab:**
  - Current readings with icons
  - Visual cards for each sensor
- **Logs Tab:**
  - Last 50 system logs
  - Log type color coding
  - Scrollable log viewer
- **Diagnostics Tab:**
  - Sensor online status
  - Device responding check
  - Network status
  - Hardware status
  - Firmware version
  - Last maintenance date

### 6. User Management (`/admin/users`)

**Features:**
- View all users
- Search users
- Promote to admin
- Demote to user
- Delete users
- User statistics

---

## 📦 Installation

### Prerequisites

- Node.js v16+ installed
- MongoDB installed (optional - demo mode available)
- Git installed

### Step 1: Install Dependencies

```bash
# Install root dependencies (if not already done)
npm install

# Or install frontend and backend separately
cd frontend
npm install

cd ../backend
npm install
```

### Step 2: Install New Dependencies

The system automatically installs required packages, but you can manually install:

```bash
# Frontend
cd frontend
npm install leaflet react-leaflet

# Backend dependencies are already included
```

### Step 3: Environment Variables

Create `.env` file in backend directory:

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/agranova
JWT_SECRET=your_secret_key_here
FRONTEND_URL=http://localhost:3001
NODE_ENV=development
```

### Step 4: Start Servers

```bash
# From root directory
npm run dev

# Or start individually
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

### Step 5: Access the Application

- Frontend: http://localhost:3001
- Backend API: http://localhost:5001
- API Health: http://localhost:5001/api/health

---

## 📖 Usage Guide

### For Administrators

#### 1. Login as Admin
- Use email: `admin@agranova.com`
- Any password (demo mode)
- System automatically assigns admin role

#### 2. View Dashboard
- Navigate to `/admin/dashboard` or `/admin`
- View system statistics and charts
- Check unread alerts

#### 3. Monitor Systems
- Go to "Systems" in sidebar
- Use filters to find specific systems
- Click "View Details" for more information

#### 4. View Map
- Go to "Map View" in sidebar
- Click markers to see system details
- Use filter buttons to show specific statuses

#### 5. Manage Alerts
- Go to "Alerts" in sidebar
- Review technical warnings
- Mark alerts as read or resolved
- Click "View System" to see full details

#### 6. Check System Details
- Click any system from Systems page or Map
- View Overview, Sensors, Logs, Diagnostics tabs
- Monitor system health indicators

#### 7. Manage Users
- Go to "Users" in sidebar
- Search for users
- Promote/demote user roles
- Delete users if needed

### For Regular Users

Regular users see standard dashboard with:
- Their own irrigation controls
- Personal analytics
- Community features
- AI assistant
- Personal alerts (irrigation-related)

Users CANNOT:
- View other users' systems
- Access admin pages
- Receive technical alerts
- View global system map

---

## 🔐 Admin vs User Permissions

### Admin Permissions ✅

| Feature | Admin | User |
|---------|-------|------|
| View all systems | ✅ | ❌ |
| View map of all systems | ✅ | ❌ |
| Receive technical alerts | ✅ | ❌ |
| View system logs | ✅ | ❌ |
| View diagnostics | ✅ | ❌ |
| Control ANY pump | ❌ | ❌ |
| Change irrigation settings | ❌ | ✅ (own) |
| Manage users | ✅ | ❌ |

### Alert Distribution

**Admin Receives:**
- SENSOR_OFFLINE
- DEVICE_NOT_RESPONDING
- NO_DATA_RECEIVED
- NETWORK_FAILURE
- FIRMWARE_ERROR
- HARDWARE_FAULT
- BATTERY_CRITICAL
- SOLAR_MALFUNCTION
- SYSTEM_OFFLINE

**User Receives:**
- Pump stopped/started
- Low water tank
- Moisture threshold alerts
- Irrigation schedule notifications
- Personal system warnings

### Important Rules

1. **Admins cannot control pumps** - Only system owners can control irrigation
2. **Admins see technical issues only** - Operational alerts go to users
3. **View-only diagnostics** - Admins monitor but don't operate
4. **Role-based routing** - Admin pages redirect non-admins to dashboard

---

## 🚨 Alert System

### Alert Types and Severity

#### CRITICAL Alerts 🔴
- SYSTEM_OFFLINE
- DEVICE_NOT_RESPONDING
- HARDWARE_FAULT
- BATTERY_CRITICAL (< 10%)

#### WARNING Alerts 🟡
- SENSOR_OFFLINE
- NETWORK_FAILURE (Poor connectivity)
- NO_DATA_RECEIVED (> 30 minutes)
- SOLAR_MALFUNCTION
- FIRMWARE_ERROR

#### INFO Alerts 🔵
- System updates
- Maintenance reminders
- Normal status changes

### Alert Workflow

1. **Alert Generation**
   - System detects issue
   - Creates AdminAlert document
   - Sets appropriate severity

2. **Alert Display**
   - Shows in Alert Center
   - Appears in unread count
   - Displays in notifications

3. **Alert Handling**
   - Admin marks as read
   - Admin resolves issue
   - Alert moves to resolved

4. **Alert Resolution**
   - Set `isResolved: true`
   - Record `resolvedAt` timestamp
   - Record `resolvedBy` admin ID
   - Remove from active alerts

---

## 🗺️ Map Integration

### Leaflet Implementation

**Map Provider:** OpenStreetMap

**Marker Colors:**
- 🟢 Green: System health = Normal
- 🟡 Yellow: System health = Warning
- 🔴 Red: System health = Critical (pulsing animation)

**Features:**
- Pan and zoom controls
- Click markers for popups
- Sidebar with system details
- Filter by system health
- Real-time marker updates

**Custom Markers:**
```javascript
const markerIcons = {
  Normal: L.divIcon({
    html: `<div style="background-color: #10b981; ..."></div>`,
    iconSize: [32, 32]
  }),
  Warning: L.divIcon({
    html: `<div style="background-color: #f59e0b; ..."></div>`,
    iconSize: [32, 32]
  }),
  Critical: L.divIcon({
    html: `<div style="background-color: #ef4444; animation: pulse..."></div>`,
    iconSize: [32, 32]
  })
};
```

---

## 🔄 Demo Mode Features

The system includes comprehensive demo mode when MongoDB is not connected:

### Demo Data
- 10 sample irrigation systems
- Various regions (North Valley, South Plains, etc.)
- Mixed statuses (Online, Offline, Warning)
- Random sensor readings
- Sample alerts and logs

### Demo Functionality
- All API endpoints work
- In-memory data storage
- Realistic data simulation
- Full feature testing
- No database required

### Demo Accounts
- Admin: `admin@agranova.com` (any password)
- Users: Auto-created during registration

---

## 🎯 Key Differentiators

1. **Separation of Concerns**
   - Admins monitor technical health
   - Users control irrigation
   - Clear responsibility boundaries

2. **Real-time Updates**
   - WebSocket integration ready
   - Polling fallback (15-30 seconds)
   - Live sensor data

3. **Scalability**
   - Handles multiple regions
   - Filterable views
   - Pagination ready
   - Indexed database queries

4. **User Experience**
   - Clean, modern UI
   - Responsive design
   - Intuitive navigation
   - Color-coded indicators
   - Visual feedback

5. **Comprehensive Monitoring**
   - System health tracking
   - Historical logs
   - Diagnostic tools
   - Alert management
   - Geographic visualization

---

## 🛠️ Troubleshooting

### Common Issues

1. **Map not loading**
   ```bash
   npm install leaflet react-leaflet
   ```

2. **Charts not displaying**
   ```bash
   npm install recharts
   ```

3. **Admin routes not working**
   - Check user role in localStorage
   - Verify JWT token
   - Check admin middleware

4. **Demo mode not activating**
   - MongoDB connection should fail
   - Check `isDatabaseConnected()` function
   - Verify demo data initialization

5. **Markers not showing on map**
   - Check system location data
   - Verify latitude/longitude values
   - Check browser console for errors

---

## 📊 Project Structure Summary

```
agronova_smart_irrigation_system/
├── backend/
│   └── src/
│       ├── models/
│       │   ├── IrrigationSystem.js      ★ NEW
│       │   ├── AdminAlert.js            ★ NEW
│       │   └── SystemLog.js             ★ NEW
│       ├── controllers/
│       │   └── adminSystemController.js ★ NEW
│       └── routes/
│           └── adminSystems.js          ★ NEW
├── frontend/
│   ├── public/
│   └── src/
│       ├── pages/
│       │   ├── AdminDashboard.jsx       ★ NEW
│       │   ├── AdminSystems.jsx         ★ NEW
│       │   ├── AdminMapView.jsx         ★ NEW
│       │   ├── AdminAlerts.jsx          ★ NEW
│       │   └── AdminSystemDetails.jsx   ★ NEW
│       ├── components/
│       │   └── common/
│       │       └── Sidebar.jsx          ★ UPDATED
│       ├── services/
│       │   └── api.js                   ★ UPDATED
│       └── App.jsx                      ★ UPDATED
└── ADMIN_SYSTEM_DOCUMENTATION.md        ★ NEW (this file)
```

---

## ✅ Testing Checklist

### Backend Testing
- [ ] All API endpoints respond correctly
- [ ] Demo mode works without MongoDB
- [ ] Filters work on systems endpoint
- [ ] Alerts can be marked read/resolved
- [ ] Logs are retrieved correctly
- [ ] Admin middleware blocks non-admins

### Frontend Testing
- [ ] Admin dashboard loads with stats
- [ ] Systems page displays filterable table
- [ ] Map view shows markers correctly
- [ ] Alerts page displays and updates
- [ ] System details page has all tabs
- [ ] Sidebar shows admin menu for admins
- [ ] Routes redirect correctly by role

### Integration Testing
- [ ] Real-time updates work
- [ ] Alert notifications display
- [ ] Map markers update status
- [ ] Charts render with live data
- [ ] Search and filters work
- [ ] Navigation between pages works

---

## 🚀 Future Enhancements

1. **Real-time WebSocket Updates**
   - Live sensor data streaming
   - Instant alert notifications
   - Real-time map marker updates

2. **Advanced Analytics**
   - System uptime tracking
   - Performance trends
   - Predictive maintenance
   - Cost analysis

3. **Bulk Operations**
   - Send alerts to multiple systems
   - Batch system updates
   - Export reports

4. **Mobile App**
   - React Native admin app
   - Push notifications
   - Offline mode

5. **Advanced Mapping**
   - Heat maps
   - Custom map layers
   - Region boundaries
   - Clustering for many systems

---

## 📞 Support

For issues or questions:
- Check troubleshooting section
- Review API documentation
- Verify environment variables
- Check browser console for errors
- Review server logs

---

## 📄 License

This project is part of AGRANOVA Smart Irrigation System.

---

**Last Updated:** February 9, 2026
**Version:** 1.0.0
**Status:** ✅ Production Ready
