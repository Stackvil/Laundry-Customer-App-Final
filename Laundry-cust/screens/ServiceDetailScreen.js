import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  ScrollView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Colors } from '../constants/Colors';
import Footer from '../components/Footer';

// Mock products data based on service
const getProductsByService = (serviceName) => {
  const allProducts = {
    'Wash & Iron': [
      { id: 1, name: 'Shirt', icon: require('../assets/icon/shirt.jpg'), price: 80 }, // 50 (wash) + 30 (iron)
      { id: 2, name: 'Pant', icon: require('../assets/icon/pant.png'), price: 95 }, // 60 (wash) + 35 (iron)
      { id: 3, name: 'Saree', icon: require('../assets/icon/saree.jpg'), price: 130 }, // 80 (wash) + 50 (iron)
      { id: 4, name: 'Kurta', icon: require('../assets/icon/kurta.webp'), price: 87 }, // 55 (wash) + 32 (iron)
      { id: 5, name: 'Dress', icon: require('../assets/icon/dress.png'), price: 110 }, // 70 (wash) + 40 (iron)
      { id: 6, name: 'T-Shirt', icon: require('../assets/icon/t shirt.jpg'), price: 40 }, // 40 (wash) + 0 (iron not available)
    ],
    Washing: [
      { id: 1, name: 'Shirt', icon: require('../assets/icon/shirt.jpg'), price: 50 },
      { id: 2, name: 'Pant', icon: require('../assets/icon/pant.png'), price: 60 },
      { id: 3, name: 'Saree', icon: require('../assets/icon/saree.jpg'), price: 80 },
      { id: 4, name: 'Kurta', icon: require('../assets/icon/kurta.webp'), price: 55 },
      { id: 5, name: 'Dress', icon: require('../assets/icon/dress.png'), price: 70 },
      { id: 6, name: 'T-Shirt', icon: require('../assets/icon/t shirt.jpg'), price: 40 },
    ],
    Ironing: [
      { id: 1, name: 'Shirt', icon: require('../assets/icon/shirt.jpg'), price: 30 },
      { id: 2, name: 'Pant', icon: require('../assets/icon/pant.png'), price: 35 },
      { id: 3, name: 'Saree', icon: require('../assets/icon/saree.jpg'), price: 50 },
      { id: 4, name: 'Kurta', icon: require('../assets/icon/kurta.webp'), price: 32 },
      { id: 5, name: 'Dress', icon: require('../assets/icon/dress.png'), price: 40 },
    ],
    'Dry Cleaning': [
      { id: 1, name: 'Suit', icon: require('../assets/icon/suit.jpg'), price: 200 },
      { id: 2, name: 'Coat', icon: require('../assets/icon/coat.png'), price: 250 },
      { id: 3, name: 'Saree', icon: require('../assets/icon/saree.jpg'), price: 180 },
      { id: 4, name: 'Blazer', icon: require('../assets/icon/coat.png'), price: 220 },
    ],
    'Stain Removal': [
      { id: 1, name: 'Shirt', icon: require('../assets/icon/shirt.jpg'), price: 100 },
      { id: 2, name: 'Pant', icon: require('../assets/icon/pant.png'), price: 120 },
      { id: 3, name: 'Dress', icon: require('../assets/icon/dress.png'), price: 150 },
    ],
    'Steam Press': [
      { id: 1, name: 'Shirt', icon: require('../assets/icon/shirt.jpg'), price: 40 },
      { id: 2, name: 'Pant', icon: require('../assets/icon/pant.png'), price: 45 },
      { id: 3, name: 'Saree', icon: require('../assets/icon/saree.jpg'), price: 60 },
    ],
  };

  return allProducts[serviceName] || allProducts.Washing;
};

