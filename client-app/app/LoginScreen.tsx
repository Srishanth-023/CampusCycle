import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleLogin = () => {
    // Add your login logic here
    console.log('Login attempt:', { email, password });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#CDFF00', '#A3CC00']}
                style={styles.logoGradient}
              >
                <Ionicons name="bicycle" size={44} color="#0A0A0A" />
              </LinearGradient>
            </View>
            <Text style={styles.title}>CampusCycle</Text>
            <Text style={styles.subtitle}>Smart Campus Transportation</Text>
          </View>

          {/* Login Card */}
          <View style={styles.loginCard}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.loginSubtext}>
              Sign in to access your cycle
            </Text>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Staff Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons 
                  name="mail-outline" 
                  size={20} 
                  color="#666" 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#666"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color="#666" 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#666"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'} 
                    size={22} 
                    color="#999" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#CDFF00', '#A3CC00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginGradient}
              >
                <Text style={styles.loginButtonText}>Sign In</Text>
                <Ionicons 
                  name="arrow-forward" 
                  size={20} 
                  color="#0A0A0A" 
                  style={styles.buttonIcon}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Ionicons name="help-circle-outline" size={16} color="#666" />
            <Text style={styles.footerText}>
              Need help? <Text style={styles.contactLink}>Contact Admin</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0aff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 30,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    letterSpacing: 0.5,
  },
  loginCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 32,
    padding: 28,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  loginSubtext: {
    fontSize: 14,
    color: '#999',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CDFF00',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F0F0F',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: -8,
  },
  forgotText: {
    color: '#CDFF00',
    fontSize: 13,
    fontWeight: '600',
  },
  loginButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  loginGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  loginButtonText: {
    color: '#0A0A0A',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: 8,
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  footerText: {
    color: '#666',
    fontSize: 13,
  },
  contactLink: {
    color: '#CDFF00',
    fontWeight: '600',
  },
});

export default LoginScreen;
