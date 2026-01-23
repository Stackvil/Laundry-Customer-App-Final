# Quick Start Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Setup Steps

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and update:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - A random secret string for JWT tokens
- `RAZORPAY_KEY_ID` - Your Razorpay Key ID
- `RAZORPAY_KEY_SECRET` - Your Razorpay Key Secret
- `FRONTEND_URL` - Your frontend URL (for CORS)

### 3. Start MongoDB
If using local MongoDB:
```bash
mongod
```

Or use MongoDB Atlas (cloud) and update `MONGODB_URI` in `.env`

### 4. Seed Database (Optional)
To populate initial data (services, items, shops):
```bash
node scripts/seedData.js
```

### 5. Start Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

### 6. Test API
```bash
# Health check
curl http://localhost:5000/api/health

# Should return: {"status":"OK","message":"CleanFold API is running"}
```

## Frontend Integration

Update `Laundry-cust/utils/api.js` with your backend URL:
```javascript
const API_BASE_URL = 'http://localhost:5000/api'; // or your production URL
```

## API Testing

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "mobileNumber": "9876543210",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "mobileNumber": "9876543210",
    "password": "password123"
  }'
```

### Get Shops (with auth token)
```bash
curl http://localhost:5000/api/shops \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Common Issues

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- For MongoDB Atlas, ensure IP is whitelisted

### Port Already in Use
- Change `PORT` in `.env`
- Or kill the process using port 5000

### CORS Errors
- Update `FRONTEND_URL` in `.env`
- Or set to `*` for development (not recommended for production)

## Next Steps

1. Update frontend `utils/api.js` to use backend API
2. Replace mock API calls in contexts with real API calls
3. Test all endpoints
4. Deploy backend to production (Heroku, AWS, etc.)
5. Update frontend API URL for production
