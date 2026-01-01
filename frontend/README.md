# Campus Cycle Management System - Frontend

## 🚀 React Frontend with Real-Time Updates

This is the frontend application for the Campus Cycle Management System, built with React, Vite, and Tailwind CSS, featuring real-time Socket.IO updates and geolocation-based access control.

---

## ✨ Features

- ✅ **Real-Time Updates** - Live unit status via Socket.IO (no refresh needed)
- ✅ **Geolocation Tracking** - Automatic location detection every 10 seconds
- ✅ **Geofencing** - Visual indication of which booths you can interact with
- ✅ **Responsive UI** - Beautiful Tailwind CSS design
- ✅ **Interactive Components** - Expandable booth cards, unit management
- ✅ **RFID Input** - Easy cycle parking and retrieval

---

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client for REST API
- **Context API** - State management

---

## 📦 Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

---

## 🚀 Running the Application

### Prerequisites
Make sure the backend server is running on `http://localhost:5000`

### Start Development Server
```bash
npm run dev
```

The application will open at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── BoothCard.jsx   # Booth display with units
│   │   ├── UnitCard.jsx    # Individual unit with actions
│   │   └── MapStatus.jsx   # Location & geofence status
│   │
│   ├── pages/
│   │   └── Dashboard.jsx   # Main page
│   │
│   ├── context/
│   │   └── BoothContext.jsx # Global state management
│   │
│   ├── api.js              # REST API client (Axios)
│   ├── socket.js           # Socket.IO client
│   ├── App.jsx             # Root component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles + Tailwind
│
├── index.html              # HTML template
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
└── package.json            # Dependencies
```

---

## 🎨 UI Components

### MapStatus
Displays user's current location and geofence status with:
- Real-time coordinates
- Active booth indication
- Geofence in/out status
- Manual refresh button

### BoothCard
Shows booth information with:
- Booth name and location
- Geofence range indicator
- Unit statistics (FREE/OCCUPIED)
- Expandable unit grid
- Visual active/inactive state

### UnitCard
Individual unit management with:
- Unit ID and status badge
- RFID input for park/take actions
- Real-time status updates
- Disabled state when out of geofence

---

## 🌍 Geolocation Flow

1. App requests location permission on load
2. Browser provides user's coordinates
3. Frontend sends location to backend API
4. Backend calculates geofence status
5. UI updates to show active booth
6. Location refreshes automatically every 10 seconds

---

## 🔄 Real-Time Updates

### Socket.IO Events

**Listening:**
- `connected` - Connection confirmation from server
- `unitUpdated` - Unit status changed (broadcasts to all clients)
- `unitStatusUpdate` - Response to status request
- `error` - Error messages

**Emitting:**
- `updateLocation` - Send user's location
- `requestUnitStatus` - Request current unit status

### How It Works
1. Any client parks/takes a cycle
2. Backend validates and updates database
3. Backend emits `unitUpdated` event
4. All connected clients receive update
5. UI updates instantly without refresh

---

## 🎯 User Flow

### Parking a Cycle
1. User enters booth geofence (shown in MapStatus)
2. Booth card highlights as "IN RANGE"
3. Click booth to expand and see units
4. Select FREE unit
5. Click "Park Cycle"
6. Enter cycle RFID
7. Click confirm
8. Unit updates to OCCUPIED instantly

### Taking a Cycle
1. User in geofence selects OCCUPIED unit
2. Click "Take Cycle"
3. Enter matching RFID
4. Click confirm
5. Unit updates to FREE instantly
6. All clients see update in real-time

---

## 🎨 Tailwind Custom Classes

Defined in `index.css`:

```css
.card                 // Base card style
.btn                  // Base button
.btn-primary          // Primary action
.btn-success          // Success action
.btn-danger           // Danger action
.badge-free           // FREE status
.badge-occupied       // OCCUPIED status
.geofence-active      // In geofence
.geofence-inactive    // Out of geofence
```

---

## ⚙️ Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🐛 Troubleshooting

### Location Not Working
- Check browser location permissions
- Must use HTTPS in production (or localhost in dev)
- Some browsers block location in non-secure contexts

### Socket.IO Not Connecting
- Ensure backend is running on correct port
- Check CORS settings in backend
- Verify VITE_SOCKET_URL in `.env`

### Units Not Updating
- Check browser console for Socket.IO events
- Verify backend is emitting `unitUpdated` events
- Check network tab for API calls

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 🚀 Production Deployment

### Build
```bash
npm run build
```

This creates a `dist/` folder with optimized static files.

### Deploy
Deploy the `dist/` folder to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

**Important:** Update environment variables for production API URLs.

---

## 📱 Browser Compatibility

- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅

Requires:
- Geolocation API support
- WebSocket support
- ES6+ support

---

## 🎓 Learning Points

This project demonstrates:
- React Context API for state management
- Socket.IO client integration
- Browser Geolocation API usage
- Real-time UI updates
- Tailwind CSS responsive design
- REST API integration with Axios
- Vite build configuration

---

## 📄 License

MIT License - Free to use and modify
