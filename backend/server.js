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
  // Placeholder: In future, send MQTT unlock command to ESP32
  console.log(`🔓 Unlocking cycle ${cycleId} (MQTT command will be added here)`);
  // Future: mqtt.publish(`cycles/${cycleId}/unlock`, 'true');
}

function lockCycle(cycleId) {
  // Placeholder: In future, send MQTT lock command to ESP32  
  console.log(`🔒 Locking cycle ${cycleId} (MQTT command will be added here)`);
  // Future: mqtt.publish(`cycles/${cycleId}/lock`, 'true');
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 CampusCycle Backend running on http://localhost:${PORT}`);
  console.log(`📊 Station: ${station.name}`);
  console.log(`🚲 Cycles: ${cycles.length} total`);
  console.log(`👥 Users: ${users.length} registered`);
  console.log('\n===== Hardware Integration Points =====');
  console.log('• unlockCycle() - Add MQTT unlock command');
  console.log('• lockCycle() - Add MQTT lock command');
  console.log('• setCycleStatus() - Ready for DB integration');
  console.log('=====================================\n');
});

module.exports = app;