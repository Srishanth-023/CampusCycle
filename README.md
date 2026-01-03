# CampusCycle 🚲

> A modern bike-sharing platform designed for college campuses with hardware integration capabilities.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.74.5-blue)](https://reactnative.dev/)

---

## 📋 Overview

CampusCycle is a college cycle-sharing application that enables students to book and return bicycles seamlessly. Built with scalability and hardware integration in mind, it features:

- 🔐 **User Authentication** - Secure session-based login system
- 🚴 **Cycle Management** - Real-time booking and return functionality
- 📱 **Mobile-First** - Cross-platform React Native mobile application
- 🔌 **Hardware Ready** - Designed for ESP32/MQTT integration
- 📊 **Analytics Ready** - Foundation for ride tracking and statistics

---

## 🏗️ Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Expo App      │         │  Node.js Backend │         │     ESP32       │
│  (React Native) │◄───────►│   (Port 3000)    │◄───────►│   Hardware      │
└─────────────────┘  REST   └──────────────────┘  HTTP   └─────────────────┘
                                    │                           │
       POST /api/book ──────────────┤                           │
       POST /api/return ────────────┤                           │
       GET  /api/cycles ────────────┤                           │
                                    │                           │
                            POST /rfid ◄────────────────────────┤ Cycle RFID Tag
                            GET /command ───────────────────────► Unlock/Lock
```

### RFID = Cycle Identification

**Important:** The RFID tags are attached to **cycles, not users**.

- Each cycle (A, B, C, D) has a unique RFID tag
- When a cycle is docked, the station reads its RFID
- Backend identifies which cycle was returned

### Data Flow

**Booking Flow (App → Hardware):**
```
User books cycle in app → Backend sets unlock=true → ESP32 polls /command → Lock opens 🔓
```

**Return Flow (Hardware → Backend):**
```
User docks cycle → RFID reader scans cycle tag → ESP32 sends to /rfid → Backend marks cycle AVAILABLE → Lock closes 🔒
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Expo Go app (for mobile testing)
- Same WiFi network for phone and computer

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Srishanth-023/CampusCycle.git
   cd CampusCycle
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install

   # Mobile App
   cd ../mobile-app
   npm install --legacy-peer-deps
   ```

3. **Configure API URL**
   
   Get your local IP:
   ```bash
   hostname -I | awk '{print $1}'
   ```
   
   Update `mobile-app/App.js` line 18:
   ```javascript
   const API_BASE_URL = 'http://YOUR_IP:3000/api';
   ```

4. **Start the application**
   
   Terminal 1 (Backend):
   ```bash
   cd backend
   node server.js
   ```
   
   Terminal 2 (Mobile App):
   ```bash
   cd mobile-app
   npm start
   ```

5. **Access the app**
   - Scan QR code with Expo Go app
   - Or press `w` for web version

📖 **For detailed setup instructions, see [SETUP.md](SETUP.md)**

---

## 🎯 Features

### Current (Version 1.0)

- ✅ User authentication with session management
- ✅ Real-time cycle availability tracking
- ✅ Booking system with OTP generation
- ✅ Return system with ride statistics
- ✅ Connection testing functionality
- ✅ Cross-platform mobile support
- ✅ **ESP32 Hardware Integration**
- ✅ **RFID-based cycle return**
- ✅ **Remote unlock via app**

### Planned

- 🔄 Database integration (MongoDB)
- 🔄 Multi-station support
- 🔄 User registration system
- 🔄 Payment gateway integration
- 🔄 GPS tracking
- 🔄 Push notifications
- 🔄 Admin dashboard

---

## 🔌 Hardware Integration (ESP32)

### Hardware Requirements

| Component | Purpose |
|-----------|---------|
| ESP32 Dev Board | Main controller |
| RFID Reader (RC522/EM18) | Card scanning |
| Relay Module (5V) | Lock control |
| Solenoid/Electric Lock | Physical lock |

### Wiring Diagram

```
ESP32 Pin    →    Component
─────────────────────────────
GPIO 16      →    RFID Reader (RX)
GPIO 26      →    Relay Module (IN)
5V           →    Power Rails
GND          →    Ground Rails
```

### ESP32 Configuration

Update the following in `hardware.md` before flashing:

```cpp
/* ================= WIFI CONFIG ================= */
const char* WIFI_SSID = "YOUR_WIFI_NAME";
const char* WIFI_PASS = "YOUR_WIFI_PASSWORD";

/* ================= BACKEND URLs ================= */
const char* POST_URL = "http://YOUR_BACKEND_IP:3000/rfid";
const char* GET_URL  = "http://YOUR_BACKEND_IP:3000/command";
```

### Get Your Backend IP

```bash
# Linux/Mac
hostname -I | awk '{print $1}'

# Windows
ipconfig | findstr IPv4
```

### Hardware API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/rfid` | POST | ESP32 sends cycle RFID when docked |
| `/command` | GET | ESP32 polls for unlock command |
| `/command/unlock` | POST | App triggers unlock |
| `/api/rfid/tags` | GET | List cycle RFID registrations |
| `/api/hardware/status` | GET | Debug hardware state |

### Lock Behavior

| Trigger | Action | Auto-Revert |
|---------|--------|-------------|
| App Booking | UNLOCK | Lock after 20s |
| RFID Tap | LOCK | Open after 10s |
| Startup | OPEN | — (default) |

### How RFID Works (Cycle Identification)

**Each cycle has an RFID tag attached to it.** When a cycle is returned to the station:

1. User docks the cycle at the station
2. RFID reader scans the cycle's tag
3. ESP32 sends the RFID to backend
4. Backend identifies which cycle was returned
5. Backend marks that cycle as AVAILABLE
6. User's ride is completed

### Register Cycle RFID Tags

Add your cycle RFID tags in `backend/server.js`:

```javascript
// Around line 40 - Map RFID tags to cycles
rfidToCycle.set("123456789", "A");    // Cycle A's RFID tag
rfidToCycle.set("987654321", "B");    // Cycle B's RFID tag
rfidToCycle.set("111222333", "C");    // Cycle C's RFID tag
rfidToCycle.set("444555666", "D");    // Cycle D's RFID tag
```

**To find an RFID tag number:**
1. Flash ESP32 and open Serial Monitor (115200 baud)
2. Scan the RFID tag attached to a cycle
3. Look for: `RFID DEC: 123456789` ← Use this number
4. Register it to the corresponding cycle ID

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Authentication**: Session tokens (in-memory)
- **Data Storage**: In-memory (v1.0)

### Mobile App
- **Framework**: React Native
- **SDK**: Expo 51
- **State Management**: React Hooks
- **Navigation**: Expo Router

### Hardware
- **Microcontroller**: ESP32
- **Communication**: HTTP REST (polling)
- **RFID**: EM18/RC522 compatible
- **Lock Control**: Relay-based

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Get Your IP Address

```bash
hostname -I | awk '{print $1}'
# Example output: 192.168.1.100
```

### Step 2: Start Backend

```bash
cd backend
npm install
node server.js
```

**Expected output:**
```
🚀 CampusCycle Backend running on http://localhost:3000
📊 Station: Main Station
🚲 Cycles: 4 total
🔖 RFID Tags: 4 registered to cycles
```

### Step 3: Configure Mobile App

Update `client-app/services/api.ts`:

```typescript
const API_BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:3000/api'
  : 'http://192.168.1.100:3000/api'; // ← Your IP
```

### Step 4: Start Mobile App

```bash
cd client-app
npm install
npm start
```

Press `w` for web or scan QR with Expo Go.

### Step 5: Configure ESP32 (Optional)

Update `hardware.md`:

```cpp
const char* WIFI_SSID = "YOUR_WIFI";
const char* WIFI_PASS = "YOUR_PASSWORD";
const char* POST_URL = "http://192.168.1.100:3000/rfid";
const char* GET_URL  = "http://192.168.1.100:3000/command";
```

Flash to ESP32 using Arduino IDE.

---

## � Demo Credentials

| Username | Password | Role |
|----------|----------|------|
| `admin` | `password` | Administrator |
| `student` | `student123` | Student |

---

## 🧪 Testing

### Quick Test Flow

1. **Test Connection**: Verify backend connectivity
2. **Login**: Use demo credentials
3. **Book Cycle**: Select available cycle
4. **Return Cycle**: Complete ride and view stats

### API Testing

```bash
# Health check
curl http://localhost:3000/api/health

# Login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

### Hardware Testing

```bash
# Check hardware status
curl http://localhost:3000/api/hardware/status

# Simulate ESP32 RFID scan
curl -X POST http://localhost:3000/rfid \
  -H "Content-Type: application/json" \
  -d '{"rfid":"123456789"}'

# Check unlock command (ESP32 polls this)
curl http://localhost:3000/command

# Trigger unlock (after login)
TOKEN="your_token_here"
curl -X POST http://localhost:3000/command/unlock \
  -H "Authorization: Bearer $TOKEN"
```

### ESP32 Serial Monitor Output

When working correctly, you should see:

```
WiFi Connected
SYSTEM READY
LOCK STATUS: OPEN 🔓
--------------------------------
POST /rfid STATUS: 200          ← RFID working
GET /command STATUS: 200        ← Polling working
WEB COMMAND: UNLOCK             ← Unlock received
RFID HEX: A1B2C3D4E5
RFID DEC: 123456789
LOCK CLOSED BY RFID 🔒
```

---

## 📁 Project Structure

```
CampusCycle/
├── backend/                 # Node.js API server
│   ├── server.js           # Main server with hardware endpoints
│   └── package.json        # Dependencies
│
├── client-app/             # Expo React Native app
│   ├── app/               # Screen components
│   ├── services/api.ts    # API service
│   ├── context/           # Auth & Theme context
│   └── package.json       # Dependencies
│
├── hardware.md             # ESP32 Arduino code
├── README.md              # This file
└── SETUP.md               # Detailed setup guide
```

---

## 🐛 Troubleshooting

### Software Issues

| Issue | Solution |
|-------|----------|
| Port 3000 in use | `lsof -ti:3000 \| xargs kill -9` |
| Cannot connect | Check same WiFi & IP address |
| SDK mismatch | Reinstall with `--legacy-peer-deps` |
| Metro bundler | Clear cache: `npm start -- --clear` |

### Hardware Issues

| Issue | Solution |
|-------|----------|
| ESP32 won't connect WiFi | Use 2.4GHz network, check credentials |
| HTTP -1 or 404 errors | Verify backend IP in ESP32 code |
| RFID not recognized | Register card in `server.js`, check decimal number |
| Lock not responding | Check relay wiring (GPIO 26), test relay LED |
| Unlock not working | Verify ESP32 polls show 200 status |

### Debug Checklist

- [ ] Backend running? `curl http://localhost:3000/api/health`
- [ ] ESP32 connected to WiFi? Check Serial Monitor
- [ ] Same network? Phone, computer, ESP32 on same WiFi
- [ ] Correct IP? `hostname -I` shows your IP
- [ ] RFID registered? Check `rfidToUser` in server.js

See [SETUP.md](SETUP.md) for more troubleshooting help.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Authors

- **CampusCycle Team** - [Srishanth-023](https://github.com/Srishanth-023)

---

## 🙏 Acknowledgments

- Built with Express.js and React Native
- Expo for mobile development tools
- Inspired by modern bike-sharing platforms

---

## 📞 Support

For detailed setup instructions, see [SETUP.md](SETUP.md)

For issues, please open a GitHub issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

---

**Made with ❤️ for college students who need wheels! 🚲**