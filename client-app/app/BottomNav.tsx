import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useTheme } from '../context/ThemeContext';

type IoniconsName = keyof typeof Ionicons.glyphMap;

interface BottomNavProps {
  activeRoute?: string;
}

interface NavItemProps {
  item: {
    id: string;
    label: string;
    icon: IoniconsName;
    activeIcon: IoniconsName;
    route: string;
    isCenter?: boolean;
  };
  isActive: boolean;
  onPress: () => void;
  colors: any;
}

const AnimatedNavItem: React.FC<NavItemProps> = ({ item, isActive, onPress, colors }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: -12,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.spring(scale, {
          toValue: 1.1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(bgOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(bgOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isActive]);

  return (
    <TouchableOpacity
      style={styles.navItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Animated.View
        style={[
          styles.navItemContent,
          {
            transform: [
              { translateY },
              { scale },
            ],
          },
        ]}
      >
        <View style={styles.iconContainer}>
          {/* Background glow effect */}
          <Animated.View
            style={[
              styles.iconGlow,
              { opacity: bgOpacity },
            ]}
          />
          {/* Icon circle */}
          <LinearGradient
            colors={isActive ? ['#CDFF00', '#A3CC00'] : ['transparent', 'transparent']}
            style={[
              styles.iconCircle,
              { borderColor: colors.card },
              !isActive && styles.iconCircleInactive,
            ]}
          >
            <Ionicons
              name={isActive ? item.activeIcon : item.icon}
              size={22}
              color={isActive ? '#0A0A0A' : colors.textSecondary}
            />
          </LinearGradient>
        </View>
        <Text
          style={[
            styles.navLabel,
            { color: colors.textSecondary },
            isActive && styles.navLabelActive,
          ]}
        >
          {item.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ activeRoute }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { colors, isDark } = useTheme();
  
  const currentRoute = activeRoute || pathname;

  const handleNavigation = (route: string) => {
    router.push(route as any);
  };

  const navItems: Array<{
    id: string;
    label: string;
    icon: IoniconsName;
    activeIcon: IoniconsName;
    route: string;
  }> = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: 'home-outline' as IoniconsName, 
      activeIcon: 'home' as IoniconsName,
      route: '/home' 
    },
    { 
      id: 'status', 
      label: 'Status', 
      icon: 'bicycle-outline' as IoniconsName, 
      activeIcon: 'bicycle' as IoniconsName,
      route: '/status'
    },
    { 
      id: 'history', 
      label: 'History', 
      icon: 'time-outline' as IoniconsName, 
      activeIcon: 'time' as IoniconsName,
      route: '/history' 
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: 'person-outline' as IoniconsName, 
      activeIcon: 'person' as IoniconsName,
      route: '/profile' 
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDark ? ['#0A0A0A', '#1A1A1A'] : ['#FFFFFF', '#F5F5F5']}
        style={[styles.navBar, { borderColor: colors.border }]}
      >
        {navItems.map((item) => {
          const isActive = currentRoute.includes(item.route);
          
          return (
            <AnimatedNavItem
              key={item.id}
              item={item}
              isActive={isActive}
              onPress={() => handleNavigation(item.route)}
              colors={colors}
            />
          );
        })}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    paddingBottom: 0,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  navItemContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlow: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(205, 255, 0, 0.2)',
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#0A0A0A',
  },
  iconCircleInactive: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  navLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 6,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  navLabelActive: {
    color: '#CDFF00',
  },
});

export default BottomNav;
