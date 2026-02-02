import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    Linking,
    TextInput,
    Image,
    Modal,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../contexts/CartContext';
import { useOrders } from '../contexts/OrderContext';
import { useAuth } from '../contexts/AuthContext';
import { createRazorpayOrder, initiateRazorpayPayment, RAZORPAY_KEY_ID } from '../utils/razorpay';
import Footer from '../components/Footer';

export default function SecurePaymentScreen({ route, navigation }) {
    const { mobileNumber, address, total, cartItems } = route.params || {};
    const { clearCart, getCartTotal } = useCart();
    const { addOrder } = useOrders();
    const { user } = useAuth();
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [placedOrder, setPlacedOrder] = useState(null);

    // Card states
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardName, setCardName] = useState('');

    // UPI states
    const [selectedUpiApp, setSelectedUpiApp] = useState(null);
    const [upiId, setUpiId] = useState('');

    // Wallet states
    const [selectedWallet, setSelectedWallet] = useState(null);

    const paymentMethods = [
        { id: 'card', name: 'Credit / Debit Card', icon: '💳' },
        { id: 'upi', name: 'UPI (GPay / PhonePe / Paytm)', icon: '📱' },
        { id: 'cash', name: 'Cash on Delivery', icon: '💵' },
        { id: 'wallet', name: 'Wallets', icon: '👛' },
    ];

    const orderTotal = total || getCartTotal() + 2.0;

    const handleRazorpayPayment = async () => {
        try {
            setIsProcessing(true);

            const razorpayOrder = await createRazorpayOrder(orderTotal);

            const userDetails = {
                name: user?.name || 'User',
                email: user?.email || 'user@example.com',
                mobileNumber: mobileNumber || user?.mobileNumber || '',
            };

            const paymentOptions = await initiateRazorpayPayment(razorpayOrder, userDetails);

            // Simulated payment flow
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

        setPlacedOrder(newOrder);
        setShowConfirmation(true);
    };

    const handlePayment = async (method = selectedPaymentMethod) => {
        if (method === 'card') {
            await handleRazorpayPayment();
        } else {
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
                    paymentMethod: paymentMethods.find(m => m.id === method)?.name || 'Manual Payment',
                    paymentId: method === 'cash' ? 'COD' : `${(method || 'UNKNOWN').toUpperCase()}_DUMMY`,
                };

                const newOrder = addOrder(orderData);
                clearCart();

                setPlacedOrder(newOrder);
                setShowConfirmation(true);
            }, 1000);
        }
    };

    const selectPaymentMethod = (methodId) => {
        setSelectedPaymentMethod(methodId);
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
                <Text style={styles.sectionTitle}>Select Payment Method</Text>

                <View style={styles.paymentMethodsContainer}>
                    {paymentMethods.map((method) => (
                        <TouchableOpacity
                            key={method.id}
                            style={[
                                styles.paymentMethodCard,
                                selectedPaymentMethod === method.id && styles.paymentMethodCardSelected,
                            ]}
                            onPress={() => selectPaymentMethod(method.id)}
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

                {/* Detailed Sections */}
                {selectedPaymentMethod === 'card' && (
                    <View style={styles.detailedSection}>
                        <View style={styles.cardInputContainer}>
                            <Text style={styles.inputLabel}>Card Number</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="XXXX XXXX XXXX XXXX"
                                value={cardNumber}
                                onChangeText={setCardNumber}
                                keyboardType="number-pad"
                                maxLength={16}
                            />

                            <View style={styles.row}>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.inputLabel}>Expiry Date</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="MM/YY"
                                        value={expiryDate}
                                        onChangeText={setExpiryDate}
                                        maxLength={5}
                                    />
                                </View>
                                <View style={[styles.inputGroup, { flex: 1, marginLeft: 15 }]}>
                                    <Text style={styles.inputLabel}>CVV</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="XXX"
                                        value={cvv}
                                        onChangeText={setCvv}
                                        keyboardType="number-pad"
                                        maxLength={3}
                                        secureTextEntry
                                    />
                                </View>
                            </View>

                            <Text style={styles.inputLabel}>Name on Card</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="John Doe"
                                value={cardName}
                                onChangeText={setCardName}
                            />
                        </View>
                        <View style={styles.secureBadge}>
                            <Ionicons name="shield-checkmark" size={16} color={Colors.success} />
                            <Text style={styles.secureText}>100% Secure Transaction</Text>
                        </View>
                    </View>
                )}

                {selectedPaymentMethod === 'upi' && (
                    <View style={styles.detailedSection}>
                        <Text style={styles.subSectionTitle}>Select UPI App</Text>
                        <View style={styles.upiAppsContainer}>
                            <TouchableOpacity
                                style={[styles.upiAppItem, selectedUpiApp === 'gpay' && styles.upiAppSelected]}
                                onPress={() => setSelectedUpiApp('gpay')}
                            >
                                <Ionicons name="logo-google" size={24} color="#4285F4" />
                                <Text style={styles.upiAppName}>GPay</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.upiAppItem, selectedUpiApp === 'phonepe' && styles.upiAppSelected]}
                                onPress={() => setSelectedUpiApp('phonepe')}
                            >
                                <Ionicons name="phone-portrait-outline" size={24} color="#5f259f" />
                                <Text style={styles.upiAppName}>PhonePe</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.upiAppItem, selectedUpiApp === 'paytm' && styles.upiAppSelected]}
                                onPress={() => setSelectedUpiApp('paytm')}
                            >
                                <Ionicons name="wallet-outline" size={24} color="#00baf2" />
                                <Text style={styles.upiAppName}>Paytm</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.inputLabel}>Or Enter UPI ID</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="username@bank"
                            value={upiId}
                            onChangeText={setUpiId}
                        />
                    </View>
                )}

                {selectedPaymentMethod === 'cash' && (
                    <View style={styles.detailedSection}>
                        <View style={styles.cashConfirmationCard}>
                            <Ionicons name="cash-outline" size={32} color={Colors.primary} />
                            <Text style={styles.cashNoticeTitle}>Pay Cash on Delivery</Text>
                            <Text style={styles.cashNoticeText}>
                                Please keep ₹{orderTotal.toFixed(2)} ready for the delivery partner.
                            </Text>
                        </View>
                    </View>
                )}

                {selectedPaymentMethod === 'wallet' && (
                    <View style={styles.detailedSection}>
                        <Text style={styles.subSectionTitle}>Select Wallet</Text>
                        <View style={styles.walletContainer}>
                            <TouchableOpacity
                                style={[styles.walletItem, selectedWallet === 'paytm' && styles.walletSelected]}
                                onPress={() => setSelectedWallet('paytm')}
                            >
                                <View style={styles.walletLogoPlaceholder}>
                                    <Text style={styles.walletEmoji}>💎</Text>
                                </View>
                                <Text style={styles.walletName}>Paytm Wallet</Text>
                                <Ionicons name={selectedWallet === 'paytm' ? "radio-button-on" : "radio-button-off"} size={20} color={Colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.walletItem, selectedWallet === 'amazon' && styles.walletSelected]}
                                onPress={() => setSelectedWallet('amazon')}
                            >
                                <View style={styles.walletLogoPlaceholder}>
                                    <Text style={styles.walletEmoji}>📦</Text>
                                </View>
                                <Text style={styles.walletName}>Amazon Pay</Text>
                                <Ionicons name={selectedWallet === 'amazon' ? "radio-button-on" : "radio-button-off"} size={20} color={Colors.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
                    onPress={() => handlePayment()}
                    disabled={isProcessing}
                >
                    <Text style={styles.payButtonText}>
                        {isProcessing ? 'Processing...' : selectedPaymentMethod === 'card' ? `Pay ₹${orderTotal.toFixed(2)}` : 'Place Order'}
                    </Text>
                </TouchableOpacity>
                <Text style={styles.disclaimer}>
                    Payments are securely processed. By continuing, you agree to our{' '}
                    <Text style={styles.disclaimerLink}>Terms & Conditions</Text>.
                </Text>
            </View>

            <Footer navigation={navigation} currentScreen={null} />

            {/* Order Confirmation Modal */}
            <Modal visible={showConfirmation} transparent={true} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.confirmationCard}>
                        <View style={styles.confettiContainer}>
                            <Ionicons name="checkmark-circle" size={100} color={Colors.success} />
                        </View>
                        <Text style={styles.confirmationTitle}>Order Placed Successfully!</Text>
                        <Text style={styles.confirmationSubtitle}>
                            Your order {placedOrder?.orderNumber} has been received and is being processed.
                        </Text>

                        <View style={styles.summaryCard}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Total Paid:</Text>
                                <Text style={styles.summaryValue}>₹{orderTotal.toFixed(2)}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Method:</Text>
                                <Text style={styles.summaryValue}>{placedOrder?.paymentMethod}</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.viewOrdersButton}
                            onPress={() => {
                                setShowConfirmation(false);
                                navigation.reset({
                                    index: 1,
                                    routes: [{ name: 'Home' }, { name: 'Orders' }],
                                });
                            }}
                        >
                            <Text style={styles.viewOrdersButtonText}>View My Orders</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.continueShoppingLink}
                            onPress={() => {
                                setShowConfirmation(false);
                                navigation.navigate('Home');
                            }}
                        >
                            <Text style={styles.continueShoppingLinkText}>Continue Shopping</Text>
                        </TouchableOpacity>
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
    detailedSection: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 20,
        marginTop: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: Colors.lightGray,
    },
    subSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 15,
    },
    cardInputContainer: {
        gap: 12,
    },
    inputLabel: {
        fontSize: 14,
        color: Colors.textLight,
        fontWeight: '600',
        marginBottom: 4,
    },
    textInput: {
        backgroundColor: Colors.background,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: Colors.lightGray,
        color: Colors.primary,
    },
    row: {
        flexDirection: 'row',
    },
    inputGroup: {
        marginBottom: 10,
    },
    secureBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
        gap: 6,
    },
    secureText: {
        fontSize: 12,
        color: Colors.success,
        fontWeight: '600',
    },
    upiAppsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 10,
    },
    upiAppItem: {
        flex: 1,
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.lightGray,
        backgroundColor: Colors.background,
    },
    upiAppSelected: {
        borderColor: Colors.secondary,
        backgroundColor: Colors.white,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    upiAppName: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.primary,
        marginTop: 6,
    },
    walletContainer: {
        gap: 12,
    },
    walletItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.lightGray,
        backgroundColor: Colors.background,
    },
    walletSelected: {
        borderColor: Colors.secondary,
        backgroundColor: Colors.white,
    },
    walletLogoPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        borderWidth: 1,
        borderColor: Colors.lightGray,
    },
    walletEmoji: {
        fontSize: 20,
    },
    walletName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: Colors.primary,
    },
    cashConfirmationCard: {
        alignItems: 'center',
        padding: 20,
        gap: 10,
    },
    cashNoticeTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    cashNoticeText: {
        fontSize: 14,
        color: Colors.textLight,
        textAlign: 'center',
        lineHeight: 20,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    confirmationCard: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 30,
        width: '100%',
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    confettiContainer: {
        marginBottom: 20,
    },
    confirmationTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.primary,
        textAlign: 'center',
        marginBottom: 10,
    },
    confirmationSubtitle: {
        fontSize: 14,
        color: Colors.textLight,
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 20,
    },
    summaryCard: {
        backgroundColor: Colors.background,
        borderRadius: 12,
        padding: 15,
        width: '100%',
        marginBottom: 25,
        gap: 8,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    summaryLabel: {
        fontSize: 14,
        color: Colors.textLight,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    viewOrdersButton: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        paddingVertical: 15,
        width: '100%',
        alignItems: 'center',
        marginBottom: 15,
    },
    viewOrdersButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    continueShoppingLink: {
        padding: 10,
    },
    continueShoppingLinkText: {
        color: Colors.secondary,
        fontSize: 14,
        fontWeight: '600',
    },
});
