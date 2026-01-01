# 🧪 Testing & Demo Guide

Complete guide for testing all features of the Campus Cycle Management System

---

## 🎯 Test Scenarios

### Test 1: Real-Time Synchronization ⚡

**Objective:** Verify that changes sync instantly across multiple clients

**Steps:**

1. **Open 2 browser windows side by side**
   ```
   Window A: http://localhost:5173
   Window B: http://localhost:5173 (incognito/private mode)
   ```

2. **In both windows:**
   - Allow location access
   - Expand the "Main Gate Booth"
   - Observe the same 5 units

3. **In Window A:**
   - Click "Park Cycle" on unit "Main-U4"
   - Enter RFID: `RFID00007`
   - Click confirm

4. **In Window B:**
   - Observe the unit "Main-U4" **instantly** changes to OCCUPIED
   - No refresh needed!

**✅ Success Criteria:**
- Unit status updates in Window B within 1 second
- Both windows show identical data
- Green "Real-time sync" indicator on unit cards

---

### Test 2: Geofencing 🌍

**Objective:** Verify location-based access control

**Method A: Using Chrome DevTools**

1. **Open Chrome DevTools** (`F12`)
2. **Open Sensors Panel:**
   - Press `Ctrl+Shift+P`
   - Type "sensors"
   - Select "Show Sensors"

3. **Test Location 1: Inside Geofence**
   ```
   Latitude: 28.6139
   Longitude: 77.2090
   ```
   **Expected:**
   - MapStatus shows "✅ Inside Geofence"
   - "Main Gate Booth" shows "IN RANGE"
   - Can interact with units

4. **Test Location 2: Outside Geofence**
   ```
   Latitude: 28.6200
   Longitude: 77.2200
   ```
   **Expected:**
   - MapStatus shows "❌ Outside All Geofences"
   - All booths show "OUT OF RANGE"
   - Units show "🔒 Move into geofence to interact"

**Method B: Create Booth at Your Location**

1. **Note your coordinates** from MapStatus card
2. **Create a booth** using curl:
   ```bash
   curl -X POST http://localhost:5000/api/booths \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test Booth",
       "location": {
         "lat": YOUR_LAT,
         "lon": YOUR_LON,
         "radius": 100
       }
     }'
   ```

3. **Create units** for this booth (use booth ID from response):
   ```bash
   curl -X POST http://localhost:5000/api/units \
     -H "Content-Type: application/json" \
     -d '{
       "unitId": "Test-U1",
       "boothId": "BOOTH_ID_HERE"
     }'
   ```

**✅ Success Criteria:**
- Geofence detection is accurate
- UI responds to location changes
- Access is properly restricted

---

### Test 3: Park Cycle Workflow 🅿️

**Objective:** Verify complete park cycle flow with validation

**Steps:**

1. **Test 3a: Successful Park**
   - Be inside geofence
   - Select FREE unit "Main-U5"
   - Enter RFID: `RFID00008`
   - Click confirm
   
   **Expected:**
   - Success message appears
   - Unit becomes OCCUPIED
   - RFID shown on unit card
   - All clients update instantly

2. **Test 3b: Duplicate RFID (Error)**
   - Select another FREE unit
   - Enter RFID: `RFID00008` (already parked)
   - Click confirm
   
   **Expected:**
   - Error: "This cycle is already parked in another unit"
   - Unit remains FREE

3. **Test 3c: Out of Geofence (Error)**
   - Move location outside geofence
   - Try to park a cycle
   
   **Expected:**
   - Error: "You are not within the booth geofence"
   - Unit remains FREE

4. **Test 3d: Invalid RFID**
   - Select FREE unit
   - Leave RFID blank
   - Try to confirm
   
   **Expected:**
   - Button is disabled
   - Error: "Please enter RFID"

**✅ Success Criteria:**
- Valid operations succeed
- Invalid operations show proper errors
- Data integrity maintained

---

### Test 4: Take Cycle Workflow 🚴

**Objective:** Verify complete take cycle flow with validation

**Steps:**

1. **Test 4a: Successful Take**
   - Be inside geofence
   - Select OCCUPIED unit "Main-U1"
   - Note the RFID shown on card (e.g., "RFID00001")
   - Enter matching RFID
   - Click confirm
   
   **Expected:**
   - Success message appears
   - Unit becomes FREE
   - RFID cleared
   - All clients update instantly

2. **Test 4b: Wrong RFID (Error)**
   - Select OCCUPIED unit "Main-U2"
   - Enter different RFID (not matching)
   - Click confirm
   
   **Expected:**
   - Error: "RFID does not match the cycle in this unit"
   - Unit remains OCCUPIED

3. **Test 4c: Take from FREE Unit (Error)**
   - Select FREE unit
   - Try to click "Take Cycle"
   
   **Expected:**
   - No "Take Cycle" button visible
   - Only "Park Cycle" option available

**✅ Success Criteria:**
- RFID matching works correctly
- Cannot take from FREE units
- Status transitions properly

---

### Test 5: Backend API Direct Testing 🔌

**Objective:** Test backend endpoints directly

**Using curl or Postman:**

1. **Check Health**
   ```bash
   curl http://localhost:5000/health
   ```
   Expected: `{"success": true}`

