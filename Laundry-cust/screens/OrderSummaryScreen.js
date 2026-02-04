import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';

export default function OrderSummaryScreen({ route, navigation }) {
  const { shop } = route.params || {};
  const { cartItems, getCartTotal } = useCart();
  const { user } = useAuth();
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber || '');
  const [address, setAddress] = useState(user?.address || '');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Address form fields
  const [village, setVillage] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [state, setState] = useState('');
  const [landmark, setLandmark] = useState('');

  const orderItems = cartItems.map((item, index) => ({
    id: `${item.id}-${item.service}-${index}`,
    name: item.name,
    service: item.service,
    quantity: item.quantity,
    price: item.price * item.quantity,
    image: item.icon,
    isImage: typeof item.icon !== 'string',
  }));

  const subtotal = getCartTotal();
  const serviceFee = 2.0;
  const deliveryFee = 0;
  const total = subtotal + serviceFee + deliveryFee;

  useEffect(() => {
    if (user?.mobileNumber) {
      setMobileNumber(user.mobileNumber);
    }
    if (user?.address) {
      setAddress(user.address);
    } else {
      // Get live location if no address is saved
      getCurrentLocation();
    }
  }, [user]);

  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);

      // Request permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission',
          'Please grant location permission to auto-fill your address',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'OK' },
          ]
        );
        setIsLoadingLocation(false);
        return;
      }

      // Get current position
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Reverse geocode to get address
      let geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode && geocode.length > 0) {
        const addr = geocode[0];
        setVillage(addr.district || addr.subLocality || '');
        setArea(addr.street || addr.subThoroughfare || '');
        setCity(addr.city || addr.subAdministrativeArea || '');
        setPincode(addr.postalCode || '');
        setState(addr.region || addr.administrativeArea || '');
        setLandmark(addr.name || '');

        // Format full address
        const addressParts = [
          addr.street,
          addr.district || addr.subLocality,
          addr.city || addr.subAdministrativeArea,
          addr.region || addr.administrativeArea,
          addr.postalCode,
        ].filter(Boolean);

        setAddress(addressParts.join(', '));
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please enter address manually.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'OK' },
        ]
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleChangeAddress = () => {
    setShowAddressModal(true);
  };

  const handleSaveAddress = () => {
    if (!village || !city || !pincode) {
      Alert.alert('Required Fields', 'Please fill in Village, City, and Pincode', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK' },
      ]);
      return;
    }

    // Format address
    const addressParts = [
      village,
      area,
      city,
      state,
      pincode,
      landmark && `Near ${landmark}`,
    ].filter(Boolean);

    setAddress(addressParts.join(', '));
    setShowAddressModal(false);
  };

  const handleProceedToPayment = () => {
    if (!mobileNumber || !address) {
      Alert.alert('Required Fields', 'Please fill in mobile number and address', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK' },
      ]);
      return;
    }
    if (mobileNumber.length < 10) {
      Alert.alert('Invalid Mobile Number', 'Please enter a valid mobile number', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK' },
      ]);
      return;
    }
    navigation.navigate('Payment', {
      mobileNumber,
      address,
      total,
      cartItems,
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Your Order</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Your Basket */}
        <View style={styles.section}>
          {shop && (
            <View style={styles.shopDisplay}>
              <View style={styles.shopDisplayTextContainer}>
                <Text style={styles.shopTitleLabel}>Your selected shop is</Text>
                <Text style={styles.shopNameHeader}>{shop.name}</Text>
              </View>
              <Text style={styles.shopEmoji}>{shop.image}</Text>
            </View>
          )}
          <Text style={styles.sectionTitle}>Your Basket</Text>
          {orderItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Your cart is empty</Text>
              <TouchableOpacity
                style={styles.shopButton}
                onPress={() => navigation.navigate('ServiceSelection')}
              >
                <Text style={styles.shopButtonText}>Add Items</Text>
              </TouchableOpacity>
            </View>
          ) : (
            orderItems.map((item) => (
              <View key={item.id} style={styles.basketItem}>
                <View style={styles.itemImage}>
                  {item.isImage ? (
                    <Image source={item.image} style={styles.itemImageIcon} resizeMode="contain" />
                  ) : (
                    <Text style={styles.itemImageEmoji}>{item.image}</Text>
                  )}
                </View>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemService}>
                    {item.service}, x{item.quantity}
                  </Text>
                  <Text style={styles.itemPrice}>₹{item.price.toFixed(2)}</Text>
                </View>
                <TouchableOpacity style={styles.editButton}>
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
          {orderItems.length > 0 && (
            <TouchableOpacity
              style={styles.addMoreButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.addMoreButtonText}>Add More Items</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Delivery Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Details</Text>

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
            <View style={styles.addressHeader}>
              <Text style={styles.label}>Delivery Address</Text>
              <TouchableOpacity onPress={handleChangeAddress}>
                <Text style={styles.changeAddressText}>Change</Text>
              </TouchableOpacity>
            </View>
            {isLoadingLocation ? (
              <View style={styles.locationLoadingContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.locationLoadingText}>Getting your location...</Text>
              </View>
            ) : (
              <View style={styles.addressDisplay}>
                <Ionicons name="location-outline" size={20} color={Colors.primary} />
                <Text style={styles.addressText}>{address || 'No address set'}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Price Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Details</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>₹{subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Service Fee</Text>
            <Text style={styles.priceValue}>₹{serviceFee.toFixed(2)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery Fee</Text>
            <Text style={[styles.priceValue, styles.freeText]}>Free</Text>
          </View>

          {/* Promo Code */}
          <View style={styles.promoContainer}>
            <TextInput
              style={styles.promoInput}
              placeholder="Add promo code"
              placeholderTextColor={Colors.textLight}
            />
            <TouchableOpacity style={styles.applyButton}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>

          {/* Total */}
          <View style={styles.totalBar}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Button */}
      {orderItems.length > 0 && (
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleProceedToPayment}
        >
          <Text style={styles.checkoutButtonText}>Proceed to Payment</Text>
        </TouchableOpacity>
      )}
      <Footer navigation={navigation} currentScreen={null} />

      {/* Address Change Modal */}
      <Modal
        visible={showAddressModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddressModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Address</Text>
              <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                <Ionicons name="close" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Village / Locality *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter village or locality"
                  value={village}
                  onChangeText={setVillage}
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Area / Street</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter area or street"
                  value={area}
                  onChangeText={setArea}
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>City *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter city"
                  value={city}
                  onChangeText={setCity}
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>State</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter state"
                  value={state}
                  onChangeText={setState}
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Pincode *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter pincode"
                  value={pincode}
                  onChangeText={setPincode}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Landmark (Optional)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter nearby landmark"
                  value={landmark}
                  onChangeText={setLandmark}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowAddressModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleSaveAddress}
              >
                <Text style={styles.modalSaveButtonText}>Save Address</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.useLocationContainer}>
              <TouchableOpacity
                style={styles.useLocationButton}
                onPress={getCurrentLocation}
                disabled={isLoadingLocation}
              >
                <Ionicons name="location" size={20} color={Colors.white} />
                <Text style={styles.useLocationButtonText}>
                  {isLoadingLocation ? 'Getting Location...' : 'Use Current Location'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 35,
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 15,
  },
  basketItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  itemImageEmoji: {
    fontSize: 30,
  },
  itemImageIcon: {
    width: 40,
    height: 40,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  itemService: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: '600',
  },
  addMoreButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  addMoreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  serviceDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  serviceDetailContent: {
    flex: 1,
  },
  serviceDetailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  serviceDetailValue: {
    fontSize: 14,
    color: Colors.textLight,
  },
  editLink: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 16,
    color: Colors.primary,
  },
  priceValue: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  freeText: {
    color: Colors.success,
  },
  promoContainer: {
    flexDirection: 'row',
    marginTop: 15,
    marginBottom: 15,
    gap: 10,
  },
  promoInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: Colors.primary,
  },
  applyButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  applyButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  totalBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.secondary,
  },
  checkoutButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 20,
    margin: 20,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 20,
  },
  shopButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  shopButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  changeAddressText: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: '600',
  },
  addressDisplay: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    gap: 10,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: Colors.primary,
    lineHeight: 20,
  },
  locationLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 15,
    gap: 10,
  },
  locationLoadingText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  modalScrollView: {
    maxHeight: 400,
    padding: 20,
  },
  modalInputGroup: {
    marginBottom: 15,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: Colors.primary,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  useLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    gap: 10,
  },
  useLocationButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 10,
    paddingBottom: 10,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  useLocationContainer: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 20,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  modalSaveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  shopDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    backgroundColor: Colors.background,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  shopDisplayTextContainer: {
    flex: 1,
  },
  shopTitleLabel: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  shopEmoji: {
    fontSize: 28,
    marginLeft: 10,
  },
  shopNameHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
});

