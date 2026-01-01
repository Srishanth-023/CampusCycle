# 🚴 Campus Cycle Management System

A real-time campus cycle management system built with the **MERN stack** (MongoDB, Express, React, Node.js). The system features geofencing-based access control and real-time updates without page refresh.

---

## 🎯 Features

- ✅ **Global Cycle Management** - Cycles are shared assets, not tied to specific booths
- ✅ **Real-Time Updates** - Live status updates using Socket.IO (no page refresh)
- ✅ **Geofencing** - Location-based access control using Haversine formula
- ✅ **RFID Validation** - Physical cycle presence confirmation
- ✅ **Unit Management** - FREE/OCCUPIED status tracking
- ✅ **Smart Validation** - Prevents duplicate RFID assignments

---

## 🏗️ System Architecture

### Core Components
1. **Booths** - Physical locations with geofencing
2. **Units** - Parking slots within booths (FREE/OCCUPIED)
3. **Cycles** - Global assets (IN_USE/PARKED)

### Key Rules
- Users can only interact with booths inside their geofence
- One RFID cannot exist in multiple units
- One unit cannot hold multiple RFIDs
- All updates are broadcast in real-time

---

## 📦 Tech Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- Socket.IO (real-time)
- REST API

### Frontend
- React.js (Vite)
- Socket.IO Client
- Tailwind CSS
- Browser Geolocation API
- Context API (State Management)

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (running locally or via Atlas)
- npm or yarn

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment (.env file already created)
# Edit if needed: PORT, MONGODB_URI, etc.

# Seed the database with sample data
npm run seed

# Start the server
npm start

# Or for development with auto-reload
npm run dev
```

The backend server will start on `http://localhost:5000`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will open at `http://localhost:5173`

---

## 📡 API Endpoints

### Booths
- `GET /api/booths` - Get all booths
- `POST /api/booths/check-geofence` - Check user's current booth
- `POST /api/booths` - Create booth

### Units
- `GET /api/units?boothId=xyz` - Get units by booth
- `POST /api/units/park` - Park a cycle
- `POST /api/units/take` - Take a cycle

### Cycles
- `GET /api/cycles` - Get all cycles
- `GET /api/cycles/:rfid` - Get cycle by RFID

See [backend/README.md](backend/README.md) for detailed API documentation.

---

## 🧪 Testing the Backend

### 1. Health Check
```bash
curl http://localhost:5000/health
```

### 2. Get All Booths
```bash
curl http://localhost:5000/api/booths
```

### 3. Check Geofence
```bash
curl -X POST http://localhost:5000/api/booths/check-geofence \
  -H "Content-Type: application/json" \
  -d '{"latitude": 28.6139, "longitude": 77.2090}'
```

### 4. Park a Cycle
```bash
curl -X POST http://localhost:5000/api/units/park \
  -H "Content-Type: application/json" \
  -d '{
    "unitId": "Main-U4",
    "rfid": "RFID00004",
    "userLat": 28.6139,
    "userLon": 77.2090
  }'
```

---

## 🗂️ Project Structure

```
campus-cycle/
├── backend/
│   ├── server.js              # Main server entry
│   ├── socket.js              # Socket.IO config
│   ├── seed.js                # Database seeding
│   ├── config/
│   │   └── db.js             # MongoDB connection
│   ├── model
    ├── src/
    │   ├── components/
    │   │   ├── BoothCard.jsx
    │   │   ├── UnitCard.jsx
    │   │   └── MapStatus.jsx
    │   ├── pages/
    │   │   └── Dashboard.jsx
    │   ├── context/
    │   │   └── BoothContext.jsx
    │   ├── api.js             # REST API client
    │   ├── socket.js          # Socket.IO client
    │   ├── App.jsx
    │   └── main.jsx
    └── index.html   # Booth schema
│   │   ├── Unit.js           # Unit schema
│   │   └── Cycle.js          # Cycle schema
│   ├── routes/
│   │   ├── boothRoutes.js
│   │   ├── unitRoutes.js
│   │   └── cycleRoutes.js
│   ├── controllers/
│   │   ├── boothController.js
│   │   ├── unitController.js
│   │   └── cycleController.js
│   └── utils/
│       └── geofence.js       # Haversine formula
│
└── frontend/                  # Coming next
    └── (React application)
```

