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
import { LinearGradient } from 'expo-linear-gradient';

export default function OrderStatusScreen({ navigation }) {
  const statusSteps = [
    {
      id: 'placed',
      title: 'Order Placed',
      time: '1:45 PM',
      completed: true,
      icon: 'checkmark',
    },
    {
      id: 'picked',
      title: 'Picked Up',
      time: '2:15 PM',
      completed: true,
      icon: 'checkmark',
    },
    {
      id: 'progress',
      title: 'In Progress',
      subtitle: 'Washing & Drying',
      completed: true,
      icon: 'checkmark',
    },
    {
      id: 'delivery',
      title: 'Out for Delivery',
      time: 'Est. 4:30 PM',
      active: true,
      icon: 'car',
    },
    {
      id: 'delivered',
      title: 'Delivered',
      completed: false,
      icon: 'cube',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Order Status</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Estimated Arrival Card */}
        <View style={styles.arrivalCard}>
          <Text style={styles.arrivalTime}>Arriving 4:00 – 5:00 PM</Text>
          <Text style={styles.arrivalSubtext}>Your laundry is on its way!</Text>
        </View>

        {/* Decorative Banner */}
        <LinearGradient
          colors={['#2d5016', Colors.success, Colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.decorativeBanner}
        >
          <View style={styles.wavePattern} />
        </LinearGradient>

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

        {/* Order Summary */}
        <TouchableOpacity style={styles.orderSummaryCard}>
          <Text style={styles.orderSummaryTitle}>Order Summary</Text>
          <Ionicons name="chevron-down" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.receiptButton}>
          <Ionicons name="receipt" size={20} color={Colors.white} />
          <Text style={styles.receiptButtonText}>View Receipt</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.supportButton}>
          <Ionicons name="headset" size={20} color={Colors.secondary} />
          <Text style={styles.supportButtonText}>Contact Support</Text>
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
  decorativeBanner: {
    height: 80,
    borderRadius: 16,
    marginBottom: 30,
    overflow: 'hidden',
  },
  wavePattern: {
    flex: 1,
    opacity: 0.3,
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
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    padding: 18,
    gap: 10,
  },
  supportButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

