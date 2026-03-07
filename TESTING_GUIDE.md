# Quick Start Guide - Admin Panel Testing

## How to Test the New Admin Navigation

### 1. Start the Application

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

The application will open at `http://localhost:3000`

---

### 2. Login as Admin

1. Go to `http://localhost:3000` (should redirect to `/login`)
2. Enter admin credentials
3. You will land directly on `/admin/dashboard` (no opening page!)

---

### 3. Test New Navigation

The sidebar should show these 6 items:

1. **🏠 Dashboard** → `/admin/dashboard`
2. **👥 Users** → `/admin/users`
3. **🛒 Orders** → `/admin/orders` (NEW)
4. **💳 Payments** → `/admin/payments` (NEW)
5. **📱 Devices** → `/admin/devices` (NEW)
6. **📊 System Monitor** → `/admin/monitor` (NEW)

Click each one to verify it loads properly!

---

### 4. Test Orders Page

**What to check:**
- ✅ See table with orders
- ✅ Stats cards at top (Total, Pending, Processing, Delivered, Cancelled)
- ✅ Search box works (type customer name or order ID)
- ✅ Status filter dropdown works
- ✅ Click "View" button opens modal with order details
- ✅ Modal shows customer info, order details, shipping
- ✅ Click "Close" or X dismisses modal

---

### 5. Test Payments Page

**What to check:**
- ✅ See table with payments
- ✅ Stats cards show Total Revenue, Completed, Pending, Failed
- ✅ Search box works (type payment ID or customer)
- ✅ Status filter works (All, Completed, Pending, Failed)
- ✅ Date filter works (All Time, Today, Last 7 Days, Last 30 Days)
- ✅ Click "View" opens payment details modal
- ✅ Modal shows transaction ID, payment method, amount
- ✅ "Export Receipt" button is visible (UI only for now)

---

### 6. Test Devices Page

**What to check:**
- ✅ See two toggle buttons: "List View" and "Map View"
- ✅ Default is "List View" with devices table
- ✅ Stats cards show Total, Active, Offline, Maintenance
- ✅ Search box works (type device name or owner)
- ✅ Status filter works (All, Active, Offline, Maintenance)
- ✅ Region filter shows 11 Azerbaijan regions
- ✅ Signal strength shows progress bar
- ✅ Click "View" opens device details modal
- ✅ Click "Map" button switches to map view

**Map View:**
- ✅ Click "Map View" toggle button
- ✅ See Azerbaijan map outline
- ✅ See colored dots (markers) for devices
  - Green = Active
  - Red = Offline
  - Yellow = Maintenance
- ✅ Click on any marker to see device info popup
- ✅ Info box shows on bottom-right with device details
- ✅ "View Full Details" button in info box opens modal
- ✅ Switch back to "List View" toggle

---

### 7. Test System Monitor Page

**What to check:**
- ✅ See 4 status cards at top:
  - System Status (Operational)
  - Total Devices (with active count)
  - Total Users (with active count)
  - API Response Time
- ✅ See 3 server performance cards:
  - Server Load (with progress bar)
  - Memory Usage (with progress bar)
  - Disk Usage (with progress bar)
  - Bars should be color-coded (green/yellow/red)
- ✅ See "Service Status" section with 3 services:
  - Network (Healthy)
  - Database (Connected)
  - API Server (Running)
- ✅ See "Recent Alerts" section with colored alert cards
- ✅ See "Recent Activity" section with activity log
- ✅ "Auto-refresh (30s)" checkbox is checked
- ✅ Click "Refresh Now" button manually refreshes
- ✅ Last updated timestamp shows at bottom

---

### 8. Test Search & Filter

On each page with search:
1. Type something in search box
2. Table should filter instantly (no need to press Enter)
3. Clear search box
4. Table should show all items again

On each page with filters:
1. Select a filter option from dropdown
2. Table should update immediately
3. Select "All" to reset filter

---

### 9. Test Modals

On Orders, Payments, or Devices page:
1. Click "View" button on any row
2. Modal should appear with overlay (background darkens)
3. Modal should scroll if content is long
4. Click X button in top-right → Modal closes
5. Click "Close" button → Modal closes
6. Modal should be centered and responsive

---

### 10. Test Routing & Navigation

**URL routing:**
- Go to `http://localhost:3000/` → Should redirect to `/login`
- After login → Should go to `/admin/dashboard` (no opening page!)
- Type `/admin/orders` in URL bar → Should load Orders page
- Type `/admin/payments` in URL bar → Should load Payments page
- Type `/admin/devices` in URL bar → Should load Devices page
- Type `/admin/monitor` in URL bar → Should load System Monitor page

**Sidebar navigation:**
- Click each menu item in sidebar
- URL should change in browser
- Page content should update
- Active menu item should be highlighted
- No page refresh (React Router)

---

### 11. Test Responsiveness

**Desktop (default):**
- All tables should fit width
- Stats cards in 4-column grid
- Filters in 3-column grid

**Tablet (resize browser to ~768px):**
- Stats cards may stack to 2-column
- Table should scroll horizontally if needed
- Sidebar should remain visible

**Mobile (resize browser to ~375px):**
- Stats cards stack to 1-column
- Filters stack to 1-column
- Sidebar may collapse (depends on Layout component)
- Modals should be full-width

---

### 12. Check for Errors

