import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Footer from '../components/Footer';

export default function OrderStatusScreen({ route, navigation }) {
  const { order } = route.params || {};

  const statusSteps = [
    {
      id: 'placed',
      title: 'Order Placed',
      time: order?.date ? '10:00 AM' : '1:45 PM', // Mock time if no real time available
      completed: true,
      icon: 'checkmark',
    },
    {
      id: 'picked',
      title: 'Picked Up',
      time: order?.status === 'Pending' ? '--' : '2:15 PM',
      completed: order?.status !== 'Pending',
      icon: 'checkmark',
    },
    {
      id: 'progress',
      title: 'In Progress',
      subtitle: 'Washing & Drying',
      completed: order?.status === 'Completed' || order?.status === 'In Progress',
      icon: 'checkmark',
    },
    {
      id: 'delivery',
      title: 'Out for Delivery',
      time: 'Est. 4:30 PM',
      active: order?.status === 'In Progress',
      icon: 'car',
    },
    {
      id: 'delivered',
      title: 'Delivered',
      completed: order?.status === 'Completed',
      icon: 'cube',
    },
  ];

  if (!order) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Status</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No order selected</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Order #{order.orderNumber}</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Estimated Arrival Card */}
        <View style={styles.arrivalCard}>
          <Text style={styles.arrivalTime}>{order.status === 'Completed' ? 'Delivered' : 'Arriving 4:00 – 5:00 PM'}</Text>
          <Text style={styles.arrivalSubtext}>{order.status === 'Completed' ? 'Your laundry was delivered successfully' : 'Your laundry is on its way!'}</Text>
        </View>

        {/* Timeline */}
        <View style={styles.timelineContainer}>
          {statusSteps.map((step, index) => (
            <View key={step.id} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View
                  style={[
                    styles.timelineIcon,
                    step.completed && styles.timelineIconCompleted,
                    step.active && styles.timelineIconActive,
                    !step.completed && !step.active && styles.timelineIconPending,
                  ]}
                >
                  <Ionicons
                    name={step.icon}
                    size={16}
                    color={step.completed || step.active ? Colors.white : Colors.lightGray}
                  />
                </View>
                {index < statusSteps.length - 1 && (
                  <View
                    style={[
                      styles.timelineLine,
                      step.completed && styles.timelineLineCompleted,
                    ]}
                  />
                )}
              </View>
              <View style={styles.timelineContent}>
                <Text
                  style={[
                    styles.timelineTitle,
                    step.active && styles.timelineTitleActive,
                    !step.completed && !step.active && styles.timelineTitlePending,
                  ]}
                >
                  {step.title}
                </Text>
                {step.subtitle && (
                  <Text style={styles.timelineSubtitle}>{step.subtitle}</Text>
                )}
                {step.time && (
                  <Text
                    style={[
                      styles.timelineTime,
                      !step.completed && !step.active && styles.timelineTimePending,
                    ]}
                  >
                    {step.time}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Order Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Information</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Mobile</Text>
            <Text style={styles.detailValue}>{order.mobileNumber}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Address</Text>
            <Text style={styles.detailValue}>{order.address}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment</Text>
            <Text style={styles.detailValue}>{order.paymentMethod}</Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={[styles.section, { marginBottom: 30 }]}>
          <Text style={styles.sectionTitle}>Items Ordered</Text>
          {order.items?.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemService}>{item.service} x{item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>₹{item.price.toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>₹{order.total?.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.receiptButton}
          onPress={() => navigation.navigate('Orders')}
        >
          <Ionicons name="list" size={20} color={Colors.white} />
          <Text style={styles.receiptButtonText}>All My Orders</Text>
        </TouchableOpacity>
      </View>
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
  scrollView: {
    flex: 1,
    padding: 20,
  },
  arrivalCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  arrivalTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  arrivalSubtext: {
    fontSize: 14,
    color: Colors.textLight,
  },
  timelineContainer: {
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 15,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineIconCompleted: {
    backgroundColor: Colors.secondary,
  },
  timelineIconActive: {
    backgroundColor: Colors.secondary,
  },
  timelineIconPending: {
    backgroundColor: Colors.lightGray,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 40,
    marginTop: 5,
  },
  timelineLineCompleted: {
    backgroundColor: Colors.secondary,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 4,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  timelineTitleActive: {
    color: Colors.secondary,
  },
  timelineTitlePending: {
    color: Colors.textLight,
  },
  timelineSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  timelineTime: {
    fontSize: 12,
    color: Colors.textLight,
  },
  timelineTimePending: {
    color: Colors.lightGray,
  },
  orderSummaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  orderSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  actionButtons: {
    padding: 20,
    gap: 15,
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 18,
    gap: 10,
  },
  receiptButtonText: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: 20,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  itemService: {
    fontSize: 14,
    color: Colors.textLight,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.textLight,
  },
});

