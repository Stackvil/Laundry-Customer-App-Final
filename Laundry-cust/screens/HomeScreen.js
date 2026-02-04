import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import Footer from '../components/Footer';

// Mock data for nearby shops
const nearbyShops = [
  {
    id: 1,
    name: 'QuickClean Laundry',
    distance: '0.5 km',
    rating: 4.8,
    image: '🧺',
    address: '123 Main Street',
  },
  {
    id: 2,
    name: 'Fresh & Fold',
    distance: '1.2 km',
    rating: 4.6,
    image: '👔',
    address: '456 Oak Avenue',
  },
  {
    id: 3,
    name: 'Sparkle Wash',
    distance: '2.1 km',
    rating: 4.9,
    image: '✨',
    address: '789 Pine Road',
  },
  {
    id: 4,
    name: 'EcoClean Services',
    distance: '1.8 km',
    rating: 4.7,
    image: '🌿',
    address: '321 Elm Street',
  },
];

export default function HomeScreen({ navigation }) {
  const [currentLocation, setCurrentLocation] = useState('Getting location...');
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);

      // Check if location services are enabled
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        setCurrentLocation('Location services disabled');
        setIsLoadingLocation(false);
        Alert.alert(
          'Location Services Disabled',
          'Please enable location services to find nearby shops.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Request permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setCurrentLocation('Location permission denied');
        setIsLoadingLocation(false);
        return;
      }

      // Get current position with fallback
      let location;
      try {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      } catch (error) {
        console.log('Error getting current position, trying last known...', error);
        location = await Location.getLastKnownPositionAsync();
      }

      if (!location) {
        throw new Error('Current location is unavailable');
      }

      // Reverse geocode to get address
      let geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode && geocode.length > 0) {
        const address = geocode[0];
        const addressString = [
          address.street,
          address.streetNumber,
          address.city,
          address.region,
          address.country,
        ]
          .filter(Boolean)
          .join(', ');

        setCurrentLocation(addressString || 'Location found');
      } else {
        setCurrentLocation(
          `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`
        );
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setCurrentLocation('Unable to get location');
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please check your location settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'OK' },
        ]
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleChangeLocation = () => {
    getCurrentLocation();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentStyle}
      >
        {/* Location Bar Container */}
        <View style={styles.locationBarContainer}>
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={styles.locationBar}
          >
            <View style={styles.locationContent}>
              <Text style={styles.locationIcon}>📍</Text>
              <View style={styles.locationTextContainer}>
                {isLoadingLocation ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={Colors.white} />
                    <Text style={styles.locationAddress}>Getting location...</Text>
                  </View>
                ) : (
                  <Text style={styles.locationAddress} numberOfLines={1}>
                    {currentLocation}
                  </Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={styles.changeLocationButton}
              onPress={handleChangeLocation}
              disabled={isLoadingLocation}
            >
              <Text style={styles.changeLocationText}>
                {isLoadingLocation ? '...' : 'Refresh'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Hero Section Container */}
        <View style={styles.heroContainer}>
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={styles.heroSection}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroEmoji}>🧺</Text>
              <Text style={styles.heroTitle}>CleanFold</Text>
              <Text style={styles.heroSubtitle}>
                Professional laundry services at your doorstep
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Nearby Shops Section */}
        <View style={styles.shopsSection}>
          <Text style={styles.sectionTitle}>Nearby Laundry Shops</Text>
          <Text style={styles.sectionSubtitle}>
            Choose from the best laundry services in your area
          </Text>

          {nearbyShops.map((shop) => (
            <TouchableOpacity
              key={shop.id}
              style={styles.shopCard}
              onPress={() => navigation.navigate('ShopDetail', { shop })}
            >
              <View style={styles.shopImageContainer}>
                <Text style={styles.shopImageEmoji}>{shop.image}</Text>
              </View>
              <View style={styles.shopInfo}>
                <Text style={styles.shopName}>{shop.name}</Text>
                <Text style={styles.shopAddress}>{shop.address}</Text>
                <View style={styles.shopMeta}>
                  <Text style={styles.distance}>📍 {shop.distance}</Text>
                </View>
              </View>
              <View style={styles.arrowContainer}>
                <Text style={styles.arrow}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Footer navigation={navigation} currentScreen="Home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentStyle: {
    paddingBottom: 100,
  },
  locationBarContainer: {
    paddingTop: 25,
    paddingHorizontal: 20,
    paddingBottom: 5,
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  locationIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.9,
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  changeLocationButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  changeLocationText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  heroContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 10,
  },
  heroSection: {
    borderRadius: 20,
    padding: 25,
    minHeight: 170,
    justifyContent: 'center',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroEmoji: {
    fontSize: 55,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  shopsSection: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 20,
  },
  shopCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 2,
    borderColor: Colors.secondary,
  },
  shopImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  shopImageEmoji: {
    fontSize: 30,
  },
  shopInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  shopName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 5,
  },
  shopAddress: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
  },
  shopMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distance: {
    fontSize: 14,
    color: Colors.textLight,
  },
  arrowContainer: {
    justifyContent: 'center',
    paddingLeft: 10,
  },
  arrow: {
    fontSize: 24,
    color: Colors.primary,
  },
});

