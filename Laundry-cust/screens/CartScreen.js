import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';

export default function CartScreen({ navigation }) {
  const { cartItems, updateCartItem, removeFromCart, getCartTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please login or signup to access your cart',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => navigation.navigate('Home'),
          },
          {
            text: 'Signup',
            onPress: () => navigation.navigate('Signup'),
          },
          {
            text: 'Login',
            onPress: () => navigation.navigate('Login'),
            style: 'default',
          },
        ],
        { cancelable: false }
      );
    }
  }, [isAuthenticated, navigation]);

  const subtotal = getCartTotal();
  const serviceFee = 2.0;
  const deliveryFee = 0;
  const total = subtotal + serviceFee + deliveryFee;

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      return;
    }
    navigation.navigate('OrderSummary');
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
        <Text style={styles.headerTitle}>Your Cart</Text>
        <View style={styles.placeholder} />
      </View>

      {!isAuthenticated ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔒</Text>
          <Text style={styles.emptyTitle}>Login Required</Text>
          <Text style={styles.emptySubtitle}>
            Please login to access your cart
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.shopButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      ) : cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Add items to your cart to get started
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.shopButtonText}>Browse Services</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Cart Items */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Cart Items</Text>
                <TouchableOpacity onPress={clearCart}>
                  <Text style={styles.clearText}>Clear All</Text>
                </TouchableOpacity>
              </View>
              {cartItems.map((item, index) => (
                <View key={`${item.id}-${item.service}-${index}`} style={styles.cartItem}>
                  <View style={styles.itemImage}>
                    {typeof item.icon === 'string' ? (
                      <Text style={styles.itemImageEmoji}>{item.icon}</Text>
                    ) : (
                      <Image source={item.icon} style={styles.itemImageIcon} resizeMode="contain" />
                    )}
                  </View>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemService}>{item.service}</Text>
                    <Text style={styles.itemPrice}>₹{item.price.toFixed(2)}/{item.unit}</Text>
                  </View>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateCartItem(item.id, item.service, item.quantity - 1)}
                    >
                      <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateCartItem(item.id, item.service, item.quantity + 1)}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeFromCart(item.id, item.service)}
                  >
                    <Ionicons name="trash-outline" size={20} color={Colors.error || '#ef4444'} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Price Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Price Summary</Text>
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
              <View style={styles.totalBar}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
              </View>
            </View>

            {/* Delivery & Order Status Info */}
            <View style={styles.infoSection}>
              <View style={styles.infoCard}>
                <Ionicons name="time-outline" size={24} color={Colors.secondary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Fast Delivery</Text>
                  <Text style={styles.infoText}>
                    Your beautiful clothes will be delivered in one or 2 days
                  </Text>
                </View>
              </View>
              <View style={styles.infoCard}>
                <Ionicons name="checkmark-circle-outline" size={24} color={Colors.secondary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle}>Track Your Order</Text>
                  <Text style={styles.infoText}>
                    Check the status of your order once placed the order
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Place Order Button */}
          <TouchableOpacity
            style={styles.placeOrderButton}
            onPress={handlePlaceOrder}
          >
            <Text style={styles.placeOrderButtonText}>Place Order</Text>
          </TouchableOpacity>
        </>
      )}
      <Footer navigation={navigation} currentScreen="Cart" />
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
  placeholder: {
    width: 24,
  },
  scrollView: {
    flex: 1,
    padding: 20,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 30,
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
  section: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  clearText: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: '600',
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
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
    fontSize: 14,
    color: Colors.textLight,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
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
  removeButton: {
    padding: 5,
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
    color: Colors.success || '#48bb78',
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
  placeOrderButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 20,
    margin: 20,
    alignItems: 'center',
  },
  placeOrderButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
});

