import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Create socket instance
const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

// Connection event handlers
socket.on('connect', () => {
  console.log('✅ Connected to server with socket ID:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Disconnected from server. Reason:', reason);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error);
});

socket.on('connected', (data) => {
  console.log('📡 Server confirmation:', data);
});

// Export socket instance and helper functions
export const socketInstance = socket;

// Subscribe to unit updates
export const onUnitUpdate = (callback) => {
  socket.on('unitUpdated', callback);
  
  // Return unsubscribe function
  return () => socket.off('unitUpdated', callback);
};

// Request unit status for a specific booth
export const requestUnitStatus = (boothId) => {
  socket.emit('requestUnitStatus', { boothId });
};

// Send location update to server
export const sendLocationUpdate = (latitude, longitude) => {
  socket.emit('updateLocation', { latitude, longitude });
};

// Listen for unit status updates
export const onUnitStatusUpdate = (callback) => {
  socket.on('unitStatusUpdate', callback);
  return () => socket.off('unitStatusUpdate', callback);
};

// Listen for errors
export const onSocketError = (callback) => {
  socket.on('error', callback);
  return () => socket.off('error', callback);
};

export default socket;