**Browser Console:**
1. Open DevTools (F12)
2. Go to Console tab
3. Navigate through all pages
4. Should see NO red errors
5. Warnings are okay (React DevTools warnings)

**Network Tab:**
1. Open DevTools → Network tab
2. Navigate to any page
3. Should see API calls to `/api/admin/users`
4. Status should be 200 OK
5. Response should have data

---

## ✅ Expected Results

If everything works correctly, you should see:

1. ✅ No opening/landing page before dashboard
2. ✅ Login → Direct to admin dashboard
3. ✅ Sidebar shows 6 new menu items
4. ✅ Orders page displays with table, search, filters
5. ✅ Payments page displays with revenue stats
6. ✅ Devices page has List and Map views working
7. ✅ System Monitor shows real-time stats
8. ✅ All search and filter features work
9. ✅ All modals open and close properly
10. ✅ No console errors
11. ✅ Smooth navigation between pages
12. ✅ URLs update correctly

---

## 🐛 Troubleshooting

### Issue: Pages show loading spinner forever
**Solution**: Check if backend is running on `http://localhost:5000` and `/api/admin/users` endpoint is working.

### Issue: "404 Not Found" in console
**Solution**: Backend API endpoints may not exist yet. Pages use simulated data from users endpoint.

### Issue: Sidebar doesn't show new items
**Solution**: Clear browser cache and refresh. Make sure you're logged in as admin user.

### Issue: Map doesn't show devices
**Solution**: Check if devices have valid region coordinates. Verify Azerbaijan regions in constants.js.

### Issue: Can't click sidebar items
**Solution**: Verify Layout component wraps all pages. Check React Router is working.

### Issue: Modal doesn't open
**Solution**: Check browser console for errors. Verify modal state (showModal) is updating.

---

## 📸 Visual Checklist

### Orders Page Should Look Like:
```
┌─────────────────────────────────────────────┐
│  🛒 Orders Management                       │
│  Manage and track all customer orders      │
├─────────────────────────────────────────────┤
│ [Total] [Pending] [Processing] [Delivered] │  ← Stats cards
├─────────────────────────────────────────────┤
│ [Search...] [Status Filter ▼]              │  ← Filters
├─────────────────────────────────────────────┤
│ Order ID | Customer | Device | Status | ✓  │  ← Table
│ ORD-2000 | John Doe | Dev-1  | Pending|View│
│ ORD-2001 | Jane     | Dev-2  | Shipped|View│
└─────────────────────────────────────────────┘
```

### Devices Map View Should Look Like:
```
┌─────────────────────────────────────────────┐
│  📱 Device Management                       │
├─────────────────────────────────────────────┤
│ [List View] [Map View] ← Toggle buttons    │
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐   │
│  │  Azerbaijan Map                     │   │
│  │     ● ● ●  ← Device markers        │   │
│  │   ●     ●                           │   │
│  │  ●   ●                              │   │
│  └─────────────────────────────────────┘   │
│                 ┌──────────────────┐        │
│                 │ Selected Device  │        │
│                 │ DEV-1001         │        │
│                 │ [View Details]   │        │
│                 └──────────────────┘        │
└─────────────────────────────────────────────┘
```

### System Monitor Should Look Like:
```
┌─────────────────────────────────────────────┐
│  📊 System Monitor             [Refresh]   │
├─────────────────────────────────────────────┤
│ [Status] [Devices] [Users] [API Time]      │  ← Status cards
├─────────────────────────────────────────────┤
│ Server Load:   [████████░] 45%             │  ← Performance
│ Memory Usage:  [██████████] 62%            │
│ Disk Usage:    [████░░░░░] 38%             │
├─────────────────────────────────────────────┤
│ Recent Alerts:           Recent Activity:   │
│ ⚠️ High memory          📝 User Reg (12x)  │
│ ✅ Backup done          🔌 Device Con (45x)│
└─────────────────────────────────────────────┘
```

---

## 🎯 Testing Complete Checklist

Print this and check off as you test:

- [ ] Application starts without errors
- [ ] Login redirects to admin dashboard
- [ ] No opening page appears
- [ ] Sidebar shows 6 menu items
- [ ] Dashboard loads (already existed)
- [ ] Users page loads (already existed)
- [ ] Orders page loads (NEW)
- [ ] Payments page loads (NEW)
- [ ] Devices page loads (NEW)
- [ ] System Monitor page loads (NEW)
- [ ] Search works on Orders
- [ ] Search works on Payments
- [ ] Search works on Devices
- [ ] Filters work on all pages
- [ ] Stats cards display correctly
- [ ] Tables display all columns
- [ ] Modals open when clicking "View"
- [ ] Modals close properly
- [ ] Map view toggles on Devices page
- [ ] Map markers are clickable
- [ ] Auto-refresh works on Monitor page
- [ ] No console errors
- [ ] URLs update correctly
- [ ] Page doesn't refresh when navigating
- [ ] Responsive on different screen sizes

**If all checked ✅ → Implementation is working perfectly!**

---

## 🚀 Next: Backend API Integration

Once frontend testing is complete, backend team should:

1. Create `GET /api/admin/orders` endpoint
2. Create `GET /api/admin/payments` endpoint
3. Create `GET /api/admin/devices` endpoint
4. Create `GET /api/admin/system/stats` endpoint

Then update the frontend pages to use real API calls instead of simulated data.

See `ADMIN_RESTRUCTURE_COMPLETE.md` for API specifications.
