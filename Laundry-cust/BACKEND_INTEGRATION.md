# Backend Integration Guide

This guide will help you integrate the backend API with your React Native frontend.

## Step 1: Install Dependencies

Add AsyncStorage for token persistence (if not already installed):
```bash
cd Laundry-cust
npx expo install @react-native-async-storage/async-storage
```

## Step 2: Update API Configuration

The API service is already created in `utils/api.js`. Update the base URL:

```javascript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:5000/api' // Development - use your computer's IP for physical device
  : 'https://your-production-api.com/api'; // Production
```

**For physical device testing**, use your computer's IP address:
```javascript
const API_BASE_URL = 'http://192.168.1.XXX:5000/api'; // Replace XXX with your IP
```

## Step 3: Update AuthContext

Replace the mock API calls in `contexts/AuthContext.js`:

```javascript
import api from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// In AuthProvider:
const login = async (mobileNumber, password) => {
  setIsLoading(true);
  try {
    const response = await api.login(mobileNumber, password);
    if (response.success) {
      await AsyncStorage.setItem('authToken', response.data.token);
      setUser(response.data.user);
    }
    setIsLoading(false);
    return response;
  } catch (error) {
    setIsLoading(false);
    throw error;
  }
};

const signup = async (name, email, password, mobileNumber, address) => {
  setIsLoading(true);
  try {
    const response = await api.register({
      name, email, password, mobileNumber, address
    });
    if (response.success) {
      await AsyncStorage.setItem('authToken', response.data.token);
      setUser(response.data.user);
    }
    setIsLoading(false);
    return response;
  } catch (error) {
    setIsLoading(false);
    throw error;
  }
};

// Load token on app start
useEffect(() => {
  const loadToken = async () => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      api.setToken(token);
      try {
        const response = await api.getCurrentUser();
        if (response.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        await AsyncStorage.removeItem('authToken');
      }
    }
  };
  loadToken();
}, []);
```

## Step 4: Update CartContext

Replace local state with API calls in `contexts/CartContext.js`:

```javascript
import api from '../utils/api';

// Replace itemList with API call
useEffect(() => {
  const loadItems = async () => {
    try {
      const response = await api.getItems();
      if (response.success) {
        // Store items in state
      }
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };
  loadItems();
}, []);

// Update addToCart
const addToCart = async (itemId, quantity, service, customProduct) => {
  try {
    const response = await api.addToCart({
      itemId: customProduct?.id || itemId,
      serviceIds: [], // Get service IDs if needed
      quantity,
      serviceName: service
    });
    // Refresh cart
    await loadCart();
  } catch (error) {
    console.error('Error adding to cart:', error);
  }
};

// Load cart from API
const loadCart = async () => {
  try {
    const response = await api.getCart();
    if (response.success) {
      setCartItems(response.data.cart.items);
    }
  } catch (error) {
    console.error('Error loading cart:', error);
  }
};
```

## Step 5: Update OrderContext

Replace mock orders with API calls in `contexts/OrderContext.js`:

```javascript
import api from '../utils/api';

const addOrder = async (orderData) => {
  try {
    const response = await api.createOrder({
      shopId: orderData.shopId,
      address: orderData.address,
      mobileNumber: orderData.mobileNumber,
      paymentMethod: orderData.paymentMethod || 'Cash on Delivery',
      notes: orderData.notes || ''
    });
    
    if (response.success) {
      const newOrder = response.data.order;
      setOrders((prev) => [newOrder, ...prev]);
      return newOrder;
    }
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

const getOrders = async () => {
  try {
    const response = await api.getOrders();
    if (response.success) {
      setOrders(response.data.orders);
      return response.data.orders;
    }
  } catch (error) {
    console.error('Error loading orders:', error);
    return [];
  }
};
```

## Step 6: Update Payment Screen

Update `screens/PaymentScreen.js` to use real Razorpay integration:

```javascript
import api from '../utils/api';

const handleRazorpayPayment = async () => {
  try {
    setIsProcessing(true);
    
    // Create Razorpay order via backend
    const paymentResponse = await api.createPaymentOrder(orderTotal, orderId);
    
    if (paymentResponse.success) {
      // Use Razorpay SDK or WebView
      // After payment, verify with backend
      const verifyResponse = await api.verifyPayment({
        orderId: orderId,
        paymentId: razorpayPaymentId,
        signature: razorpaySignature,
        razorpayOrderId: paymentResponse.data.orderId
      });
      
      if (verifyResponse.success) {
        handlePaymentSuccess(verifyResponse.data);
      }
    }
  } catch (error) {
    // Handle error
  } finally {
    setIsProcessing(false);
  }
};
```

## Step 7: Update HomeScreen

Update `screens/HomeScreen.js` to fetch shops from API:

```javascript
import api from '../utils/api';

useEffect(() => {
  const loadShops = async () => {
    try {
      if (currentLocation && location.coords) {
        const response = await api.getShops(
          location.coords.latitude,
          location.coords.longitude
        );
        if (response.success) {
          setShops(response.data.shops);
        }
      }
    } catch (error) {
      console.error('Error loading shops:', error);
    }
  };
  loadShops();
}, [currentLocation]);
```

## Step 8: Add Error Handling

Create a global error handler:

```javascript
// utils/errorHandler.js
export const handleApiError = (error) => {
  if (error.message) {
    Alert.alert('Error', error.message);
  } else {
    Alert.alert('Error', 'Something went wrong. Please try again.');
  }
};
```

## Step 9: Add Loading States

Add loading indicators for all API calls:

```javascript
const [isLoading, setIsLoading] = useState(false);

// In your component
{isLoading && <ActivityIndicator />}
```

## Step 10: Test Integration

1. Start backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Update API URL in `utils/api.js`

3. Test registration and login

4. Test adding items to cart

5. Test creating orders

6. Test payment flow

## Common Issues & Solutions

### CORS Errors
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- For Expo, use your computer's IP address

### Network Errors
- Check backend is running
- Verify API URL is correct
- Check firewall settings

### Authentication Errors
- Verify token is being sent in headers
- Check token expiration
- Ensure token is stored in AsyncStorage

### Payment Errors
- Verify Razorpay keys are correct
- Check webhook URL configuration
- Ensure payment verification is called

## Next Steps

1. ✅ Backend is ready
2. ⏳ Integrate frontend with API
3. ⏳ Test all features
4. ⏳ Deploy backend to production
5. ⏳ Update frontend API URL for production
6. ⏳ Test end-to-end flow

## Support

Refer to:
- `backend/API_DOCUMENTATION.md` - Complete API reference
- `backend/QUICK_START.md` - Backend setup guide
- `backend/README.md` - Backend documentation
