# ParkShare Setup Guide

## Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)
- Firebase project
- Stripe account
- Google OAuth credentials (optional)
- Apple Developer account (optional)

## Quick Start

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Environment Configuration

#### Backend Configuration (.env)
The backend `.env` file is already created with default values. Update these values:

```env
# Required Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key_here
FRONTEND_URL=http://localhost:3000

# Optional Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
JWT_SECRET=your-super-secret-jwt-key-here
```

#### Frontend Configuration (.env)
The frontend `.env` file is already created with default values. Update these values:

```env
# Required for OAuth
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-here
REACT_APP_APPLE_CLIENT_ID=your-apple-client-id-here

# Optional - Maps Integration
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here
```

### 3. Firebase Setup

#### Current Firebase Project: `parkshare-40123`
- The Firebase configuration is already set up
- Google OAuth is implemented and ready to use
- You need to enable Google Sign-In in Firebase Console

#### Enable Google Sign-In:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `parkshare-40123`
3. Go to Authentication > Sign-in method
4. Enable Google and configure OAuth consent screen
5. Copy the Google Client ID to your frontend `.env` file

### 4. Stripe Configuration

#### Current Stripe Setup:
- Test mode is enabled by default
- Test API key is already configured
- Payment system is fully functional

#### To use your own Stripe account:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your test/live API keys
3. Update `STRIPE_SECRET_KEY` in backend `.env`
4. Update `REACT_APP_STRIPE_PUBLISHABLE_KEY` in frontend `.env`

### 5. Start the Application

```bash
# Start both frontend and backend
npm start

# Or start individually
npm run backend    # Starts backend on port 3001
npm run frontend   # Starts frontend on port 3000
```

## Current Status

### ✅ Fully Implemented Features:
- Firebase Authentication (Email/Password)
- Google OAuth (needs Google Client ID)
- Apple Sign-In (needs Apple Client ID)
- Stripe Payment System
- Real-time Messaging
- Map Integration
- Mobile App (React Native)
- Admin Panel
- Multi-language Support

### 🔧 Requires Setup:
1. **Google OAuth**: Add Google Client ID to enable Google Sign-In
2. **Apple Sign-In**: Add Apple Client ID to enable Apple Sign-In
3. **Stripe**: Use your own Stripe keys for production
4. **Email**: Configure email service for notifications

## Testing

### Test Users:
The application includes test users for development:
- Test mode is enabled by default
- Payments are bypassed for test users
- See `TEST_USER_IDS` in `backend/server.js`

### Test Stripe:
- Use test card: `4242 4242 4242 4242`
- Any future expiry date
- Any CVV

## Production Deployment

### Environment Variables:
1. Set `NODE_ENV=production` in backend
2. Set `TEST_MODE=false` in backend
3. Use production Stripe keys
4. Configure production Firebase project
5. Set production domain in CORS settings

### Security:
- Never commit `.env` files
- Use environment-specific configurations
- Enable Firebase security rules
- Configure proper CORS origins

## Troubleshooting

### Common Issues:
1. **Firebase Auth Error**: Check Firebase project configuration
2. **Stripe Payment Error**: Verify API keys and test mode settings
3. **CORS Error**: Update `FRONTEND_URL` in backend `.env`
4. **Google OAuth Error**: Verify Google Client ID and Firebase config

### Support:
Check the logs in both frontend and backend consoles for detailed error messages.