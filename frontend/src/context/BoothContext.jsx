import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { boothAPI, unitAPI } from '../api';
import { onUnitUpdate, sendLocationUpdate } from '../socket';

const BoothContext = createContext();

export const useBoothContext = () => {
  const context = useContext(BoothContext);
  if (!context) {
    throw new Error('useBoothContext must be used within a BoothProvider');
  }
  return context;
};

export const BoothProvider = ({ children }) => {
  // State
  const [booths, setBooths] = useState([]);
  const [units, setUnits] = useState([]);
  const [activeBoothId, setActiveBoothId] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [geolocationSupported, setGeolocationSupported] = useState(true);

  // Fetch all booths
  const fetchBooths = useCallback(async () => {
    try {
      const response = await boothAPI.getAll();
      setBooths(response.data || []);
    } catch (err) {
      console.error('Error fetching booths:', err);
      setError('Failed to fetch booths');
    }
  }, []);

  // Fetch all units
  const fetchUnits = useCallback(async (boothId = null) => {
    try {
      const response = await unitAPI.getAll(boothId);
      setUnits(response.data || []);
    } catch (err) {
      console.error('Error fetching units:', err);
      setError('Failed to fetch units');
    }
  }, []);

  // Check geofence based on user location
  const checkGeofence = useCallback(async (lat, lon) => {
    try {
      const response = await boothAPI.checkGeofence(lat, lon);
      setActiveBoothId(response.activeBoothId);
      
      // Send location update via Socket.IO
      sendLocationUpdate(lat, lon);
      
      return response.activeBoothId;
    } catch (err) {
      console.error('Error checking geofence:', err);
      setActiveBoothId(null);
      return null;
    }
  }, []);

  // Get user's current location
  const updateUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeolocationSupported(false);
      console.error('Geolocation is not supported by this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        checkGeofence(latitude, longitude);
      },
      (err) => {
        console.error('Error getting location:', err);
        setError('Failed to get your location. Please enable location services.');
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  }, [checkGeofence]);

  // Park a cycle
  const parkCycle = useCallback(async (unitId, rfid) => {
    if (!userLocation) {
      throw new Error('Location not available');
    }

    try {
      const response = await unitAPI.parkCycle(
        unitId,
        rfid,
        userLocation.latitude,
        userLocation.longitude
      );
      
      // Refresh units after parking
      await fetchUnits();
      
      return response;
    } catch (err) {
      console.error('Error parking cycle:', err);
      throw err;
    }
  }, [userLocation, fetchUnits]);

  // Take a cycle
  const takeCycle = useCallback(async (unitId, rfid) => {
    if (!userLocation) {
      throw new Error('Location not available');
    }

    try {
      const response = await unitAPI.takeCycle(
        unitId,
        rfid,
        userLocation.latitude,
        userLocation.longitude
      );
      
      // Refresh units after taking
      await fetchUnits();
      
      return response;
    } catch (err) {
      console.error('Error taking cycle:', err);
      throw err;
    }
  }, [userLocation, fetchUnits]);

  // Get units for a specific booth
  const getBoothUnits = useCallback((boothId) => {
    return units.filter(unit => unit.boothId._id === boothId);
  }, [units]);

  // Check if user is in a specific booth's geofence
  const isInBoothGeofence = useCallback((boothId) => {
    return activeBoothId === boothId;
  }, [activeBoothId]);

  // Initialize: Fetch data and setup geolocation
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchBooths(), fetchUnits()]);
        updateUserLocation();
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [fetchBooths, fetchUnits, updateUserLocation]);

  // Setup periodic location updates (every 10 seconds)
  useEffect(() => {
    const locationInterval = setInterval(() => {
      updateUserLocation();
    }, 10000); // 10 seconds

    return () => clearInterval(locationInterval);
  }, [updateUserLocation]);

  // Listen for real-time unit updates via Socket.IO
  useEffect(() => {
    const unsubscribe = onUnitUpdate((data) => {
      console.log('📡 Real-time unit update received:', data);
      
      // Update the specific unit in state
      setUnits(prevUnits => {
        const updatedUnit = data.unit;
        const index = prevUnits.findIndex(u => u._id === updatedUnit._id);
        
        if (index !== -1) {
          const newUnits = [...prevUnits];
          newUnits[index] = updatedUnit;
          return newUnits;
        } else {
          // Unit not found, add it
          return [...prevUnits, updatedUnit];
        }
      });
    });

    return unsubscribe;
  }, []);

  const value = {
    // State
    booths,
    units,
    activeBoothId,
    userLocation,
    loading,
    error,
    geolocationSupported,
    
    // Actions
    fetchBooths,
    fetchUnits,
    updateUserLocation,
    checkGeofence,
    parkCycle,
    takeCycle,
    getBoothUnits,
    isInBoothGeofence
  };

  return (
    <BoothContext.Provider value={value}>
      {children}
    </BoothContext.Provider>
  );
};
