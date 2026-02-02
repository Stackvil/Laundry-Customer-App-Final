import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { OrderProvider } from './contexts/OrderContext';
import HomeScreen from './screens/HomeScreen';
import ShopDetailScreen from './screens/ShopDetailScreen';
import ServiceDetailScreen from './screens/ServiceDetailScreen';
import ServiceSelectionScreen from './screens/ServiceSelectionScreen';
import ProductPreviewScreen from './screens/ProductPreviewScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import OrdersScreen from './screens/OrdersScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import SavedAddressesScreen from './screens/SavedAddressesScreen';
import PaymentMethodsScreen from './screens/PaymentMethodsScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import CartScreen from './screens/CartScreen';
import OrderSummaryScreen from './screens/OrderSummaryScreen';
import SecurePaymentScreen from './screens/SecurePaymentScreen';
import OrderStatusScreen from './screens/OrderStatusScreen';
import SettingsScreen from './screens/SettingsScreen';
import HelpSupportScreen from './screens/HelpSupportScreen';
import PrivacySettingsScreen from './screens/PrivacySettingsScreen';
import LanguageSettingsScreen from './screens/LanguageSettingsScreen';
import AboutScreen from './screens/AboutScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <OrderProvider>
          <NavigationContainer>
            <StatusBar style="dark" />
            <Stack.Navigator
              initialRouteName="Home"
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="ShopDetail" component={ShopDetailScreen} />
              <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
              <Stack.Screen name="ServiceSelection" component={ServiceSelectionScreen} />
              <Stack.Screen name="ProductPreview" component={ProductPreviewScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Signup" component={SignupScreen} />
              <Stack.Screen name="Orders" component={OrdersScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
              <Stack.Screen name="SavedAddresses" component={SavedAddressesScreen} />
              <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
              <Stack.Screen name="Notifications" component={NotificationsScreen} />
              <Stack.Screen name="Cart" component={CartScreen} />
              <Stack.Screen name="OrderSummary" component={OrderSummaryScreen} />
              <Stack.Screen name="Payment" component={SecurePaymentScreen} />
              <Stack.Screen name="OrderStatus" component={OrderStatusScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
              <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
              <Stack.Screen name="LanguageSettings" component={LanguageSettingsScreen} />
              <Stack.Screen name="About" component={AboutScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </OrderProvider>
      </CartProvider>
    </AuthProvider>
  );
}

