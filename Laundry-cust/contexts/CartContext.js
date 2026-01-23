import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const itemList = [
    { id: 'shirts', name: 'Shirts', price: 2.5, icon: require('../assets/icon/shirt.jpg'), unit: 'item' },
    { id: 'trousers', name: 'Trousers', price: 4.0, icon: require('../assets/icon/pant.png'), unit: 'item' },
    { id: 'suit', name: 'Suit', price: 8.0, icon: require('../assets/icon/suit.jpg'), unit: 'item' },
    { id: 'coat', name: 'Coat', price: 10.0, icon: require('../assets/icon/coat.png'), unit: 'item' },
    { id: 'dress', name: 'Dress', price: 6.0, icon: require('../assets/icon/dress.png'), unit: 'item' },
    { id: 'kurta', name: 'Kurta', price: 5.0, icon: require('../assets/icon/kurta.webp'), unit: 'item' },
    { id: 'saree', name: 'Saree', price: 7.0, icon: require('../assets/icon/saree.jpg'), unit: 'item' },
    { id: 'tshirt', name: 'T-Shirt', price: 3.0, icon: require('../assets/icon/t shirt.jpg'), unit: 'item' },
  ];

  const addToCart = (itemId, quantity, service = 'Wash & Fold', customProduct = null) => {
    if (quantity <= 0) return;

    // If customProduct is provided, use it directly
    if (customProduct) {
      setCartItems(prev => {
        const existingItemIndex = prev.findIndex(
          cartItem => cartItem.id === customProduct.id && cartItem.service === service
        );

        if (existingItemIndex >= 0) {
          const updated = [...prev];
          updated[existingItemIndex].quantity += quantity;
          return updated;
        } else {
          return [
            ...prev,
            {
              id: customProduct.id || itemId,
              name: customProduct.name,
              price: customProduct.price,
              icon: customProduct.icon || '👕',
              quantity,
              service,
              unit: customProduct.unit || 'item',
            },
          ];
        }
      });
      return;
    }

    // Otherwise use the default itemList
    const item = itemList.find(i => i.id === itemId);
    if (!item) return;

    setCartItems(prev => {
      const existingItemIndex = prev.findIndex(
        cartItem => cartItem.id === itemId && cartItem.service === service
      );

      if (existingItemIndex >= 0) {
        const updated = [...prev];
        updated[existingItemIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prev,
          {
            id: itemId,
            name: item.name,
            price: item.price,
            icon: item.icon,
            quantity,
            service,
            unit: item.unit,
          },
        ];
      }
    });
  };

  const updateCartItem = (itemId, service, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId, service);
      return;
    }

    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId && item.service === service
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (itemId, service) => {
    setCartItems(prev =>
      prev.filter(item => !(item.id === itemId && item.service === service))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const value = {
    cartItems,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemCount,
    itemList,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

