import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import BottomNav from './BottomNav';

const BookingScreen = () => {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { 
    user, 
    station, 
    cycles, 
    activeBooking,
    fetchCycles, 
    bookCycle, 
    returnCycle 
  } = useAuth();
  
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchCycles();
    } catch (error) {
      console.error('Refresh error:', error);
    }
    setRefreshing(false);
  }, [fetchCycles]);

  useEffect(() => {
    fetchCycles();
  }, []);

  const handleBookCycle = async (cycleId: string, cycleName: string) => {
    console.log('🎯 handleBookCycle called:', { cycleId, cycleName });
    Alert.alert(
      'Unlock Cycle',
      `Do you want to unlock ${cycleName}?`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => console.log('❌ User cancelled unlock') },
        {
          text: 'Unlock',
          onPress: async () => {
            console.log('✅ User confirmed unlock, starting process...');
            setLoading(true);
            try {
              console.log('📡 Calling bookCycle API with cycleId:', cycleId);
              const result = await bookCycle(cycleId);
              console.log('📥 bookCycle response:', result);
              if (result.success) {
                console.log('✅ Unlock successful!');
                Alert.alert(
                  'Unlocked! 🔓',
                  `${cycleName} unlocked successfully!\n\n✅ Hardware solenoid activated\n🔖 RFID: ${result.rfidTag}\n⚡ Method: ${result.unlockMethod}\n\nThe cycle is ready to use!`
                );
              } else {
                console.log('❌ Unlock failed:', result.message);
                Alert.alert('Unlock Failed', result.message || 'Could not unlock cycle');
              }
            } catch (error: any) {
              console.error('❌ Exception in handleBookCycle:', error);
              Alert.alert('Error', error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleReturnCycle = async (cycleId: string, cycleName: string) => {
    Alert.alert(
      'Return Cycle',
      `Do you want to return ${cycleName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Return',
          onPress: async () => {
            setLoading(true);
            try {
              const result = await returnCycle(cycleId);
              if (result.success && result.rideStats) {
                Alert.alert(
                  'Return Successful! 🚲',
                  `${cycleName} returned successfully!\n\n📊 Ride Stats:\n• Duration: ${result.rideStats.duration} minutes\n• Distance: ${result.rideStats.distance} km`
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

  // Only first cycle is available
  const availableCycles = cycles.length > 0 ? 1 : 0;
  const totalCycles = cycles.length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <LinearGradient
            colors={['#CDFF00', '#A3CC00']}
            style={styles.stationIcon}
          >
            <Ionicons name="bicycle" size={24} color="#0A0A0A" />
          </LinearGradient>
          <View style={styles.stationInfo}>
            <Text style={[styles.stationName, { color: colors.text }]}>
              {station?.name || 'Main Station'}
            </Text>
            <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>
              Welcome, {user?.username || 'admin'}
            </Text>
          </View>
        </View>
        
        <View style={styles.headerSpacer} />
      </View>

      {/* Active Booking Banner */}
      {activeBooking && (
        <View style={styles.otpBanner}>
          <View style={styles.otpIconContainer}>
            <Ionicons name="lock-open" size={24} color="#856404" />
          </View>
          <View style={styles.otpInfo}>
            <Text style={styles.otpLabel}>Active Booking - {activeBooking.cycleName}</Text>
            <Text style={styles.otpValue}>🔓 Hardware Unlocked</Text>
          </View>
          <TouchableOpacity
            style={styles.viewStatusButton}
            onPress={() => router.push('/status')}
          >
            <Text style={styles.viewStatusText}>View</Text>
            <Ionicons name="chevron-forward" size={16} color="#856404" />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#CDFF00" />
        }
      >
        {/* Stats Card */}
        <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{availableCycles}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Available</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.text }]}>{totalCycles}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Cycles</Text>
          </View>
        </View>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Available Cycles</Text>
          <TouchableOpacity onPress={onRefresh}>
            <Ionicons name="refresh" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Cycles List */}
        {cycles.length > 0 ? (
          cycles.map((cycle, index) => {
            // Only first cycle is available, rest are coming soon
            const isAvailable = index === 0 && cycle.status === 'AVAILABLE';
            const isMyBooking = activeBooking?.cycleId === cycle.id;
            const isComingSoon = index > 0;
            
            return (
              <View
                key={cycle.id}
                style={[
                  styles.cycleCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  isMyBooking && styles.cycleCardActive,
                  isComingSoon && styles.cycleCardInactive
                ]}
              >
                <View style={styles.cycleInfo}>
                  <View style={[
                    styles.cycleIconContainer,
                    { backgroundColor: isAvailable ? 'rgba(205, 255, 0, 0.15)' : 'rgba(102, 102, 102, 0.15)' }
                  ]}>
                    <Ionicons
                      name="bicycle"
                      size={28}
                      color={isAvailable ? '#CDFF00' : '#666'}
                    />
                  </View>
                  <View style={styles.cycleDetails}>
                    <Text style={[styles.cycleName, { color: isComingSoon ? '#666' : colors.text }]}>{cycle.name}</Text>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: isAvailable ? '#4CAF50' : '#666' }
                    ]}>
                      <Text style={styles.statusText}>
                        {isComingSoon ? 'COMING SOON' : isMyBooking ? 'YOUR BOOKING' : 'AVAILABLE'}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: isAvailable ? '#CDFF00' : isMyBooking ? '#FF9800' : '#444' }
                  ]}
                  onPress={() => 
                    isAvailable 
                      ? handleBookCycle(cycle.id, cycle.name)
                      : isMyBooking 
                        ? handleReturnCycle(cycle.id, cycle.name)
                        : null
                  }
                  disabled={loading || isComingSoon}
                >
                  {loading ? (
                    <ActivityIndicator color="#0A0A0A" size="small" />
                  ) : (
                    <Text style={[styles.actionButtonText, isComingSoon && { color: '#999' }]}>
                      {isAvailable ? 'Unlock' : isMyBooking ? 'Return' : 'Inactive'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="bicycle-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No cycles available
            </Text>
            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#CDFF00" />
        </View>
      )}

      <BottomNav activeRoute="/booking" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  stationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stationInfo: {
    marginLeft: 12,
  },
  stationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  welcomeText: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  headerSpacer: {
    width: 44,
  },
  otpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  otpIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(133, 100, 4, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpInfo: {
    flex: 1,
    marginLeft: 12,
  },
  otpLabel: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '600',
  },
  otpValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#856404',
    letterSpacing: 2,
  },
  viewStatusButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewStatusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#856404',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#CDFF00',
  },
  statLabel: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#333',
    marginHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cycleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  cycleCardActive: {
    borderColor: '#CDFF00',
    borderWidth: 2,
  },
  cycleCardInactive: {
    opacity: 0.6,
    borderColor: '#333',
  },
  cycleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cycleIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cycleDetails: {
    marginLeft: 14,
    flex: 1,
  },
  cycleName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#0A0A0A',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#CDFF00',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  refreshButtonText: {
    color: '#0A0A0A',
    fontWeight: 'bold',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BookingScreen;
