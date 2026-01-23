import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { Colors } from '../constants/Colors';

export default function SignupScreen({ route, navigation }) {
  const { signup, isLoading, isAuthenticated } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

  const handleSignup = async () => {
    if (!name || !email || !mobileNumber || !address || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK' },
      ]);
      return;
    }

    if (mobileNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid mobile number', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK' },
      ]);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK' },
      ]);
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK' },
      ]);
      return;
    }

    try {
      await signup(name, email, password, mobileNumber, address);
      if (returnScreen && returnParams) {
        navigation.replace(returnScreen, returnParams);
      } else {
        navigation.replace('Home');
      }
    } catch (error) {
      Alert.alert('Error', 'Signup failed. Please try again.', [
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
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
            <Text style={styles.subtitle}>Create your account</Text>
          </View>

          {/* Signup Form */}
          <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your mobile number"
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="phone-pad"
              maxLength={15}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter your complete address"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            onPress={handleSignup}
            disabled={isLoading}
            style={isLoading && styles.buttonDisabled}
          >
            <LinearGradient
              colors={[Colors.white, Colors.white]}
              style={styles.signupButton}
            >
              <Text style={styles.signupButtonText}>
                {isLoading ? 'Creating account...' : 'Sign Up'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Login', {
                  returnScreen,
                  returnParams,
                })
              }
            >
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  signupButton: {
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
  },
  loginLink: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

