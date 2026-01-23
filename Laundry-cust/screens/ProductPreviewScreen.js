import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../constants/Colors';
import { useCart } from '../contexts/CartContext';
import Footer from '../components/Footer';

export default function ProductPreviewScreen({ route, navigation }) {
  const { addToCart } = useCart();
  const { shop, service, product, products, totalPrice: routeTotalPrice, selectedServices } = route.params;
  
  // Handle both single product (old flow) and multiple products (new flow)
  const isMultipleProducts = products && products.length > 0;
  const selectedProducts = isMultipleProducts ? products : [{ ...product, quantity: 1 }];
  const calculatedTotal = isMultipleProducts 
    ? routeTotalPrice 
    : (product ? product.price * 1 : 0);
  
  // Get selected services - if selectedServices is passed, use it, otherwise use the single service
  const servicesToDisplay = selectedServices && selectedServices.length > 0 
    ? selectedServices 
    : (service ? [service] : []);
  
  // Mock contact details for shop
  const shopContact = {
    phone: '+91 98765 43210',
    email: shop.name.toLowerCase().replace(/\s+/g, '') + '@cleanfold.com',
    address: shop.address || '123 Main Street',
    distance: shop.distance || '0.5 km',
  };
  
  const [productImages, setProductImages] = useState([]);
  const [imageError, setImageError] = useState(false);

  const requestPermissions = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraPermission.status !== 'granted' || mediaPermission.status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera and media library permissions to upload images.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'OK' },
        ]
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;
    
    // Clear error when user starts uploading
    setImageError(false);

    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: async () => {
            try {
              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.8,
                allowsEditing: true,
              });

              if (!result.canceled && result.assets && result.assets.length > 0) {
                const newImages = result.assets.map((asset) => asset.uri);
                setProductImages((prev) => [...prev, ...newImages]);
                setImageError(false);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to take photo. Please try again.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'OK' },
              ]);
            }
          },
        },
        {
          text: 'Gallery',
          onPress: async () => {
            try {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.8,
              });

              if (!result.canceled && result.assets) {
                const newImages = result.assets.map((asset) => asset.uri);
                setProductImages((prev) => [...prev, ...newImages]);
                setImageError(false);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to pick image. Please try again.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'OK' },
              ]);
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const removeImage = (index) => {
    setProductImages((prev) => prev.filter((_, i) => i !== index));
  };

  const totalPrice = calculatedTotal;

  const handleAddToCart = () => {
    // Validate that images are uploaded
    if (productImages.length === 0) {
      setImageError(true);
      Alert.alert(
        'Image Required',
        'Please upload at least one product image before adding to cart.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'OK' },
        ]
      );
      return;
    }

    setImageError(false);
    let itemsAdded = 0;
    selectedProducts.forEach((product) => {
      const serviceName = servicesToDisplay[0]?.name || service?.name || 'Wash & Fold';
      
      // Add product directly with its custom price and details
      addToCart(
        product.id || product.name.toLowerCase().replace(/\s+/g, '-'),
        product.quantity,
        serviceName,
        {
          id: product.id || product.name.toLowerCase().replace(/\s+/g, '-'),
          name: product.name,
          price: product.price,
          icon: product.icon || '👕',
          unit: 'item',
        }
      );
      itemsAdded += product.quantity;
    });

    Alert.alert(
      'Added to Cart!',
      `${itemsAdded} item(s) added to your cart successfully.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Continue Shopping',
          onPress: () => navigation.goBack(),
        },
        {
          text: 'View Cart',
          onPress: () => navigation.navigate('Cart'),
          style: 'default',
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Product Preview Header */}
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        style={styles.header}
      >
        <View>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.productPreview}>
          <Text style={styles.productIcon}>
            {isMultipleProducts ? '🛍️' : product?.icon || '👕'}
          </Text>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>
              {isMultipleProducts ? 'Selected Products' : product?.name || 'Product'}
            </Text>
            <Text style={styles.serviceName}>
              {servicesToDisplay.length > 0
                ? servicesToDisplay.map((svc) => svc.name || service?.name).join(', ')
                : service?.name || 'Service'}
            </Text>
            <Text style={styles.shopName}>at {shop.name}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Shop & Services Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shop & Services Details</Text>
        
        {/* Shop Information */}
        <View style={styles.shopInfoCard}>
          <View style={styles.shopInfoHeader}>
            <Text style={styles.shopInfoIcon}>{shop.image || '🧺'}</Text>
            <View style={styles.shopInfoDetails}>
              <Text style={styles.shopInfoName}>{shop.name}</Text>
              <Text style={styles.shopInfoDistance}>📍 {shopContact.distance}</Text>
            </View>
          </View>
          
          {/* Contact Details */}
          <View style={styles.contactDetails}>
            <View style={styles.contactItem}>
              <Ionicons name="call" size={18} color={Colors.primary} />
              <Text style={styles.contactText}>{shopContact.phone}</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="mail" size={18} color={Colors.primary} />
              <Text style={styles.contactText}>{shopContact.email}</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="location" size={18} color={Colors.primary} />
              <Text style={styles.contactText}>{shopContact.address}</Text>
            </View>
          </View>
        </View>

        {/* Selected Services */}
        <View style={styles.servicesInfoCard}>
          <Text style={styles.servicesInfoTitle}>Selected Services</Text>
          <View style={styles.servicesList}>
            {servicesToDisplay.map((svc, index) => (
              <View key={index} style={styles.serviceItem}>
                <Text style={styles.serviceItemIcon}>{svc.icon || '🧼'}</Text>
                <View style={styles.serviceItemInfo}>
                  <Text style={styles.serviceItemName}>{svc.name}</Text>
                  <Text style={styles.serviceItemDesc}>{svc.description || svc.price}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Upload Product Images */}
      <View style={[styles.section, imageError && styles.sectionError]}>
        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>Upload Product Images</Text>
          <Text style={styles.requiredText}>* Required</Text>
        </View>
        <Text style={styles.uploadSubtext}>
          Upload images of the items you want to service
        </Text>
        <TouchableOpacity 
          style={[styles.uploadButton, imageError && styles.uploadButtonError]} 
          onPress={pickImage}
        >
          <Ionicons name="camera" size={24} color={imageError ? '#ef4444' : Colors.primary} />
          <Text style={[styles.uploadButtonText, imageError && styles.uploadButtonTextError]}>
            Choose Images
          </Text>
        </TouchableOpacity>
        {imageError && (
          <Text style={styles.errorText}>Please upload at least one product image</Text>
        )}

        {productImages.length > 0 && (
          <View style={styles.imagesContainer}>
            {productImages.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.uploadedImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color={Colors.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Order Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        
        {/* Selected Items List */}
        <View style={styles.selectedItemsContainer}>
          {selectedProducts.map((item, index) => (
            <View key={index} style={styles.selectedItemCard}>
              {typeof item.icon === 'string' ? (
                <Text style={styles.selectedItemIcon}>{item.icon}</Text>
              ) : (
                <View style={styles.selectedItemIconContainer}>
                  <Image source={item.icon} style={styles.selectedItemIconImage} resizeMode="contain" />
                </View>
              )}
              <View style={styles.selectedItemInfo}>
                <Text style={styles.selectedItemName}>{item.name}</Text>
                <Text style={styles.selectedItemPrice}>₹{item.price} × {item.quantity}</Text>
              </View>
              <Text style={styles.selectedItemTotal}>₹{item.price * item.quantity}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>₹{totalPrice}</Text>
        </View>
      </View>

      {/* Add to Cart Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleAddToCart}>
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={styles.placeOrderButton}
          >
            <Text style={styles.placeOrderButtonText}>Add to Cart</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <Footer navigation={navigation} currentScreen={null} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 5,
  },
  productPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productIcon: {
    fontSize: 60,
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 5,
  },
  serviceName: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
    marginBottom: 3,
  },
  shopName: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '600',
    opacity: 0.95,
  },
  section: {
    backgroundColor: Colors.white,
    padding: 20,
    marginTop: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.lightGray,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 15,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: Colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginHorizontal: 20,
    minWidth: 40,
    textAlign: 'center',
  },
  priceText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
  selectedItemsContainer: {
    marginBottom: 15,
  },
  selectedItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  selectedItemIcon: {
    fontSize: 30,
    marginRight: 12,
  },
  selectedItemIconContainer: {
    width: 40,
    height: 40,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedItemIconImage: {
    width: 40,
    height: 40,
  },
  selectedItemInfo: {
    flex: 1,
  },
  selectedItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  selectedItemPrice: {
    fontSize: 14,
    color: Colors.textLight,
  },
  selectedItemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.secondary,
  },
  totalPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  totalPriceLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  totalPriceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.secondary,
  },
  shopInfoCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  shopInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  shopInfoIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  shopInfoDetails: {
    flex: 1,
  },
  shopInfoName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 5,
  },
  shopInfoDistance: {
    fontSize: 14,
    color: Colors.textLight,
  },
  contactDetails: {
    gap: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contactText: {
    fontSize: 14,
    color: Colors.primary,
    flex: 1,
  },
  servicesInfoCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  servicesInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 12,
  },
  servicesList: {
    gap: 10,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 10,
  },
  serviceItemIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  serviceItemInfo: {
    flex: 1,
  },
  serviceItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 3,
  },
  serviceItemDesc: {
    fontSize: 12,
    color: Colors.textLight,
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
    borderRadius: 10,
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
  uploadSubtext: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 10,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 15,
    borderWidth: 2,
    borderColor: Colors.secondary,
    borderStyle: 'dashed',
    gap: 10,
  },
  uploadButtonError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  uploadButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  uploadButtonTextError: {
    color: '#ef4444',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  requiredText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '600',
  },
  sectionError: {
    borderWidth: 2,
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 8,
    fontWeight: '500',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 15,
  },
  imageWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  uploadedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.white,
    borderRadius: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: Colors.textLight,
  },
  summaryValue: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  totalRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.secondary,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  placeOrderButton: {
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    overflow: 'hidden',
  },
  placeOrderButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

