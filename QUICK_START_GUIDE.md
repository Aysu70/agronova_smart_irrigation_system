# 🚀 QUICK START GUIDE - AGRANOVA PLATFORM

## Getting Started with the Updated System

### Prerequisites
- Node.js installed
- MongoDB installed and running
- Git (optional)

---

## 🔧 Setup Instructions

### 1. Start MongoDB
```powershell
# Make sure MongoDB is running
# Windows: Start MongoDB service or run:
mongod
```

### 2. Install Dependencies

#### Backend:
```powershell
cd backend
npm install
```

#### Frontend:
```powershell
cd frontend
npm install
```

### 3. Configure Environment Variables

Create `.env` file in `backend/` directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/agranova
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

### 4. Start the Application

#### Start Backend (Terminal 1):
```powershell
cd backend
npm run dev
```

The backend will run on: `http://localhost:5000`

#### Start Frontend (Terminal 2):
```powershell
cd frontend
npm start
```

The frontend will run on: `http://localhost:3000`

---

## 👥 Default Accounts

### Admin Account
- **Email:** `admin@agranova.com`
- **Password:** Create during registration (automatic admin role)

### Test User Account
- Register any email and password
- Will be assigned "user" role automatically

---

## 🎯 Key Features to Test

### 1. **Authentication System**
- ✅ Register a new account → Should redirect to dashboard immediately
- ✅ Login as regular user → Goes to `/dashboard`
- ✅ Login as admin → Goes to `/admin/dashboard`
- ✅ No redirect loops

### 2. **Sidebar Navigation**
- ✅ Visit `/irrigation` → Sidebar visible
- ✅ Visit `/admin/alerts` → Sidebar visible
- ✅ All pages have working sidebar
- ✅ Responsive on mobile

### 3. **Admin Dashboard**
- ✅ View total users count (real data from database)
- ✅ View active devices statistics
- ✅ Quick access panel works
- ✅ Recent users table shows real registrations

### 4. **User Management** (`/admin/users`)
- ✅ See all registered users
- ✅ Search users by name or email
- ✅ Filter by role (admin/user)
- ✅ Filter by region
- ✅ View user details
- ✅ Promote user to admin
- ✅ Demote admin to user
- ✅ Delete user

### 5. **Irrigation Systems** (`/admin/systems`)
- ✅ Health filter removed
- ✅ Azerbaijan regions in dropdown
- ✅ Filter by region and status
- ✅ Search functionality works

### 6. **Registration Form**
- ✅ Region dropdown with Azerbaijan regions
- ✅ English region names
- ✅ Optional region field

---

## 📍 Routes Map

### Public Routes:
- `/login` - Login page
- `/register` - Registration page

### User Routes (Protected):
- `/dashboard` - User main dashboard
- `/irrigation` - Irrigation control
- `/analytics` - Analytics & charts
- `/community` - Community features
- `/ai-assistant` - AI chatbot

### Admin Routes (Admin Only):
- `/admin` or `/admin/dashboard` - Admin main dashboard ⭐ NEW
- `/admin/users` - User management ⭐ NEW
- `/admin/systems` - Irrigation systems monitor
- `/admin/map` - Map view
- `/admin/alerts` - Alert center
- `/admin/system/:id` - System details

---

## 🎨 UI/UX Highlights

### Colors:
- **Primary Green:** System branding
- **Blue Accents:** Admin features
- **Orange:** Warnings and orders
- **Purple:** Payments and admin role
- **Red:** Critical alerts and errors

### Responsive Design:
- Mobile: Hamburger menu, collapsible sidebar
- Tablet: Adapted grid layouts
- Desktop: Full sidebar visible

---

## 🔑 Testing Scenarios

### Scenario 1: New User Registration
1. Go to `/register`
2. Fill in: Name, Email, Region (optional), Password
3. Click "Create Account"
4. **Expected:** Redirected to `/dashboard` immediately
5. Sidebar visible and working

