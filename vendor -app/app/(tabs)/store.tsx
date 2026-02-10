import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import { Search, X, Package } from 'lucide-react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { StatusBar as RNStatusBar } from 'react-native';
import {
  getAllProducts,
  getShopProducts,
  getVendorShopId,
  syncProductToShop,
  type Product
} from '../../services/products';
import { API_CONFIG } from '../../config/api';
import { getImageSource } from '../../utils/imageHelper';

interface ProductState {
  id: string;
  name: string;
  category: string;
  is_available: boolean;
  price_per_kg: number;
  image_url: string;
  weight?: string | null;
  weight_in_kg?: number;
  description?: string;
  price?: number;
  original_price?: number | null;
  discount_percentage?: number;
}

// Helper function to normalize weight to kilograms
// Handles cases where weight_in_kg might be stored in grams instead of kg
const normalizeWeightToKg = (weightInKg: number | undefined, displayWeight: string | null | undefined): number => {
  if (!weightInKg) return 1.0;

  // If weight is less than 1, assume it's already in kg (e.g., 0.25 kg = 250g)
  if (weightInKg < 1) {
    return weightInKg;
  }

  // Check if display weight suggests it's in grams (e.g., "250 g")
  if (displayWeight) {
    const displayLower = displayWeight.toLowerCase().trim();
    if (displayLower.includes('g') && !displayLower.includes('kg')) {
      // If display shows grams, convert weight_in_kg from grams to kg
      // Common weights in grams: 250g, 500g, 750g, 1000g
      // If weight_in_kg is between 100-1000, likely in grams
      if (weightInKg >= 100 && weightInKg <= 1000) {
        return weightInKg / 1000;
      }
      // If weight_in_kg is very large (> 1000 but reasonable), likely in grams
      if (weightInKg > 1000 && weightInKg < 1000000) {
        return weightInKg / 1000;
      }
    }
  }

  // If weight is between 100-1000 and seems like grams (reasonable product weight)
  // Most product weights in grams are 250g, 500g, 750g, 1000g
  if (weightInKg >= 100 && weightInKg <= 1000 && weightInKg % 250 === 0) {
    return weightInKg / 1000;
  }

  // If weight is very large (> 1000 but < 1 million), likely stored in grams incorrectly
  // Convert to kg
  if (weightInKg > 1000 && weightInKg < 1000000) {
    return weightInKg / 1000;
  }

  // If weight is extremely large (> 1 million), likely error, divide by 1000000
  if (weightInKg >= 1000000) {
    return weightInKg / 1000000;
  }

  // Otherwise assume it's already in kg (for weights 1-100 kg)
  return weightInKg;
};

// Helper function to calculate pricing details (similar to customer app)
const getProductPricingDetails = (product: ProductState, pricePerKgOverride?: number) => {
  // Use override price if provided, otherwise use product's price_per_kg
  const pricePerKg = pricePerKgOverride !== undefined ? pricePerKgOverride : (product.price_per_kg || 0);

  // Normalize weight to kilograms (handle both kg and grams)
  const weightInKg = normalizeWeightToKg(product.weight_in_kg, product.weight);

  // Always calculate price based on normalized weight and price per kg
  // This ensures consistency with customer app and handles weight normalization correctly
  const calculatedPrice = pricePerKg * weightInKg;

  // Always use calculated price to ensure accuracy (don't rely on stored price which might be wrong)
  const currentPrice = calculatedPrice;

  const discountPercentage = product.discount_percentage || 0;

  // Calculate original price
  let originalPrice = currentPrice;
  if (product.original_price && product.original_price > currentPrice) {
    originalPrice = product.original_price;
  } else if (discountPercentage > 0 && currentPrice > 0) {
    originalPrice = currentPrice / (1 - discountPercentage / 100);
  }

  return {
    currentPrice,
    originalPrice: Math.round(originalPrice),
    discountPercentage: Math.round(discountPercentage),
  };
};

// Product cleanup completed. Replaced by list-based service box.


