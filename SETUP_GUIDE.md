# 🚀 Backend Setup & Testing Guide

## Step 1: Setup MongoDB

### Option A: MongoDB Atlas (Cloud - Recommended)

**No installation needed!** Just create a free account:

1. **Visit** [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. **Sign up** for free account
3. **Create cluster** (M0 Free tier)
4. **Add database user** with username/password
5. **Whitelist IP** (0.0.0.0/0 for development)
6. **Get connection string** from "Connect" button
7. **Update** `backend/.env` with your Atlas URI

Example Atlas URI:
```env
MONGODB_URI=mongodb+srv://campuscycle:yourpassword@cluster0.xxxxx.mongodb.net/campuscycle?retryWrites=true&w=majority
```

### Option B: Local MongoDB Installation

#### Windows
1. Download MongoDB from https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB will run as a Windows service automatically

### Verify MongoDB is Running

**For Atlas:** Check cluster status in Atlas dashboard (should show "Active")

**For Local:**
```powershell
# Check if MongoDB service is running
Get-Service -Name MongoDB

# Or start it manually if needed
net start MongoDB
```

---

## Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

This will install:
- express
- mongoose
- socket.io
- cors
- dotenv
- nodemon (dev dependency)

---

## Step 3: Seed the Database

```bash
npm run seed
```

Expected output:
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

📊 Summary:
   Booths: 3
   Units: 15
   Cycles: 10
   Occupied Units: 3
   Free Units: 12
```

---

## Step 4: Start the Server

```bash
npm start
```

Expected output:
```
╔════════════════════════════════════════════════════╗
║   🚴 Campus Cycle Management System - Backend    ║
╚════════════════════════════════════════════════════╝

🚀 Server running on port 5000
📡 Socket.IO enabled
🌍 Environment: development

📍 API Endpoints:
   - http://localhost:5000/
   - http://localhost:5000/api/booths
   - http://localhost:5000/api/units
   - http://localhost:5000/api/cycles
   - http://localhost:5000/health

✅ MongoDB Connected: cluster0.xxxxx.mongodb.net (or localhost)
✅ Socket.IO initialized
```

---

## Step 5: Test the API

### Test 1: Health Check
```powershell
curl http://localhost:5000/health
```

Expected:
```json
{
  "success": true,
  "message": "Campus Cycle server is running",
  "timestamp": "2026-01-01T..."
}
```

### Test 2: Get All Booths
```powershell
curl http://localhost:5000/api/booths
```

Expected: List of 3 booths with names and locations

### Test 3: Get All Units
```powershell
curl http://localhost:5000/api/units
```

Expected: List of 15 units (3 occupied, 12 free)

### Test 4: Check Geofence (Main Gate location)
```powershell
curl -X POST http://localhost:5000/api/booths/check-geofence `
  -H "Content-Type: application/json" `
  -d '{\"latitude\": 28.6139, \"longitude\": 77.2090}'
```

Expected:
```json
{
  "success": true,
  "activeBoothId": "BOOTH_ID",
  "boothName": "Main Gate Booth"
}
```

### Test 5: Park a Cycle
```powershell
curl -X POST http://localhost:5000/api/units/park `
  -H "Content-Type: application/json" `
  -d '{\"unitId\": \"Main-U4\", \"rfid\": \"RFID00004\", \"userLat\": 28.6139, \"userLon\": 77.2090}'
```

Expected:
```json
{
  "success": true,
  "message": "Cycle parked successfully",
  "data": {
    "unit": { "status": "OCCUPIED", "cycleRfid": "RFID00004" },
    "cycle": { "status": "PARKED" }
  }
}
```

### Test 6: Take a Cycle
```powershell
curl -X POST http://localhost:5000/api/units/take `
  -H "Content-Type: application/json" `
  -d '{\"unitId\": \"Main-U4\", \"rfid\": \"RFID00004\", \"userLat\": 28.6139, \"userLon\": 77.2090}'
```

Expected:
```json
{
  "success": true,
  "message": "Cycle taken successfully",
  "data": {
    "unit": { "status": "FREE", "cycleRfid": null },
    "cycle": { "status": "IN_USE" }
  }
}
```

---

## Step 6: Test Socket.IO

You can use a Socket.IO client or browser console:

```javascript
// In browser console (after loading socket.io-client)
const socket = io('http://localhost:5000');

socket.on('connected', (data) => {
  console.log('Connected:', data);
});

socket.on('unitUpdated', (data) => {
  console.log('Unit updated:', data);
});

// Send location update
socket.emit('updateLocation', { 
  latitude: 28.6139, 
  longitude: 77.2090 
});
```

---

## Common Issues & Solutions

### Issue: MongoDB not running
**Solution:**

**For MongoDB Atlas:**
- Check cluster status in Atlas dashboard
- Verify connection string in `.env` is correct
- Ensure network access is configured (0.0.0.0/0)
- Check database user credentials

**For Local MongoDB:**
```powershell
net start MongoDB
```


**For MongoDB Atlas:**
1. Verify your connection string format:
   ```
   mongodb+srv://username:password@cluster.xxxxx.mongodb.net/campuscycle?retryWrites=true&w=majority
   ```
2. Check password has no special characters (or URL encode them)
3. Whitelist your IP in Atlas Network Access
4. Ensure database user exists in Database Access

**For Local:**

### Issue: Port 5000 already in use
**Solution:** Change PORT in `.env` file:
```env
PORT=5001
```

### Issue: Cannot connect to MongoDB
**Solution:** Check MONGODB_URI in `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/campuscycle
```

### Issue: Missing dependencies
**Solution:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

---

## Development Mode

For auto-reload on code changes:
```bash
npm run dev
```

This uses nodemon to watch for file changes.

---

## Next Steps

✅ Backend is running and tested!

Now you can:
1. Build the frontend React application
2. Integrate Socket.IO client
3. Add geolocation tracking
4. Create interactive UI components

**The backend is ready to support the frontend development!**
