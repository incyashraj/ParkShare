# ParkShare - Simplified User Journey Flowchart

## 🚗 Main User Flows

```mermaid
flowchart TD
    %% Start
    Start([User Enters ParkShare]) --> Auth{Authenticated?}
    
    %% Authentication
    Auth -->|No| Login[Login/Register]
    Auth -->|Yes| Dashboard[User Dashboard]
    Login --> Firebase[Firebase Authentication]
    Firebase --> Dashboard
    
    %% Dashboard Options
    Dashboard --> Options{What to do?}
    
    %% Option 1: Find Parking
    Options -->|Find Parking| Search[Search Parking Spots]
    Search --> Filter[Filter & Browse]
    Filter --> Select[Select Parking Spot]
    Select --> Details[View Spot Details]
    Details --> Available{Available?}
    Available -->|No| Unavailable[Show Unavailable]
    Available -->|Yes| Book[Book Now]
    
    %% Booking Process
    Book --> BookingModal[Booking Modal]
    BookingModal --> DateTime[Select Date & Time]
    DateTime --> Price[Calculate Price]
    Price --> Confirm[Confirm Booking]
    Confirm --> Payment{Payment Mode?}
    Payment -->|Test| TestPay[Bypass Payment]
    Payment -->|Real| StripePay[Stripe Payment]
    TestPay --> CreateBooking[Create Booking]
    StripePay --> CreateBooking
    
    %% Booking Success
    CreateBooking --> Receipt[Generate Receipt]
    Receipt --> Notify[Send Notifications]
    Notify --> UpdateSpot[Update Spot Availability]
    UpdateSpot --> Success[Booking Confirmed!]
    
    %% Option 2: Add Parking Spot
    Options -->|Add Spot| AddSpot[Add Parking Spot Form]
    AddSpot --> SpotDetails[Enter Spot Details]
    SpotDetails --> Images[Upload Images]
    Images --> Pricing[Set Hourly Rate]
    Pricing --> Submit[Submit Listing]
    Submit --> Listed[Spot Listed Successfully]
    
    %% Option 3: Manage Profile
    Options -->|Profile| Profile[Profile Dashboard]
    Profile --> ProfileTabs{Profile Tab?}
    
    %% Profile Tabs
    ProfileTabs -->|Bookings| MyBookings[My Bookings]
    ProfileTabs -->|Listings| MyListings[My Listings]
    ProfileTabs -->|Verification| Verification[Verification Status]
    ProfileTabs -->|Analytics| Analytics[Analytics & Stats]
    
    %% Booking Management
    MyBookings --> BookingActions{Action?}
    BookingActions -->|Edit| EditBooking[Edit Booking]
    BookingActions -->|Cancel| CancelBooking[Cancel Booking]
    EditBooking --> UpdateBooking[Update Booking]
    CancelBooking --> Refund[Process Refund]
    UpdateBooking --> BookingUpdated[Booking Updated]
    Refund --> BookingCancelled[Booking Cancelled]
    
    %% Listing Management
    MyListings --> ListingActions{Action?}
    ListingActions -->|Edit| EditListing[Edit Listing]
    ListingActions -->|View Bookings| ViewBookings[View Spot Bookings]
    EditListing --> ListingUpdated[Listing Updated]
    ViewBookings --> ManageBookings[Manage Spot Bookings]
    
    %% Verification
    Verification --> VerifyActions{Verify?}
    VerifyActions -->|Email| EmailVerify[Email Verification]
    VerifyActions -->|Mobile| MobileVerify[Mobile Verification]
    VerifyActions -->|Host| HostVerify[Host Verification]
    EmailVerify --> EmailCode[Send Verification Code]
    MobileVerify --> SMSCode[Send SMS Code]
    HostVerify --> Documents[Submit Documents]
    
    %% Analytics
    Analytics --> Stats[View Statistics]
    Stats --> Performance[Performance Metrics]
    Performance --> Insights[Analytics Insights]
    
    %% Real-time Updates
    Success --> RealTime[Real-time Updates]
    BookingUpdated --> RealTime
    BookingCancelled --> RealTime
    ListingUpdated --> RealTime
    
    %% Notifications
    RealTime --> Notifications[Send Notifications]
    Notifications --> EmailNotify[Email Notifications]
    Notifications --> InAppNotify[In-App Notifications]
    Notifications --> SMSNotify[SMS Notifications]
    
    %% End Points
    Success --> End1([Booking Complete])
    Listed --> End2([Spot Listed])
    BookingUpdated --> End3([Booking Updated])
    BookingCancelled --> End4([Booking Cancelled])
    ListingUpdated --> End5([Listing Updated])
    Insights --> End6([Analytics Viewed])
    
    %% Error Handling
    Unavailable --> Error1[Show Error Message]
    Error1 --> Search
    
    %% Styling
    classDef startEnd fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px
    classDef process fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef decision fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    classDef success fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef error fill:#ffebee,stroke:#c62828,stroke-width:2px
    
    class Start,End1,End2,End3,End4,End5,End6 startEnd
    class Login,Dashboard,Search,Filter,Select,Details,Book,BookingModal,DateTime,Price,Confirm,CreateBooking,Receipt,Notify,UpdateSpot,AddSpot,SpotDetails,Images,Pricing,Submit,Profile,MyBookings,MyListings,Verification,Analytics,EditBooking,CancelBooking,UpdateBooking,Refund,EditListing,ViewBookings,ManageBookings,EmailVerify,MobileVerify,HostVerify,EmailCode,SMSCode,Documents,Stats,Performance,Insights,RealTime,Notifications,EmailNotify,InAppNotify,SMSNotify process
    class Auth,Options,Available,Payment,ProfileTabs,BookingActions,ListingActions,VerifyActions decision
    class Success,Listed,BookingUpdated,BookingCancelled,ListingUpdated success
    class Unavailable,Error1 error
```

