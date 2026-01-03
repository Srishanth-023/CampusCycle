import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ImageBackground,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import BottomNav from './BottomNav';

const HomeScreen = () => {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user, logout } = useAuth();
  const [userName, setUserName] = useState('User');
  const [notifications, setNotifications] = useState<any[]>([]);

  // Extract username from user context
  useEffect(() => {
    if (user?.username) {
      setUserName(user.username);
    }
  }, [user]);

  const cycleStands = [
    { 
      id: 1, 
      name: 'Stand 1', 
      available: 1, 
      total: 4, 
      status: 'available',
      isActive: true,
      image: 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=600&h=400&fit=crop'
    },
    { 
      id: 2, 
      name: 'Stand 2', 
      available: 0, 
      total: 4, 
      status: 'coming-soon',
      isActive: false,
      image: 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=600&h=400&fit=crop'
    },
    { 
      id: 3, 
      name: 'Stand 3', 
      available: 0, 
      total: 4, 
      status: 'coming-soon',
      isActive: false,
      image: 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=600&h=400&fit=crop'
    },
    { 
      id: 4, 
      name: 'Stand 4', 
      available: 0, 
      total: 4, 
      status: 'coming-soon',
      isActive: false,
      image: 'https://images.unsplash.com/photo-1571333250630-f0230c320b6d?w=600&h=400&fit=crop'
    },
  ];

  const handleStandPress = (stand: any) => {
    if (stand.isActive) {
      // Navigate to booking page for active stands
      router.push('/booking');
    } else {
      // Show coming soon alert for inactive stands
      Alert.alert(
        stand.name,
        `Location: Main Campus\nAvailable Cycles: ${stand.available}/${stand.total}\nStatus: Coming Soon`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleProfilePress = () => {
    Alert.alert(
      'Profile',
      `Logged in as: ${userName}\nEmail: ${user?.email || 'user@campus.com'}`,
      [
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Logout',
              'Are you sure you want to logout?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Logout',
                  onPress: async () => {
                    await logout();
                    router.replace('/');
                  },
                },
              ]
            );
          },
        },
        { text: 'Close' },
      ]
    );
  };

  const handleNotificationPress = () => {
    if (notifications.length === 0) {
      Alert.alert(
        'No Notifications',
        'You have no new notifications at this time.',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert('Notifications', 'Your notifications will appear here.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        {/* Left Side - Profile Button */}
        <TouchableOpacity 
          style={styles.profileSection}
          onPress={handleProfilePress}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={['#CDFF00', '#A3CC00']}
            style={styles.profileIcon}
          >
            <Ionicons name="person" size={24} color="#0A0A0A" />
          </LinearGradient>
          <View style={styles.userInfo}>
            <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>Welcome Back</Text>
            <Text style={[styles.userNameText, { color: colors.text }]}>{userName}</Text>
          </View>
        </TouchableOpacity>

        {/* Right Side - Notification Button */}
        <TouchableOpacity 
          style={[styles.notificationButton, { backgroundColor: colors.card }]}
          onPress={handleNotificationPress}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={26} color={colors.text} />
          {notifications.length > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>{notifications.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: colors.text }]}>Cycle Stands</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Select a stand to unlock your cycle</Text>
        </View>

        {/* Cycle Stands Grid */}
        <View style={styles.standsGrid}>
          {cycleStands.map((stand) => (
            <TouchableOpacity
              key={stand.id}
              style={styles.standCard}
              onPress={() => handleStandPress(stand)}
              activeOpacity={0.85}
            >
              <ImageBackground
                source={{ uri: stand.image }}
                style={styles.standBackground}
                imageStyle={styles.standBackgroundImage}
              >
                {/* Overlay */}
                <LinearGradient
                  colors={
                    stand.isActive
                      ? ['rgba(10, 10, 10, 0.3)', 'rgba(10, 10, 10, 0.92)']
                      : ['rgba(10, 10, 10, 0.75)', 'rgba(10, 10, 10, 0.95)']
                  }
                  style={styles.standOverlay}
                >
                  {/* Top Row - Icon */}
                  <View style={styles.standTopRow}>
                    <View style={[
                      styles.standIconContainer,
                      !stand.isActive && styles.standIconInactive
                    ]}>
                      <Ionicons
                        name="bicycle"
                        size={28}
                        color={stand.isActive ? '#CDFF00' : '#666'}
                      />
                    </View>
                    {stand.isActive ? (
                      <View style={styles.activeBadge}>
                        <Text style={styles.activeText}>Active</Text>
                      </View>
                    ) : (
                      <View style={styles.comingSoonBadge}>
                        <Text style={styles.comingSoonText}>Coming Soon</Text>
                      </View>
                    )}
                  </View>

                  {/* Stand Info */}
                  <View style={styles.standInfoSection}>
                    <Text style={[
                      styles.standName,
                      !stand.isActive && styles.standNameInactive
                    ]}>
                      {stand.name}
                    </Text>
                    <View style={styles.locationRow}>
                      <Ionicons 
                        name="location-outline" 
                        size={14} 
                        color={stand.isActive ? '#CDFF00' : '#666'} 
                      />
                      <Text style={[
                        styles.standLocation,
                        !stand.isActive && styles.standLocationInactive
                      ]}>
                        Main Campus
                      </Text>
                    </View>
                  </View>

                  {/* Availability Section */}
                  {stand.isActive ? (
                    <View style={styles.availabilitySection}>
                      <View style={styles.availabilityItem}>
                        <Text style={styles.availableCount}>
                          {stand.available}
                        </Text>
                        <Text style={styles.availableLabel}>Available</Text>
                      </View>
                      <View style={styles.dividerLine} />
                      <View style={styles.availabilityItem}>
                        <Text style={styles.totalCount}>{stand.total}</Text>
                        <Text style={styles.totalLabel}>Total Cycles</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.inactiveSection}>
                      <Ionicons name="lock-closed" size={20} color="#666" />
                      <Text style={styles.inactiveText}>Stand Inactive</Text>
                    </View>
                  )}
                </LinearGradient>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav activeRoute="/home" />
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    marginLeft: 12,
  },
  welcomeText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  userNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#CDFF00',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0A0A0A',
  },
  scrollView: {
    flex: 1,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
  },
  standsGrid: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  standCard: {
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  standBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  standBackgroundImage: {
    borderRadius: 20,
  },
  standOverlay: {
    flex: 1,
    padding: 18,
    justifyContent: 'space-between',
  },
  standTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  standIconContainer: {
    backgroundColor: 'rgba(205, 255, 0, 0.18)',
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(205, 255, 0, 0.35)',
  },
  standIconInactive: {
    backgroundColor: 'rgba(102, 102, 102, 0.1)',
    borderColor: 'rgba(102, 102, 102, 0.2)',
  },
  activeBadge: {
    backgroundColor: 'rgba(205, 255, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(205, 255, 0, 0.4)',
  },
  activeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#CDFF00',
    letterSpacing: 0.3,
  },
  comingSoonBadge: {
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.4)',
  },
  comingSoonText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FF4444',
    letterSpacing: 0.3,
  },
  standInfoSection: {
    marginTop: -10,
  },
  standName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  standNameInactive: {
    color: '#666',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  standLocation: {
    fontSize: 13,
    color: '#CDFF00',
    fontWeight: '600',
  },
  standLocationInactive: {
    color: '#666',
  },
  availabilitySection: {
    flexDirection: 'row',
    backgroundColor: 'rgba(26, 26, 26, 0.85)',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: 'rgba(205, 255, 0, 0.15)',
  },
  inactiveSection: {
    flexDirection: 'row',
    backgroundColor: 'rgba(26, 26, 26, 0.85)',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(102, 102, 102, 0.3)',
    gap: 8,
  },
  inactiveText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  availabilityItem: {
    alignItems: 'center',
    flex: 1,
  },
  availableCount: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#CDFF00',
    marginBottom: 2,
  },
  availableLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  totalCount: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  totalLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  dividerLine: {
    width: 1,
    height: 36,
    backgroundColor: '#333',
  },
});

export default HomeScreen;
