const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory data store
const station = {
  id: "station1",
  name: "Main Station"
};

const cycles = [
  { id: "A", name: "Cycle A", status: "AVAILABLE" },
  { id: "B", name: "Cycle B", status: "AVAILABLE" },
  { id: "C", name: "Cycle C", status: "AVAILABLE" },
  { id: "D", name: "Cycle D", status: "IN_USE" }
];

// In-memory user store (hardcoded for V0)
const users = [
  { username: "admin", password: "password" },
  { username: "student", password: "student123" }
];

// Simple session store (in-memory)
const sessions = new Map(); // Changed to Map to store user info with token

// Ride history store (in-memory)
const rideHistory = [];

// Active bookings store
const activeBookings = new Map(); // token -> { cycleId, cycleName, startTime }

// ===== ESP32 HARDWARE INTEGRATION =====
// RFID to User mapping
const rfidToUser = new Map();
rfidToUser.set("123456789", "admin");    // Add your RFID card numbers here
rfidToUser.set("987654321", "student");

// RFID scan logs (for analytics)
const rfidLogs = [];

// Unlock command flag (edge-triggered)
let unlockFlag = false;

// ESP32 API Key for security
const ESP32_API_KEY = process.env.ESP32_KEY || "CAMPUS_CYCLE_ESP32_SECRET";

// ===== HARDWARE-COMPATIBLE HELPER FUNCTIONS =====
// These functions will later contain MQTT/ESP32 communication

function setCycleStatus(cycleId, status) {
  const cycle = cycles.find(c => c.id === cycleId);
  if (cycle) {
    cycle.status = status;
    console.log(`✅ Cycle ${cycleId} status updated to: ${status}`);
    return true;
  }
  console.log(`❌ Cycle ${cycleId} not found`);
  return false;
}

function unlockCycle(cycleId) {
  // Set unlock flag for ESP32 polling
  unlockFlag = true;
  console.log(`🔓 Unlocking cycle ${cycleId} - ESP32 unlock flag SET`);
}

function lockCycle(cycleId) {
  // Lock is handled by ESP32 auto-close or RFID tap
  console.log(`🔒 Locking cycle ${cycleId} - handled by ESP32`);
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateSessionToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Simple auth middleware
function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }
  
  // Attach user info to request
  req.userToken = token;
  req.user = sessions.get(token);
  
  next();
}

// ===== API ENDPOINTS =====

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required'
    });
  }
  
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
  
  const token = generateSessionToken();
  sessions.set(token, { username: user.username });
  
  console.log(`✅ User ${username} logged in successfully`);
  
  res.json({
    success: true,
    message: 'Login successful',
    token: token,
    user: { username: user.username }
  });
});

