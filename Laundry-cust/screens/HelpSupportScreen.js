import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import Footer from '../components/Footer';

export default function HelpSupportScreen({ navigation }) {
  const categories = [
    {
      id: 'faq',
      title: 'Frequently Asked Questions',
      icon: 'help-circle',
      description: 'Find answers to common questions',
      onPress: () => {
        Alert.alert(
          'Frequently Asked Questions',
          'Q: How do I place an order?\nA: Select a service, choose items, add to cart, and checkout.\n\nQ: What are your delivery times?\nA: Standard delivery is 2-3 business days.\n\nQ: Can I cancel my order?\nA: Yes, you can cancel within 1 hour of placing the order.\n\nQ: How do I track my order?\nA: Go to Orders section in your profile to track status.',
          [{ text: 'OK' }]
        );
      },
    },
    {
      id: 'order',
      title: 'Order Issues',
      icon: 'receipt',
      description: 'Problems with your orders',
      onPress: () => {
        Alert.alert(
          'Order Issues',
          'If you have any issues with your order:\n\n• Check your order status in the Orders section\n• Contact us if your order is delayed\n• Report damaged or missing items\n• Request a refund if needed\n\nContact Support: support@laundryapp.com',
          [{ text: 'OK' }]
        );
      },
    },
    {
      id: 'payment',
      title: 'Payment Issues',
      icon: 'card',
      description: 'Payment and billing questions',
      onPress: () => {
        Alert.alert(
          'Payment Issues',
          'Payment Help:\n\n• Check your payment method in Settings\n• Verify your card details are correct\n• Contact your bank if payment fails\n• Refunds are processed within 5-7 business days\n\nFor payment support, contact: payments@laundryapp.com',
          [{ text: 'OK' }]
        );
      },
    },
    {
      id: 'account',
      title: 'Account Issues',
      icon: 'person',
      description: 'Account and profile problems',
      onPress: () => {
        Alert.alert(
          'Account Issues',
          'Account Help:\n\n• Update your profile in Settings\n• Reset your password if forgotten\n• Update your address and contact info\n• Manage your saved addresses\n\nNeed help? Contact: accounts@laundryapp.com',
          [{ text: 'OK' }]
        );
      },
    },
    {
      id: 'contact',
      title: 'Contact Us',
      icon: 'mail',
      description: 'Get in touch with our support team',
      onPress: () => {
        Alert.alert(
          'Contact Us',
          'We\'re here to help!\n\n📧 Email: support@laundryapp.com\n📞 Phone: +1 (555) 123-4567\n💬 Live Chat: Available 9 AM - 6 PM\n\nResponse time: Within 24 hours',
          [
            { text: 'Call', onPress: () => Linking.openURL('tel:+15551234567') },
            { text: 'Email', onPress: () => Linking.openURL('mailto:support@laundryapp.com') },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      },
    },
    {
      id: 'feedback',
      title: 'App Feedback',
      icon: 'chatbubble-ellipses',
      description: 'Share your thoughts and suggestions',
      onPress: () => {
        Alert.alert(
          'App Feedback',
          'We value your feedback!\n\nHelp us improve by sharing:\n• What you like about the app\n• Features you\'d like to see\n• Any bugs or issues\n• General suggestions\n\nEmail us at: feedback@laundryapp.com',
          [
            { text: 'Send Email', onPress: () => Linking.openURL('mailto:feedback@laundryapp.com') },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      },
    },
    {
      id: 'terms',
      title: 'Terms & Conditions',
      icon: 'document-text',
      description: 'Read our terms of service',
      onPress: () => {
        Alert.alert(
          'Terms & Conditions',
          'Terms of Service:\n\n1. Orders must be placed with accurate information\n2. Payment is required at checkout\n3. Cancellations accepted within 1 hour\n4. We are not responsible for lost items if incorrect address is provided\n5. Refunds processed within 5-7 business days\n\nFor full terms, visit: www.laundryapp.com/terms',
          [{ text: 'OK' }]
        );
      },
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: 'shield-checkmark',
      description: 'How we protect your data',
      onPress: () => {
        Alert.alert(
          'Privacy Policy',
          'Your Privacy Matters:\n\n• We collect only necessary information\n• Your data is encrypted and secure\n• We never share your personal information\n• You can delete your account anytime\n• Cookies are used for app functionality only\n\nFor full policy, visit: www.laundryapp.com/privacy',
          [{ text: 'OK' }]
        );
      },
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
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.welcomeText}>How can we help you?</Text>
          <Text style={styles.subtitleText}>
            Browse categories below or contact our support team
          </Text>
        </View>

        {/* Categories Grid */}
        <View style={styles.categoriesContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={category.onPress}
            >
              <LinearGradient
                colors={[Colors.white, Colors.background]}
                style={styles.categoryGradient}
              >
                <View style={styles.categoryIconContainer}>
                  <Ionicons
                    name={category.icon}
                    size={32}
                    color={Colors.primary}
                  />
                </View>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categoryDescription}>
                  {category.description}
                </Text>
                <View style={styles.categoryArrow}>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={Colors.textLight}
                  />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Contact Section */}
        <View style={styles.quickContactSection}>
          <Text style={styles.sectionTitle}>Need Immediate Help?</Text>
          <View style={styles.quickContactButtons}>
            <TouchableOpacity
              style={styles.quickContactButton}
              onPress={() => Linking.openURL('tel:+15551234567')}
            >
              <Ionicons name="call" size={24} color={Colors.white} />
              <Text style={styles.quickContactButtonText}>Call Us</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickContactButton}
              onPress={() => Linking.openURL('mailto:support@laundryapp.com')}
            >
              <Ionicons name="mail" size={24} color={Colors.white} />
              <Text style={styles.quickContactButtonText}>Email Us</Text>
            </TouchableOpacity>
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
  headerSection: {
    marginBottom: 25,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  categoriesContainer: {
    marginBottom: 25,
  },
  categoryCard: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 12,
    position: 'relative',
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: Colors.lightGray,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  categoryDescription: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 10,
  },
  categoryArrow: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -10,
  },
  quickContactSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  quickContactButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  quickContactButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  quickContactButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

