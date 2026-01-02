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
┌─────────────────┐         ┌──────────────────┐
│  Mobile App     │◄───────►│  Backend API     │
│  (React Native) │  REST   │  (Node.js)       │
└─────────────────┘         └──────────────────┘
                                    │
                                    │ (Future)
                                    ▼
                            ┌──────────────────┐
                            │  ESP32 + MQTT    │
                            │  (Hardware)      │
                            └──────────────────┘
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

### Planned

- 🔄 Database integration (PostgreSQL/MongoDB)
- 🔄 ESP32/MQTT hardware communication
- 🔄 Multi-station support
- 🔄 User registration system
- 🔄 Payment gateway integration
- 🔄 GPS tracking
- 🔄 Push notifications
- 🔄 Admin dashboard

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
- **Navigation**: Single-screen (v1.0)

### Future Integrations
- **Hardware**: ESP32 with MQTT protocol
- **Database**: PostgreSQL or MongoDB
- **Analytics**: Custom tracking system

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

---

## � Project Structure

```
CampusCycle/
├── backend/              # Backend API server
│   ├── server.js        # Main application logic
│   ├── package.json     # Dependencies
│   └── .gitignore       # Ignore rules
│
├── mobile-app/          # Mobile application
│   ├── App.js          # Main component
│   ├── app.json        # Expo config
│   ├── package.json    # Dependencies
│   └── .gitignore      # Ignore rules
│
├── SETUP.md            # Detailed setup guide
├── README.md           # This file
└── .gitignore          # Root ignore rules
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3000 in use | `lsof -ti:3000 \| xargs kill -9` |
| Cannot connect | Check same WiFi & IP address |
| SDK mismatch | Reinstall with `--legacy-peer-deps` |
| Metro bundler | Clear cache: `npm start -- --clear` |

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