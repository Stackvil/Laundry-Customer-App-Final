import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export default function Footer({ navigation, currentScreen }) {
  const { isAuthenticated } = useAuth();
  const { getCartItemCount } = useCart();
  const cartItemCount = getCartItemCount();

  const handleProfilePress = () => {
    if (isAuthenticated) {
      navigation.navigate('Profile');
    } else {
      Alert.alert(
        'Login Required',
        'Please login or signup to access your profile',
        [
          {
            text: 'Cancel',
            style: 'cancel',
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
        { cancelable: true }
      );
    }
  };

  const handleOrdersPress = () => {
    if (isAuthenticated) {
      navigation.navigate('Orders');
    } else {
      Alert.alert(
        'Login Required',
        'Please login or signup to view your orders',
        [
          {
            text: 'Cancel',
            style: 'cancel',
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
        { cancelable: true }
      );
    }
  };
  return (
    <View style={styles.footer}>
      <TouchableOpacity
        style={styles.footerItem}
        onPress={() => navigation.navigate('Home')}
      >
        {currentScreen === 'Home' ? (
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={styles.footerIconContainer}
          >
            <Text style={styles.footerIcon}>🏠</Text>
          </LinearGradient>
        ) : (
          <View style={styles.footerIconContainerInactive}>
            <Text style={styles.footerIconInactive}>🏠</Text>
          </View>
        )}
        <Text
          style={[
            styles.footerLabel,
            currentScreen === 'Home' && styles.footerLabelActive,
          ]}
        >
          Home
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.footerItem}
        onPress={handleOrdersPress}
      >
        {currentScreen === 'Orders' ? (
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={styles.footerIconContainer}
          >
            <Text style={styles.footerIcon}>📦</Text>
          </LinearGradient>
        ) : (
          <View style={styles.footerIconContainerInactive}>
            <Text style={styles.footerIconInactive}>📦</Text>
          </View>
        )}
        <Text
          style={[
            styles.footerLabel,
            currentScreen === 'Orders' && styles.footerLabelActive,
          ]}
        >
          Orders
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.footerItem}
        onPress={() => navigation.navigate('Cart')}
      >
        {currentScreen === 'Cart' ? (
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={styles.footerIconContainer}
          >
            <View style={styles.cartIconContainer}>
              <Text style={styles.footerIcon}>🛒</Text>
              {cartItemCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </Text>
                </View>
              )}
            </View>
          </LinearGradient>
        ) : (
          <View style={styles.footerIconContainerInactive}>
            <View style={styles.cartIconContainer}>
              <Text style={styles.footerIconInactive}>🛒</Text>
              {cartItemCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
        <Text
          style={[
            styles.footerLabel,
            currentScreen === 'Cart' && styles.footerLabelActive,
          ]}
        >
          Cart
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.footerItem}
        onPress={handleProfilePress}
      >
        {currentScreen === 'Profile' ? (
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={styles.footerIconContainer}
          >
            <Text style={styles.footerIcon}>👤</Text>
          </LinearGradient>
        ) : (
          <View style={styles.footerIconContainerInactive}>
            <Text style={styles.footerIconInactive}>👤</Text>
          </View>
        )}
        <Text
          style={[
            styles.footerLabel,
            currentScreen === 'Profile' && styles.footerLabelActive,
          ]}
        >
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingVertical: 8,
    paddingBottom: 6,
    marginBottom: 5,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  footerItem: {
    alignItems: 'center',
    flex: 1,
  },
  footerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  footerIconContainerInactive: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    backgroundColor: Colors.background,
  },
  footerIcon: {
    fontSize: 20,
  },
  footerIconInactive: {
    fontSize: 20,
    opacity: 0.6,
  },
  footerLabel: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '500',
  },
  footerLabelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  cartIconContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: Colors.secondary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  cartBadgeText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: 'bold',
  },
});

