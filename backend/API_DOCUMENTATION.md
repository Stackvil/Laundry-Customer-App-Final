# CleanFold Backend API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-api-domain.com/api
```

## Authentication
Most endpoints require authentication. Include JWT token in request headers:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format
All API responses follow this structure:
```json
{
  "success": true/false,
  "message": "Response message",
  "data": { ... },
  "errors": [ ... ] // Only present on validation errors
}
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "mobileNumber": "9876543210",
  "password": "password123",
  "address": "123 Main St" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

### Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "mobileNumber": "9876543210",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

### Get Current User
**GET** `/auth/me` (Protected)

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... }
  }
}
```

### Change Password
**POST** `/auth/change-password` (Protected)

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

---

## Shop Endpoints

### Get All Shops
**GET** `/shops`

**Query Parameters:**
- `latitude` (optional) - User latitude
- `longitude` (optional) - User longitude
- `maxDistance` (optional) - Max distance in meters (default: 10000)

**Example:**
```
GET /shops?latitude=28.6139&longitude=77.2090&maxDistance=5000
```

**Response:**
```json
{
  "success": true,
  "count": 4,
  "data": {
    "shops": [
      {
        "_id": "...",
        "name": "QuickClean Laundry",
        "address": "123 Main Street",
        "distance": "0.5 km",
        "rating": 4.8,
        ...
      }
    ]
  }
}
```

### Get Shop by ID
**GET** `/shops/:id`

---

## Service & Item Endpoints

### Get All Services
**GET** `/services`

### Get All Items
**GET** `/services/items/all`

---

## Cart Endpoints (All Protected)

### Get Cart
**GET** `/cart`

### Add to Cart
**POST** `/cart/add`

**Request Body:**
```json
{
  "itemId": "item_id_here",
  "serviceIds": ["service_id_1", "service_id_2"],
  "quantity": 2,
  "serviceName": "Wash & Iron"
}
```

### Update Cart Item
**PUT** `/cart/update/:itemIndex`

**Request Body:**
```json
{
  "quantity": 3
}
```

### Remove from Cart
**DELETE** `/cart/remove/:itemIndex`

### Clear Cart
**DELETE** `/cart/clear`

---

## Order Endpoints (All Protected)

### Create Order
**POST** `/orders`

**Request Body:**
```json
{
  "shopId": "shop_id_here",
  "address": {
    "village": "Village Name",
    "area": "Area Name",
    "city": "City",
    "pincode": "123456",
    "state": "State",
    "landmark": "Landmark",
    "fullAddress": "Complete address"
  },
  "mobileNumber": "9876543210",
  "paymentMethod": "Cash on Delivery",
  "notes": "Special instructions"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": {
      "_id": "...",
      "orderNumber": "ORD-12345678",
      "status": "Pending",
      "total": 500,
      ...
    }
  }
}
```

### Get User Orders
**GET** `/orders`

### Get Order by ID
**GET** `/orders/:id`

### Update Order Status
**PUT** `/orders/:id/status` (Admin/Shop Owner)

**Request Body:**
```json
{
  "status": "In Progress",
  "note": "Order is being processed"
}
```

### Cancel Order
**PUT** `/orders/:id/cancel`

---

## Payment Endpoints (All Protected)

### Create Razorpay Order
**POST** `/payments/create-order`

**Request Body:**
```json
{
  "amount": 500,
  "currency": "INR",
  "orderId": "order_id_here"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "order_xxx",
    "amount": 50000,
    "currency": "INR",
    "key": "rzp_test_xxx"
  }
}
```

### Verify Payment
**POST** `/payments/verify`

**Request Body:**
```json
{
  "orderId": "your_order_id",
  "paymentId": "razorpay_payment_id",
  "signature": "razorpay_signature",
  "razorpayOrderId": "razorpay_order_id"
}
```

### Webhook (Public)
**POST** `/payments/webhook`

Called by Razorpay for payment events. No authentication required.

---

## Address Endpoints (All Protected)

### Get Addresses
**GET** `/addresses`

### Create Address
**POST** `/addresses`

**Request Body:**
```json
{
  "label": "Home",
  "village": "Village",
  "area": "Area",
  "city": "City",
  "pincode": "123456",
  "state": "State",
  "landmark": "Landmark",
  "fullAddress": "Complete address"
}
```

### Update Address
**PUT** `/addresses/:id`

### Delete Address
**DELETE** `/addresses/:id`

---

## Notification Endpoints (All Protected)

### Get Notifications
**GET** `/notifications?isRead=true&limit=50`

### Get Unread Count
**GET** `/notifications/unread-count`

### Mark as Read
**PUT** `/notifications/:id/read`

### Mark All as Read
**PUT** `/notifications/read-all`

### Delete Notification
**DELETE** `/notifications/:id`

---

## Settings Endpoints (All Protected)

### Get Settings
**GET** `/settings`

### Update Language
**PUT** `/settings/language`

**Request Body:**
```json
{
  "language": "en"
}
```

### Update Notification Settings
**PUT** `/settings/notifications`

**Request Body:**
```json
{
  "push": true,
  "email": true,
  "marketing": false
}
```

### Update Privacy Settings
**PUT** `/settings/privacy`

**Request Body:**
```json
{
  "dataSharing": false,
  "analytics": true,
  "locationTracking": true,
  "profileVisibility": true
}
```

---

## Error Codes

- **400** - Bad Request (validation errors)
- **401** - Unauthorized (missing/invalid token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **500** - Server Error

---

## Real-time Updates (Socket.io)

Connect to Socket.io server and join user room:
```javascript
socket.emit('join-user-room', userId);
```

Listen for events:
- `new-order` - New order created
- `order-status-update` - Order status changed
- `payment-success` - Payment successful

---

## Example Integration

```javascript
import api from './utils/api';

// Login
const loginResponse = await api.login('9876543210', 'password123');
api.setToken(loginResponse.data.token);

// Get shops
const shopsResponse = await api.getShops(28.6139, 77.2090);

// Add to cart
await api.addToCart({
  itemId: 'item_id',
  serviceIds: ['service_id'],
  quantity: 2,
  serviceName: 'Wash & Iron'
});

// Create order
const orderResponse = await api.createOrder({
  shopId: 'shop_id',
  address: { ... },
  mobileNumber: '9876543210'
});
```
