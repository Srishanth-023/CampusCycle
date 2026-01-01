# Campus Cycle Management System - Backend

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campuscycle
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Setup MongoDB

**Option A: MongoDB Atlas (Cloud - Recommended)**
1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (free tier available)
4. Add your IP address to whitelist (or allow access from anywhere: `0.0.0.0/0`)
5. Create a database user with username and password
6. Get your connection string and update `.env` file

**Option B: Local MongoDB**
```bash
# On Windows (if MongoDB is installed as a service)
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
```

### 4. Run the Server
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

---

## 📡 API Endpoints

### Booths
- `GET /api/booths` - Get all booths
- `GET /api/booths/:id` - Get booth by ID
- `POST /api/booths` - Create new booth
- `PUT /api/booths/:id` - Update booth
- `DELETE /api/booths/:id` - Delete booth
- `POST /api/booths/check-geofence` - Check which booth user is in

### Units
- `GET /api/units` - Get all units (filter by `?boothId=xyz`)
- `GET /api/units/:id` - Get unit by ID
- `POST /api/units` - Create new unit
- `PUT /api/units/:id` - Update unit
- `DELETE /api/units/:id` - Delete unit
- `POST /api/units/park` - Park a cycle in a unit
- `POST /api/units/take` - Take a cycle from a unit

### Cycles
- `GET /api/cycles` - Get all cycles (filter by `?status=PARKED`)
- `GET /api/cycles/:rfid` - Get cycle by RFID
- `POST /api/cycles` - Create new cycle
- `PUT /api/cycles/:rfid` - Update cycle
- `DELETE /api/cycles/:rfid` - Delete cycle

---

## 🔌 Socket.IO Events

### Client → Server
- `updateLocation` - Send user's location for geofencing
- `requestUnitStatus` - Request current status of units

### Server → Client
- `connected` - Connection confirmation
- `unitUpdated` - Real-time unit status update
- `unitStatusUpdate` - Response to status request
- `error` - Error messages

---

## 📦 Sample API Requests

### Create a Booth
```bash
POST http://localhost:5000/api/booths
Content-Type: application/json

{
  "name": "Main Gate Booth",
  "location": {
    "lat": 28.6139,
    "lon": 77.2090,
    "radius": 100
  }
}
```

### Create a Unit
```bash
POST http://localhost:5000/api/units
Content-Type: application/json

{
  "unitId": "UNIT-A1",
  "boothId": "BOOTH_ID_HERE"
}
```

### Park a Cycle
```bash
POST http://localhost:5000/api/units/park
Content-Type: application/json

{
  "unitId": "UNIT-A1",
  "rfid": "RFID12345",
  "userLat": 28.6139,
  "userLon": 77.2090
}
```

### Take a Cycle
```bash
POST http://localhost:5000/api/units/take
Content-Type: application/json

{
  "unitId": "UNIT-A1",
  "rfid": "RFID12345",
  "userLat": 28.6139,
  "userLon": 77.2090
}
```

### Check Geofence
```bash
POST http://localhost:5000/api/booths/check-geofence
Content-Type: application/json

{
  "latitude": 28.6139,
  "longitude": 77.2090
}
```

---

## 🗂️ Project Structure

```
backend/
├── server.js              # Main entry point
├── socket.js              # Socket.IO configuration
├── config/
│   └── db.js             # MongoDB connection
├── models/
│   ├── Booth.js          # Booth schema
│   ├── Unit.js           # Unit schema
│   └── Cycle.js          # Cycle schema
├── routes/
│   ├── boothRoutes.js    # Booth routes
│   ├── unitRoutes.js     # Unit routes
│   └── cycleRoutes.js    # Cycle routes
├── controllers/
│   ├── boothController.js
│   ├── unitController.js
│   └── cycleController.js
└── utils/
    └── geofence.js       # Geofencing utilities
```

---

## ✅ System Requirements Implemented

- ✅ Cycles are global assets (no permanent booth-cycle mapping)
- ✅ Units determine availability (FREE or OCCUPIED)
- ✅ RFID confirms physical presence of a cycle in a unit
- ✅ Geofencing-based access control using Haversine formula
- ✅ Real-time updates via Socket.IO
- ✅ Validation: One RFID cannot exist in multiple units
- ✅ Validation: One unit cannot hold multiple RFIDs
- ✅ Backend is single source of truth

---

## 🛡️ Validation Rules

The system enforces:
1. Users must be within booth geofence to interact
2. Units can only be FREE or OCCUPIED
3. RFID uniqueness across all units
4. Status consistency between Units and Cycles
5. Real-time broadcasting of all state changes

---

## 🧪 Testing the Backend

1. Start the server: `npm start`
2. Test the health endpoint: `http://localhost:5000/health`
3. Use Postman or curl to test API endpoints
4. Monitor Socket.IO connections in console logs

---

## 📝 Notes

- MongoDB must be running before starting the server
- Socket.IO clients will auto-reconnect on connection loss
- All dates are stored as ISO strings
- Geofence radius is in meters
- Default geofence radius: 100 meters
