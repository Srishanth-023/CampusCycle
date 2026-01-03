# Hardware Integration - Realtime Unlock System

## 🔄 System Overview

The system has been converted from **OTP-based** to **realtime hardware RFID/solenoid unlock**.

## 🔧 How It Works

### 1. User Flow
1. User opens app and navigates to Booking page
2. User clicks **"Unlock"** button on available cycle
3. Backend immediately:
   - Changes cycle status: `AVAILABLE` → `IN_USE`
   - Queues unlock command with cycle-specific RFID tag
   - Returns confirmation to app
4. App shows: "🔓 Unlocked! Hardware solenoid activated"
5. ESP32 polls `/command` endpoint (every ~2 seconds)
6. ESP32 receives: `{unlock: true, cycleId: "A", rfidTag: "0004002722"}`
7. ESP32 activates solenoid for that specific RFID tag
8. User removes cycle and rides

### 2. Return Flow
1. User returns cycle to station
2. ESP32 scans RFID tag when cycle is docked
3. ESP32 sends RFID to backend: `POST /rfid {"rfid": "0004002722"}`
4. Backend automatically:
   - Detects cycle is `IN_USE`
   - Changes status: `IN_USE` → `AVAILABLE`
   - Calculates ride duration
   - Adds to ride history
   - Clears active booking
5. Solenoid auto-locks (handled by ESP32 hardware)

## 📡 Backend Changes

### Modified Files
- **`backend/server.js`**

### Key Changes

#### 1. Cycle Data Structure
```javascript
const cycles = [
  { id: "A", name: "Cycle A", status: "AVAILABLE", rfidTag: "0004002722" },
  { id: "B", name: "Cycle B", status: "AVAILABLE", rfidTag: "0004002723" },
  { id: "C", name: "Cycle C", status: "AVAILABLE", rfidTag: "0004002724" },
  { id: "D", name: "Cycle D", status: "IN_USE", rfidTag: "0004002725" }
];
```

#### 2. Unlock Command Structure
**Before:**
```javascript
let unlockFlag = false;
```

**After:**
```javascript
let unlockCommand = {
  pending: false,
  cycleId: null,
  rfidTag: null,
  timestamp: null
};
```

#### 3. Booking Endpoint Response
**Before:**
```javascript
res.json({
  success: true,
  cycle: cycle,
  otp: "123456",
  bookingTime: bookingTime
});
```

**After:**
```javascript
res.json({
  success: true,
  cycle: cycle,
  rfidTag: cycle.rfidTag,
  unlockMethod: 'HARDWARE_RFID',
  bookingTime: bookingTime,
  note: 'ESP32 will unlock solenoid when it polls /command endpoint'
});
```

#### 4. ESP32 Polling Endpoint
**Before:**
```javascript
GET /command
Response: { unlock: false }
```

**After:**
```javascript
GET /command
Response: {
  unlock: true,
  cycleId: "A",
  rfidTag: "0004002722"
}
```

## 📱 Frontend Changes

### Modified Files
- **`client-app/context/AuthContext.tsx`**
- **`client-app/services/api.ts`**
- **`client-app/app/booking.tsx`**
- **`client-app/app/status.tsx`**

### Key Changes

#### 1. ActiveBooking Interface
**Before:**
```typescript
interface ActiveBooking {
  cycleId: string;
  cycleName: string;
  otp: string;
  bookingTime: string;
}
```

**After:**
```typescript
interface ActiveBooking {
  cycleId: string;
  cycleName: string;
  unlockMethod: string;
  bookingTime: string;
}
```

#### 2. BookingResponse Type
**Before:**
```typescript
interface BookingResponse {
  success: boolean;
  cycle: Cycle;
  otp: string;
  bookingTime: string;
}
```

**After:**
```typescript
interface BookingResponse {
  success: boolean;
  cycle: Cycle;
  rfidTag: string;
  unlockMethod: string;
  bookingTime: string;
  note?: string;
}
```

#### 3. UI Changes

**Unlock Confirmation:**
```
Before: "Booking Successful! 🎉
         OTP: 123456
         Use this OTP to unlock the cycle."

After:  "Unlocked! 🔓
         Hardware solenoid activated
         RFID: 0004002722
         Method: HARDWARE_RFID
         The cycle is ready to use!"
```