2. **Get All Booths**
   ```bash
   curl http://localhost:5000/api/booths
   ```
   Expected: Array of 3 booths

3. **Get All Units**
   ```bash
   curl http://localhost:5000/api/units
   ```
   Expected: Array of 15 units

4. **Check Geofence**
   ```bash
   curl -X POST http://localhost:5000/api/booths/check-geofence \
     -H "Content-Type: application/json" \
     -d '{"latitude": 28.6139, "longitude": 77.2090}'
   ```
   Expected: `{"activeBoothId": "...", "boothName": "Main Gate Booth"}`

5. **Park Cycle via API**
   ```bash
   curl -X POST http://localhost:5000/api/units/park \
     -H "Content-Type: application/json" \
     -d '{
       "unitId": "Library-U1",
       "rfid": "RFID00009",
       "userLat": 28.6145,
       "userLon": 77.2085
     }'
   ```
   Expected: Success response + unit updates in frontend!

**✅ Success Criteria:**
- All endpoints respond correctly
- Data validation works
- Frontend updates from API calls

---

### Test 6: Socket.IO Events 📡

**Objective:** Verify Socket.IO real-time events

**Steps:**

1. **Open browser console** (F12)
2. **Look for connection logs:**
   ```
   ✅ Connected to server with socket ID: ...
   📡 Server confirmation: ...
   ```

3. **Monitor events:**
   - Park a cycle in another window
   - Watch console for:
     ```
     📡 Real-time unit update received: {unit: {...}}
     ```

4. **Check backend terminal** for:
   ```
   🔌 Client connected. Total clients: 2
   📡 Broadcasted unit update: Main-U4 - OCCUPIED
   ```

**✅ Success Criteria:**
- Socket connects successfully
- Events received in real-time
- Backend logs show broadcasts

---

### Test 7: Periodic Location Updates ⏱️

**Objective:** Verify automatic location refresh

**Steps:**

1. **Open browser console**
2. **Watch for location API calls** every 10 seconds:
   ```
   🌐 API Request: POST /booths/check-geofence
   ```

3. **Change location** in DevTools sensors
4. **Wait ~10 seconds**
5. **MapStatus should update** with new geofence status

**✅ Success Criteria:**
- Location checked every 10 seconds
- Geofence status updates automatically
- No manual refresh needed

---

### Test 8: Multiple Concurrent Users 👥

**Objective:** Stress test with multiple clients

**Steps:**

1. **Open 4-5 browser windows**
2. **In each window:**
   - Park a cycle
   - Take a cycle
   - Refresh location

3. **Observe:**
   - All windows stay in sync
   - No conflicts or race conditions
   - Server handles all requests

**✅ Success Criteria:**
- System handles concurrent operations
- Data consistency maintained
- No crashes or errors

---

## 🎬 Demo Script (5 Minutes)

**Perfect for presentations or demonstrations:**

### Minute 1: Introduction
"This is a real-time campus cycle management system with geofencing."

**Show:**
- Dashboard with 3 booths
- Location status
- Live indicator

### Minute 2: Geofencing Demo
"The system tracks your location and only lets you interact with nearby booths."

**Show:**
- Change location in DevTools
- Watch geofence status change
- Show restricted access

### Minute 3: Real-Time Updates
"All changes sync instantly across all devices."

**Show:**
- Open 2 windows side by side
- Park cycle in one
- Watch it update in the other

### Minute 4: Full Workflow
"Users can park and retrieve cycles using RFID."

**Show:**
- Park a cycle (success)
- Try duplicate RFID (error)
- Take cycle with matching RFID (success)

### Minute 5: Technical Architecture
"Built with MERN stack, Socket.IO, and geolocation."

**Show:**
- Browser console (Socket.IO events)
- Backend terminal (server logs)
- Network tab (API calls)

---

## 📊 Test Coverage Checklist

- [ ] Real-time sync works across multiple clients
- [ ] Geofencing accurately detects location
- [ ] Park cycle validates RFID and location
- [ ] Take cycle requires matching RFID
- [ ] Cannot park duplicate RFIDs
- [ ] Cannot interact outside geofence
- [ ] Location updates every 10 seconds
- [ ] Socket.IO connects and reconnects
- [ ] All API endpoints respond correctly
- [ ] Error messages are clear and helpful
- [ ] UI is responsive and updates smoothly
- [ ] System handles multiple users
- [ ] Database maintains data integrity

---

## 🐛 Known Issues & Limitations

### Current Limitations:
1. **Single booth geofence:** User can only be in one booth at a time
2. **No authentication:** Anyone can park/take cycles
3. **No history:** No log of past transactions
4. **Mock locations:** Sample booths use Delhi coordinates

### Future Enhancements:
- User authentication and authorization
- Transaction history and audit log
- Push notifications for cycle availability
- Mobile app (React Native)
- Admin dashboard for booth management
- Analytics and reporting

---

## 📝 Bug Reporting Template

If you find a bug:

```
**Bug Title:** Brief description

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Screenshots:**
(If applicable)

**Environment:**
- Browser: Chrome 120
- OS: Windows 11
- Backend: Running on port 5000
- Frontend: Running on port 5173

**Console Errors:**
(Copy any errors from browser console)
```

---

## 🎉 Success!

If all tests pass, you have a fully functional real-time cycle management system!

**Congratulations!** 🚴‍♂️
