import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('❌ Response error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ==================== BOOTH ENDPOINTS ====================

export const boothAPI = {
  // Get all booths
  getAll: async () => {
    const response = await api.get('/booths');
    return response.data;
  },

  // Get booth by ID
  getById: async (id) => {
    const response = await api.get(`/booths/${id}`);
    return response.data;
  },

  // Create new booth
  create: async (boothData) => {
    const response = await api.post('/booths', boothData);
    return response.data;
  },

  // Update booth
  update: async (id, boothData) => {
    const response = await api.put(`/booths/${id}`, boothData);
    return response.data;
  },

  // Delete booth
  delete: async (id) => {
    const response = await api.delete(`/booths/${id}`);
    return response.data;
  },

  // Check geofence - determine which booth user is in
  checkGeofence: async (latitude, longitude) => {
    const response = await api.post('/booths/check-geofence', {
      latitude,
      longitude
    });
    return response.data;
  }
};

// ==================== UNIT ENDPOINTS ====================

export const unitAPI = {
  // Get all units (optionally filter by boothId)
  getAll: async (boothId = null) => {
    const url = boothId ? `/units?boothId=${boothId}` : '/units';
    const response = await api.get(url);
    return response.data;
  },

  // Get unit by ID
  getById: async (id) => {
    const response = await api.get(`/units/${id}`);
    return response.data;
  },

  // Create new unit
  create: async (unitData) => {
    const response = await api.post('/units', unitData);
    return response.data;
  },

  // Update unit
  update: async (id, unitData) => {
    const response = await api.put(`/units/${id}`, unitData);
    return response.data;
  },

  // Delete unit
  delete: async (id) => {
    const response = await api.delete(`/units/${id}`);
    return response.data;
  },

  // Park a cycle in a unit
  parkCycle: async (unitId, rfid, userLat, userLon) => {
    const response = await api.post('/units/park', {
      unitId,
      rfid,
      userLat,
      userLon
    });
    return response.data;
  },

  // Take a cycle from a unit
  takeCycle: async (unitId, rfid, userLat, userLon) => {
    const response = await api.post('/units/take', {
      unitId,
      rfid,
      userLat,
      userLon
    });
    return response.data;
  }
};

// ==================== CYCLE ENDPOINTS ====================

export const cycleAPI = {
  // Get all cycles (optionally filter by status)
  getAll: async (status = null) => {
    const url = status ? `/cycles?status=${status}` : '/cycles';
    const response = await api.get(url);
    return response.data;
  },

  // Get cycle by RFID
  getByRfid: async (rfid) => {
    const response = await api.get(`/cycles/${rfid}`);
    return response.data;
  },

  // Create new cycle
  create: async (cycleData) => {
    const response = await api.post('/cycles', cycleData);
    return response.data;
  },

  // Update cycle
  update: async (rfid, cycleData) => {
    const response = await api.put(`/cycles/${rfid}`, cycleData);
    return response.data;
  },

  // Delete cycle
  delete: async (rfid) => {
    const response = await api.delete(`/cycles/${rfid}`);
    return response.data;
  }
};

// Health check
export const healthCheck = async () => {
  const response = await api.get('/health', { baseURL: 'http://localhost:5000' });
  return response.data;
};

export default api;
