// API Service for CampusCycle
// For web: use localhost
// For mobile device: use your computer's IP address (e.g., 192.168.0.105)

import { Platform } from 'react-native';

// Auto-detect: use localhost for web, IP for native mobile
const API_BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:3000/api'
  : 'http://192.168.0.105:3000/api'; // Change this IP to your computer's IP for mobile testing

export interface User {
  username: string;
}

export interface Cycle {
  id: string;
  name: string;
  status: 'AVAILABLE' | 'IN_USE';
}

export interface Station {
  id: string;
  name: string;
}

export interface RideStats {
  duration: number;
  distance: string;
  returnTime: string;
}

export interface RideHistory {
  id: string;
  cycleId: string;
  cycleName: string;
  startTime: string;
  endTime: string;
  duration: number;
  distance: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface CyclesResponse {
  success: boolean;
  station: Station;
  cycles: Cycle[];
}

export interface BookingResponse {
  success: boolean;
  message: string;
  cycle: Cycle;
  otp: string;
  bookingTime: string;
}

export interface ReturnResponse {
  success: boolean;
  message: string;
  cycle: Cycle;
  rideStats: RideStats;
}

export interface HistoryResponse {
  success: boolean;
  history: RideHistory[];
}

export interface HealthResponse {
  success: boolean;
  message: string;
  timestamp: string;
  station: string;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  getToken() {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    body?: Record<string, unknown>
  ): Promise<T> {
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (this.token) {
      (config.headers as Record<string, string>).Authorization = `Bearer ${this.token}`;
    }

    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error: any) {
      console.error('API Error:', error);
      if (error.message.includes('Network request failed') || error.name === 'TypeError') {
        throw new Error('Cannot connect to server. Make sure the backend is running and you are on the same network.');
      }
      throw error;
    }
  }

  // Health check
  async checkHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health');
  }

  // Authentication
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/login', 'POST', {
      username,
      password,
    });
    if (response.success && response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.request<{ success: boolean; message: string }>('/logout', 'POST');
      this.setToken(null);
      return response;
    } catch (error) {
      this.setToken(null);
      throw error;
    }
  }

  // Cycles
  async getCycles(): Promise<CyclesResponse> {
    return this.request<CyclesResponse>('/cycles');
  }

  async bookCycle(cycleId: string): Promise<BookingResponse> {
    return this.request<BookingResponse>('/book', 'POST', { cycleId });
  }

  async returnCycle(cycleId: string): Promise<ReturnResponse> {
    return this.request<ReturnResponse>('/return', 'POST', { cycleId });
  }

  // History
  async getHistory(): Promise<HistoryResponse> {
    return this.request<HistoryResponse>('/history');
  }
}

export const apiService = new ApiService();
export default apiService;
