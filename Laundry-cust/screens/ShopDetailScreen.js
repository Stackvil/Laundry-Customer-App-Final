import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import Footer from '../components/Footer';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

// Available items
const items = [
  {
    id: 'shirt',
    name: 'Shirt',
    icon: require('../assets/icon/shirt.jpg'),
    basePrice: 50,
  },
  {
    id: 'pant',
    name: 'Pant',
    icon: require('../assets/icon/pant.png'),
    basePrice: 60,
  },
  {
    id: 'saree',
    name: 'Saree',
    icon: require('../assets/icon/saree.jpg'),
    basePrice: 80,
  },
  {
    id: 'kurta',
    name: 'Kurta',
    icon: require('../assets/icon/kurta.webp'),
    basePrice: 55,
  },
  {
    id: 'dress',
    name: 'Dress',
    icon: require('../assets/icon/dress.png'),
    basePrice: 70,
  },
  {
    id: 't-shirt',
    name: 'T-Shirt',
    icon: require('../assets/icon/t shirt.jpg'),
    basePrice: 40,
  },
  {
    id: 'suit',
    name: 'Suit',
    icon: require('../assets/icon/suit.jpg'),
    basePrice: 200,
  },
  {
    id: 'coat',
    name: 'Coat',
    icon: require('../assets/icon/coat.png'),
    basePrice: 250,
  },
];

// Available services with pricing
const services = [
  {
    id: 'washing',
    name: 'Washing',
    icon: require('../assets/washing.jpg'),
    priceMultiplier: 1.0, // Base price
  },
  {
    id: 'ironing',
    name: 'Ironing',
    icon: require('../assets/ironing.webp'),
    priceMultiplier: 0.6, // 60% of base price
  },
  {
    id: 'dry-cleaning',
    name: 'Dry Cleaning',
    icon: require('../assets/dry cleaning.webp'),
    priceMultiplier: 2.5, // 250% of base price
  },
  {
    id: 'stain-removal',
    name: 'Stain Removal',
    icon: require('../assets/strain removal.jpg'),
    priceMultiplier: 1.2, // 120% of base price
  },
  {
    id: 'steam-press',
    name: 'Steam Press',
    icon: require('../assets/steam press.avif'),
    priceMultiplier: 0.8, // 80% of base price
  },
];