### Scenario 2: Admin Login
1. Go to `/register` and create account with email: `admin@agranova.com`
2. **Expected:** Automatically gets admin role
3. Redirected to `/admin/dashboard`
4. See admin dashboard with user statistics

### Scenario 3: User Management
1. Login as admin
2. Navigate to `/admin/users`
3. See all registered users
4. Search for a user
5. Click "View" to see details
6. Try "Promote" on a regular user
7. **Expected:** User becomes admin

### Scenario 4: Sidebar Test
1. Login as any user
2. Navigate to `/irrigation`
3. **Expected:** Sidebar visible and working
4. Navigate to `/analytics`
5. **Expected:** Sidebar still visible
6. Click hamburger on mobile
7. **Expected:** Sidebar opens/closes smoothly

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to database"
**Solution:** Make sure MongoDB is running
```powershell
mongod
```

### Issue: "Port already in use"
**Solution:** Kill the process or change port in `.env`
```powershell
# Find process using port 5000
netstat -ano | findstr :5000
# Kill process
taskkill /PID <process_id> /F
```

### Issue: "Module not found"
**Solution:** Reinstall dependencies
```powershell
cd backend
Remove-Item node_modules -Recurse -Force
npm install

cd ../frontend
Remove-Item node_modules -Recurse -Force
npm install
```

### Issue: "Redirect loop after registration"
**Solution:** Clear browser cache and localStorage
```javascript
// In browser console:
localStorage.clear();
```

### Issue: "Sidebar not showing"
**Solution:** Check that page uses Layout component
```jsx
import Layout from '../components/common/Layout';
// Wrap page content in:
<Layout title="Page Title">
  {/* content */}
</Layout>
```

---

## 📚 File Structure Reference

```
frontend/src/
├── components/
│   ├── common/
│   │   ├── Layout.jsx         ← Main layout wrapper
│   │   ├── Sidebar.jsx        ← Navigation sidebar
│   │   └── Navbar.jsx         ← Top navigation
│   └── ...
├── pages/
│   ├── Dashboard.jsx          ← User dashboard
│   ├── Login.jsx              ← Login page
│   ├── Register.jsx           ← Registration (with regions)
│   ├── AdminDashboard.jsx     ← Admin overview ⭐ NEW
│   ├── AdminUsers.jsx         ← User management ⭐ NEW
│   ├── AdminSystems.jsx       ← Systems monitor (updated)
│   └── ...
├── context/
│   └── AuthContext.jsx        ← Authentication (fixed)
├── utils/
│   └── constants.js           ← Azerbaijan regions ⭐ NEW
└── App.jsx                    ← Main routing (updated)
```

---

## ✅ Verification Checklist

Before considering the system ready, verify:

- [ ] MongoDB is running
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can register new user
- [ ] Registration redirects to dashboard (no loop)
- [ ] Can login as user
- [ ] Can login as admin (using admin@agranova.com)
- [ ] Sidebar visible on `/irrigation`
- [ ] Sidebar visible on `/admin/alerts`
- [ ] Admin dashboard shows real user count
- [ ] Can view all users in `/admin/users`
- [ ] Can search users
- [ ] Can filter by region (shows English names)
- [ ] Irrigation systems page has no Health filter
- [ ] Region dropdown in registration works
- [ ] Mobile responsive
- [ ] No console errors

---

## 📞 Support

If you encounter any issues:

1. Check `IMPLEMENTATION_COMPLETE.md` for detailed changes
2. Verify MongoDB connection
3. Clear browser cache/localStorage
4. Check console for errors (F12)
5. Restart both backend and frontend

---

## 🎉 Success!

You should now have a fully functional AgroNova Smart Irrigation Platform with:
- ✅ Working sidebar navigation
- ✅ Fixed authentication flow
- ✅ Professional admin dashboard
- ✅ Real user management
- ✅ Azerbaijan regions support
- ✅ Responsive design
- ✅ Production-ready codebase

**Enjoy your smart agriculture platform!** 🌱
