import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { Colors } from '../constants/Colors';

export default function LoginScreen({ route, navigation }) {
  const { login, isLoading, isAuthenticated } = useAuth();
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');

  const returnScreen = route.params?.returnScreen;
  const returnParams = route.params?.returnParams;

  useEffect(() => {
    if (isAuthenticated) {
      // If user is already logged in, redirect them
      if (returnScreen && returnParams) {
        navigation.replace(returnScreen, returnParams);
      } else {
        navigation.replace('Home');
      }
    }
  }, [isAuthenticated, navigation, returnScreen, returnParams]);

  const handleLogin = async () => {
    if (!mobileNumber || !password) {
      Alert.alert('Error', 'Please enter both mobile number and password', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK' },
      ]);
      return;
    }

    try {
      await login(mobileNumber, password);
      if (returnScreen && returnParams) {
        navigation.replace(returnScreen, returnParams);
      } else {
        navigation.replace('Home');
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK' },
      ]);
    }
  };

  return (
    <LinearGradient
      colors={[Colors.primary, Colors.secondary]}
      style={styles.container}
    >
      <ScrollView>
        <View style={styles.content}>
        {/* Header */}
        <View>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.header}>
          <Text style={styles.logoEmoji}>🧺</Text>
          <Text style={styles.logoText}>CleanFold</Text>
          <Text style={styles.subtitle}>Welcome back!</Text>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your mobile number"
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="phone-pad"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            style={isLoading && styles.buttonDisabled}
          >
            <LinearGradient
              colors={[Colors.white, Colors.white]}
              style={styles.loginButton}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Logging in...' : 'Log In'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => Alert.alert('Info', 'Forgot password feature coming soon', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'OK' },
            ])}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('Signup', {
                returnScreen,
                returnParams,
              })
            }
          >
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoEmoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
  },
  form: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: Colors.primary,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  loginButton: {
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 15,
  },
  forgotPasswordText: {
    color: Colors.secondary,
    fontSize: 14,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
  },
  signupLink: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

