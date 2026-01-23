import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import Footer from '../components/Footer';

export default function PrivacySettingsScreen({ navigation }) {
  const [dataSharing, setDataSharing] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [locationTracking, setLocationTracking] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState(true);

  const privacyOptions = [
    {
      id: 'data-sharing',
      title: 'Data Sharing',
      description: 'Allow sharing of anonymized data for service improvement',
      value: dataSharing,
      onToggle: setDataSharing,
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Help us improve by sharing usage analytics',
      value: analytics,
      onToggle: setAnalytics,
    },
    {
      id: 'marketing',
      title: 'Marketing Emails',
      description: 'Receive promotional emails and special offers',
      value: marketingEmails,
      onToggle: setMarketingEmails,
    },
    {
      id: 'location',
      title: 'Location Tracking',
      description: 'Allow location access for nearby shop recommendations',
      value: locationTracking,
      onToggle: setLocationTracking,
    },
    {
      id: 'profile',
      title: 'Profile Visibility',
      description: 'Make your profile visible to other users',
      value: profileVisibility,
      onToggle: setProfileVisibility,
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
          <Text style={styles.headerTitle}>Privacy Settings</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.infoSection}>
          <Ionicons name="shield-checkmark" size={48} color={Colors.secondary} />
          <Text style={styles.infoTitle}>Your Privacy Matters</Text>
          <Text style={styles.infoText}>
            Control how your data is used and shared. You can change these settings at any time.
          </Text>
        </View>

        <View style={styles.settingsSection}>
          {privacyOptions.map((option) => (
            <View key={option.id} style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>{option.title}</Text>
                  <Text style={styles.settingDescription}>{option.description}</Text>
                </View>
              </View>
              <Switch
                value={option.value}
                onValueChange={option.onToggle}
                trackColor={{ false: Colors.lightGray, true: Colors.secondary }}
                thumbColor={option.value ? Colors.primary : Colors.white}
              />
            </View>
          ))}
        </View>

        <View style={styles.dataSection}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <TouchableOpacity style={styles.dataButton}>
            <Ionicons name="download-outline" size={24} color={Colors.primary} />
            <Text style={styles.dataButtonText}>Download My Data</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.dataButton}>
            <Ionicons name="trash-outline" size={24} color={Colors.danger} />
            <Text style={[styles.dataButtonText, styles.deleteText]}>Delete My Account</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Footer navigation={navigation} currentScreen={null} />
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
  infoSection: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 15,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
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
    flex: 1,
    marginRight: 15,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: Colors.textLight,
    lineHeight: 16,
  },
  dataSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 15,
  },
  dataButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
  dataButtonText: {
    flex: 1,
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: 12,
  },
  deleteText: {
    color: Colors.danger,
  },
});
