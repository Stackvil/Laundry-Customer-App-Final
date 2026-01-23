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

export default function PaymentMethodsScreen({ navigation }) {
  const [cards, setCards] = useState([]);
  const [showCardTypeSelection, setShowCardTypeSelection] = useState(false);
  const [selectedCardType, setSelectedCardType] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  });

  const openCardTypeSelection = () => {
    setShowCardTypeSelection(true);
  };

  const selectCardType = (type) => {
    setSelectedCardType(type);
    setShowCardTypeSelection(false);
    setEditingCard(null);
    setFormData({
      cardNumber: '',
      cardholderName: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
    });
    setIsModalVisible(true);
  };

  const openEditModal = (card) => {
    setEditingCard(card);
    setSelectedCardType(card.type);
    setFormData({
      cardNumber: card.cardNumber,
      cardholderName: card.cardholderName,
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      cvv: '',
    });
    setIsModalVisible(true);
  };

  const formatCardNumber = (text) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Limit to 16 digits
    const limited = cleaned.slice(0, 16);
    // Add spaces every 4 digits
    const formatted = limited.match(/.{1,4}/g)?.join(' ') || limited;
    return formatted;
  };

  const maskCardNumber = (cardNumber) => {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.length <= 4) return cardNumber;
    const lastFour = cleaned.slice(-4);
    const masked = '**** **** **** ' + lastFour;
    return masked;
  };

  const getCardBrand = (cardNumber) => {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.startsWith('4')) return 'Visa';
    if (cleaned.startsWith('5')) return 'Mastercard';
    if (cleaned.startsWith('6')) return 'Discover';
    if (cleaned.startsWith('3')) return 'Amex';
    return 'Card';
  };

  const validateCard = () => {
    const cardNumber = formData.cardNumber.replace(/\s/g, '');
    if (cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) {
      Alert.alert('Error', 'Please enter a valid 16-digit card number');
      return false;
    }

    if (!formData.cardholderName.trim()) {
      Alert.alert('Error', 'Please enter cardholder name');
      return false;
    }

    const month = parseInt(formData.expiryMonth);
    const year = parseInt(formData.expiryYear);
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    if (!formData.expiryMonth || !formData.expiryYear) {
      Alert.alert('Error', 'Please enter expiry date');
      return false;
    }

    if (month < 1 || month > 12) {
      Alert.alert('Error', 'Please enter a valid month (01-12)');
      return false;
    }

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      Alert.alert('Error', 'Card has expired. Please enter a valid expiry date');
      return false;
    }

    if (!formData.cvv || formData.cvv.length !== 3 || !/^\d+$/.test(formData.cvv)) {
      Alert.alert('Error', 'Please enter a valid 3-digit CVV');
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (!validateCard()) {
      return;
    }

    const cardNumber = formData.cardNumber.replace(/\s/g, '');
    const cardData = {
      id: editingCard ? editingCard.id : Date.now().toString(),
      type: selectedCardType,
      cardNumber: cardNumber,
      cardholderName: formData.cardholderName,
      expiryMonth: formData.expiryMonth,
      expiryYear: formData.expiryYear,
      brand: getCardBrand(cardNumber),
      isDefault: cards.length === 0,
    };

    if (editingCard) {
      setCards((prev) =>
        prev.map((card) => (card.id === editingCard.id ? cardData : card))
      );
      Alert.alert('Success', 'Card updated successfully');
    } else {
      setCards((prev) => [...prev, cardData]);
      Alert.alert('Success', 'Card added successfully');
    }

    setIsModalVisible(false);
    setSelectedCardType(null);
    setFormData({
      cardNumber: '',
      cardholderName: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
    });
  };

  const handleDelete = (cardId) => {
    Alert.alert(
      'Delete Card',
      'Are you sure you want to delete this card?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setCards((prev) => {
              const filtered = prev.filter((card) => card.id !== cardId);
              if (filtered.length > 0 && prev.find((c) => c.id === cardId)?.isDefault) {
                filtered[0].isDefault = true;
              }
              return filtered;
            });
            Alert.alert('Success', 'Card deleted successfully');
          },
        },
      ]
    );
  };

  const setAsDefault = (cardId) => {
    setCards((prev) =>
      prev.map((card) => ({
        ...card,
        isDefault: card.id === cardId,
      }))
    );
    Alert.alert('Success', 'Default card updated');
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
          <Text style={styles.headerTitle}>Payment Methods</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        {cards.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="card-outline" size={80} color={Colors.textLight} />
            <Text style={styles.emptyText}>No payment methods</Text>
            <Text style={styles.emptySubtext}>
              Add a credit or debit card to get started
            </Text>
          </View>
        ) : (
          cards.map((card) => (
            <View key={card.id} style={styles.cardContainer}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  {card.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                    </View>
                  )}
                  <View>
                    <Text style={styles.cardType}>{card.type}</Text>
                    <Text style={styles.cardBrand}>{card.brand}</Text>
                  </View>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openEditModal(card)}
                  >
                    <Ionicons name="create-outline" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDelete(card.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.cardDetails}>
                <Text style={styles.cardNumber}>{maskCardNumber(card.cardNumber)}</Text>
                <Text style={styles.cardholderName}>{card.cardholderName}</Text>
                <Text style={styles.expiry}>
                  Expires: {card.expiryMonth}/{card.expiryYear}
                </Text>
              </View>

              {!card.isDefault && (
                <TouchableOpacity
                  style={styles.setDefaultButton}
                  onPress={() => setAsDefault(card.id)}
                >
                  <Text style={styles.setDefaultText}>Set as default</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Card Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={openCardTypeSelection}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={styles.addButtonGradient}
          >
            <Ionicons name="add" size={24} color={Colors.white} />
            <Text style={styles.addButtonText}>Add Payment Method</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Card Type Selection Modal */}
      <Modal
        visible={showCardTypeSelection}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCardTypeSelection(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.cardTypeModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Card Type</Text>
              <TouchableOpacity
                onPress={() => setShowCardTypeSelection(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.cardTypeOption}
              onPress={() => selectCardType('Credit Card')}
            >
              <View style={styles.cardTypeIcon}>
                <Ionicons name="card" size={32} color={Colors.primary} />
              </View>
              <Text style={styles.cardTypeText}>Credit Card</Text>
              <Ionicons name="chevron-forward" size={24} color={Colors.textLight} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cardTypeOption}
              onPress={() => selectCardType('Debit Card')}
            >
              <View style={styles.cardTypeIcon}>
                <Ionicons name="card" size={32} color={Colors.secondary} />
              </View>
              <Text style={styles.cardTypeText}>Debit Card</Text>
              <Ionicons name="chevron-forward" size={24} color={Colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Card Details Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setIsModalVisible(false);
          setSelectedCardType(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingCard ? 'Edit Card' : `Add ${selectedCardType}`}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setIsModalVisible(false);
                  setSelectedCardType(null);
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Card Number *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.cardNumber}
                  onChangeText={(text) =>
                    setFormData({ ...formData, cardNumber: formatCardNumber(text) })
                  }
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="number-pad"
                  maxLength={19}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Cardholder Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.cardholderName}
                  onChangeText={(text) =>
                    setFormData({ ...formData, cardholderName: text })
                  }
                  placeholder="John Doe"
                  placeholderTextColor={Colors.textLight}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Expiry Month *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.expiryMonth}
                    onChangeText={(text) => {
                      const month = text.replace(/\D/g, '').slice(0, 2);
                      setFormData({ ...formData, expiryMonth: month });
                    }}
                    placeholder="MM"
                    placeholderTextColor={Colors.textLight}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>

                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Expiry Year *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.expiryYear}
                    onChangeText={(text) => {
                      const year = text.replace(/\D/g, '').slice(0, 2);
                      setFormData({ ...formData, expiryYear: year });
                    }}
                    placeholder="YY"
                    placeholderTextColor={Colors.textLight}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>CVV *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.cvv}
                  onChangeText={(text) => {
                    const cvv = text.replace(/\D/g, '').slice(0, 3);
                    setFormData({ ...formData, cvv });
                  }}
                  placeholder="123"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="number-pad"
                  maxLength={3}
                  secureTextEntry
                />
                <Text style={styles.hint}>3-digit security code</Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setIsModalVisible(false);
                  setSelectedCardType(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <LinearGradient
                  colors={[Colors.primary, Colors.secondary]}
                  style={styles.saveButtonGradient}
                >
                  <Text style={styles.saveButtonText}>Save Card</Text>
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
  cardContainer: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  cardHeaderLeft: {
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
  cardType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  cardBrand: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 5,
  },
  cardDetails: {
    marginBottom: 12,
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 8,
    letterSpacing: 2,
  },
  cardholderName: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  expiry: {
    fontSize: 14,
    color: Colors.textLight,
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
  cardTypeModalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
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
  cardTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  cardTypeIcon: {
    marginRight: 16,
  },
  cardTypeText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
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
  hint: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  halfWidth: {
    flex: 1,
    paddingHorizontal: 0,
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

