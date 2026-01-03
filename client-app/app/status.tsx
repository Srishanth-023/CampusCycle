import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import BottomNav from './BottomNav';

const StatusScreen = () => {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { activeBooking, returnCycle, fetchCycles } = useAuth();
  const [loading, setLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState('0:00');

  // Calculate elapsed time
  useEffect(() => {
    if (!activeBooking) return;

    const calculateElapsed = () => {
      const startTime = new Date(activeBooking.bookingTime).getTime();
      const now = new Date().getTime();
      const diff = Math.floor((now - startTime) / 1000);
      
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      
      if (hours > 0) {
        setElapsedTime(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setElapsedTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 1000);

    return () => clearInterval(interval);
  }, [activeBooking]);

  const handleReturn = async () => {
    if (!activeBooking) return;

    Alert.alert(
      'Return Cycle',
      `Do you want to return ${activeBooking.cycleName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Return',
          onPress: async () => {
            setLoading(true);
            try {
              const result = await returnCycle(activeBooking.cycleId);
              if (result.success && result.rideStats) {
                Alert.alert(
                  'Return Successful! 🚲',
                  `${activeBooking.cycleName} returned successfully!\n\n📊 Ride Stats:\n• Duration: ${result.rideStats.duration} minutes\n• Distance: ${result.rideStats.distance} km`,
                  [
                    {
                      text: 'View History',
                      onPress: () => router.push('/history'),
                    },
                    { text: 'OK' },
                  ]
                );
              } else {
                Alert.alert('Return Failed', result.message || 'Could not return cycle');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // No active booking
  if (!activeBooking) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="bicycle-outline" size={48} color={colors.textSecondary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>No Active Ride</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Book a cycle from the home screen to start your ride
          </Text>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => router.push('/home')}
          >
            <LinearGradient
              colors={['#CDFF00', '#A3CC00']}
              style={styles.bookButtonGradient}
            >
              <Ionicons name="bicycle" size={20} color="#0A0A0A" />
              <Text style={styles.bookButtonText}>Book a Cycle</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <BottomNav activeRoute="/status" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Active Ride</Text>
      </View>

      <View style={styles.content}>
        {/* Cycle Info Card */}
        <View style={[styles.cycleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <LinearGradient
            colors={['#CDFF00', '#A3CC00']}
            style={styles.cycleIcon}
          >
            <Ionicons name="bicycle" size={40} color="#0A0A0A" />
          </LinearGradient>
          <Text style={[styles.cycleName, { color: colors.text }]}>{activeBooking.cycleName}</Text>
          <View style={styles.activeBadge}>
            <View style={styles.activeDot} />
            <Text style={styles.activeText}>In Use</Text>
          </View>
        </View>

        {/* OTP Card */}
        <View style={styles.otpCard}>
          <View style={styles.otpHeader}>
            <Ionicons name="key" size={20} color="#856404" />
            <Text style={styles.otpLabel}>Unlock OTP</Text>
          </View>
          <Text style={styles.otpValue}>{activeBooking.otp}</Text>
          <Text style={styles.otpHint}>Use this code to unlock the cycle</Text>
        </View>

        {/* Timer Card */}
        <View style={[styles.timerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.timerRow}>
            <View style={styles.timerItem}>
              <Ionicons name="time-outline" size={24} color="#CDFF00" />
              <Text style={[styles.timerLabel, { color: colors.textSecondary }]}>Elapsed Time</Text>
              <Text style={[styles.timerValue, { color: colors.text }]}>{elapsedTime}</Text>
            </View>
            <View style={styles.timerDivider} />
            <View style={styles.timerItem}>
              <Ionicons name="calendar-outline" size={24} color="#CDFF00" />
              <Text style={[styles.timerLabel, { color: colors.textSecondary }]}>Started</Text>
              <Text style={[styles.timerValue, { color: colors.text }]}>
                {new Date(activeBooking.bookingTime).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* Return Button */}
        <TouchableOpacity
          style={styles.returnButton}
          onPress={handleReturn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="return-down-back" size={22} color="#FFFFFF" />
              <Text style={styles.returnButtonText}>Return Cycle</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <BottomNav activeRoute="/status" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  bookButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  bookButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 28,
    gap: 10,
  },
  bookButtonText: {
    color: '#0A0A0A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cycleCard: {
    width: '100%',
    alignItems: 'center',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 16,
  },
  cycleIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cycleName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  activeText: {
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 14,
  },
  otpCard: {
    width: '100%',
    backgroundColor: '#fff3cd',
    padding: 20,
    borderRadius: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    marginBottom: 16,
    alignItems: 'center',
  },
  otpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  otpLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
  },
  otpValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#856404',
    letterSpacing: 4,
    marginBottom: 8,
  },
  otpHint: {
    fontSize: 12,
    color: '#856404',
    opacity: 0.8,
  },
  timerCard: {
    width: '100%',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  timerDivider: {
    width: 1,
    height: 60,
    backgroundColor: '#333',
  },
  timerLabel: {
    fontSize: 12,
  },
  timerValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  returnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9800',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 10,
  },
  returnButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
});

export default StatusScreen;
