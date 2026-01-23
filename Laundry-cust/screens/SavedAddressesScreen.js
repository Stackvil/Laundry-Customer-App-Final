import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

export default function SavedAddressesScreen({ navigation }) {
  const [addresses, setAddresses] = useState([
    {
      id: '1',
      name: 'John Doe',
      mobileNumber: '+91 98765 43210',
      doorNumber: '123',
      village: 'Main Street',
      mandal: 'Downtown',
      city: 'Hyderabad',
      district: 'Hyderabad',
      state: 'Telangana',
      pincode: '500001',
      landmark: 'Near Metro Station',
      isDefault: true,
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: '',
    doorNumber: '',
    village: '',
    mandal: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    landmark: '',
  });

  const openAddModal = () => {
    setEditingAddress(null);
    setFormData({
      name: '',
      mobileNumber: '',
      doorNumber: '',
      village: '',
      mandal: '',
      city: '',
      district: '',
      state: '',
      pincode: '',
      landmark: '',
    });
    setIsModalVisible(true);
  };

  const openEditModal = (address) => {
    setEditingAddress(address);
    setFormData({
      name: address.name,
      mobileNumber: address.mobileNumber,
      doorNumber: address.doorNumber,
      village: address.village,
      mandal: address.mandal,
      city: address.city,
      district: address.district,
      state: address.state,
      pincode: address.pincode,
      landmark: address.landmark,
    });
    setIsModalVisible(true);
  };

  const handleSave = () => {
    // Validation
    if (!formData.name.trim() || !formData.mobileNumber.trim() || !formData.doorNumber.trim() || 
        !formData.village.trim() || !formData.mandal.trim() || !formData.city.trim() || 
        !formData.district.trim() || !formData.state.trim() || !formData.pincode.trim()) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (formData.pincode.length !== 6 || !/^\d+$/.test(formData.pincode)) {
      Alert.alert('Error', 'Please enter a valid 6-digit pincode');
      return;
    }

    if (editingAddress) {
      // Update existing address
      setAddresses((prev) =>
        prev.map((addr) =>
          addr.id === editingAddress.id
            ? { ...addr, ...formData }
            : addr
        )
      );
      Alert.alert('Success', 'Address updated successfully');
    } else {
      // Add new address
      const newAddress = {
        id: Date.now().toString(),
        ...formData,
        isDefault: addresses.length === 0, // First address is default
      };
      setAddresses((prev) => [...prev, newAddress]);
      Alert.alert('Success', 'Address added successfully');
    }
    setIsModalVisible(false);
  };

  const handleDelete = (addressId) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setAddresses((prev) => {
              const filtered = prev.filter((addr) => addr.id !== addressId);
              // If deleted address was default, make first one default
              if (filtered.length > 0 && prev.find((a) => a.id === addressId)?.isDefault) {
                filtered[0].isDefault = true;
              }
              return filtered;
            });
            Alert.alert('Success', 'Address deleted successfully');
          },
        },
      ]
    );
  };

  const setAsDefault = (addressId) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === addressId,
      }))
    );
    Alert.alert('Success', 'Default address updated');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Saved Addresses</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        {addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={80} color={Colors.textLight} />
            <Text style={styles.emptyText}>No saved addresses</Text>
            <Text style={styles.emptySubtext}>
              Add an address to get started
            </Text>
          </View>
        ) : (
          addresses.map((address) => (
            <View key={address.id} style={styles.addressCard}>
              <View style={styles.addressHeader}>
                <View style={styles.addressHeaderLeft}>
                  {address.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                    </View>
                  )}
                  <Text style={styles.addressName}>{address.name}</Text>
                </View>
                <View style={styles.addressActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openEditModal(address)}
                  >
                    <Ionicons name="create-outline" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDelete(address.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.addressDetails}>
                <Text style={styles.addressText}>
                  {address.doorNumber}, {address.village}
                </Text>
                <Text style={styles.addressText}>
                  {address.mandal}, {address.city}
                </Text>
                <Text style={styles.addressText}>
                  {address.district}, {address.state} - {address.pincode}
                </Text>
                {address.landmark && (
                  <Text style={styles.addressText}>
                    Landmark: {address.landmark}
                  </Text>
                )}
                <Text style={styles.mobileText}>
                  <Ionicons name="call-outline" size={14} color={Colors.textLight} />{' '}
                  {address.mobileNumber}
                </Text>
              </View>

              {!address.isDefault && (
                <TouchableOpacity
                  style={styles.setDefaultButton}
                  onPress={() => setAsDefault(address.id)}
                >
                  <Text style={styles.setDefaultText}>Set as default</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Address Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={openAddModal}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={styles.addButtonGradient}
          >
            <Ionicons name="add" size={24} color={Colors.white} />
            <Text style={styles.addButtonText}>Add New Address</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Add/Edit Address Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Enter full name"
                  placeholderTextColor={Colors.textLight}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mobile Number *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.mobileNumber}
                  onChangeText={(text) => setFormData({ ...formData, mobileNumber: text })}
                  placeholder="Enter mobile number"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Door Number *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.doorNumber}
                  onChangeText={(text) => setFormData({ ...formData, doorNumber: text })}
                  placeholder="Enter door number"
                  placeholderTextColor={Colors.textLight}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Village *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.village}
                  onChangeText={(text) => setFormData({ ...formData, village: text })}
                  placeholder="Enter village"
                  placeholderTextColor={Colors.textLight}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mandal *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.mandal}
                  onChangeText={(text) => setFormData({ ...formData, mandal: text })}
                  placeholder="Enter mandal"
                  placeholderTextColor={Colors.textLight}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>City *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.city}
                  onChangeText={(text) => setFormData({ ...formData, city: text })}
                  placeholder="Enter city"
                  placeholderTextColor={Colors.textLight}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>District *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.district}
                  onChangeText={(text) => setFormData({ ...formData, district: text })}
                  placeholder="Enter district"
                  placeholderTextColor={Colors.textLight}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>State *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.state}
                  onChangeText={(text) => setFormData({ ...formData, state: text })}
                  placeholder="Enter state"
                  placeholderTextColor={Colors.textLight}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Pincode *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.pincode}
                  onChangeText={(text) => setFormData({ ...formData, pincode: text })}
                  placeholder="Enter 6-digit pincode"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Landmark (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.landmark}
                  onChangeText={(text) => setFormData({ ...formData, landmark: text })}
                  placeholder="Enter landmark"
                  placeholderTextColor={Colors.textLight}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
              >
                <LinearGradient
                  colors={[Colors.primary, Colors.secondary]}
                  style={styles.saveButtonGradient}
                >
                  <Text style={styles.saveButtonText}>Save Address</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
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
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textLight,
  },
  addressCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  addressHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  defaultBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  defaultBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  addressName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  addressActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 5,
  },
  addressDetails: {
    marginBottom: 12,
  },
  addressText: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
    lineHeight: 20,
  },
  mobileText: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 8,
  },
  setDefaultButton: {
    marginTop: 8,
    paddingVertical: 8,
  },
  setDefaultText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  closeButton: {
    padding: 5,
  },
  modalScroll: {
    maxHeight: 500,
  },
  inputGroup: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.primary,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: Colors.background,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    padding: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

