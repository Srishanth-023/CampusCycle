import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import BottomNav from './BottomNav';

const ProfileScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme, colors, toggleTheme, isDark } = useTheme();
  
  const [userName, setUserName] = useState('User');
  const [userEmail, setUserEmail] = useState('staff@gmail.com');

  useEffect(() => {
    if (params.email) {
      const email = params.email as string;
      const extractedName = email.split('@')[0];
      const formattedName = extractedName.charAt(0).toUpperCase() + extractedName.slice(1);
      setUserName(formattedName);
      setUserEmail(email);
    }
  }, [params.email]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            router.replace('/');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Profile Avatar */}
          <View style={styles.avatarSection}>
            <LinearGradient
              colors={['#CDFF00', '#A3CC00']}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>{userName}</Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{userEmail}</Text>
            <View style={styles.badge}>
              <Ionicons name="shield-checkmark" size={14} color="#4CAF50" />
              <Text style={styles.badgeText}>Verified Staff</Text>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            PREFERENCES
          </Text>

          {/* Theme Toggle */}
          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: isDark ? 'rgba(205, 255, 0, 0.15)' : 'rgba(0, 0, 0, 0.05)' }]}>
                <Ionicons
                  name={isDark ? 'moon' : 'sunny'}
                  size={22}
                  color={isDark ? '#CDFF00' : '#FFA500'}
                />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  {isDark ? 'Switch to light theme' : 'Switch to dark theme'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#E0E0E0', true: '#A3CC00' }}
              thumbColor={isDark ? '#CDFF00' : '#F5F5F5'}
              ios_backgroundColor="#E0E0E0"
            />
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            ACCOUNT
          </Text>

          {/* Edit Profile */}
          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(33, 150, 243, 0.15)' }]}>
                <Ionicons name="person-outline" size={22} color="#2196F3" />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  Edit Profile
                </Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  Update your information
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Notifications */}
          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(156, 39, 176, 0.15)' }]}>
                <Ionicons name="notifications-outline" size={22} color="#9C27B0" />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  Notifications
                </Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  Manage your alerts
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Privacy */}
          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(76, 175, 80, 0.15)' }]}>
                <Ionicons name="lock-closed-outline" size={22} color="#4CAF50" />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  Privacy & Security
                </Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  Control your data
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            SUPPORT
          </Text>

          {/* Help Center */}
          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 152, 0, 0.15)' }]}>
                <Ionicons name="help-circle-outline" size={22} color="#FF9800" />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  Help Center
                </Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  Get assistance
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* About */}
          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(96, 125, 139, 0.15)' }]}>
                <Ionicons name="information-circle-outline" size={22} color="#607D8B" />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  About CampusCycle
                </Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  Version 1.0.0
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FF4444', '#CC0000']}
            style={styles.logoutGradient}
          >
            <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
            <Text style={styles.logoutText}>Logout</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* App Info */}
        <Text style={[styles.appInfo, { color: colors.textSecondary }]}>
          CampusCycle © 2026
        </Text>
      </ScrollView>

      <BottomNav activeRoute="/profile" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  profileCard: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#CDFF00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0A0A0A',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  section: {
    marginTop: 8,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
  },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#FF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  appInfo: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 24,
    marginBottom: 12,
  },
});

export default ProfileScreen;
