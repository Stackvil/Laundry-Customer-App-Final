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

  // Status mapping for the tracker
  const getStatusSteps = () => {
    const isPending = order?.status === 'Pending';
    const isInProgress = order?.status === 'In Progress';
    const isCompleted = order?.status === 'Completed';

    return [
      {
        id: 'placed',
        title: 'Ordered',
        subtitle: 'We have received your order',
        time: 'Feb 4, 11:30 AM',
        isCompleted: true,
        isActive: isPending,
      },
      {
        id: 'picked',
        title: 'Picked Up',
        subtitle: 'Laundry picked up by agent',
        time: !isPending ? 'Feb 4, 12:15 PM' : null,
        isCompleted: !isPending,
        isActive: false,
      },
      {
        id: 'processing',
        title: 'Processing',
        subtitle: 'Washing, drying & folding in progress',
        isCompleted: isCompleted || isInProgress,
        isActive: isInProgress,
      },
      {
        id: 'out_for_delivery',
        title: 'Out for delivery',
        subtitle: 'Agent is on the way to your home',
        isCompleted: isCompleted,
        isActive: false,
      },
      {
        id: 'delivered',
        title: 'Delivered',
        subtitle: 'Package was left at front door',
        isCompleted: isCompleted,
        isActive: false,
      },
    ];
  };

  const statusSteps = getStatusSteps();

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

  const currentStatusIndex = statusSteps.findLastIndex(s => s.isCompleted);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Amazon-style Vertical Timeline */}
        <View style={styles.timelineSection}>
          <Text style={styles.timelineSectionTitle}>Track Shipment</Text>

          <View style={styles.timelineContainer}>
            {statusSteps.map((step, index) => {
              const isLast = index === statusSteps.length - 1;
              const isNextStep = index === currentStatusIndex + 1;

              return (
                <View key={step.id} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View
                      style={[
                        styles.dot,
                        step.isCompleted && styles.dotCompleted,
                        step.isActive && styles.dotActive,
                      ]}
                    >
                      {step.isCompleted && (
                        <Ionicons name="checkmark" size={12} color={Colors.white} />
                      )}
                    </View>
                    {!isLast && (
                      <View
                        style={[
                          styles.line,
                          step.isCompleted && statusSteps[index + 1].isCompleted && styles.lineCompleted,
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <View style={styles.timelineHeader}>
                      <Text
                        style={[
                          styles.timelineTitle,
                          step.isCompleted && styles.timelineTitleCompleted,
                          step.isActive && styles.timelineTitleActive,
                        ]}
                      >
                        {step.title}
                      </Text>
                      {step.time && (
                        <Text style={styles.timelineTime}>{step.time}</Text>
                      )}
                    </View>
                    <Text style={styles.timelineSubtitle}>{step.subtitle}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Order Info & Address */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color={Colors.textLight} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Delivery Address</Text>
              <Text style={styles.infoValue}>{order.address}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons name="card-outline" size={20} color={Colors.textLight} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Payment Method</Text>
              <Text style={styles.infoValue}>{order.paymentMethod}</Text>
            </View>
          </View>
        </View>

        {/* Order Summary with Items */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Order Summary</Text>

          {/* Item List */}
          <View style={styles.itemsList}>
            {order.items?.map((item, index) => (
              <View key={index} style={styles.summaryItemRow}>
                <View style={styles.itemMainInfo}>
                  <Text style={styles.summaryItemName}>{item.name}</Text>
                  <Text style={styles.summaryItemSubtitle}>{item.service} x{item.quantity}</Text>
                </View>
                <Text style={styles.summaryItemPrice}>₹{item.price.toFixed(2)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Order Total</Text>
            <Text style={styles.summaryTotalValue}>₹{order.total?.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.homeButtonText}>Return to Shopping</Text>
        </TouchableOpacity>
      </View>

      <Footer navigation={navigation} currentScreen="Orders" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDF0F3', // Amazon-like background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111',
  },
  headerRight: {
    width: 34,
  },
  scrollView: {
    flex: 1,
  },
  timelineSection: {
    backgroundColor: Colors.white,
    padding: 20,
    marginBottom: 10,
  },
  timelineSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 20,
  },
  timelineContainer: {
    paddingLeft: 5,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 70,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 15,
    width: 20,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 20,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#DDD',
    zIndex: 2,
    marginTop: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotCompleted: {
    backgroundColor: '#067D62', // Amazon green
  },
  dotActive: {
    backgroundColor: '#007185',
    borderWidth: 3,
    borderColor: '#B0E0E6',
  },
  line: {
    width: 3,
    flex: 1,
    backgroundColor: '#E7E9EC',
    position: 'absolute',
    top: 18,
    left: 8.5,
    bottom: -4,
    zIndex: 1,
  },
  lineCompleted: {
    backgroundColor: '#067D62',
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#565959',
  },
  timelineTitleCompleted: {
    color: '#111',
    fontWeight: 'bold',
  },
  timelineTitleActive: {
    color: '#007185',
    fontWeight: 'bold',
  },
  timelineSubtitle: {
    fontSize: 13,
    color: '#565959',
  },
  timelineTime: {
    fontSize: 12,
    color: '#565959',
  },
  infoSection: {
    backgroundColor: Colors.white,
    padding: 20,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#565959',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#111',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E7E9EC',
    marginVertical: 15,
  },
  summarySection: {
    backgroundColor: Colors.white,
    padding: 20,
    marginBottom: 30,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 15,
  },
  itemsList: {
    marginBottom: 10,
  },
  summaryItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemMainInfo: {
    flex: 1,
  },
  summaryItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111',
  },
  summaryItemSubtitle: {
    fontSize: 12,
    color: '#565959',
    marginTop: 2,
  },
  summaryItemPrice: {
    fontSize: 14,
    color: '#111',
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E7E9EC',
    marginBottom: 15,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
  },
  summaryTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B12704', // Amazon price color
  },
  actionBar: {
    padding: 15,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#DDD',
  },
  homeButton: {
    backgroundColor: '#FFD814', // Amazon yellow button
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  homeButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
  },
});

