import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../contexts/CartContext';
import Footer from '../components/Footer';

export default function ServiceSelectionScreen({ navigation }) {
  const { addToCart, getCartItemCount, getCartTotal } = useCart();
  const [selectedService, setSelectedService] = useState('Wash & Fold');
  const [items, setItems] = useState({
    shirts: 0,
    trousers: 0,
    suit: 0,
    coat: 0,
    dress: 0,
    kurta: 0,
    saree: 0,
    tshirt: 0,
  });

  const updateItem = (item, delta) => {
    setItems((prev) => ({
      ...prev,
      [item]: Math.max(0, prev[item] + delta),
    }));
  };

  const handleAddToCart = () => {
    Object.keys(items).forEach((itemId) => {
      if (items[itemId] > 0) {
        addToCart(itemId, items[itemId], selectedService);
      }
    });
    // Reset items after adding to cart
    setItems({
      shirts: 0,
      trousers: 0,
      suit: 0,
      coat: 0,
      dress: 0,
      kurta: 0,
      saree: 0,
      tshirt: 0,
    });
    // Navigate to cart
    navigation.navigate('Cart');
  };

  const services = [
    { id: 'wash-fold', name: 'Wash & Fold' },
    { id: 'ironing', name: 'Ironing' },
    { id: 'dry-cleaning', name: 'Dry Cleaning' },
  ];

  const itemList = [
    { id: 'shirts', name: 'Shirts', price: 2.5, icon: require('../assets/icon/shirt.jpg'), unit: 'item' },
    { id: 'trousers', name: 'Trousers', price: 4.0, icon: require('../assets/icon/pant.png'), unit: 'item' },
    { id: 'suit', name: 'Suit', price: 8.0, icon: require('../assets/icon/suit.jpg'), unit: 'item' },
    { id: 'coat', name: 'Coat', price: 10.0, icon: require('../assets/icon/coat.png'), unit: 'item' },
    { id: 'dress', name: 'Dress', price: 6.0, icon: require('../assets/icon/dress.png'), unit: 'item' },
    { id: 'kurta', name: 'Kurta', price: 5.0, icon: require('../assets/icon/kurta.webp'), unit: 'item' },
    { id: 'saree', name: 'Saree', price: 7.0, icon: require('../assets/icon/saree.jpg'), unit: 'item' },
    { id: 'tshirt', name: 'T-Shirt', price: 3.0, icon: require('../assets/icon/t shirt.jpg'), unit: 'item' },
  ];

  const currentTotal = itemList.reduce((sum, item) => {
    return sum + items[item.id] * item.price;
  }, 0);

  const cartTotal = getCartTotal();
  const cartItemCount = getCartItemCount();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={20} color={Colors.secondary} />
          <Text style={styles.locationText}>123 Clean St, Suite 404</Text>
          <Ionicons name="chevron-down" size={16} color={Colors.primary} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <Text style={styles.greeting}>Hello, Jane!</Text>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for shirts, bedding..."
            placeholderTextColor={Colors.textLight}
          />
        </View>

        {/* Promotional Banners */}
        <View style={styles.bannersContainer}>
          <View style={styles.banner1}>
            <Text style={styles.banner1Title}>20% off your first order!</Text>
            <Text style={styles.banner1Subtitle}>Use code CLEAN20 at checkout.</Text>
            <TouchableOpacity style={styles.banner1Button}>
              <Text style={styles.banner1ButtonText}>Order Now</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.banner2}>
            <Text style={styles.banner2Title}>Eco-friendly</Text>
            <Text style={styles.banner2Subtitle}>Learn more about our eco-friendly practices</Text>
          </View>
        </View>

        {/* Service Tabs */}
        <View style={styles.serviceTabs}>
          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceTab,
                selectedService === service.name && styles.serviceTabActive,
              ]}
              onPress={() => setSelectedService(service.name)}
            >
              <Text
                style={[
                  styles.serviceTabText,
                  selectedService === service.name && styles.serviceTabTextActive,
                ]}
              >
                {service.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Choose Items Section */}
        <Text style={styles.sectionTitle}>Choose Items</Text>

        {itemList.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <View style={styles.itemIcon}>
              <Image source={item.icon} style={styles.itemIconImage} resizeMode="contain" />
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>
                ${item.price.toFixed(2)}/{item.unit}
              </Text>
            </View>
            <View style={styles.quantitySelector}>
              {items[item.id] > 0 && (
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateItem(item.id, -1)}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
              )}
              {items[item.id] > 0 && (
                <Text style={styles.quantityText}>{items[item.id]}</Text>
              )}
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateItem(item.id, 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Cart Bar */}
      {cartItemCount > 0 || Object.values(items).some(qty => qty > 0) ? (
        <View style={styles.cartBarContainer}>
          <TouchableOpacity
            style={styles.cartBar}
            onPress={() => navigation.navigate('Cart')}
          >
            <View style={styles.bagCountBadge}>
              <Text style={styles.bagCountText}>{cartItemCount}</Text>
            </View>
            <Text style={styles.cartBarText}>View Cart</Text>
            <Text style={styles.cartBarTotal}>${(cartTotal + currentTotal).toFixed(2)}</Text>
          </TouchableOpacity>
          {Object.values(items).some(qty => qty > 0) && (
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={handleAddToCart}
            >
              <Text style={styles.addToCartButtonText}>Add to Cart</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 15,
    backgroundColor: Colors.white,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  locationText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.primary,
  },
  bannersContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  banner1: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 15,
  },
  banner1Title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 5,
  },
  banner1Subtitle: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.9,
    marginBottom: 10,
  },
  banner1Button: {
    backgroundColor: Colors.secondary,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  banner1ButtonText: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  banner2: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
  },
  banner2Title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 5,
  },
  banner2Subtitle: {
    fontSize: 12,
    color: Colors.textLight,
  },
  serviceTabs: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  serviceTab: {
    flex: 1,
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  serviceTabActive: {
    backgroundColor: Colors.white,
  },
  serviceTabText: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '600',
  },
  serviceTabTextActive: {
    color: Colors.primary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 15,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  itemIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  itemIconEmoji: {
    fontSize: 24,
  },
  itemIconImage: {
    width: 40,
    height: 40,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 14,
    color: Colors.textLight,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
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
    fontWeight: '600',
    color: Colors.primary,
    minWidth: 20,
    textAlign: 'center',
  },
  cartBarContainer: {
    padding: 10,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  cartBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 12,
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  bagBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    padding: 20,
    justifyContent: 'space-between',
  },
  bagCountBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bagCountText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  cartBarText: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
    marginLeft: 15,
  },
  bagBarText: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
    marginLeft: 15,
  },
  cartBarTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.secondary,
  },
  bagBarTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.secondary,
  },
  addToCartButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  addToCartButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

