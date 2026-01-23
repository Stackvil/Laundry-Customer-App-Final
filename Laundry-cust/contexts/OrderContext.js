import React, { createContext, useState, useContext } from 'react';

const OrderContext = createContext();

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);

  const addOrder = (orderData) => {
    const newOrder = {
      id: Date.now().toString(),
      orderNumber: `#ORD-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      ...orderData,
      status: 'Pending',
    };
    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const getOrders = () => {
    return orders;
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        addOrder,
        getOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