export default function ServiceDetailScreen({ route, navigation }) {
  const { shop, service, selectedServices, selectedItems } = route.params;
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  
  // Check if we're using the new flow (selectedItems) or old flow (service)
  const isNewFlow = selectedItems && selectedItems.length > 0;
  
  // For new flow, use selectedItems directly; for old flow, get products by service
  const products = isNewFlow 
    ? selectedItems.map(item => ({
        id: item.id,
        name: item.name,
        icon: item.icon,
        price: item.price, // Already calculated with services
      }))
    : getProductsByService(service?.name || 'Washing');
  
  // State to track selected products and quantities
  const [selectedProducts, setSelectedProducts] = useState({});
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Calculate price multiplier based on number of selected services (for old flow)
  const getPriceMultiplier = () => {
    if (isNewFlow) return 1.0; // Prices already calculated in new flow
    const serviceCount = selectedServices ? selectedServices.length : 1;
    // 1 service = 1.0x, 2 services = 1.3x, 3 services = 1.6x, 4+ services = 2.0x
    if (serviceCount === 1) return 1.0;
    if (serviceCount === 2) return 1.3;
    if (serviceCount === 3) return 1.6;
    return 2.0; // 4 or more services
  };

  // Calculate adjusted price for a product based on selected services
  const getAdjustedPrice = (basePrice) => {
    if (isNewFlow) return basePrice; // Price already calculated
    const multiplier = getPriceMultiplier();
    return Math.round(basePrice * multiplier);
  };

  const updateQuantity = (productId, delta) => {
    setSelectedProducts((prev) => {
      const currentQty = prev[productId] || 0;
      const newQty = Math.max(0, currentQty + delta);
      
      if (newQty === 0) {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      }
      
      return {
        ...prev,
        [productId]: newQty,
      };
    });
  };

  const getTotalItems = () => {
    return Object.values(selectedProducts).reduce((sum, qty) => sum + qty, 0);
  };

  // Animate continue button when items are selected
  useEffect(() => {
    const totalItems = Object.values(selectedProducts).reduce((sum, qty) => sum + qty, 0);
    const hasItems = totalItems > 0;
    Animated.timing(slideAnim, {
      toValue: hasItems ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [selectedProducts, slideAnim]);

  const getTotalPrice = () => {
    return products.reduce((total, product) => {
      const qty = selectedProducts[product.id] || 0;
      const adjustedPrice = getAdjustedPrice(product.price);
      return total + adjustedPrice * qty;
    }, 0);
  };

  const handleContinue = () => {
    const itemsWithQuantity = products
      .filter((product) => selectedProducts[product.id] > 0)
      .map((product) => ({
        ...product,
        price: getAdjustedPrice(product.price), // Use adjusted price
        quantity: selectedProducts[product.id],
      }));

    if (itemsWithQuantity.length === 0) {
      Alert.alert('No Items Selected', 'Please select at least one item to continue.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK' },
      ]);
      return;
    }

    // For new flow, include the selected services for each item
    const productsWithServices = isNewFlow
      ? itemsWithQuantity.map(item => {
          const originalItem = selectedItems.find(orig => orig.id === item.id);
          return {
            ...item,
            selectedServices: originalItem?.selectedServices || [],
          };
        })
      : itemsWithQuantity;

    if (isAuthenticated) {
      // User is logged in, add items directly to cart and navigate to cart
      let itemsAdded = 0;
      productsWithServices.forEach((product) => {
        // Determine service name - use first selected service or default
        const serviceName = isNewFlow 
          ? (product.selectedServices && product.selectedServices.length > 0
              ? product.selectedServices.map(s => s.name).join(', ')
              : 'Wash & Fold')
          : (service?.name || 'Wash & Fold');
        
        // Add product directly to cart with its custom price and details
        // product.price is already the adjusted price per item
        addToCart(
          product.id || product.name.toLowerCase().replace(/\s+/g, '-'),
          product.quantity,
          serviceName,
          {
            id: product.id || product.name.toLowerCase().replace(/\s+/g, '-'),
            name: product.name,
            price: product.price, // Price per item (already adjusted)
            icon: typeof product.icon === 'string' ? product.icon : product.icon,
            unit: 'item',
          }
        );
        itemsAdded += product.quantity;
      });

      // Navigate directly to Order Summary (Order Confirmation)
      navigation.navigate('OrderSummary');
    } else {
      // User is not logged in, navigate to login first
      navigation.navigate('Login', {
        returnScreen: 'OrderSummary',
        returnParams: {
          shop,
          items: productsWithServices,
        },
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Service Header */}
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.serviceHeader}>
          <Text style={styles.serviceIcon}>
            {isNewFlow 
              ? '🛍️'
              : (selectedServices && selectedServices.length > 1 
                ? '🛍️' 
                : (service?.icon || '🧼'))}
          </Text>
          <View style={styles.serviceHeaderInfo}>
            <Text style={styles.serviceName}>
              {isNewFlow
                ? `${selectedItems.length} item${selectedItems.length > 1 ? 's' : ''} selected`
                : (selectedServices && selectedServices.length > 0
                  ? selectedServices.map((svc) => svc.name).join(', ')
                  : service?.name || 'Service')}
            </Text>
            <Text style={styles.serviceDescription}>
              {isNewFlow
                ? 'Select quantities for each item'
                : (selectedServices && selectedServices.length > 1
                  ? `${selectedServices.length} services selected`
                  : (service?.description || 'Service'))}
            </Text>
            <Text style={styles.shopName}>at {shop.name}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Products Section */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>Select Products</Text>
          <Text style={styles.sectionSubtitle}>
            Choose items and adjust quantities
          </Text>

          <View style={styles.productsList}>
            {products.map((product) => {
              const quantity = selectedProducts[product.id] || 0;
              const adjustedPrice = getAdjustedPrice(product.price);
              const serviceCount = isNewFlow 
                ? (selectedItems.find(item => item.id === product.id)?.selectedServices?.length || 0)
                : (selectedServices ? selectedServices.length : 1);
              const selectedServicesForItem = isNewFlow
                ? (selectedItems.find(item => item.id === product.id)?.selectedServices || [])
                : [];
              
              return (
                <View key={product.id} style={styles.productCard}>
                  <View style={styles.productInfo}>
                    {typeof product.icon === 'string' ? (
                      <Text style={styles.productIcon}>{product.icon}</Text>
                    ) : (
                      <View style={styles.productIconContainer}>
                        <Image source={product.icon} style={styles.productIconImage} resizeMode="contain" />
                      </View>
                    )}
                    <View style={styles.productDetails}>
                      <Text style={styles.productName}>{product.name}</Text>
                      <Text style={styles.productPrice}>
                        ₹{adjustedPrice} per item
                        {isNewFlow && selectedServicesForItem.length > 0 && (
                          <Text style={styles.priceNote}>
                            {' '}({selectedServicesForItem.map(s => s.name).join(', ')})
                          </Text>
                        )}
                        {!isNewFlow && serviceCount > 1 && (
                          <Text style={styles.priceNote}> ({serviceCount} services)</Text>
                        )}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.quantityContainer}>
                    {quantity > 0 && (
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(product.id, -1)}
                      >
                        <Text style={styles.quantityButtonText}>-</Text>
                      </TouchableOpacity>
                    )}
                    {quantity > 0 && (
                      <Text style={styles.quantityText}>{quantity}</Text>
                    )}
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(product.id, 1)}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Continue Button - Animated from bottom */}
      {getTotalItems() > 0 && (
        <Animated.View
          style={[
            styles.footer,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 0],
                  }),
                },
              ],
              opacity: slideAnim,
            },
          ]}
        >
          <View style={styles.footerInfo}>
            <Text style={styles.footerItems}>{getTotalItems()} items</Text>
            <Text style={styles.footerTotal}>₹{getTotalPrice()}</Text>
          </View>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              style={styles.continueButtonGradient}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}
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
    padding: 15,
    paddingTop: 35,
    paddingBottom: 15,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  backButton: {
    padding: 5,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  serviceHeaderInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 3,
  },
  serviceDescription: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.9,
    marginBottom: 3,
  },
  shopName: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '600',
    opacity: 0.95,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 180,
  },
  productsSection: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 3,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 12,
  },
  productsList: {
    gap: 8,
  },
  productCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: Colors.secondary,
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  productIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  productIconContainer: {
    width: 40,
    height: 40,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productIconImage: {
    width: 40,
    height: 40,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 3,
  },
  productPrice: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '500',
  },
  priceNote: {
    fontSize: 10,
    color: Colors.secondary,
    fontStyle: 'italic',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    minWidth: 25,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 90,
    left: 10,
    right: 10,
    backgroundColor: Colors.white,
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
    borderRadius: 15,
    zIndex: 1000,
  },
  footerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  footerItems: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '500',
  },
  footerTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.secondary,
  },
  continueButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  continueButtonGradient: {
    padding: 14,
    alignItems: 'center',
  },
  continueButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

