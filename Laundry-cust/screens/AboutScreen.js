import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import Footer from '../components/Footer';

export default function AboutScreen({ navigation }) {
  const appVersion = '1.0.0';
  const appName = 'CleanFold';

  const aboutSections = [
    {
      title: 'App Information',
      items: [
        { label: 'Version', value: appVersion },
        { label: 'Build', value: '2024.01.15' },
        { label: 'Platform', value: 'React Native' },
      ],
    },
    {
      title: 'Company',
      items: [
        { label: 'Name', value: 'CleanFold Services' },
        { label: 'Founded', value: '2024' },
        { label: 'Location', value: 'India' },
      ],
    },
  ];

  const links = [
    {
      id: 'terms',
      title: 'Terms of Service',
      icon: 'document-text',
      url: 'https://cleanfold.com/terms',
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: 'shield-checkmark',
      url: 'https://cleanfold.com/privacy',
    },
    {
      id: 'website',
      title: 'Visit Website',
      icon: 'globe',
      url: 'https://cleanfold.com',
    },
    {
      id: 'support',
      title: 'Contact Support',
      icon: 'mail',
      url: 'mailto:support@cleanfold.com',
    },
  ];

  const handleLinkPress = (url) => {
    Linking.openURL(url).catch((err) =>
      console.error('Failed to open URL:', err)
    );
  };

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
          <Text style={styles.headerTitle}>About</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🧺</Text>
          </View>
          <Text style={styles.appName}>{appName}</Text>
          <Text style={styles.appTagline}>Professional Laundry Services</Text>
          <Text style={styles.appVersion}>Version {appVersion}</Text>
        </View>

        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionText}>
            CleanFold is your trusted partner for professional laundry and dry cleaning services.
            We provide convenient, reliable, and eco-friendly solutions to keep your clothes fresh and clean.
          </Text>
        </View>

        {aboutSections.map((section, index) => (
          <View key={index} style={styles.infoSection}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.infoCard}>
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex} style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{item.label}:</Text>
                  <Text style={styles.infoValue}>{item.value}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.linksSection}>
          <Text style={styles.sectionTitle}>Links</Text>
          {links.map((link) => (
            <TouchableOpacity
              key={link.id}
              style={styles.linkItem}
              onPress={() => handleLinkPress(link.url)}
            >
              <Ionicons name={link.icon} size={24} color={Colors.primary} />
              <Text style={styles.linkText}>{link.title}</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.copyrightSection}>
          <Text style={styles.copyrightText}>
            © 2024 CleanFold Services. All rights reserved.
          </Text>
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
  logoSection: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 30,
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
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  logoEmoji: {
    fontSize: 50,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 5,
  },
  appTagline: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 10,
  },
  appVersion: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '500',
  },
  descriptionSection: {
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
  descriptionText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 22,
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 15,
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
  linksSection: {
    marginBottom: 20,
  },
  linkItem: {
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
  linkText: {
    flex: 1,
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: 12,
  },
  copyrightSection: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  copyrightText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
  },
});