## 📋 Core User Journeys

### 1. **Renter Journey** (Find & Book Parking)
```
Dashboard → Search Spots → Select Spot → Book → Payment → Confirmation
```

### 2. **Host Journey** (List Parking Spot)
```
Dashboard → Add Spot → Fill Details → Set Price → Submit → Listed
```

### 3. **Profile Management Journey**
```
Dashboard → Profile → Choose Tab → Manage Content → Updates
```

### 4. **Booking Management Journey**
```
Profile → My Bookings → Edit/Cancel → Confirm → System Update
```

## 🔄 Key System Interactions

### Real-time Features
- **WebSocket Updates**: Instant availability changes
- **Live Notifications**: Real-time booking alerts
- **Payment Status**: Live payment processing
- **Spot Management**: Immediate listing updates

### Data Flow
- **Frontend**: React components with Material-UI
- **Backend**: Node.js with Express and WebSocket
- **Database**: JSON files (users, spots, bookings)
- **External**: Firebase Auth, Stripe Payments

### Security & Verification
- **Authentication**: Firebase secure login
- **Payments**: Stripe secure processing
- **Verification**: Email, SMS, and document verification
- **Receipts**: Secure PDF generation

## 🎯 Main Features Summary

### For Renters
- 🔍 Search and filter parking spots
- 📅 Book with date/time selection
- 💳 Secure payment processing
- 📱 Real-time notifications
- 📊 Booking management
- 📄 Receipt generation

### For Hosts
- ➕ Add parking spot listings
- 💰 Set pricing and availability
- 📈 View booking analytics
- ✅ Host verification process
- 📱 Manage spot bookings
- 💵 Track earnings

### System Features
- ⚡ Real-time updates
- 🔐 Secure authentication
- 💳 Payment processing
- 📧 Email notifications
- 📱 Mobile app support
- 📊 Analytics dashboard

This simplified flowchart shows the main user journeys and core functionality of ParkShare, making it easy to understand how users interact with the system and how different features work together. 