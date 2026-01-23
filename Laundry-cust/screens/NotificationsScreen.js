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

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState({
    // Order Notifications
    orderConfirmation: true,
    orderShipped: true,
    orderDelivered: true,
    orderCancelled: true,
    orderReturned: true,
    
    // Promotional Notifications
    dealsOffers: false,
    newServices: true,
    seasonalPromotions: false,
    recommendations: true,
    
    // Account Notifications
    accountSecurity: true,
    accountUpdates: true,
    passwordChanges: true,
    paymentUpdates: true,
    
    // Communication Preferences
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
  });

  const toggleNotification = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const NotificationSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  const NotificationOption = ({ 
    title, 
    description, 
    value, 
    onToggle,
    icon 
  }) => (
    <View style={styles.notificationOption}>
      <View style={styles.notificationLeft}>
        {icon && (
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={20} color={Colors.primary} />
          </View>
        )}
        <View style={styles.notificationText}>
          <Text style={styles.notificationTitle}>{title}</Text>
          {description && (
            <Text style={styles.notificationDescription}>{description}</Text>
          )}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: Colors.lightGray, true: Colors.success }}
        thumbColor={Colors.white}
        ios_backgroundColor={Colors.lightGray}
      />
    </View>
  );

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
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color={Colors.primary} />
          <Text style={styles.infoText}>
            Manage your notification preferences. You can change these settings at any time.
          </Text>
        </View>

        {/* Order Notifications */}
        <NotificationSection title="Order Notifications">
          <NotificationOption
            title="Order Confirmation"
            description="Get notified when your order is confirmed"
            value={notifications.orderConfirmation}
            onToggle={() => toggleNotification('orderConfirmation')}
            icon="checkmark-circle-outline"
          />
          <NotificationOption
            title="Order Shipped"
            description="Receive updates when your order is shipped"
            value={notifications.orderShipped}
            onToggle={() => toggleNotification('orderShipped')}
            icon="car-outline"
          />
          <NotificationOption
            title="Order Delivered"
            description="Get notified when your order is delivered"
            value={notifications.orderDelivered}
            onToggle={() => toggleNotification('orderDelivered')}
            icon="checkmark-done-circle-outline"
          />
          <NotificationOption
            title="Order Cancelled"
            description="Receive notifications if your order is cancelled"
            value={notifications.orderCancelled}
            onToggle={() => toggleNotification('orderCancelled')}
            icon="close-circle-outline"
          />
          <NotificationOption
            title="Order Returned"
            description="Get updates about order returns and refunds"
            value={notifications.orderReturned}
            onToggle={() => toggleNotification('orderReturned')}
            icon="return-down-back-outline"
          />
        </NotificationSection>

        {/* Promotional Notifications */}
        <NotificationSection title="Promotional Notifications">
          <NotificationOption
            title="Deals & Offers"
            description="Receive notifications about special deals and discounts"
            value={notifications.dealsOffers}
            onToggle={() => toggleNotification('dealsOffers')}
            icon="pricetag-outline"
          />
          <NotificationOption
            title="New Services"
            description="Get notified about new laundry services and features"
            value={notifications.newServices}
            onToggle={() => toggleNotification('newServices')}
            icon="sparkles-outline"
          />
          <NotificationOption
            title="Seasonal Promotions"
            description="Receive notifications about seasonal offers and promotions"
            value={notifications.seasonalPromotions}
            onToggle={() => toggleNotification('seasonalPromotions')}
            icon="calendar-outline"
          />
          <NotificationOption
            title="Recommendations"
            description="Get personalized service recommendations"
            value={notifications.recommendations}
            onToggle={() => toggleNotification('recommendations')}
            icon="bulb-outline"
          />
        </NotificationSection>

        {/* Account Notifications */}
        <NotificationSection title="Account Notifications">
          <NotificationOption
            title="Account Security"
            description="Important security alerts and login notifications"
            value={notifications.accountSecurity}
            onToggle={() => toggleNotification('accountSecurity')}
            icon="shield-checkmark-outline"
          />
          <NotificationOption
            title="Account Updates"
            description="Get notified about changes to your account"
            value={notifications.accountUpdates}
            onToggle={() => toggleNotification('accountUpdates')}
            icon="person-outline"
          />
          <NotificationOption
            title="Password Changes"
            description="Receive notifications when your password is changed"
            value={notifications.passwordChanges}
            onToggle={() => toggleNotification('passwordChanges')}
            icon="lock-closed-outline"
          />
          <NotificationOption
            title="Payment Updates"
            description="Get notified about payment transactions and updates"
            value={notifications.paymentUpdates}
            onToggle={() => toggleNotification('paymentUpdates')}
            icon="card-outline"
          />
        </NotificationSection>

        {/* Communication Preferences */}
        <NotificationSection title="Communication Preferences">
          <NotificationOption
            title="Email Notifications"
            description="Receive notifications via email"
            value={notifications.emailNotifications}
            onToggle={() => toggleNotification('emailNotifications')}
            icon="mail-outline"
          />
          <NotificationOption
            title="SMS Notifications"
            description="Receive notifications via SMS"
            value={notifications.smsNotifications}
            onToggle={() => toggleNotification('smsNotifications')}
            icon="chatbubble-outline"
          />
          <NotificationOption
            title="Push Notifications"
            description="Receive push notifications on your device"
            value={notifications.pushNotifications}
            onToggle={() => toggleNotification('pushNotifications')}
            icon="notifications-outline"
          />
          <NotificationOption
            title="Marketing Emails"
            description="Receive marketing emails and promotional content"
            value={notifications.marketingEmails}
            onToggle={() => toggleNotification('marketingEmails')}
            icon="megaphone-outline"
          />
        </NotificationSection>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => {
              const allEnabled = Object.keys(notifications).reduce((acc, key) => {
                acc[key] = true;
                return acc;
              }, {});
              setNotifications(allEnabled);
            }}
          >
            <Text style={styles.quickActionText}>Enable All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickActionButton, styles.disableButton]}
            onPress={() => {
              const allDisabled = Object.keys(notifications).reduce((acc, key) => {
                acc[key] = false;
                return acc;
              }, {});
              setNotifications(allDisabled);
            }}
          >
            <Text style={[styles.quickActionText, styles.disableButtonText]}>
              Disable All
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingBottom: 40,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 12,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  notificationOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 13,
    color: Colors.textLight,
    lineHeight: 18,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  disableButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  quickActionText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  disableButtonText: {
    color: Colors.primary,
  },
});


