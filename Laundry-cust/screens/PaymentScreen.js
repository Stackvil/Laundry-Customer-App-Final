import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../contexts/CartContext';
import { useOrders } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';
import { createRazorpayOrder, initiateRazorpayPayment, RAZORPAY_KEY_ID } from '../utils/razorpay';
import Footer from '../components/Footer';

export default function PaymentScreen({ route, navigation }) {
  const { mobileNumber, address, total, cartItems } = route.params || {};
  const { clearCart, getCartTotal } = useCart();
  const { addOrder } = useOrders();
  const { user } = useAuth();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    { id: 'card', name: 'Card', icon: '💳' },
    { id: 'upi', name: 'UPI', icon: '📱' },
    { id: 'cash', name: 'Cash on Delivery', icon: '💵' },
    { id: 'wallet', name: 'Digital Wallet', icon: '👛' },
  ];
  
  const orderTotal = total || getCartTotal() + 2.0;

  const handleRazorpayPayment = async () => {
    try {
      setIsProcessing(true);
      
      // Create Razorpay order
      const razorpayOrder = await createRazorpayOrder(orderTotal);
      
      // Prepare user details for Razorpay
      const userDetails = {
        name: user?.name || 'User',
        email: user?.email || 'user@example.com',
        mobileNumber: mobileNumber || user?.mobileNumber || '',
      };
      
      // Initialize Razorpay payment
      const paymentOptions = await initiateRazorpayPayment(razorpayOrder, userDetails);
      
      // For React Native with Razorpay SDK installed, uncomment this:
      /*
      const RazorpayCheckout = require('react-native-razorpay').default;
      
      RazorpayCheckout.open(paymentOptions)
        .then((data) => {
          // Payment successful
          handlePaymentSuccess({
            razorpay_payment_id: data.razorpay_payment_id,
            razorpay_order_id: data.razorpay_order_id,
            razorpay_signature: data.razorpay_signature,
          });
        })
        .catch((error) => {
          // Payment failed or cancelled
          setIsProcessing(false);
          if (error.code !== 'BAD_REQUEST_ERROR') {
            Alert.alert(
              'Payment Cancelled',
              'Payment was cancelled. Please try again.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Retry', onPress: handleRazorpayPayment },
              ]
            );
          }
        });
      */
      
      // Simulated payment flow (for testing without SDK)
      // In production, replace this with actual Razorpay SDK call above
      setTimeout(() => {
        setIsProcessing(false);
        handlePaymentSuccess({
          razorpay_payment_id: `pay_${Date.now()}`,
          razorpay_order_id: razorpayOrder.id,
          razorpay_signature: 'simulated_signature',
        });
      }, 2000);
      
    } catch (error) {
      setIsProcessing(false);
      Alert.alert(
        'Payment Error',
        error.message || 'Failed to process payment. Please try again.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: handleRazorpayPayment },
        ]
      );
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    // Create order
    const orderData = {
      items: cartItems.map(item => ({
        name: item.name,
        service: item.service,
        quantity: item.quantity,
        price: item.price,
      })),
      total: orderTotal,
      mobileNumber,
      address,
      paymentMethod: 'Razorpay',
      paymentId: paymentData.razorpay_payment_id,
      orderId: paymentData.razorpay_order_id,
    };
    
    const newOrder = addOrder(orderData);
    clearCart();
    
    Alert.alert(
      'Order Placed!',
      'Your order has been placed successfully. Your beautiful clothes will be delivered in one or 2 days.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'View Orders',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [
                { name: 'Home' },
                { name: 'Orders' },
              ],
            });
          },
          style: 'default',
        },
        {
          text: 'Continue Shopping',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handlePayment = async () => {
    if (selectedPaymentMethod === 'card') {
      // Use Razorpay for card payments
      await handleRazorpayPayment();
    } else if (selectedPaymentMethod === 'cash') {
      // Cash on delivery - no payment processing needed
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        
        const orderData = {
          items: cartItems.map(item => ({
            name: item.name,
            service: item.service,
            quantity: item.quantity,
            price: item.price,
          })),
          total: orderTotal,
          mobileNumber,
          address,
          paymentMethod: 'Cash on Delivery',
          paymentId: 'COD',
        };
        
        const newOrder = addOrder(orderData);
        clearCart();
        
        Alert.alert(
          'Order Placed!',
          'Your order has been placed successfully. Pay cash when your order is delivered. Your beautiful clothes will be delivered in one or 2 days.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'View Orders',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [
                    { name: 'Home' },
                    { name: 'Orders' },
                  ],
                });
              },
              style: 'default',
            },
            {
              text: 'Continue Shopping',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Home' }],
                });
              },
            },
          ],
          { cancelable: false }
        );
      }, 1000);
    } else {
      // UPI and Wallet - show coming soon
      Alert.alert(
        'Payment Method',
        `${paymentMethods.find(m => m.id === selectedPaymentMethod)?.name} payment will be available soon`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'OK' },
        ]
      );
    }
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
        <Text style={styles.headerTitle}>Secure Payment</Text>
        <View style={styles.headerRight}>
          <Ionicons name="lock-closed" size={24} color={Colors.primary} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Payment Method Selection */}
        <Text style={styles.sectionTitle}>Select Payment Method</Text>

        {/* Payment Method Options */}
        <View style={styles.paymentMethodsContainer}>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethodCard,
                selectedPaymentMethod === method.id && styles.paymentMethodCardSelected,
              ]}
              onPress={() => setSelectedPaymentMethod(method.id)}
            >
              <View style={styles.paymentMethodLeft}>
                <Text style={styles.paymentMethodIcon}>{method.icon}</Text>
                <Text style={styles.paymentMethodName}>{method.name}</Text>
              </View>
              <View
                style={[
                  styles.radioButton,
                  selectedPaymentMethod === method.id && styles.radioButtonSelected,
                ]}
              >
                {selectedPaymentMethod === method.id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment Method Specific Info */}
        {selectedPaymentMethod === 'card' && (
          <View style={styles.paymentInfoCard}>
            <Ionicons name="card-outline" size={24} color={Colors.secondary} />
            <Text style={styles.paymentInfoText}>
              Pay securely with your debit or credit card
            </Text>
            <Text style={styles.paymentInfoSubtext}>
              Powered by Razorpay
            </Text>
            <Text style={styles.razorpayKeyText}>
              Test Mode: {RAZORPAY_KEY_ID}
            </Text>
          </View>
        )}

        {selectedPaymentMethod === 'upi' && (
          <View style={styles.paymentInfoCard}>
            <Ionicons name="phone-portrait-outline" size={24} color={Colors.secondary} />
            <Text style={styles.paymentInfoText}>
              Pay using UPI apps like Google Pay, PhonePe, Paytm
                    </Text>
                  </View>
        )}

        {selectedPaymentMethod === 'cash' && (
          <View style={styles.paymentInfoCard}>
            <Ionicons name="cash-outline" size={24} color={Colors.secondary} />
            <Text style={styles.paymentInfoText}>
              Pay cash when your order is delivered
            </Text>
            <Text style={styles.paymentInfoSubtext}>
              No online payment required
            </Text>
                </View>
        )}

        {selectedPaymentMethod === 'wallet' && (
          <View style={styles.paymentInfoCard}>
            <Ionicons name="wallet-outline" size={24} color={Colors.secondary} />
            <Text style={styles.paymentInfoText}>
              Pay using digital wallets like Paytm, Amazon Pay
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Pay Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={isProcessing}
        >
          <Text style={styles.payButtonText}>
            {isProcessing ? 'Processing...' : `Pay ₹${orderTotal.toFixed(2)}`}
          </Text>
        </TouchableOpacity>
        <Text style={styles.disclaimer}>
          Payments are securely processed. By continuing, you agree to our{' '}
          <Text style={styles.disclaimerLink}>Terms & Conditions</Text>.
        </Text>
      </View>
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
    paddingTop: 35,
    backgroundColor: Colors.white,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 20,
  },
  paymentMethodsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.lightGray,
  },
  paymentMethodCardSelected: {
    borderColor: Colors.secondary,
    backgroundColor: Colors.background,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 15,
  },
  paymentMethodIcon: {
    fontSize: 28,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  paymentInfoCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  paymentInfoText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 10,
    textAlign: 'center',
  },
  paymentInfoSubtext: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 5,
    textAlign: 'center',
  },
  razorpayKeyText: {
    fontSize: 10,
    color: Colors.textLight,
    marginTop: 3,
    fontStyle: 'italic',
  },
  cardOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardOptionSelected: {
    borderColor: Colors.secondary,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardLogo: {
    width: 40,
    height: 30,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardLogoVisa: {
    backgroundColor: '#1a1f71',
  },
  cardLogoMastercard: {
    backgroundColor: '#eb001b',
  },
  cardLogoText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardInfo: {
    flex: 1,
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  cardExpiry: {
    fontSize: 14,
    color: Colors.textLight,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: Colors.secondary,
    backgroundColor: Colors.secondary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.secondary,
    borderStyle: 'dashed',
    gap: 10,
  },
  addCardText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.secondary,
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.white,
  },
  payButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
  disclaimerLink: {
    color: Colors.secondary,
    fontWeight: '600',
  },
});

