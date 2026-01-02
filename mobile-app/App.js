import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Constants from 'expo-constants';

// Configuration
// Use your computer's IP address instead of localhost for mobile device connectivity
const API_BASE_URL = 'http://192.168.0.105:3000/api';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [cycles, setCycles] = useState([]);
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentOtp, setCurrentOtp] = useState('');

  // API Helper Functions
  const apiCall = async (endpoint, method = 'GET', body = null) => {
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
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
    } catch (error) {
      console.error('API Error:', error);
      // Better error handling for network issues
      if (error.message.includes('Network request failed') || error.name === 'TypeError') {
        throw new Error('Cannot connect to server. Make sure the backend is running and you are on the same network.');
      }
      throw error;
    }
  };

  // Authentication Functions
  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      const response = await apiCall('/login', 'POST', {
        username: username.trim(),
        password: password.trim(),
      });

      if (response.success) {
        setAuthToken(response.token);
        setIsLoggedIn(true);
        setUsername('');
        setPassword('');
        Alert.alert('Success', 'Logged in successfully!');
        // Pass the token directly since state update is async
        fetchCycles(response.token);
      }
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiCall('/logout', 'POST');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggedIn(false);
      setAuthToken('');
      setCycles([]);
      setStation(null);
      setCurrentOtp('');
    }
  };

  // Cycle Management Functions
  const fetchCycles = async (token = authToken) => {
    try {
      const config = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      };
      
      const response = await fetch(`${API_BASE_URL}/cycles`, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch cycles');
      }
      
      if (data.success) {
        setCycles(data.cycles);
        setStation(data.station);
      }
    } catch (error) {
      console.error('Fetch cycles error:', error);
      Alert.alert('Error', 'Failed to fetch cycles: ' + error.message);
    }
  };

  const handleBookCycle = async (cycleId) => {
    setLoading(true);
    try {
      const response = await apiCall('/book', 'POST', { cycleId });
      
      if (response.success) {
        setCurrentOtp(response.otp);
        Alert.alert(
          'Booking Successful!', 
          `Cycle ${cycleId} booked successfully!\nOTP: ${response.otp}\n\nPlease use this OTP to unlock the cycle.`,
          [{ text: 'OK', onPress: () => fetchCycles() }]
        );
      }
    } catch (error) {
      Alert.alert('Booking Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnCycle = async (cycleId) => {
    setLoading(true);
    try {
      const response = await apiCall('/return', 'POST', { cycleId });
      
      if (response.success) {
        const { rideStats } = response;
        Alert.alert(
          'Return Successful!',
          `Cycle ${cycleId} returned successfully!\n\nRide Stats:\n• Duration: ${rideStats.duration} minutes\n• Distance: ${rideStats.distance} km`,
          [{ text: 'OK', onPress: () => fetchCycles() }]
        );
        setCurrentOtp('');
      }
    } catch (error) {
      Alert.alert('Return Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCycles();
    setRefreshing(false);
  };

  // Test API connection
  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      
      if (data.success) {
        Alert.alert('Connection Test', `✅ Successfully connected to server!\n\n${data.message}`);
      }
    } catch (error) {
      Alert.alert('Connection Test', `❌ Failed to connect to server.\n\nError: ${error.message}\n\nAPI URL: ${API_BASE_URL}`);
    } finally {
      setLoading(false);
    }
  };

  // Render Login Screen
  const renderLoginScreen = () => (
    <View style={styles.container}>
      <View style={styles.loginContainer}>
        <Text style={styles.title}>🚲 CampusCycle</Text>
        <Text style={styles.subtitle}>College Cycle Sharing</Text>
        
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity
            style={[styles.button, styles.loginButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.testButton]}
            onPress={testConnection}
            disabled={loading}
          >
            <Text style={styles.buttonText}>🔍 Test Connection</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.credentialsHint}>
          <Text style={styles.hintText}>Demo Credentials:</Text>
          <Text style={styles.hintText}>• Username: admin, Password: password</Text>
          <Text style={styles.hintText}>• Username: student, Password: student123</Text>
        </View>
      </View>
    </View>
  );

  // Render Cycle Item
  const renderCycleItem = (cycle) => {
    const isAvailable = cycle.status === 'AVAILABLE';
    
    return (
      <View key={cycle.id} style={styles.cycleCard}>
        <View style={styles.cycleHeader}>
          <Text style={styles.cycleName}>{cycle.name}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: isAvailable ? '#4CAF50' : '#F44336' }
          ]}>
            <Text style={styles.statusText}>{cycle.status}</Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: isAvailable ? '#2196F3' : '#FF9800' }
          ]}
          onPress={() => isAvailable ? handleBookCycle(cycle.id) : handleReturnCycle(cycle.id)}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {isAvailable ? 'Book Cycle' : 'Return Cycle'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render Main App Screen
  const renderMainScreen = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🚲 {station?.name || 'CampusCycle'}</Text>
          <Text style={styles.headerSubtitle}>Cycles Available</Text>
        </View>
        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {currentOtp && (
        <View style={styles.otpContainer}>
          <Text style={styles.otpTitle}>🔑 Current OTP</Text>
          <Text style={styles.otpText}>{currentOtp}</Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {cycles.length > 0 ? (
          cycles.map(renderCycleItem)
        ) : (
          <View style={styles.emptyCycles}>
            <Text style={styles.emptyText}>No cycles available</Text>
            <TouchableOpacity style={styles.button} onPress={fetchCycles}>
              <Text style={styles.buttonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      )}
    </View>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" />
      {isLoggedIn ? renderMainScreen() : renderLoginScreen()}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Constants.statusBarHeight,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2196F3',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 40,
  },
  form: {
    marginBottom: 30,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5,
  },
  loginButton: {
    marginTop: 10,
  },
  testButton: {
    backgroundColor: '#FF9800',
    marginTop: 5,
  },
  logoutButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  credentialsHint: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  hintText: {
    fontSize: 12,
    color: '#555',
    marginBottom: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  otpContainer: {
    backgroundColor: '#fff3cd',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  otpTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 5,
  },
  otpText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#856404',
    textAlign: 'center',
    letterSpacing: 3,
  },
  scrollView: {
    flex: 1,
    padding: 15,
  },
  cycleCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  cycleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cycleName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyCycles: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});