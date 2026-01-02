# CampusCycle - Quick Reference

## 🚀 Quick Commands

### Backend
```bash
cd backend
npm install          # Install dependencies
node server.js       # Start server
```

### Mobile App
```bash
cd mobile-app
npm install --legacy-peer-deps    # Install dependencies
npm start                          # Start Expo
```

## 📱 Demo Credentials
- **Admin**: `admin` / `password`
- **Student**: `student` / `student123`

## 🔧 Configuration Checklist
- [ ] Get local IP: `hostname -I | awk '{print $1}'`
- [ ] Update API_BASE_URL in `mobile-app/App.js` (line 18)
- [ ] Ensure phone and computer on same WiFi
- [ ] Backend running on port 3000
- [ ] Mobile app running on port 8081

## 🐛 Common Issues

**Backend port in use:**
```bash
lsof -ti:3000 | xargs kill -9
```

**Clear Expo cache:**
```bash
cd mobile-app
rm -rf .expo
npm start -- --clear
```

**Reinstall dependencies:**
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

## 📊 Default Data
- **Station**: Main Station
- **Cycles**: 4 (A, B, C - Available | D - In Use)
- **Users**: 2 (admin, student)

## 🔌 Hardware Integration Points
Located in `backend/server.js`:
- `unlockCycle(cycleId)` - Line ~42
- `lockCycle(cycleId)` - Line ~48  
- `setCycleStatus(cycleId, status)` - Line ~36

## 📝 Files Created
```
✅ .gitignore (root)
✅ backend/.gitignore
✅ mobile-app/.gitignore
✅ README.md (professional)
✅ SETUP.md (industry standard)
✅ QUICK_REFERENCE.md (this file)
```

## 🎯 Test Flow
1. Test Connection → Login → Book Cycle → Return Cycle

## 📖 Documentation
- **Setup Guide**: [SETUP.md](SETUP.md)
- **Project Overview**: [README.md](README.md)
- **Requirements**: [version0.md](version0.md)