---

## 🌍 Geofencing Logic

1. Frontend sends user's `{ latitude, longitude }` every 5-10 seconds
2. Backend calculates distance using **Haversine formula**
3. Backend returns active booth ID if user is within radius
4. Frontend enables interaction only for that booth

---

## 🔄 Real-Time Flow

### Parking a Cycle
1. User selects FREE unit within geofence
2. Sends RFID to backend
3. Backend validates:
   - User in geofence ✓
   - Unit is FREE ✓
   - RFID not already parked ✓
4. Updates:
   - Unit → OCCUPIED
   - Cycle → PARKED
5. Broadcasts `unitUpdated` event via Socket.IO
6. All connected clients update UI instantly

### Taking a Cycle
1. User selects OCCUPIED unit
2. RFIProject Status

1. ✅ **Backend Complete** - REST API + Socket.IO + Geofencing
2. ✅ **Frontend Complete** - React UI with live updates + Geolocation
   - Cycle → IN_USE
5. Broadcasts update to all clients

---

## 📊 Sample Data (After Seeding)

- **3 Booths**: Main Gate, Library, Cafeteria
- **15 Units**: 5 units per booth
- **10 Cycles**: RFID00001 - RFID00010
- **3 Pre-parked cycles** in Main Gate Booth

---

## 🛡️ Validation Rules

✅ Enforced by Backend:
- One RFID per Run the Complete System!

### Full System Setup

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run seed      # First time only
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser and allow location access!

---

## 📸 Features Showcase

### Real-Time Updates
- 🔴 Any change in any client updates **ALL** clients instantly
- 🔄 No page refresh needed
- ⚡ Socket.IO handles all real-time communication

### Geofencing
- 📍 Browser gets your location automatically
- ⭕ System calculates if you're within 100m of any booth
- 🟢 Only booths in range can be interacted with
- 🔴 Out-of-range booths are read-only

### RFID Validation
- 🏷️ Each cycle has a unique RFID
- ✅ System prevents duplicate parking
- 🔒 Can only take a cycle with matching RFID
- 🔐 Backend validates all operations

---

## 🎮 Try It Out!

1. **Start both servers** (backend + frontend)
2. **Open in 2 browser windows** to see real-time sync
3. **Park a cycle** in one window
4. **Watch it update** in the other window instantly
5. **Move your location** to test geofencing

---

## 📚 Documentation

- [Quick Start Guide](QUICK_START.md) - **Start here!** Complete setup walkthrough
- [Backend Documentation](backend/README.md) - API reference, database models
- [Frontend Documentation](frontend/README.md) - Components, state management
- [Setup Guide](SETUP_GUIDE.md) - Detailed installation instructions
- [Testing Guide](TESTING_GUIDE.md) - Test scenarios and demo script
- [Project Summary](PROJECT_SUMMARY.md) - File structure and technologies
- [Architecture](ARCHITECTURE.md) - System diagrams and data flows

---

**The complete MERN stack application is ready to use! 🎉
1. ✅ **Backend Complete** - REST API + Socket.IO + Geofencing
2. ⏳ **Frontend Development** - React UI with live updates
3. ⏳ **Testing** - Integration and E2E tests
4. ⏳ **Deployment** - Docker + Cloud hosting

---

## 🤝 Contributing

This is a learning project built according to specific system requirements. Feel free to fork and experiment!

---

## 📄 License

MIT License - Free to use and modify

---

## 🚀 Ready to Build the Frontend?

The backend is complete and ready. Next, we'll build the React frontend with:
- Real-time Socket.IO integration
- Geolocation API
- Interactive booth and unit cards
- Live status updates

**Run the backend and test the APIs before proceeding to frontend development!**

