# CleanFold Backend API

Complete backend API for CleanFold Laundry Service Application.

## Features

- ✅ User Authentication (Register, Login, JWT)
- ✅ User Profile Management
- ✅ Shop Management with Location-based Search
- ✅ Service & Item Management
- ✅ Shopping Cart Management
- ✅ Order Management with Status Tracking
- ✅ Razorpay Payment Integration
- ✅ Address Management
- ✅ Real-time Notifications (Socket.io)
- ✅ Settings & Preferences Management

## Tech Stack

- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for Authentication
- **Razorpay** for Payments
- **Socket.io** for Real-time Updates
- **Bcrypt** for Password Hashing

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
   - MongoDB connection string
   - JWT secret
   - Razorpay keys
   - Other environment variables

4. Start MongoDB (if running locally):
```bash
mongod
```

5. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/preferences` - Update user preferences

### Shops
- `GET /api/shops` - Get all shops (with location filter)
- `GET /api/shops/:id` - Get shop by ID

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID
- `GET /api/services/items/all` - Get all items
- `GET /api/services/items/:id` - Get item by ID

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:itemIndex` - Update cart item
- `DELETE /api/cart/remove/:itemIndex` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status
- `PUT /api/orders/:id/cancel` - Cancel order

### Payments
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment
- `POST /api/payments/webhook` - Razorpay webhook handler

### Addresses
- `GET /api/addresses` - Get user's addresses
- `POST /api/addresses` - Create new address
- `PUT /api/addresses/:id` - Update address
- `DELETE /api/addresses/:id` - Delete address

### Notifications
- `GET /api/notifications` - Get user's notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings/language` - Update language
- `PUT /api/settings/notifications` - Update notification preferences
- `PUT /api/settings/privacy` - Update privacy settings

## Database Models

- **User** - User accounts and preferences
- **Shop** - Laundry shops with location
- **Service** - Available services (Washing, Ironing, etc.)
- **Item** - Laundry items (Shirt, Pant, etc.)
- **Order** - Customer orders
- **Cart** - Shopping cart
- **Address** - User addresses
- **Notification** - User notifications

## Authentication

All protected routes require JWT token in header:
```
Authorization: Bearer <token>
```

## Real-time Updates

Socket.io is used for real-time order status updates and notifications. Clients should connect and join their user room:
```javascript
socket.emit('join-user-room', userId);
```

## Payment Integration

Razorpay integration includes:
- Order creation
- Payment verification
- Webhook handling for payment events

## Environment Variables

See `.env.example` for all required environment variables.

## API Response Format

All responses follow this format:
```json
{
  "success": true/false,
  "message": "Response message",
  "data": { ... },
  "errors": [ ... ] // Only on validation errors
}
```

## Error Handling

- 400: Bad Request (validation errors)
- 401: Unauthorized (authentication required)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Server Error

## Development

Run in development mode with auto-reload:
```bash
npm run dev
```

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a production MongoDB instance (MongoDB Atlas recommended)
3. Set secure JWT_SECRET
4. Configure proper CORS settings
5. Use process manager like PM2:
```bash
pm2 start server.js --name cleanfold-api
```

## License

ISC
