# CampusCycle Setup Guide

> A comprehensive guide to set up and run the CampusCycle bike-sharing application locally.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Development](#development)

---

## Overview

CampusCycle is a college bike-sharing platform consisting of:
- **Backend API**: Node.js/Express REST API server
- **Mobile App**: React Native application built with Expo

**Version**: 1.0.0  
**Status**: Development  
**License**: MIT

---

## Prerequisites

Ensure you have the following installed on your system:

| Software | Version | Required |
|----------|---------|----------|
| Node.js  | 18.x or higher | Yes |
| npm      | 9.x or higher | Yes |
| Expo Go  | Latest (SDK 51) | Yes (for mobile) |
| Git      | Latest | Recommended |

### System Requirements

- **OS**: Linux, macOS, or Windows
- **RAM**: Minimum 4GB recommended
- **Network**: WiFi connection for mobile device testing

---

## Project Structure

```
CampusCycle/
├── backend/               # Backend API server
│   ├── server.js         # Main server file
│   ├── package.json      # Backend dependencies
│   └── .gitignore        # Backend ignore rules
│
├── mobile-app/           # React Native mobile application
│   ├── App.js           # Main application component
│   ├── index.js         # Entry point
│   ├── app.json         # Expo configuration
│   ├── package.json     # Mobile app dependencies
│   └── .gitignore       # Mobile app ignore rules
│
├── .gitignore           # Root ignore rules
├── README.md            # Project overview
└── SETUP.md             # This file
```

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Srishanth-023/CampusCycle.git
cd CampusCycle
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

**Expected output**: ~100 packages installed without errors.

### 3. Install Mobile App Dependencies

```bash
cd ../mobile-app
npm install --legacy-peer-deps
```

**Expected output**: ~1100 packages installed.

> **Note**: `--legacy-peer-deps` flag is used to handle peer dependency conflicts in Expo SDK 51.

---

## Configuration

### Backend Configuration

1. **Get your local IP address**:

```bash
# Linux/macOS
hostname -I | awk '{print $1}'

# Windows (PowerShell)
(Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*"}).IPAddress
```

2. **No additional configuration needed** - Backend runs on port 3000 by default.

### Mobile App Configuration

Update the API URL in `mobile-app/App.js`:

```javascript
// Line 18
const API_BASE_URL = 'http://YOUR_LOCAL_IP:3000/api';
```

Replace `YOUR_LOCAL_IP` with the IP address obtained from the previous step.

**Example**:
```javascript
const API_BASE_URL = 'http://192.168.0.105:3000/api';
```

---

## Running the Application

### Start Backend Server

Open a terminal and run:

```bash
cd backend
node server.js
```

**Expected output**:
```
🚀 CampusCycle Backend running on http://localhost:3000
📊 Station: Main Station
🚲 Cycles: 4 total
👥 Users: 2 registered

===== Hardware Integration Points =====
• unlockCycle() - Add MQTT unlock command
• lockCycle() - Add MQTT lock command
• setCycleStatus() - Ready for DB integration
=====================================
```

### Start Mobile App

Open a **new terminal** and run:

```bash
cd mobile-app
npm start
```

**Expected output**: QR code displayed in terminal.

### Access the Mobile App

#### Option 1: Physical Device (Recommended)

1. Install **Expo Go** from:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Ensure your phone and computer are on the same WiFi network**

3. Scan the QR code:
   - **iOS**: Use Camera app
   - **Android**: Use Expo Go app

#### Option 2: Web Browser

Press `w` in the Expo terminal to open in browser.

---

## Testing

### Demo Credentials

Use these credentials to test the application:

| Username | Password | Role |
|----------|----------|------|
| admin    | password | Admin |
| student  | student123 | Student |

### Test Flow

1. **Connection Test**
   - Tap "🔍 Test Connection" button
   - Should show: "✅ Successfully connected to server!"

2. **Login**
   - Enter username and password
   - Tap "Login"
   - Should redirect to cycle listing

3. **Book a Cycle**
   - Select an available cycle
   - Tap "Book Cycle"
   - Note the OTP displayed

4. **Return a Cycle**
   - Select a cycle in use
   - Tap "Return Cycle"
   - View ride statistics

### API Endpoints

Test backend endpoints using curl:

```bash
# Health check
curl http://localhost:3000/api/health

# Login
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Get cycles (requires token)
curl http://localhost:3000/api/cycles \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

#### 2. Cannot Connect to Server

**Error**: "❌ Failed to connect to server"

**Solutions**:
- Verify backend server is running
- Check that phone and computer are on same WiFi
- Verify IP address in `App.js` matches your computer's IP
- Check firewall settings

#### 3. Expo SDK Version Mismatch

**Error**: "Project is incompatible with this version of Expo Go"

**Solution**:
```bash
cd mobile-app
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

#### 4. Metro Bundler Issues

**Error**: Metro bundler fails to start

**Solution**:
```bash
cd mobile-app
rm -rf .expo
npm start -- --clear
```

### Getting Help

1. Check terminal logs for detailed error messages
2. Verify all prerequisites are installed correctly
3. Ensure correct Node.js version: `node --version`
4. Clear caches and reinstall dependencies

---

## Development

### Backend Development

**File**: `backend/server.js`

Key features:
- In-memory data storage (no database)
- Session-based authentication
- Hardware integration placeholders

**Hot reload**: Not enabled. Restart server after changes.

### Mobile App Development

**File**: `mobile-app/App.js`

**Hot reload**: Enabled automatically
- Save file to see changes
- Shake device → "Reload" for full refresh

### Code Style

- Use 2-space indentation
- Follow ES6+ JavaScript standards
- Add comments for complex logic
- Keep functions small and focused

### Adding Features

1. Backend: Add endpoint in `server.js`
2. Mobile: Add UI component in `App.js`
3. Test both independently
4. Integrate and test end-to-end

---

## Architecture Notes

### Authentication Flow

1. User submits credentials
2. Backend validates and generates session token
3. Token stored in mobile app state
4. Token sent with all authenticated requests

### Future Enhancements

- **Hardware Integration**: ESP32/MQTT for physical locks
- **Database**: PostgreSQL/MongoDB for persistence
- **Analytics**: Ride tracking and statistics
- **Multi-station**: Support for multiple locations
- **Payment**: Integration with payment gateways

---

## Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)

---

## Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review terminal error messages
3. Consult documentation links above

---

**Last Updated**: January 2, 2026  
**Maintained By**: CampusCycle Team