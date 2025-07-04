# ParkShare Mobile App

A modern React Native mobile application for the ParkShare parking sharing platform.

## 🚀 Features

### Core Features
- **User Authentication** - Secure login and registration with email/password and Google Sign-In
- **Home Dashboard** - Overview of nearby parking spots, recent bookings, and quick stats
- **Search & Discovery** - Find parking spots with advanced filtering options
- **Interactive Map** - Visual map interface for parking spot locations
- **Booking Management** - View, manage, and track your parking bookings
- **User Profile** - Manage account settings and preferences
- **Real-time Updates** - Live notifications and availability updates

### Technical Features
- **Cross-platform** - Works on both iOS and Android
- **Modern UI/UX** - Material Design 3 with React Native Paper
- **TypeScript** - Full type safety and better development experience
- **Navigation** - React Navigation with bottom tabs and stack navigation
- **State Management** - Context API for authentication and app state
- **Offline Support** - AsyncStorage for local data persistence
- **Responsive Design** - Adapts to different screen sizes

## 📱 Screenshots

*Coming soon...*

## 🛠 Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **UI Library**: React Native Paper (Material Design 3)
- **Navigation**: React Navigation v6
- **Icons**: Expo Vector Icons (Ionicons)
- **State Management**: React Context API
- **Storage**: AsyncStorage
- **HTTP Client**: Axios
- **Maps**: React Native Maps (planned)
- **Notifications**: Expo Notifications (planned)

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Development Server

```bash
npm start
```

### 3. Run on iOS Simulator

```bash
npm run ios
```

### 4. Run on Android Emulator

```bash
npm run android
```

### 5. Run on Web (for testing)

```bash
npm run web
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React Context providers
├── screens/            # Screen components
├── services/           # API services and utilities
├── types/              # TypeScript type definitions
└── utils/              # Helper functions and utilities
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
API_BASE_URL=http://localhost:3001
GOOGLE_CLIENT_ID=your_google_client_id
```

### Backend Integration

The mobile app connects to the ParkShare backend API. Make sure the backend server is running on `http://localhost:3001`.

## 📱 App Architecture

### Navigation Structure

```
App Navigator
├── Authentication Stack
│   ├── Login Screen
│   └── Register Screen
└── Main App Stack
    ├── Tab Navigator
    │   ├── Home Screen
    │   ├── Search Screen
    │   ├── Map Screen
    │   ├── Bookings Screen
    │   └── Profile Screen
    ├── Spot Detail Screen
    ├── Add Spot Screen
    ├── Settings Screen
    └── Notifications Screen
```

### State Management

- **AuthContext**: Manages user authentication state
- **Local Storage**: Persists user data and preferences
- **API Integration**: Real-time data from backend

## 🎨 UI/UX Design

### Design System

- **Primary Color**: #1E3A8A (Deep Blue)
- **Accent Color**: #FBBF24 (Golden Yellow)
- **Background**: #F8FAFC (Light Gray)
- **Surface**: #FFFFFF (White)
- **Typography**: Material Design 3 typography scale

### Components

- **Cards**: Parking spot cards with availability status
- **Chips**: Rating, availability, and status indicators
- **Buttons**: Primary, secondary, and floating action buttons
- **Input Fields**: Form inputs with validation
- **Navigation**: Bottom tabs with icons

## 🔐 Authentication

### Features

- Email/password authentication
- Google Sign-In integration
- Secure token storage
- Auto-login functionality
- Session management

### Security

- Password validation
- Secure storage with AsyncStorage
- API authentication headers
- Error handling and user feedback

## 📊 Data Management

### Local Storage

- User authentication tokens
- User preferences
- Offline data cache
- App settings

### API Integration

- RESTful API communication
- Real-time updates via WebSocket
- Error handling and retry logic
- Data synchronization

## 🚀 Deployment

### iOS App Store

1. Build the production bundle:
```bash
expo build:ios
```

2. Submit to App Store Connect

### Google Play Store

1. Build the production APK:
```bash
expo build:android
```

2. Upload to Google Play Console

## 🧪 Testing

### Unit Tests

```bash
npm test
```

### E2E Tests

```bash
npm run test:e2e
```

## 📈 Performance

### Optimization

- Lazy loading of screens
- Image optimization
- Memory management
- Bundle size optimization

### Monitoring

- Crash reporting
- Performance metrics
- User analytics
- Error tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Basic authentication
- ✅ Home dashboard
- ✅ Navigation structure
- ✅ UI components

### Phase 2 (Next)
- 🔄 Interactive map integration
- 🔄 Real-time booking system
- 🔄 Push notifications
- 🔄 Payment integration

### Phase 3 (Future)
- 📋 Advanced search filters
- 📋 Social features
- 📋 Analytics dashboard
- 📋 Offline mode

---

**ParkShare Mobile** - Making parking sharing simple and accessible! 🚗💙 