export default function StoreScreen() {
  const [products, setProducts] = useState<ProductState[]>([]);
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shopId, setShopId] = useState<string | null>(null);
  const [shopType, setShopType] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingProduct, setEditingProduct] = useState<ProductState | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editAvailable, setEditAvailable] = useState(true);
  const inputRefs = useRef<Record<string, any>>({});

  // Load products from Supabase on mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Reload products when screen comes into focus (to get latest updates)
  useFocusEffect(
    useCallback(() => {
      console.log('[StoreScreen] Screen focused - reloading products to get latest updates...');
      loadProducts();
    }, [])
  );

  // Helper function to map shop_type to product category
  const getCategoryFromShopType = (shopType: string | null): string | null => {
    if (!shopType) return null;

    const shopTypeMap: Record<string, string> = {
      'laundry': 'Standard',
      'dryclean': 'Premium',
    };

    return shopTypeMap[shopType.toLowerCase()] || null;
  };

  const loadProducts = async () => {
    try {
      setLoading(true);

      // Get vendor's shop ID and shop type
      const vendorShopId = await getVendorShopId();
      setShopId(vendorShopId);

      // Get shop type from vendor data FIRST (before loading products)
      let shopTypeFromData: string | null = null;
      try {
        const vendorDataStr = await AsyncStorage.getItem('vendor_data');
        if (vendorDataStr) {
          const vendorData = JSON.parse(vendorDataStr);
          shopTypeFromData = vendorData?.shop?.shop_type || vendorData?.shop?.shopType || null;
          setShopType(shopTypeFromData);
          console.log('[StoreScreen] Shop type loaded:', shopTypeFromData);
        }
      } catch (error) {
        console.warn('[StoreScreen] Error loading shop type:', error);
      }

      // Get base products (shop_id IS NULL) - these are templates
      const baseProducts = await getAllProducts();

      // Get shop-specific products (shop_id = vendorShopId) - vendor's custom prices/availability
      let shopProducts: Product[] = [];
      if (vendorShopId) {
        shopProducts = await getShopProducts(vendorShopId);
      }

      // Create a map of shop-specific products by name for quick lookup
      const shopProductsMap = new Map<string, Product>();
      shopProducts.forEach((sp) => {
        shopProductsMap.set(sp.name, sp);
      });

      if (baseProducts && baseProducts.length > 0) {
        // Filter base products based on shop type (use shopTypeFromData, not state)
        let filteredProducts = baseProducts;

        // Show all products by default to allow vendor to select from all available item types
        console.log('[StoreScreen] Showing all products for selection');

        // Map base products to our state, merging with shop-specific data if available
        // Vendor app shows base products (templates) but with shop-specific prices/availability if set
        const productStates: ProductState[] = filteredProducts.map((baseProduct) => {
          // Check if this shop has a custom version of this product
          const shopProduct = shopProductsMap.get(baseProduct.name);

          // Use shop-specific price/availability if exists, otherwise use base product defaults
          // Ensure price_per_kg is a number (handle string conversions from database)
          const shopPricePerKg = shopProduct?.price_per_kg;
          const basePricePerKg = baseProduct.price_per_kg;

          // Convert to number, ensuring we don't lose precision
          let finalPricePerKg = 0;
          if (shopPricePerKg !== undefined && shopPricePerKg !== null) {
            finalPricePerKg = typeof shopPricePerKg === 'string'
              ? parseFloat(shopPricePerKg)
              : Number(shopPricePerKg);
          } else if (basePricePerKg !== undefined && basePricePerKg !== null) {
            finalPricePerKg = typeof basePricePerKg === 'string'
              ? parseFloat(basePricePerKg)
              : Number(basePricePerKg);
          }

          const isAvailable = shopProduct?.is_available !== undefined ? shopProduct.is_available : false;

          // Log for debugging price issues
          if (shopProduct && (baseProduct.name.includes('Shirt') || baseProduct.name.includes('Wash'))) {
            console.log(`[StoreScreen] Loading product: ${baseProduct.name}`, {
              shopPricePerKg: shopPricePerKg,
              basePricePerKg: basePricePerKg,
              finalPricePerKg: finalPricePerKg,
            });
          }

          const pricePerKg = finalPricePerKg;

          return {
            id: baseProduct.id, // Use base product ID (vendor will sync using this ID)
            name: baseProduct.name,
            category: baseProduct.category,
            is_available: isAvailable,
            price_per_kg: pricePerKg,
            image_url: baseProduct.image_url,
            weight: baseProduct.weight || null,
            weight_in_kg: baseProduct.weight_in_kg || 1,
            description: baseProduct.description || '',
            // Calculate price based on normalized weight and price_per_kg
            // Normalize weight first to handle grams/kg conversion
            price: (() => {
              const normalizedWeight = normalizeWeightToKg(baseProduct.weight_in_kg, baseProduct.weight);
              return pricePerKg * normalizedWeight;
            })(),
            original_price: baseProduct.original_price || null,
            discount_percentage: baseProduct.discount_percentage || 0,
          };
        });

        // Initialize prices - use default prices from Supabase, vendor can override
        const initialPrices: Record<string, string> = {};
        productStates.forEach((product) => {
          // Always use the price_per_kg (default or vendor's custom price)
          // Ensure it's a number before formatting - handle both string and number types
          let pricePerKgNum = 0;
          if (product.price_per_kg !== undefined && product.price_per_kg !== null) {
            pricePerKgNum = typeof product.price_per_kg === 'string'
              ? parseFloat(product.price_per_kg)
              : Number(product.price_per_kg);
          }

          let priceValue = '';
          if (pricePerKgNum > 0 && !isNaN(pricePerKgNum) && isFinite(pricePerKgNum)) {
            // Format price: remove trailing zeros but keep decimals if needed
            // Use full precision to support any number of digits
            priceValue = pricePerKgNum.toString().replace(/\.?0+$/, '');
            if (priceValue.includes('.') && priceValue.endsWith('.')) {
              priceValue = priceValue.slice(0, -1);
            }
            // Ensure we keep the full value - no truncation
            // If it's a whole number, don't add unnecessary decimals
            if (!priceValue.includes('.') && pricePerKgNum % 1 === 0) {
              priceValue = pricePerKgNum.toString();
            }
          }
          initialPrices[product.id] = priceValue;

          // Log for debugging price issues, especially for the problematic product
          // Log for debugging price issues
          if (product.name && (product.name.includes('Shirt') || product.name.includes('Wash'))) {
            console.log(`[StoreScreen] Initializing price for ${product.name}:`, {
              rawPricePerKg: product.price_per_kg,
              convertedPricePerKg: pricePerKgNum,
              priceValue: priceValue,
            });
          }
        });

        console.log('[StoreScreen] Loaded products:', productStates.length);
        console.log('[StoreScreen] Initialized prices:', Object.keys(initialPrices).length, 'products');
        if (__DEV__) {
          // Log first few prices for debugging
          const samplePrices = Object.entries(initialPrices).slice(0, 3);
          samplePrices.forEach(([id, price]) => {
            const product = productStates.find(p => p.id === id);
            console.log(`[StoreScreen] Product: ${product?.name} - Price: ₹${price}/kg`);
          });
        }

        setProducts(productStates);
        setPrices(initialPrices);

        // Set default category to first available one if not set
        if (productStates.length > 0 && selectedCategory === '') {
          setSelectedCategory('All');
        }
      } else {
        Alert.alert('Info', 'No products found in the system. Please contact support.');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const handleSave = async () => {
    if (!shopId) {
      Alert.alert('Error', 'Shop ID not found. Please log in again.');
      return;
    }

    try {
      setSaving(true);

      // Update all products
      const updatePromises = products.map(async (product) => {
        // Get price from state (user input)
        const priceString = prices[product.id] || '';
        const pricePerKg = priceString ? parseFloat(priceString) : 0;

        console.log(`[StoreScreen] Saving product: ${product.name}`, {
          productId: product.id,
          priceString,
          pricePerKg,
          isAvailable: product.is_available,
        });

        // Validate price if product is available
        if (product.is_available && (isNaN(pricePerKg) || pricePerKg <= 0)) {
          return {
            success: false,
            product: product.name,
            error: `Price is required when product is available. Please enter a price greater than 0.`
          };
        }

        // Use the entered price, or 0 if product is not available
        const finalPrice = product.is_available ? pricePerKg : 0;

        // Sync product to shop (updates both availability and price)
        // This will save to Supabase and reflect in customer app
        const result = await syncProductToShop(
          shopId,
          product.id,
          product.is_available,
          finalPrice
        );

        if (!result.success) {
          console.error(`[StoreScreen] Failed to save ${product.name}:`, result.error);
        }

        return {
          success: result.success,
          product: product.name,
          error: result.error
        };
      });

      const results = await Promise.all(updatePromises);
      const failed = results.filter((r) => !r.success);

      if (failed.length === 0) {
        Alert.alert('Success', 'All services updated successfully!');
        // Reload products to reflect changes from Supabase
        await loadProducts();
      } else {
        const failedNames = failed.map((f) => `${f.product} (${f.error})`).join('\n');
        Alert.alert(
          'Partial Success',
          `Updated ${results.length - failed.length} services.\n\nFailed:\n${failedNames}`
        );
        // Still reload to get updated data
        await loadProducts();
      }
    } catch (error: any) {
      console.error('Error saving products:', error);
      Alert.alert('Error', error.message || 'Failed to save products. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle product edit
  const handleEditProduct = (product: ProductState) => {
    setEditingProduct(product);
    // Get price from prices state or product, ensure it's formatted correctly
    const priceFromState = prices[product.id];
    const priceFromProduct = product.price_per_kg > 0 ? Number(product.price_per_kg).toString() : '';
    const priceToEdit = priceFromState || priceFromProduct;

    console.log('[StoreScreen] Editing product:', {
      productName: product.name,
      priceFromState: priceFromState,
      priceFromProduct: priceFromProduct,
      priceToEdit: priceToEdit,
      productPricePerKg: product.price_per_kg,
    });

    setEditPrice(priceToEdit);
    setEditAvailable(product.is_available);
  };

  // Save edited product
  const handleSaveEdit = async () => {
    if (!editingProduct) return;

    // Ensure price is a valid number
    const priceValue = Number(editPrice);
    if (isNaN(priceValue) || priceValue < 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    console.log('[StoreScreen] Saving edited product:', {
      productName: editingProduct.name,
      editPrice: editPrice,
      priceValue: priceValue,
      priceValueType: typeof priceValue,
    });

    // Save to backend first
    try {
      if (shopId) {
        setSaving(true); // Reuse saving state for modal save too
        const result = await syncProductToShop(shopId, editingProduct.id, editAvailable, priceValue);
        setSaving(false);

        if (result.success) {
          console.log('[StoreScreen] Product saved successfully, updating local state...');

          // Update products state locally immediately
          setProducts(prev => prev.map(p =>
            p.id === editingProduct.id
              ? { ...p, is_available: editAvailable, price_per_kg: priceValue }
              : p
          ));

          // Update prices state locally immediately
          setPrices(prev => ({
            ...prev,
            [editingProduct.id]: editPrice
          }));

          setEditingProduct(null);
          Alert.alert('Success', 'Service updated successfully!');

          // Still reload in background to ensure sync with database
          loadProducts();
        } else {
          Alert.alert('Error', result.error || 'Failed to save service');
          // DO NOT close modal on error
        }
      }
    } catch (error: any) {
      setSaving(false);
      console.error('Error saving product:', error);
      Alert.alert('Error', error.message || 'Failed to save service');
      // DO NOT close modal on error
    }
  };

  // Get unique categories (without "All")
  const categories = useMemo(() => {
    const cats = [...Array.from(new Set(products.map(p => p.category)))].filter(Boolean).sort();
    return ['All', ...cats];
  }, [products]);

  // Filter products by category and search query
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [products, selectedCategory, searchQuery]);

  // Group products by category - memoized to prevent unnecessary re-renders
  const productsByCategory = useMemo(() => {
    return products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {} as Record<string, ProductState[]>);
  }, [products]);

  return (
    <View style={styles.container}>
      <ExpoStatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        style={{ flex: 1 }}
      >
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Manage Services</Text>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save All</Text>
            )}
          </TouchableOpacity>
        </LinearGradient>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#111111" />
            <Text style={styles.loadingText}>Loading services...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="none"
          >
            {Object.keys(productsByCategory).length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No services found</Text>
                <TouchableOpacity onPress={loadProducts} style={styles.refreshButton}>
                  <Text style={styles.refreshButtonText}>Refresh</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Services</Text>
                {shopType && (
                  <Text style={styles.shopTypeInfo}>
                    Shop Type: {shopType.charAt(0).toUpperCase() + shopType.slice(1)}
                    {shopType.toLowerCase() !== 'multi' && ' - Showing matching services only'}
                  </Text>
                )}
                <Text style={styles.sectionSubtitle}>
                  Tap on a service to set price and availability
                </Text>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                  <View style={styles.searchInputWrapper}>
                    <Search size={20} color="#6B7280" style={styles.searchIcon} />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search services..."
                      placeholderTextColor="#9CA3AF"
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {searchQuery.length > 0 && (
                      <TouchableOpacity
                        onPress={() => setSearchQuery('')}
                        style={styles.clearSearchButton}
                      >
                        <X size={18} color="#6B7280" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Category Filter */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoryScroll}
                  contentContainerStyle={styles.categoryContainer}
                >
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryChip,
                        selectedCategory === category && styles.categoryChipActive
                      ]}
                      onPress={() => setSelectedCategory(category)}
                    >
                      <Text style={[
                        styles.categoryText,
                        selectedCategory === category && styles.categoryTextActive
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Service List Box */}
                <View style={styles.serviceListBox}>
                  <Text style={styles.serviceListLabel}>
                    Select Services for {selectedCategory || 'Item'}:
                  </Text>

                  {filteredProducts.map((product) => {
                    // Get price from prices state or product
                    const priceString = prices[product.id] || '';
                    const pricePerKg = priceString ? Number(priceString) : (Number(product.price_per_kg) || 0);

                    return (
                      <View
                        key={product.id}
                        style={styles.serviceRow}
                      >
                        <TouchableOpacity
                          style={styles.serviceRowLeft}
                          onPress={async () => {
                            // Quick toggle functionality
                            if (!shopId) return;
                            try {
                              const newAvailable = !product.is_available;

                              // Optimistic update
                              setProducts(prev => prev.map(p =>
                                p.id === product.id ? { ...p, is_available: newAvailable } : p
                              ));

                              const result = await syncProductToShop(shopId, product.id, newAvailable, pricePerKg);
                              if (!result.success) {
                                // Revert optimistic update
                                setProducts(prev => prev.map(p =>
                                  p.id === product.id ? { ...p, is_available: product.is_available } : p
                                ));
                                Alert.alert('Error', result.error || 'Failed to update availability');
                              }
                            } catch (error) {
                              console.error('Error toggling service:', error);
                            }
                          }}
                          activeOpacity={0.7}
                        >
                          <View
                            style={[
                              styles.circularCheckbox,
                              product.is_available && styles.circularCheckboxActive
                            ]}
                          >
                            {product.is_available && <View style={styles.circularCheckboxInner} />}
                          </View>
                          <View style={styles.serviceIconContainer}>
                            <Image
                              source={getImageSource(product.image_url, product.name, product.category)}
                              style={styles.serviceIcon}
                              resizeMode="contain"
                            />
                          </View>
                          <View style={styles.serviceInfo}>
                            <Text style={styles.serviceName}>{product.name}</Text>
                            <Text style={styles.servicePriceText}>₹{pricePerKg}</Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.rowEditButton}
                          onPress={() => handleEditProduct(product)}
                        >
                          <Text style={styles.rowEditButtonText}>EDIT</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>

                {filteredProducts.length === 0 && (
                  <View style={styles.emptyProductsContainer}>
                    <Text style={styles.emptyProductsText}>No services found for this category</Text>
                  </View>
                )}
              </View>
            )}

            {/* Edit Product Modal */}
            <Modal
              visible={editingProduct !== null}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setEditingProduct(null)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>
                      {editingProduct?.name || 'Edit Product'}
                    </Text>
                    <TouchableOpacity onPress={() => setEditingProduct(null)}>
                      <Text style={styles.modalClose}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.modalBody}>
                    <View style={styles.modalInputGroup}>
                      <Text style={styles.modalLabel}>Price per kg (₹)</Text>
                      <TextInput
                        style={styles.modalInput}
                        keyboardType="decimal-pad"
                        value={editPrice}
                        onChangeText={(text) => {
                          // Allow any number of digits, decimals, and ensure proper formatting
                          // Remove any non-numeric characters except decimal point
                          const cleanedText = text.replace(/[^0-9.]/g, '');
                          // Ensure only one decimal point
                          const parts = cleanedText.split('.');
                          const formatted = parts.length > 2
                            ? parts[0] + '.' + parts.slice(1).join('')
                            : cleanedText;
                          setEditPrice(formatted);
                        }}
                        placeholder="Enter price per kg (e.g., 400, 1500, 2500.50)"
                        autoFocus
                      />
                    </View>

                    <View style={styles.modalSwitchGroup}>
                      <Text style={styles.modalLabel}>Availability</Text>
                      <View style={styles.modalSwitchRow}>
                        <Text style={styles.modalSwitchLabel}>
                          {editAvailable ? 'Available' : 'Not Available'}
                        </Text>
                        <Switch
                          value={editAvailable}
                          onValueChange={setEditAvailable}
                          thumbColor={editAvailable ? '#111111' : '#f4f3f4'}
                          trackColor={{ false: '#767577', true: '#4CAF50' }}
                        />
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.modalSaveButton}
                      onPress={handleSaveEdit}
                    >
                      <Text style={styles.modalSaveButtonText}>Save Changes</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              </View>
            </Modal>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 25,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight || 24 : 60,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111111',
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#111111',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginLeft: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 20,
  },

  infoText: {
    marginTop: 10,
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: '#111111',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  categoryScroll: {
    marginTop: 10,
    marginBottom: 20,
  },
  categoryContainer: {
    paddingVertical: 8,
    paddingBottom: 12,
    gap: 10,
  },
  categoryChip: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 10,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryChipActive: {
    backgroundColor: '#FCD34D',
  },
  categoryText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#1F2937',
    fontWeight: '600',
  },
  // Service List Box Styles
  serviceListBox: {
    paddingBottom: 20,
  },
  serviceListLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    marginVertical: 12,
  },
  serviceRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FDBA74', // Peach border
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  circularCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularCheckboxActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF5FF',
  },
  circularCheckboxInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
  },
  serviceIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceIcon: {
    width: 38,
    height: 38,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  servicePriceText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  rowEditButton: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  rowEditButtonText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },
  unavailableBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(156, 163, 175, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unavailableBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  emptyProductsContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyProductsText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111111',
  },
  modalClose: {
    fontSize: 24,
    color: '#6B7280',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalInputGroup: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111111',
  },
  modalSwitchGroup: {
    marginBottom: 20,
  },
  modalSwitchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalSwitchLabel: {
    fontSize: 16,
    color: '#111111',
    fontWeight: '500',
  },
  modalSaveButton: {
    backgroundColor: '#111111',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  modalSaveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111111',
    padding: 0,
    margin: 0,
  },
  clearSearchButton: {
    padding: 4,
    marginLeft: 8,
  },
  shopTypeInfo: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '600',
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  availabilitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  availabilityLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  productDetailsSection: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  productDetailText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    lineHeight: 16,
  },
  discountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  originalPriceText: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountText: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '600',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});
