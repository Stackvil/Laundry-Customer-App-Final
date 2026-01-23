# Razorpay Integration Setup Guide

## Current Status
✅ Razorpay API keys configured (Test Mode)
✅ Payment flow structure implemented
✅ Helper functions created in `utils/razorpay.js`

## Test API Keys
- **Key ID**: `rzp_test_RkgC2RZSP1gZNW`
- **Key Secret**: `ivWo5qTwct9dCsKlCG43NhCS`

## Installation Options

### Option 1: Using React Native Razorpay SDK (Recommended for Production)

**Note**: This requires a development build (not Expo Go) as it uses native modules.

1. Install the package:
```bash
npm install react-native-razorpay
```

2. For iOS, install pods:
```bash
cd ios && pod install && cd ..
```

3. In `screens/PaymentScreen.js`, uncomment the Razorpay SDK code (lines 54-80) and remove the simulated payment flow.

4. Build a development build:
```bash
npx expo prebuild
npx expo run:android  # or npx expo run:ios
```

### Option 2: Using WebView (Works with Expo Go)

1. Install required packages:
```bash
npx expo install react-native-webview expo-web-browser
```

2. Update `utils/razorpay.js` to use WebView approach:
   - Create a Razorpay checkout URL
   - Open in WebView or external browser
   - Handle payment callbacks

### Option 3: Backend Integration (Most Secure - Recommended)

1. Create a backend API endpoint to:
   - Create Razorpay orders (using secret key)
   - Verify payment signatures
   - Handle webhooks

2. Update `utils/razorpay.js`:
   - Replace `createRazorpayOrder` to call your backend API
   - Add `verifyPaymentSignature` function that calls backend

3. Example backend endpoint structure:
```javascript
POST /api/razorpay/create-order
Body: { amount: 1000, currency: 'INR' }
Response: { orderId: 'order_xxx', amount: 1000 }

POST /api/razorpay/verify-payment
Body: { orderId, paymentId, signature }
Response: { verified: true/false }
```

## Security Notes

⚠️ **IMPORTANT**: Never expose your Razorpay Secret Key in the mobile app!

- The Secret Key should only be used on your backend server
- The Key ID can be safely used in the mobile app
- Always verify payment signatures on the backend
- Use HTTPS for all API calls

## Testing

1. Use Razorpay test cards:
   - **Card Number**: 4111 1111 1111 1111
   - **CVV**: Any 3 digits
   - **Expiry**: Any future date
   - **Name**: Any name

2. Test payment flow:
   - Select "Card" payment method
   - Click "Pay Now"
   - Complete payment in Razorpay checkout
   - Verify order creation

## Current Implementation

The current implementation uses a simulated payment flow for testing. To enable real payments:

1. Choose one of the installation options above
2. Uncomment the Razorpay SDK code in `PaymentScreen.js`
3. Remove or comment out the simulated payment flow
4. Test with Razorpay test credentials

## Production Checklist

- [ ] Replace test keys with production keys
- [ ] Set up backend API for order creation
- [ ] Implement payment signature verification
- [ ] Set up Razorpay webhooks for payment status updates
- [ ] Test with real payment methods
- [ ] Add error handling and retry logic
- [ ] Add analytics for payment success/failure rates

