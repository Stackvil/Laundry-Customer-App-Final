import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { Colors } from '../constants/Colors';
import Footer from '../components/Footer';

export default function SettingsScreen({ navigation }) {
  const { user, changePassword, isAuthenticated } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      Alert.alert('Success', 'Password changed successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setShowChangePassword(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const settingsOptions = [
    {
      id: 'password',
      title: 'Change Password',
      icon: 'lock-closed',
      onPress: () => setShowChangePassword(true),
    },
    {
      id: 'notifications',
      title: 'Push Notifications',
      icon: 'notifications',
      hasToggle: true,
      value: notificationsEnabled,
      onToggle: setNotificationsEnabled,
    },
    {
      id: 'email',
      title: 'Email Notifications',
      icon: 'mail',
      hasToggle: true,
      value: emailNotifications,
      onToggle: setEmailNotifications,
    },
    {
      id: 'privacy',
      title: 'Privacy Settings',
      icon: 'shield-checkmark',
      onPress: () => navigation.navigate('PrivacySettings'),
    },
    {
      id: 'language',
      title: 'Language',
      icon: 'language',
      onPress: () => navigation.navigate('LanguageSettings'),
    },
    {
      id: 'about',
      title: 'About',
      icon: 'information-circle',
      onPress: () => navigation.navigate('About'),
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Change Password Section */}
        {showChangePassword && (
          <View style={styles.passwordSection}>
            <Text style={styles.sectionTitle}>Change Password</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Password</Text>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor={Colors.textLight}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor={Colors.textLight}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor={Colors.textLight}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.passwordActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowChangePassword(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.savePasswordButton, isLoading && styles.savePasswordButtonDisabled]}
                onPress={handleChangePassword}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={[Colors.primary, Colors.secondary]}
                  style={styles.savePasswordButtonGradient}
                >
                  <Text style={styles.savePasswordButtonText}>
                    {isLoading ? 'Changing...' : 'Change Password'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Settings Options */}
        <View style={styles.settingsSection}>
          {settingsOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.settingItem}
              onPress={option.onPress}
              disabled={option.hasToggle}
            >
              <View style={styles.settingItemLeft}>
                <Ionicons
                  name={option.icon}
                  size={24}
                  color={Colors.primary}
                  style={styles.settingIcon}
                />
                <Text style={styles.settingText}>{option.title}</Text>
              </View>
              {option.hasToggle ? (
                <Switch
                  value={option.value}
                  onValueChange={option.onToggle}
                  trackColor={{ false: Colors.lightGray, true: Colors.secondary }}
                  thumbColor={option.value ? Colors.primary : Colors.white}
                />
              ) : (
                <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Account Info */}
        <View style={styles.accountInfoSection}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{user?.email || 'Not set'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mobile:</Text>
              <Text style={styles.infoValue}>{user?.mobileNumber || 'Not set'}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <Footer navigation={navigation} currentScreen="Profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  passwordSection: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: Colors.primary,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  passwordActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  savePasswordButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  savePasswordButtonDisabled: {
    opacity: 0.6,
  },
  savePasswordButtonGradient: {
    padding: 15,
    alignItems: 'center',
  },
  savePasswordButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingsSection: {
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 15,
  },
  settingText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
  accountInfoSection: {
    marginTop: 10,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textLight,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
});