**Active Booking Banner:**
```
Before: "Active Booking - Cycle A
         123456"

After:  "Active Booking - Cycle A
         🔓 Hardware Unlocked"
```

**Status Page:**
```
Before: "Unlock OTP
         123456
         Use this code to unlock the cycle"

After:  "Hardware Status
         🔓 Unlocked via RFID
         Cycle solenoid lock is open"
```

## 🔖 RFID Mapping

| Cycle | Cycle ID | RFID Tag    |
|-------|----------|-------------|
| Cycle A | A | 0004002722 |
| Cycle B | B | 0004002723 |
| Cycle C | C | 0004002724 |
| Cycle D | D | 0004002725 |

## 🧪 Testing the System

### Test Unlock Flow

1. **Start Backend:**
   ```bash
   cd backend
   node server.js
   ```

2. **Check Hardware Status:**
   ```bash
   curl http://localhost:3000/api/hardware/status
   ```

3. **Login (get token):**
   ```bash
   curl -X POST http://localhost:3000/api/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"password"}'
   ```

4. **Unlock Cycle A:**
   ```bash
   curl -X POST http://localhost:3000/api/book \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"cycleId":"A"}'
   ```

5. **Simulate ESP32 Poll:**
   ```bash
   curl http://localhost:3000/command
   ```
   **Expected Response:**
   ```json
   {
     "unlock": true,
     "cycleId": "A",
     "rfidTag": "0004002722"
   }
   ```

6. **Simulate RFID Return:**
   ```bash
   curl -X POST http://localhost:3000/rfid \
     -H "Content-Type: application/json" \
     -d '{"rfid":"0004002722"}'
   ```

### Console Logs to Watch

When you unlock a cycle, you'll see:
```
🔓 UNLOCK REQUEST: Cycle A (RFID: 0004002722) - Status: AVAILABLE → IN_USE
📱 Cycle A booked by admin - Hardware unlock triggered
📡 ESP32 POLLING: Sending unlock for Cycle A (RFID: 0004002722)
```

When cycle is returned:
```
🔖 RFID Scan received: 0004002722
✅ CYCLE RETURNED: Cycle A by admin (15 min) - Status: IN_USE → AVAILABLE
```

## 🚀 Deployment Checklist

- [x] Backend updated with RFID tags
- [x] Unlock command structure includes cycleId and rfidTag
- [x] Frontend removed all OTP references
- [x] Booking UI shows "Unlock" instead of "Book"
- [x] Active booking shows "Hardware Unlocked"
- [x] Status page shows hardware status
- [x] ESP32 polling returns cycle-specific data
- [x] RFID return flow auto-detects and processes returns
- [x] All error handling maintained

## 📊 API Endpoints

### For Mobile App

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/login` | User authentication |
| POST | `/api/book` | Unlock cycle (triggers hardware) |
| POST | `/api/return` | Return cycle (manual) |
| GET | `/api/cycles` | Get all cycles status |
| GET | `/api/history` | Get ride history |
| GET | `/api/hardware/status` | Debug: check system state |

### For ESP32

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/command` | Poll for unlock commands |
| POST | `/rfid` | Send RFID scan (auto-return) |
| POST | `/api/rfid/register` | Register new RFID tag |
| GET | `/api/rfid/tags` | List all RFID mappings |

## 🎯 Next Steps

1. **Upload to ESP32**: Flash the hardware code to your ESP32
2. **Test Polling**: Verify ESP32 polls `/command` every 2 seconds
3. **Test Unlock**: Click "Unlock" in app, verify solenoid activates
4. **Test Return**: Dock cycle, verify RFID scan triggers auto-return
5. **Monitor Logs**: Watch backend console for full unlock→return flow

## ⚡ Real-time Features

- **Edge-triggered unlock**: Command clears immediately after ESP32 reads it
- **Automatic return**: RFID scan auto-detects and processes returns
- **Status sync**: Cycle status updates instantly on unlock/return
- **Ride tracking**: Automatic duration calculation on return
- **No manual intervention**: Fully automated lock/unlock cycle

---

**System Status**: ✅ Ready for hardware testing
**Last Updated**: January 3, 2026
