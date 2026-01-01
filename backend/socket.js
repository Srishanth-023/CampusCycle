/**
 * Socket.IO Configuration
 * Handles real-time communication for unit status updates
 */

const initializeSocket = (io) => {
  // Track connected clients
  let connectedClients = 0;

  io.on('connection', (socket) => {
    connectedClients++;
    console.log(`🔌 Client connected. Total clients: ${connectedClients}`);
    console.log(`   Socket ID: ${socket.id}`);

    // Send initial connection confirmation
    socket.emit('connected', {
      message: 'Connected to Campus Cycle server',
      socketId: socket.id
    });

    // Handle client location updates (for geofence checking)
    socket.on('updateLocation', (data) => {
      const { latitude, longitude } = data;
      console.log(`📍 Location update from ${socket.id}: lat=${latitude}, lon=${longitude}`);
      
      // You can add additional logic here if needed
      // For example, automatically determine which booth they're in
    });

    // Handle manual unit status requests
    socket.on('requestUnitStatus', async (data) => {
      const { boothId } = data;
      try {
        const Unit = require('./models/Unit');
        const units = await Unit.find({ boothId }).populate('boothId', 'name location');
        
        socket.emit('unitStatusUpdate', {
          boothId,
          units
        });
      } catch (error) {
        socket.emit('error', {
          message: 'Error fetching unit status',
          error: error.message
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      connectedClients--;
      console.log(`🔌 Client disconnected. Total clients: ${connectedClients}`);
      console.log(`   Socket ID: ${socket.id}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`❌ Socket error from ${socket.id}:`, error);
    });
  });

  // Broadcast function for unit updates (called from controllers)
  io.broadcastUnitUpdate = (unit) => {
    io.emit('unitUpdated', { unit });
    console.log(`📡 Broadcasted unit update: ${unit.unitId} - ${unit.status}`);
  };

  console.log('✅ Socket.IO initialized');
};

module.exports = initializeSocket;
