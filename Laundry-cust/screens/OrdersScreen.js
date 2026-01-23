import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useAuth } from '../contexts/AuthContext';
import { useOrders } from '../contexts/OrderContext';
import Footer from '../components/Footer';

export default function OrdersScreen({ navigation }) {
  const { isAuthenticated } = useAuth();
  const { orders } = useOrders();

  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please login or signup to view your orders',
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

  const formatOrderItems = (items) => {
    if (!items || items.length === 0) return 'No items';
    return items.map(item => `${item.quantity} ${item.name}`).join(', ');
  };

  return (
    <View style={styles.container}>
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
        <Text style={styles.headerTitle}>My Orders</Text>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContentStyle}
      >
        {!isAuthenticated ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔒</Text>
            <Text style={styles.emptyText}>Login Required</Text>
            <Text style={styles.emptySubtext}>
              Please login to view your orders
            </Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>No orders yet</Text>
            <Text style={styles.emptySubtext}>
              Your orders will appear here
            </Text>
          </View>
        ) : (
          orders.map((order) => (
            <TouchableOpacity 
              key={order.id} 
              style={styles.orderCard}
              onPress={() => navigation.navigate('OrderStatus', { order })}
            >
              <View style={styles.orderHeader}>
                <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    order.status === 'Completed' && styles.statusCompleted,
                    order.status === 'In Progress' && styles.statusInProgress,
                    order.status === 'Pending' && styles.statusPending,
                  ]}
                >
                  <Text style={styles.statusText}>{order.status}</Text>
                </View>
              </View>
              <Text style={styles.orderDate}>{order.date}</Text>
              <Text style={styles.orderItems}>{formatOrderItems(order.items)}</Text>
              {order.address && (
                <View style={styles.orderAddress}>
                  <Ionicons name="location-outline" size={14} color={Colors.textLight} />
                  <Text style={styles.orderAddressText}>{order.address}</Text>
                </View>
              )}
              <View style={styles.orderFooter}>
                <Text style={styles.orderTotal}>₹{order.total?.toFixed(2) || '0.00'}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Footer navigation={navigation} currentScreen="Orders" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scrollContentStyle: {
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textLight,
  },
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: Colors.secondary,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusCompleted: {
    backgroundColor: Colors.success + '20',
  },
  statusInProgress: {
    backgroundColor: Colors.secondary + '20',
  },
  statusPending: {
    backgroundColor: Colors.textLight + '20',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  orderDate: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
  },
  orderItems: {
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 8,
  },
  orderAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 5,
  },
  orderAddressText: {
    fontSize: 12,
    color: Colors.textLight,
    flex: 1,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.secondary,
  },
});

