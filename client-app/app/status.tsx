import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import BottomNav from './BottomNav';

const StatusScreen = () => {
  const { colors, isDark } = useTheme();
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="bicycle" size={48} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Cycle Status</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Coming Soon</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Track your current cycle rental status and trips here
        </Text>
      </View>
      <BottomNav activeRoute="/status" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default StatusScreen;
