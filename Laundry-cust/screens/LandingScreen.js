import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';

export default function LandingScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.logoIcon}>
          <Text style={styles.logoEmoji}>🧺</Text>
        </View>
        <Text style={styles.logoText}>CleanFold</Text>
      </View>

      {/* Illustration Panel */}
      <View style={styles.illustrationPanel}>
        <View style={styles.basketContainer}>
          <Text style={styles.basketEmoji}>🧺</Text>
          <View style={styles.laundryStack}>
            <View style={[styles.laundryItem, styles.laundryItem1]} />
            <View style={[styles.laundryItem, styles.laundryItem2]} />
            <View style={[styles.laundryItem, styles.laundryItem3]} />
          </View>
        </View>
      </View>

      {/* Headline */}
      <Text style={styles.headline}>Laundry, simplified.</Text>

      {/* Description */}
      <Text style={styles.description}>
        Schedule a pickup, and we'll handle the washing, folding, and delivery right to your door.
      </Text>

      {/* Feature Tags */}
      <View style={styles.featuresContainer}>
        <View style={styles.featureRow}>
          <View style={styles.featureTag}>
            <Text style={styles.featureIcon}>🚚</Text>
            <Text style={styles.featureText}>Free Delivery</Text>
          </View>
          <View style={styles.featureTag}>
            <Text style={styles.featureIcon}>🌿</Text>
            <Text style={styles.featureText}>Eco-Friendly</Text>
          </View>
        </View>
        <View style={styles.featureTag}>
          <Text style={styles.featureIcon}>⏱️</Text>
          <Text style={styles.featureText}>Fast Turnaround</Text>
        </View>
      </View>

      {/* CTA Buttons */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('ServiceSelection')}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Account')}
        >
          <Text style={styles.secondaryButtonText}>Log In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    padding: 20,
    alignItems: 'center',
    paddingTop: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoEmoji: {
    fontSize: 30,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  illustrationPanel: {
    width: '100%',
    height: 250,
    backgroundColor: Colors.background,
    borderRadius: 20,
    marginBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  basketContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  basketEmoji: {
    fontSize: 80,
    marginBottom: 10,
  },
  laundryStack: {
    position: 'absolute',
    top: 20,
    alignItems: 'center',
  },
  laundryItem: {
    width: 100,
    height: 20,
    borderRadius: 10,
    marginBottom: 5,
  },
  laundryItem1: {
    backgroundColor: '#90cdf4',
  },
  laundryItem2: {
    backgroundColor: '#81e6d9',
  },
  laundryItem3: {
    backgroundColor: '#faf0e6',
  },
  headline: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 40,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  featureTag: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: 5,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  featureText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  ctaContainer: {
    width: '100%',
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 15,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

