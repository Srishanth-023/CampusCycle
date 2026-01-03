import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import BottomNav from './BottomNav';

const HistoryScreen = () => {
  const { colors, isDark } = useTheme();
  const { rideHistory, fetchHistory } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  }, [fetchHistory]);

  // Calculate total stats
  const totalRides = rideHistory.length;
  const totalDuration = rideHistory.reduce((sum, ride) => sum + ride.duration, 0);
  const totalDistance = rideHistory.reduce((sum, ride) => sum + parseFloat(ride.distance), 0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Ride History</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons name="refresh" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#CDFF00" />
        }
      >
        {/* Stats Summary */}
        <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Ionicons name="bicycle" size={20} color="#CDFF00" />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{totalRides}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Rides</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Ionicons name="time" size={20} color="#CDFF00" />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{totalDuration}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Minutes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Ionicons name="speedometer" size={20} color="#CDFF00" />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{totalDistance.toFixed(1)}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Km</Text>
          </View>
        </View>

        {/* Rides List */}
        {rideHistory.length > 0 ? (
          <View style={styles.ridesList}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Rides</Text>
            
            {rideHistory.map((ride, index) => (
              <View
                key={ride.id || index}
                style={[styles.rideCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.rideHeader}>
                  <View style={styles.rideIconContainer}>
                    <Ionicons name="bicycle" size={22} color="#CDFF00" />
                  </View>
                  <View style={styles.rideInfo}>
                    <Text style={[styles.rideCycle, { color: colors.text }]}>{ride.cycleName}</Text>
                    <Text style={[styles.rideDate, { color: colors.textSecondary }]}>
                      {formatDate(ride.endTime)}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.rideStats}>
                  <View style={styles.rideStat}>
                    <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                    <Text style={[styles.rideStatValue, { color: colors.text }]}>{ride.duration} min</Text>
                  </View>
                  <View style={styles.rideStat}>
                    <Ionicons name="navigate-outline" size={16} color={colors.textSecondary} />
                    <Text style={[styles.rideStatValue, { color: colors.text }]}>{ride.distance} km</Text>
                  </View>
                  <View style={styles.rideStat}>
                    <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
                    <Text style={[styles.rideStatValue, { color: '#4CAF50' }]}>Completed</Text>
                  </View>
                </View>

                <View style={styles.rideTimeRow}>
                  <View style={styles.rideTimeItem}>
                    <Text style={[styles.rideTimeLabel, { color: colors.textSecondary }]}>Start</Text>
                    <Text style={[styles.rideTimeValue, { color: colors.text }]}>
                      {formatTime(ride.startTime)}
                    </Text>
                  </View>
                  <View style={styles.rideTimeLine}>
                    <View style={[styles.dot, { backgroundColor: '#CDFF00' }]} />
                    <View style={[styles.line, { backgroundColor: colors.border }]} />
                    <View style={[styles.dot, { backgroundColor: '#4CAF50' }]} />
                  </View>
                  <View style={styles.rideTimeItem}>
                    <Text style={[styles.rideTimeLabel, { color: colors.textSecondary }]}>End</Text>
                    <Text style={[styles.rideTimeValue, { color: colors.text }]}>
                      {formatTime(ride.endTime)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="time-outline" size={48} color={colors.textSecondary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Rides Yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Your completed rides will appear here
            </Text>
          </View>
        )}
      </ScrollView>

      <BottomNav activeRoute="/history" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsCard: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(205, 255, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#333',
    marginHorizontal: 8,
  },
  ridesList: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  rideCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  rideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rideIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(205, 255, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rideInfo: {
    marginLeft: 12,
    flex: 1,
  },
  rideCycle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  rideDate: {
    fontSize: 13,
    marginTop: 2,
  },
  rideStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  rideStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rideStatValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  rideTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rideTimeItem: {
    alignItems: 'center',
    flex: 1,
  },
  rideTimeLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  rideTimeValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  rideTimeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    paddingHorizontal: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  line: {
    flex: 1,
    height: 2,
    marginHorizontal: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default HistoryScreen;
