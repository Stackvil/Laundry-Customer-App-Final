import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Footer from '../components/Footer';

export default function AccountScreen({ navigation }) {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const accountItems = [
    {
      id: 'personal',
      title: 'Personal Information',
      icon: 'person',
    },
    {
      id: 'addresses',
      title: 'Manage Addresses',
      icon: 'location',
    },
    {
      id: 'payment',
      title: 'Payment Methods',
      icon: 'card',
    },
  ];

  const activityItems = [
    {
      id: 'history',
      title: 'Order History',
      icon: 'time',
    },
    {
      id: 'subscriptions',
      title: 'My Subscriptions',
      icon: 'refresh',
    },
  ];

  const settingsItems = [
    {
      id: 'notifications',
      title: 'Push Notifications',
      icon: 'notifications',
      hasToggle: true,
    },
    {
      id: 'security',
      title: 'Password & Security',
      icon: 'lock-closed',
    },
  ];

  const supportItems = [
    {
      id: 'help',
      title: 'Help & FAQ',
      icon: 'help-circle',
    },
    {
      id: 'terms',
      title: 'Terms of Service',
      icon: 'document-text',
    },
  ];

  const renderSection = (title, items) => (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>{title}</Text>
      <View style={styles.sectionCard}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem,
              index < items.length - 1 && styles.menuItemBorder,
            ]}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon} size={20} color={Colors.secondary} />
              </View>
              <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            {item.hasToggle ? (
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{
                  false: Colors.lightGray,
                  true: Colors.secondary,
                }}
                thumbColor={Colors.white}
              />
            ) : (
              <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>My Account</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileCard}>
          <LinearGradient
            colors={['#ff6b6b', Colors.secondary, '#4ecdc4', '#45b7d1']}
            style={styles.avatar}
          >
            <Ionicons name="person" size={40} color={Colors.white} />
          </LinearGradient>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Alex Johnson</Text>
            <Text style={styles.profileEmail}>alex.j@example.com</Text>
          </View>
          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Sections */}
        {renderSection('ACCOUNT', accountItems)}
        {renderSection('ACTIVITY', activityItems)}
        {renderSection('SETTINGS', settingsItems)}
        {renderSection('SUPPORT', supportItems)}

        {/* Log Out Button */}
        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
      <Footer navigation={navigation} currentScreen="Profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 35,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 15,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.8,
  },
  editProfileButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  editProfileButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textLight,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#c53030',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  logoutButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

