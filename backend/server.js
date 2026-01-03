const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n[${ timestamp}] ${req.method} ${req.url}`);
  if (req.method === 'POST' && req.body) {
    console.log('Body:', JSON.stringify(req.body));
  }
  if (req.headers.authorization) {
    console.log('Auth: Token present');
  }
  next();
});

// In-memory data store
const station = {
  id: "station1",
  name: "Main Station"
};

const cycles = [
  { id: "A", name: "Cycle A", status: "AVAILABLE", rfidTag: "58274325810955" },
  { id: "B", name: "Cycle B", status: "AVAILABLE", rfidTag: "83563908408000" },
  { id: "C", name: "Cycle C", status: "AVAILABLE", rfidTag: "0004002724" },
  { id: "D", name: "Cycle D", status: "IN_USE", rfidTag: "0004002725" }
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
// RFID to Cycle mapping (each cycle has an RFID tag)
const rfidToCycle = new Map();
rfidToCycle.set("0004002722", "A");    // Cycle A's RFID tag
rfidToCycle.set("0004002723", "B");    // Cycle B's RFID tag
rfidToCycle.set("0004002724", "C");    // Cycle C's RFID tag
rfidToCycle.set("0004002725", "D");    // Cycle D's RFID tag



// RFID scan logs (for analytics)
const rfidLogs = [];

// Unlock command (edge-triggered)
let unlockCommand = {
  pending: false,
  cycleId: null,
  rfidTag: null,
  timestamp: null
};

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
  const cycle = cycles.find(c => c.id === cycleId);
  if (cycle && cycle.rfidTag) {
    unlockCommand = {
      pending: true,
      cycleId: cycleId,
      rfidTag: cycle.rfidTag,
      timestamp: new Date().toISOString()
    };
    console.log(`🔓 UNLOCK REQUEST: Cycle ${cycleId} (RFID: ${cycle.rfidTag}) - Status: ${cycle.status} → IN_USE`);
  } else {
    console.log(`❌ Cannot unlock cycle ${cycleId} - RFID tag missing`);
  }
}

function lockCycle(cycleId) {
  // Lock is handled by ESP32 auto-close or RFID tap
  console.log(`🔒 Locking cycle ${cycleId} - handled by ESP32`);
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
  console.log('\n🎯 BOOK ENDPOINT HIT');
  console.log('User:', req.user?.username);
  console.log('Request body:', req.body);
  
  const { cycleId } = req.body;
  
  if (!cycleId) {
    console.log('❌ ERROR: cycleId missing in request');
    return res.status(400).json({
      success: false,
      message: 'cycleId is required'
    });
  }
  
  console.log('✅ cycleId received:', cycleId);
  
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
  
  const bookingTime = new Date().toISOString();
  
  // Store active booking
  activeBookings.set(req.userToken, {
    cycleId,
    cycleName: cycle.name,
    startTime: bookingTime,
    unlockMethod: 'HARDWARE_RFID'
  });
  
  console.log(`📱 Cycle ${cycleId} booked by ${req.user.username} - Hardware unlock triggered`);
  
  res.json({
    success: true,
    message: 'Cycle unlocked via hardware',
    cycle: cycle,
    rfidTag: cycle.rfidTag,
    unlockMethod: 'HARDWARE_RFID',
    bookingTime: bookingTime,
    note: 'ESP32 will unlock solenoid when it polls /command endpoint'
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

// POST /rfid - ESP32 sends RFID scan when cycle is docked/returned
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
  
  // Check which cycle this RFID belongs to
  const cycleId = rfidToCycle.get(rfid);
  
  if (!cycleId) {
    console.log(`❌ Unknown RFID tag: ${rfid}`);
    return res.json({ 
      success: false, 
      message: 'RFID tag not registered to any cycle',
      action: 'UNKNOWN_CYCLE'
    });
  }
  
  const cycle = cycles.find(c => c.id === cycleId);
  
  if (!cycle) {
    console.log(`❌ Cycle ${cycleId} not found in system`);
    return res.json({
      success: false,
      message: 'Cycle not found',
      action: 'ERROR'
    });
  }
  
  // Check if cycle is currently in use (being returned)
  if (cycle.status === 'IN_USE') {
    // Find who has this cycle booked
    let userToken = null;
    let booking = null;
    let username = null;
    
    for (const [token, bookingData] of activeBookings.entries()) {
      if (bookingData.cycleId === cycleId) {
        userToken = token;
        booking = bookingData;
        username = sessions.get(token)?.username || 'unknown';
        break;
      }
    }
    
    if (booking) {
      // Process cycle return
      setCycleStatus(cycleId, 'AVAILABLE');
      
      const endTime = new Date().toISOString();
      const startTime = new Date(booking.startTime);
      const duration = Math.floor((new Date() - startTime) / 60000); // minutes
      
      // Add to history
      rideHistory.push({
        id: `ride_${Date.now()}`,
        username: username,
        cycleId: cycleId,
        cycleName: cycle.name,
        startTime: booking.startTime,
        endTime: endTime,
        duration: duration,
        distance: (Math.random() * 5 + 1).toFixed(1)
      });
      
      activeBookings.delete(userToken);
      
      console.log(`✅ CYCLE RETURNED: ${cycle.name} by ${username} (${duration} min) - Status: IN_USE → AVAILABLE`);
      
      return res.json({
        success: true,
        message: 'Cycle returned successfully',
        cycle: cycle.name,
        cycleId: cycleId,
        returnedBy: username,
        duration: duration,
        action: 'RETURN_SUCCESS'
      });
    }
    
    // Cycle marked IN_USE but no booking found - reset it
    console.log(`⚠️ ${cycle.name} was IN_USE but no booking found, resetting to AVAILABLE`);
    setCycleStatus(cycleId, 'AVAILABLE');
    
    return res.json({
      success: true,
      message: 'Cycle status reset to available',
      cycle: cycle.name,
      action: 'RESET'
    });
  }
  
  // Cycle is already available - just acknowledge the scan
  console.log(`ℹ️ ${cycle.name} scanned (already available)`);
  return res.json({
    success: true,
    message: 'Cycle is already available',
    cycle: cycle.name,
    cycleId: cycleId,
    status: cycle.status,
    action: 'ALREADY_AVAILABLE'
  });
});

// GET /command - ESP32 polls this for unlock commands
app.get('/command', (req, res) => {
  // Return current unlock command
  const response = {
    unlock: unlockCommand.pending,
    cycleId: unlockCommand.cycleId,
    rfidTag: unlockCommand.rfidTag
  };
  
  // Edge-triggered: reset after sending
  if (unlockCommand.pending) {
    console.log(`📡 ESP32 POLLING: Sending unlock for Cycle ${unlockCommand.cycleId} (RFID: ${unlockCommand.rfidTag})`);
    unlockCommand = {
      pending: false,
      cycleId: null,
      rfidTag: null,
      timestamp: null
    };
  }
  
  res.json(response);
});

// POST /command/unlock - Expo app calls this to trigger unlock
app.post('/command/unlock', authenticate, (req, res) => {
  const { cycleId } = req.body;
  
  if (!cycleId) {
    return res.status(400).json({ success: false, message: 'cycleId required' });
  }
  
  unlockCycle(cycleId);
  console.log(`🎯 Manual unlock triggered by ${req.user.username} for Cycle ${cycleId}`);
  
  res.json({
    success: true,
    message: 'Unlock command sent',
    cycleId: cycleId,
    rfidTag: cycles.find(c => c.id === cycleId)?.rfidTag,
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

// POST /api/rfid/register - Register RFID tag to a cycle
app.post('/api/rfid/register', authenticate, (req, res) => {
  const { rfid, cycleId } = req.body;
  
  if (!rfid || !cycleId) {
    return res.status(400).json({
      success: false,
      message: 'RFID and cycleId required'
    });
  }
  
  const cycle = cycles.find(c => c.id === cycleId);
  if (!cycle) {
    return res.status(404).json({
      success: false,
      message: 'Cycle not found'
    });
  }
  
  rfidToCycle.set(rfid, cycleId);
  console.log(`🔖 RFID ${rfid} registered to ${cycle.name}`);
  
  res.json({
    success: true,
    message: `RFID tag registered to ${cycle.name}`,
    rfid: rfid,
    cycleId: cycleId,
    cycleName: cycle.name
  });
});

// GET /api/rfid/tags - List registered RFID tags for cycles
app.get('/api/rfid/tags', authenticate, (req, res) => {
  const tags = Array.from(rfidToCycle.entries()).map(([rfid, cycleId]) => {
    const cycle = cycles.find(c => c.id === cycleId);
    return {
      rfid,
      cycleId,
      cycleName: cycle?.name || 'Unknown'
    };
  });
  
  res.json({
    success: true,
    count: tags.length,
    tags: tags
  });
});

// GET /api/hardware/status - Hardware status for debugging
app.get('/api/hardware/status', (req, res) => {
  res.json({
    success: true,
    unlockCommand: unlockCommand,
    registeredTags: rfidToCycle.size,
    activeBookings: Array.from(activeBookings.entries()).map(([token, booking]) => ({
      username: sessions.get(token)?.username,
      ...booking
    })),
    cycles: cycles.map(c => ({ id: c.id, name: c.name, status: c.status, rfidTag: c.rfidTag })),
    recentScans: rfidLogs.slice(-5)
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 CampusCycle Backend running on http://localhost:${PORT}`);
  console.log(`📊 Station: ${station.name}`);
  console.log(`🚲 Cycles: ${cycles.length} total`);
  console.log(`👥 Users: ${users.length} registered`);
  console.log(`🔖 RFID Tags: ${rfidToCycle.size} registered to cycles`);
  console.log('\n===== ESP32 Hardware Endpoints =====');
  console.log(`POST /rfid           ← ESP32 sends cycle RFID when docked`);
  console.log(`GET  /command        ← ESP32 polls for unlock command`);
  console.log(`POST /command/unlock ← App triggers unlock`);
  console.log(`GET  /api/rfid/tags  ← List cycle RFID tags`);
  console.log(`GET  /api/hardware/status ← Debug info`);
  console.log('=====================================\n');
});

module.exports = app;