# 🚀 Complete System Quick Start Guide

## Step-by-Step Instructions to Run the Full Campus Cycle System

---

## ✅ Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Node.js v16+** installed (`node --version`)
- [ ] **MongoDB Atlas account** (free tier) OR **Local MongoDB** installed
- [ ] **Git** (optional, for version control)
- [ ] **Modern browser** (Chrome, Firefox, Edge, Safari)
- [ ] **2 terminal windows** (one for backend, one for frontend)

---

## 📥 Step 1: Setup MongoDB

### Option A: MongoDB Atlas (Cloud - Recommended) ☁️

1. **Go to MongoDB Atlas**
   - Visit [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Click "Try Free"

2. **Create Account**
   - Sign up with email or Google
   - Verify your email

3. **Create a Cluster**
   - Select FREE tier (M0 Sandbox)
   - Choose a cloud provider (AWS recommended)
   - Select a region closest to you
   - Click "Create Cluster" (takes 3-5 minutes)

4. **Configure Database Access**
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Username: `campuscycle`
   - Password: Generate or create your own (save this!)
   - User Privileges: "Read and write to any database"
   - Click "Add User"

5. **Configure Network Access**
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (`0.0.0.0/0`)
   - Confirm

6. **Get Connection String**
   - Go to "Database" in left sidebar
   - Click "Connect" on your cluster
   - Select "Connect your application"
   - Copy the connection string (looks like):
   ```
   mongodb+srv://campuscycle:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   - Replace `<password>` with your actual password
   - Add database name before the `?`:
   ```
   mongodb+srv://campuscycle:yourpassword@cluster0.xxxxx.mongodb.net/campuscycle?retryWrites=true&w=majority
   ```

7. **Update Backend .env File**
   - Open `backend/.env`
   - Replace the `MONGODB_URI` with your Atlas connection string:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://campuscycle:yourpassword@cluster0.xxxxx.mongodb.net/campuscycle?retryWrites=true&w=majority
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

✅ **MongoDB Atlas is now ready!** No need to install MongoDB locally.

---

### Option B: Local MongoDB

If you prefer to use local MongoDB:

**Note:** If using MongoDB Atlas, the connection message will show your Atlas cluster URL instead of localhost.

#### Windows
```powershell
# Check if MongoDB service is running
Get-Service -Name MongoDB

# If not running, start it
net start MongoDB
```

#### Mac/Linux
```bash
# Start MongoDB
sudo systemctl start mongod

# Verify it's running
sudo systemctl status mongod
```

**Then use this in backend/.env:**
```env
MONGODB_URI=mongodb://localhost:27017/campuscycle
```

**Expected:** MongoDB should be running on `mongodb://localhost:27017`

---

## 🔧 Step 2: Setup Backend

Open **Terminal 1** and run:

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install
```

**Wait for installation to complete** (this may take 1-2 minutes)

---

## 🌱 Step 3: Seed the Database

Still in **Terminal 1** (backend):

```bash
npm run seed
```

**Expected Output:**
```
✅ Connected to MongoDB
🗑️  Clearing existing data...
📍 Creating booths...
✅ Created 3 booths
🔢 Creating units...
✅ Created 15 units
🚴 Creating cycles...
✅ Created 10 cycles
🅿️  Parking some cycles...
✅ Parked 3 cycles in Main Gate Booth

🎉 Database seeded successfully!
```

This creates:
- 3 Booths (Main Gate, Library, Cafeteria)
- 15 Units (5 per booth)
- 10 Cycles (with RFIDs)

---

## 🚀 Step 4: Start Backend Server

Still in **Terminal 1** (backend):

```bash
npm start
```

**Expected Output:**
```
╔════════════════════════════════════════════════════╗
║   🚴 Campus Cycle Management System - Backend    ║
╚════════════════════════════════════════════════════╝

🚀 Server running on port 5000
📡 Socket.IO enabled
🌍 Environment: development

✅ MongoDB Connected: localhost
✅ Socket.IO initialized
```

**✅ Backend is now running!** Leave this terminal open.

---

## 🎨 Step 5: Setup Frontend

Open **Terminal 2** (new terminal window) and run:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install
```

**Wait for installation to complete** (this may take 2-3 minutes)

---

## 🌐 Step 6: Start Frontend Server

Still in **Terminal 2** (frontend):

```bash
npm run dev
```

**Expected Output:**
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

**✅ Frontend is now running!**

Your browser should automatically open to `http://localhost:5173`

---

## 🌍 Step 7: Allow Location Access

When the page loads, your browser will ask:

**"Allow this site to access your location?"**

👉 **Click "Allow"** or **"Yes"**

This is required for geofencing to work!

---

## 🎉 Step 8: You're Ready!

You should now see:

### On the Screen:
- ✅ **Location Status** card showing your coordinates
- ✅ **Geofence Status** (in/out of range)
- ✅ **3 Booth Cards** (Main Gate, Library, Cafeteria)
- ✅ **Live indicator** (green pulsing dot)

---

## 🧪 Step 9: Test the System

### Test 1: View Units
1. Click on **any booth card** to expand it
2. You should see **5 units** for each booth
3. Some units are **FREE**, some are **OCCUPIED**

### Test 2: Real-Time Updates (Open 2 Windows)

**Window 1:**
1. Open `http://localhost:5173`
2. Expand a booth

**Window 2:**
1. Open `http://localhost:5173` in a **new browser window**
2. Expand the same booth

**Now park a cycle in Window 1:**
1. Click "Park Cycle" on a FREE unit
2. Enter RFID: `RFID00005`
3. Click confirm

**Watch Window 2:**
- The unit should **instantly update** to OCCUPIED! 🎉

This proves real-time Socket.IO is working!

### Test 3: Geofencing

Since you're testing locally, your actual location won't match the sample booth coordinates.

To test geofencing properly, you can:

**Option A: Modify your location (Chrome DevTools)**
1. Press `F12` to open DevTools
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type "sensors" and select "Show Sensors"
4. Under "Location", select "Other"
5. Enter these coordinates:
   - **Latitude:** `28.6139`
   - **Longitude:** `77.2090`
6. Click "Manage" locations to save it

Now you should be **inside the Main Gate Booth geofence**!

**Option B: Create a booth at your location**

Use the backend API to create a booth at your current coordinates:

```bash
curl -X POST http://localhost:5000/api/booths \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Location Booth",
    "location": {
      "lat": YOUR_LATITUDE,
      "lon": YOUR_LONGITUDE,
      "radius": 100
    }
  }'
```

Replace `YOUR_LATITUDE` and `YOUR_LONGITUDE` with the coordinates shown in your Location Status card.

Then create some units for this booth (repeat 5 times with different unitIds):

```bash
curl -X POST http://localhost:5000/api/units \
  -H "Content-Type: application/json" \
  -d '{
    "unitId": "MyBooth-U1",
    "boothId": "PASTE_BOOTH_ID_FROM_PREVIOUS_RESPONSE"
  }'
```

---

## 🎮 Step 10: Full Workflow Test

### Park a Cycle
1. Ensure you're **in geofence** (booth shows "IN RANGE")
2. Expand the active booth
3. Find a **FREE** unit
4. Click **"Park Cycle"**
5. Enter RFID: `RFID00006`
6. Click **confirm**
7. ✅ Unit becomes **OCCUPIED** instantly!

### Take a Cycle
1. Select an **OCCUPIED** unit
2. Click **"Take Cycle"**
3. Enter the **matching RFID** (shown on the unit card)
4. Click **confirm**
5. ✅ Unit becomes **FREE** instantly!

---

## 🐛 Troubleshooting

### Backend won't start
**Problem:** Port 5000 already in use
**Solution:** Change port in `backend/.env`:
```env
PORT=5001
```
Then update `frontend/.env`:
```env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
```

### Frontend won't connect to backend
**Problem:** CORS or connection errors
**Solution:** 
1. Check backend is running
2. Verify URLs in `frontend/.env`
3. Clear browser cache and reload

### Location not detected
**Problem:** Browser location permission denied
**Solution:**
1. Click the lock icon in address bar
2. Change location to "Allow"
3. Reload the page

### Real-time updates not working
**Problem:** Socket.IO not connecting
**Solution:**
1. Check browser console for connection errors
2. Verify backend shows "Client connected"
3. Try refreshing both windows

### MongoDB connection error

**For MongoDB Atlas:**
1. Check your connection string format in `.env`
2. Verify username and password are correct
3. Ensure IP address is whitelisted (Network Access in Atlas)
4. Check if cluster is active in Atlas dashboard

**For Local MongoDB:**
**Problem:** Can't connect to database
**Solution:**
```bash
# Restart MongoDB
net start MongoDB

# Or check if it's running
Get-Service -Name MongoDB
```

---

## 📊 System Status Check

### Backend Health Check
```bash
curl http://localhost:5000/health
```

**Expected:** `{"success": true, "message": "Campus Cycle server is running"}`

**For MongoDB Atlas:**
1. Go to Atlas dashboard
2. Click "Browse Collections"
3. You should see `campuscycle` database with 3 collections

**For Local MongoDB:**
### Check Socket.IO Connection
Open browser console on frontend page:

**Expected logs:**
```
✅ Connected to server with socket ID: abc123
📡 Server confirmation: {message: "Connected to Campus Cycle server"}
```

### Check Database
```bash
# Connect to MongoDB
mongosh

# Use database
use campuscycle

# Check collections
show collections

# Count documents
db.booths.countDocuments()   // Should be 3
db.units.countDocuments()    // Should be 15
db.cycles.countDocuments()   // Should be 10
```

---

## 🎓 What You've Built

✅ **Full MERN Stack Application**
- MongoDB database with 3 collections
- Express REST API with 15+ endpoints
- React frontend with real-time UI
- Node.js backend with Socket.IO

✅ **Real-Time Features**
- Live updates across all clients
- No page refresh needed
- Socket.IO bidirectional communication

✅ **Geofencing**
- Browser geolocation API
- Haversine distance calculation
- Location-based access control

✅ **Production-Ready Architecture**
- Separated backend/frontend
- Environment configuration
- Error handling
- Input validation

---

## 📚 Next Steps

1. **Experiment** with different locations
2. **Test** with multiple browser windows
3. **Create** your own booths and units via API
4. **Monitor** the console logs to see real-time events
5. **Learn** by reading the code comments

---

## 🎉 Congratulations!

You've successfully set up and run a complete real-time campus cycle management system!

**Enjoy exploring the application!** 🚴‍♂️