// Logout endpoint
app.post('/api/logout', authenticate, (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  sessions.delete(token);
  activeBookings.delete(token);
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Get all cycles
app.get('/api/cycles', authenticate, (req, res) => {
  res.json({
    success: true,
    station: station,
    cycles: cycles
  });
});

// Book a cycle
app.post('/api/book', authenticate, (req, res) => {
  const { cycleId } = req.body;
  
  if (!cycleId) {
    return res.status(400).json({
      success: false,
      message: 'cycleId is required'
    });
  }
  
  const cycle = cycles.find(c => c.id === cycleId);
  
  if (!cycle) {
    return res.status(404).json({
      success: false,
      message: 'Cycle not found'
    });
  }
  
  if (cycle.status !== 'AVAILABLE') {
    return res.status(400).json({
      success: false,
      message: 'Cycle is not available for booking'
    });
  }
  
  // Update cycle status and trigger hardware unlock
  setCycleStatus(cycleId, 'IN_USE');
  unlockCycle(cycleId); // Hardware compatibility function
  
  const otp = generateOTP();
  const bookingTime = new Date().toISOString();
  
  // Store active booking
  activeBookings.set(req.userToken, {
    cycleId,
    cycleName: cycle.name,
    startTime: bookingTime,
    otp
  });
  
  console.log(`📱 Cycle ${cycleId} booked successfully, OTP: ${otp}`);
  
  res.json({
    success: true,
    message: 'Cycle booked successfully',
    cycle: cycle,
    otp: otp,
    bookingTime: bookingTime
  });
});

// Return a cycle
app.post('/api/return', authenticate, (req, res) => {
  const { cycleId } = req.body;
  
  if (!cycleId) {
    return res.status(400).json({
      success: false,
      message: 'cycleId is required'
    });
  }
  
  const cycle = cycles.find(c => c.id === cycleId);
  
  if (!cycle) {
    return res.status(404).json({
      success: false,
      message: 'Cycle not found'
    });
  }
  
  if (cycle.status !== 'IN_USE') {
    return res.status(400).json({
      success: false,
      message: 'Cycle is not currently in use'
    });
  }
  
  // Update cycle status and trigger hardware lock
  setCycleStatus(cycleId, 'AVAILABLE');
  lockCycle(cycleId); // Hardware compatibility function
  
  // Get booking info before removing
  const booking = activeBookings.get(req.userToken);
  const endTime = new Date().toISOString();
  
  // Mock ride statistics
  const rideStats = {
    duration: Math.floor(Math.random() * 60 + 15), // 15-75 minutes
    distance: (Math.random() * 5 + 1).toFixed(1), // 1-6 km
    returnTime: endTime
  };
  
  // Add to ride history
  if (booking) {
    rideHistory.push({
      id: `ride_${Date.now()}`,
      username: req.user.username,
      cycleId: cycleId,
      cycleName: cycle.name,
      startTime: booking.startTime,
      endTime: endTime,
      duration: rideStats.duration,
      distance: rideStats.distance
    });
    
    // Remove active booking
    activeBookings.delete(req.userToken);
  }
  
  console.log(`🚲 Cycle ${cycleId} returned successfully`);
  
  res.json({
    success: true,
    message: 'Cycle returned successfully',
    cycle: cycle,
    rideStats: rideStats
  });
});

// Get ride history
app.get('/api/history', authenticate, (req, res) => {
  // Filter history for current user
  const userHistory = rideHistory
    .filter(ride => ride.username === req.user.username)
    .sort((a, b) => new Date(b.endTime) - new Date(a.endTime));
  
  res.json({
    success: true,
    history: userHistory
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CampusCycle API is running',
    timestamp: new Date().toISOString(),
    station: station.name
  });
});

// =====================================================
// ===== ESP32 HARDWARE ENDPOINTS =====
// =====================================================

// POST /rfid - ESP32 sends RFID scan here
app.post('/rfid', (req, res) => {
  const { rfid } = req.body;
  
  console.log(`🔖 RFID Scan received: ${rfid}`);
  
  if (!rfid) {
    return res.status(400).json({ success: false, message: 'RFID required' });
  }
  
  // Log the scan (for analytics)
  rfidLogs.push({
    rfid,
    timestamp: new Date().toISOString()
  });
  
  // Check if RFID is registered
  const username = rfidToUser.get(rfid);
  
  if (!username) {
    console.log(`❌ Unknown RFID: ${rfid}`);
    return res.json({ 
      success: false, 
      message: 'RFID not registered',
      action: 'DENY'
    });
  }
  
  // Find user's active booking
  let userToken = null;
  let booking = null;
  
  for (const [token, userData] of sessions.entries()) {
    if (userData.username === username && activeBookings.has(token)) {
      userToken = token;
      booking = activeBookings.get(token);
      break;
    }
  }
  
  if (!booking) {
    console.log(`ℹ️ RFID ${rfid} (${username}) - No active booking`);
    return res.json({
      success: true,
      message: 'RFID recognized, no active booking',
      username: username,
      action: 'ACKNOWLEDGE'
    });
  }
  
  // Process cycle return
  const cycle = cycles.find(c => c.id === booking.cycleId);
  if (cycle) {
    setCycleStatus(booking.cycleId, 'AVAILABLE');
    
    const endTime = new Date().toISOString();
    const startTime = new Date(booking.startTime);
    const duration = Math.floor((new Date() - startTime) / 60000); // minutes
    
    // Add to history
    rideHistory.push({
      id: `ride_${Date.now()}`,
      username: username,
      cycleId: booking.cycleId,
      cycleName: booking.cycleName,
      startTime: booking.startTime,
      endTime: endTime,
      duration: duration,
      distance: (Math.random() * 5 + 1).toFixed(1)
    });
    
    activeBookings.delete(userToken);
    
    console.log(`✅ Cycle ${booking.cycleName} returned via RFID by ${username}`);
    
    return res.json({
      success: true,
      message: 'Cycle returned successfully',
      username: username,
      cycle: booking.cycleName,
      duration: duration,
      action: 'RETURN_SUCCESS'
    });
  }
  
  res.json({ success: false, message: 'Error processing return' });
});

// GET /command - ESP32 polls this for unlock commands
app.get('/command', (req, res) => {
  // Return current unlock flag
  const response = { unlock: unlockFlag };
  
  // Edge-triggered: reset flag after sending
  if (unlockFlag) {
    console.log(`📡 Unlock command sent to ESP32`);
    unlockFlag = false; // Reset immediately (edge-triggered)
  }
  
  res.json(response);
});

// POST /command/unlock - Expo app calls this to trigger unlock
app.post('/command/unlock', authenticate, (req, res) => {
  unlockFlag = true;
  console.log(`🎯 Unlock triggered by ${req.user.username} via app`);
  
  res.json({
    success: true,
    message: 'Unlock command sent',
    note: 'ESP32 will receive in next poll cycle (≤2 seconds)'
  });
});

// GET /rfid/logs - Get RFID scan history (for Expo app)
app.get('/api/rfid/logs', authenticate, (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const logs = rfidLogs.slice(-limit).reverse();
  
  res.json({
    success: true,
    count: logs.length,
    logs: logs
  });
});

// POST /api/rfid/register - Register new RFID card
app.post('/api/rfid/register', authenticate, (req, res) => {
  const { rfid, username } = req.body;
  
  if (!rfid || !username) {
    return res.status(400).json({
      success: false,
      message: 'RFID and username required'
    });
  }
  
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  rfidToUser.set(rfid, username);
  console.log(`🔖 RFID ${rfid} registered to ${username}`);
  
  res.json({
    success: true,
    message: `RFID registered to ${username}`,
    rfid: rfid
  });
});

// GET /api/rfid/cards - List registered RFID cards
app.get('/api/rfid/cards', authenticate, (req, res) => {
  const cards = Array.from(rfidToUser.entries()).map(([rfid, username]) => ({
    rfid,
    username
  }));
  
  res.json({
    success: true,
    count: cards.length,
    cards: cards
  });
});

// GET /api/hardware/status - Hardware status for debugging
app.get('/api/hardware/status', (req, res) => {
  res.json({
    success: true,
    unlockPending: unlockFlag,
    registeredCards: rfidToUser.size,
    activeBookings: activeBookings.size,
    recentScans: rfidLogs.slice(-5)
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 CampusCycle Backend running on http://localhost:${PORT}`);
  console.log(`📊 Station: ${station.name}`);
  console.log(`🚲 Cycles: ${cycles.length} total`);
  console.log(`👥 Users: ${users.length} registered`);
  console.log(`🔖 RFID Cards: ${rfidToUser.size} registered`);
  console.log('\n===== ESP32 Hardware Endpoints =====');
  console.log(`POST /rfid          ← ESP32 sends RFID scans`);
  console.log(`GET  /command       ← ESP32 polls for unlock`);
  console.log(`POST /command/unlock ← App triggers unlock`);
  console.log(`GET  /api/rfid/logs  ← View scan history`);
  console.log(`GET  /api/hardware/status ← Debug info`);
  console.log('=====================================\n');
});

module.exports = app;