export default function ShopDetailScreen({ route, navigation }) {
  const { shop } = route.params;
  const [expandedItems, setExpandedItems] = useState({}); // Track which items are expanded
  const [selectedItemServices, setSelectedItemServices] = useState({}); // Track selected services for each item
  const [itemQuantities, setItemQuantities] = useState({}); // Track quantities for each item
  const { clearCart, addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  // Toggle item expansion
  const toggleItem = (itemId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Update item quantity
  const updateQuantity = (itemId, delta) => {
    setItemQuantities((prev) => {
      const currentQty = prev[itemId] || 0;
      const newQty = Math.max(0, currentQty + delta);

      // If increasing quantity and item is not expanded, expand it to show services
      if (delta > 0 && newQty > 0) {
        setExpandedItems((prevExpanded) => {
          // Only expand if not already expanded
          if (!prevExpanded[itemId]) {
            return {
              ...prevExpanded,
              [itemId]: true,
            };
          }
          return prevExpanded;
        });
      }

      if (newQty === 0) {
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      }

      return {
        ...prev,
        [itemId]: newQty,
      };
    });
  };

  // Get quantity for an item
  const getQuantity = (itemId) => {
    return itemQuantities[itemId] || 0;
  };

  // Toggle service selection for an item
  const toggleService = (itemId, serviceId) => {
    setSelectedItemServices((prev) => {
      const itemServices = prev[itemId] || [];
      const isSelected = itemServices.includes(serviceId);

      if (isSelected) {
        // Remove service
        return {
          ...prev,
          [itemId]: itemServices.filter((id) => id !== serviceId),
        };
      } else {
        // Add service
        return {
          ...prev,
          [itemId]: [...itemServices, serviceId],
        };
      }
    });
  };

  // Check if service is selected for an item
  const isServiceSelected = (itemId, serviceId) => {
    return (selectedItemServices[itemId] || []).includes(serviceId);
  };

  // Get total selected items count
  const getSelectedItemsCount = () => {
    return Object.keys(selectedItemServices).filter(
      (itemId) => selectedItemServices[itemId].length > 0 && getQuantity(itemId) > 0
    ).length;
  };

  // Get total quantity of all selected items
  const getTotalQuantity = () => {
    return Object.keys(selectedItemServices).reduce((total, itemId) => {
      if (selectedItemServices[itemId].length > 0) {
        return total + getQuantity(itemId);
      }
      return total;
    }, 0);
  };

  // Get grand total amount
  const getGrandTotal = () => {
    return items.reduce((total, item) => {
      const qty = getQuantity(item.id);
      const selectedServices = selectedItemServices[item.id] || [];
      return total + calculateItemPrice(item, selectedServices, qty);
    }, 0);
  };

  // Calculate price for item with selected services and quantity
  const calculateItemPrice = (item, selectedServiceIds, quantity = 1) => {
    if (selectedServiceIds.length === 0 || quantity === 0) return 0;

    let pricePerItem = 0;
    selectedServiceIds.forEach((serviceId) => {
      const service = services.find((s) => s.id === serviceId);
      if (service) {
        pricePerItem += item.basePrice * service.priceMultiplier;
      }
    });

    return Math.round(pricePerItem * quantity);
  };

  const getSelectedItemsData = () => {
    return items
      .filter((item) => {
        const qty = getQuantity(item.id);
        return (selectedItemServices[item.id] || []).length > 0 && qty > 0;
      })
      .map((item) => {
        const qty = getQuantity(item.id);
        const itemServices = selectedItemServices[item.id].map((serviceId) =>
          services.find((s) => s.id === serviceId)
        );

        return {
          id: item.id,
          name: item.name,
          icon: item.icon,
          quantity: qty,
          services: itemServices,
          price: calculateItemPrice(item, selectedItemServices[item.id], 1), // Price per unit
        };
      });
  };

  const handleAddToCart = () => {
    const selectedItemsData = getSelectedItemsData();

    if (selectedItemsData.length === 0) {
      return;
    }

    // Add each selected item + service combination to cart without clearing
    selectedItemsData.forEach(itemData => {
      itemData.services.forEach(service => {
        const servicePrice = Math.round(items.find(i => i.id === itemData.id).basePrice * service.priceMultiplier);
        addToCart(itemData.id, itemData.quantity, service.name, {
          id: `${itemData.id}-${service.id}`,
          name: `${itemData.name}`,
          price: servicePrice,
          icon: itemData.icon,
          unit: 'item'
        });
      });
    });

    Alert.alert(
      'Success',
      'Items added to cart successfully!',
      [{ text: 'OK' }]
    );
  };

  const handleProceedToPayment = () => {
    const selectedItemsData = getSelectedItemsData();

    if (selectedItemsData.length === 0) {
      return;
    }

    // Check if user is logged in
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please login to proceed with your order.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Login',
            onPress: () => {
              // Add items to cart before navigating so they are there after login
              clearCart();
              selectedItemsData.forEach(itemData => {
                itemData.services.forEach(service => {
                  const servicePrice = Math.round(items.find(i => i.id === itemData.id).basePrice * service.priceMultiplier);
                  addToCart(itemData.id, itemData.quantity, service.name, {
                    id: `${itemData.id}-${service.id}`,
                    name: `${itemData.name}`,
                    price: servicePrice,
                    icon: itemData.icon,
                    unit: 'item'
                  });
                });
              });
              navigation.navigate('Login', {
                returnScreen: 'OrderSummary',
                returnParams: { shop }
              });
            }
          }
        ]
      );
      return;
    }

    // Clear the cart first as it was doing in handleContinue
    clearCart();

    // Add each selected item + service combination to cart
    selectedItemsData.forEach(itemData => {
      itemData.services.forEach(service => {
        const servicePrice = Math.round(items.find(i => i.id === itemData.id).basePrice * service.priceMultiplier);
        addToCart(itemData.id, itemData.quantity, service.name, {
          id: `${itemData.id}-${service.id}`,
          name: `${itemData.name}`,
          price: servicePrice,
          icon: itemData.icon,
          unit: 'item'
        });
      });
    });

    // Navigate to OrderSummary
    navigation.navigate('OrderSummary', { shop });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Shop Header */}
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
          <View style={styles.shopHeader}>
            <View style={styles.shopImageContainer}>
              <Text style={styles.shopImageEmoji}>{shop.image}</Text>
            </View>
            <View style={styles.shopHeaderInfo}>
              <Text style={styles.shopName}>{shop.name}</Text>
              <Text style={styles.shopAddress}>{shop.address}</Text>
              <View style={styles.shopMeta}>
                <Text style={styles.distance}>📍 {shop.distance}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Items Section */}
        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Select Items</Text>
          <Text style={styles.sectionSubtitle}>
            Choose items and select services for each
          </Text>

          {items.map((item) => {
            const isExpanded = expandedItems[item.id];
            const itemSelectedServices = selectedItemServices[item.id] || [];
            const hasSelectedServices = itemSelectedServices.length > 0;
            const quantity = getQuantity(item.id);

            return (
              <View key={item.id} style={styles.itemCard}>
                {/* Item Header */}
                <View style={styles.itemHeader}>
                  <TouchableOpacity
                    style={styles.itemHeaderLeft}
                    onPress={() => toggleItem(item.id)}
                  >
                    {typeof item.icon === 'string' ? (
                      <Text style={styles.itemIcon}>{item.icon}</Text>
                    ) : (
                      <View style={styles.itemIconContainer}>
                        <Image source={item.icon} style={styles.itemIconImage} resizeMode="contain" />
                      </View>
                    )}
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      {hasSelectedServices && (
                        <View>
                          <Text style={styles.itemSelectedServices}>
                            {itemSelectedServices.length} service{itemSelectedServices.length > 1 ? 's' : ''} selected
                          </Text>
                          <Text style={styles.itemTotalPrice}>Total: ₹{calculateItemPrice(item, itemSelectedServices, quantity)}</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Quantity Controls */}
                  <View style={styles.quantityContainer}>
                    {quantity > 0 && (
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.id, -1)}
                      >
                        <Ionicons name="remove" size={20} color={Colors.primary} />
                      </TouchableOpacity>
                    )}
                    {quantity > 0 && (
                      <Text style={styles.quantityText}>{quantity}</Text>
                    )}
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(item.id, 1)}
                    >
                      <Ionicons name="add" size={20} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.expandButton}
                      onPress={() => toggleItem(item.id)}
                    >
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={24}
                        color={Colors.primary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Services List (shown when expanded) */}
                {isExpanded && (
                  <View style={styles.servicesContainer}>
                    <Text style={styles.servicesTitle}>Select Services for {item.name}:</Text>
                    <View style={styles.servicesList}>
                      {services.map((service) => {
                        const isSelected = isServiceSelected(item.id, service.id);
                        const servicePrice = Math.round(item.basePrice * service.priceMultiplier);

                        return (
                          <TouchableOpacity
                            key={service.id}
                            style={[
                              styles.serviceOption,
                              isSelected && styles.serviceOptionSelected,
                            ]}
                            onPress={() => toggleService(item.id, service.id)}
                          >
                            <View style={styles.serviceOptionLeft}>
                              {/* Tick mark checkbox */}
                              <View style={[
                                styles.checkbox,
                                isSelected && styles.checkboxSelected
                              ]}>
                                {isSelected && (
                                  <Ionicons name="checkmark" size={16} color={Colors.white} />
                                )}
                              </View>
                              <View style={styles.serviceOptionIconContainer}>
                                <Image source={service.icon} style={styles.serviceOptionIconImage} resizeMode="cover" />
                              </View>
                              <View style={styles.serviceOptionInfo}>
                                <Text style={styles.serviceOptionName}>{service.name}</Text>
                                <Text style={styles.serviceOptionPrice}>₹{servicePrice}</Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )
                }
              </View>
            );
          })}
        </View>
      </ScrollView >

      {/* Action Buttons */}
      {
        getSelectedItemsCount() > 0 && (
          <View style={styles.footer}>
            <View style={styles.footerInfo}>
              <Text style={styles.footerText}>
                {getSelectedItemsCount()} item{getSelectedItemsCount() > 1 ? 's' : ''} • {getTotalQuantity()} total qty
              </Text>
              <Text style={styles.footerTotal}>Total: ₹{getGrandTotal()}</Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
                <Text style={styles.addToCartButtonText}>Add to Cart</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.paymentButton} onPress={handleProceedToPayment}>
                <LinearGradient
                  colors={[Colors.primary, Colors.secondary]}
                  style={styles.paymentButtonGradient}
                >
                  <Text style={styles.paymentButtonText}>Proceed to Payment</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )
      }

      <Footer navigation={navigation} currentScreen={null} />
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 15,
  },
  backButton: {
    padding: 5,
  },
  shopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  shopImageEmoji: {
    fontSize: 35,
  },
  shopHeaderInfo: {
    flex: 1,
  },
  shopName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 5,
  },
  shopAddress: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
    marginBottom: 8,
  },
  shopMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distance: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
  },
  itemsSection: {
    padding: 20,
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
  itemCard: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: Colors.secondary,
    overflow: 'hidden',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  itemHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    minWidth: 24,
    textAlign: 'center',
  },
  expandButton: {
    padding: 4,
    marginLeft: 4,
  },
  itemIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  itemIconContainer: {
    width: 50,
    height: 50,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemIconImage: {
    width: 50,
    height: 50,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  itemSelectedServices: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '600',
  },
  itemTotalPrice: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: 'bold',
    marginTop: 2,
  },
  servicesContainer: {
    padding: 15,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    backgroundColor: Colors.background,
  },
  servicesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 12,
  },
  servicesList: {
    gap: 10,
  },
  serviceOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: Colors.lightGray,
  },
  serviceOptionSelected: {
    borderColor: Colors.success,
    backgroundColor: Colors.background,
  },
  serviceOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.lightGray,
    marginRight: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  checkboxSelected: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  serviceOptionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
    overflow: 'hidden',
    backgroundColor: Colors.background,
  },
  serviceOptionIconImage: {
    width: '100%',
    height: '100%',
  },
  serviceOptionInfo: {
    flex: 1,
  },
  serviceOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 2,
  },
  serviceOptionPrice: {
    fontSize: 14,
    color: Colors.textLight,
  },
  footer: {
    backgroundColor: Colors.white,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  footerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '500',
  },
  footerTotal: {
    fontSize: 20,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  addToCartButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  addToCartButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  paymentButton: {
    flex: 1.5,
    borderRadius: 12,
    overflow: 'hidden',
  },
  paymentButtonGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
