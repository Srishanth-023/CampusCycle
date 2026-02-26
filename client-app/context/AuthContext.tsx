import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService, { User, Cycle, Station, RideHistory } from '../services/api';

interface ActiveBooking {
  cycleId: string;
  cycleName: string;
  unlockMethod: string;
  bookingTime: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;
  station: Station | null;
  cycles: Cycle[];
  activeBooking: ActiveBooking | null;
  rideHistory: RideHistory[];
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchCycles: () => Promise<void>;
  bookCycle: (cycleId: string) => Promise<{ success: boolean; message?: string; rfidTag?: string; unlockMethod?: string }>;
  returnCycle: (cycleId: string) => Promise<{ success: boolean; rideStats?: any; message?: string }>;
  fetchHistory: () => Promise<void>;
  testConnection: () => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = 'campuscycle_auth_token';
const USER_KEY = 'campuscycle_user';
const ACTIVE_BOOKING_KEY = 'campuscycle_active_booking';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [station, setStation] = useState<Station | null>(null);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [activeBooking, setActiveBooking] = useState<ActiveBooking | null>(null);
  const [rideHistory, setRideHistory] = useState<RideHistory[]>([]);

  // Load saved auth state on mount
  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      const savedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      const savedUser = await AsyncStorage.getItem(USER_KEY);
      const savedBooking = await AsyncStorage.getItem(ACTIVE_BOOKING_KEY);

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        apiService.setToken(savedToken);
        setIsLoggedIn(true);
        
        // Fetch cycles after restoring auth, then validate the saved booking
        try {
          const cyclesResponse = await apiService.getCycles();
          if (cyclesResponse.success) {
            setCycles(cyclesResponse.cycles);
            setStation(cyclesResponse.station);
          }

          if (savedBooking) {
            const booking = JSON.parse(savedBooking);
            const bookedCycle = cyclesResponse?.cycles?.find((c: { id: string; status: string }) => c.id === booking.cycleId);

            if (bookedCycle && bookedCycle.status === 'IN_USE') {
              // Cycle is still in use — restore the active booking
              setActiveBooking(booking);
            } else {
              // Server was restarted or cycle was returned externally — discard stale booking
              console.log('Stale booking detected (cycle not IN_USE on server), clearing local booking');
              await AsyncStorage.removeItem(ACTIVE_BOOKING_KEY);
            }
          }
        } catch (error) {
          // If token is invalid, clear auth state
          console.log('Token expired, clearing auth state');
          await clearAuthState();
        }
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuthState = async () => {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
    await AsyncStorage.removeItem(ACTIVE_BOOKING_KEY);
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
    setActiveBooking(null);
    setCycles([]);
    setStation(null);
    setRideHistory([]);
    apiService.setToken(null);
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.login(username, password);
      
      if (response.success) {
        setToken(response.token);
        setUser(response.user);
        setIsLoggedIn(true);
        
        // Save to storage
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, response.token);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user));
        
        // Fetch cycles after login
        await fetchCycles();
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await clearAuthState();
    }
  };

  const fetchCycles = async () => {
    if (!apiService.getToken()) return; // no token yet — skip silently
    try {
      const response = await apiService.getCycles();
      if (response.success) {
        setCycles(response.cycles);
        setStation(response.station);
      }
    } catch (error) {
      console.error('Fetch cycles error:', error);
      throw error;
    }
  };

  const bookCycle = async (cycleId: string): Promise<{ success: boolean; message?: string; rfidTag?: string; unlockMethod?: string }> => {
    console.log('📞 AuthContext.bookCycle called with cycleId:', cycleId);
    try {
      console.log('📡 Calling apiService.bookCycle...');
      const response = await apiService.bookCycle(cycleId);
      console.log('📥 API response received:', response);
      
      if (response.success) {
        const booking: ActiveBooking = {
          cycleId: response.cycle.id,
          cycleName: response.cycle.name,
          unlockMethod: response.unlockMethod || 'HARDWARE_RFID',
          bookingTime: response.bookingTime,
        };
        
        console.log('💾 Saving booking to storage:', booking);
        setActiveBooking(booking);
        await AsyncStorage.setItem(ACTIVE_BOOKING_KEY, JSON.stringify(booking));
        
        // Refresh cycles list
        console.log('🔄 Refreshing cycles list...');
        await fetchCycles();
        
        return { 
          success: true, 
          message: response.message,
          rfidTag: response.rfidTag,
          unlockMethod: response.unlockMethod
        };
      }
      
      console.log('❌ Booking failed:', response.message);
      return { success: false, message: response.message };
    } catch (error: any) {
      console.error('❌ Exception in bookCycle:', error);
      return { success: false, message: error.message };
    }
  };

  const returnCycle = async (cycleId: string): Promise<{ success: boolean; rideStats?: any; message?: string }> => {
    try {
      const response = await apiService.returnCycle(cycleId);
      
      if (response.success) {
        setActiveBooking(null);
        await AsyncStorage.removeItem(ACTIVE_BOOKING_KEY);
        
        // Refresh cycles and history
        await fetchCycles();
        await fetchHistory();
        
        return { success: true, rideStats: response.rideStats };
      }
      
      return { success: false, message: response.message };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await apiService.getHistory();
      if (response.success) {
        setRideHistory(response.history);
      }
    } catch (error) {
      console.error('Fetch history error:', error);
    }
  };

  const testConnection = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiService.checkHealth();
      return { success: true, message: response.message };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isLoading,
        user,
        token,
        station,
        cycles,
        activeBooking,
        rideHistory,
        login,
        logout,
        fetchCycles,
        bookCycle,
        returnCycle,
        fetchHistory,
        testConnection,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
