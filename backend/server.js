const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
const port = 3001;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user to their personal room for notifications
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  // Join user to spot-specific room for real-time updates
  socket.on('join-spot-room', (spotId) => {
    socket.join(`spot-${spotId}`);
    console.log(`User joined spot room: ${spotId}`);
  });

  // Handle real-time spot availability updates
  socket.on('spot-availability-change', (data) => {
    const { spotId, available } = data;
    io.to(`spot-${spotId}`).emit('spot-availability-updated', { spotId, available });
  });

  // Handle real-time booking notifications
  socket.on('new-booking', (data) => {
    const { spotOwnerId, booking } = data;
    io.to(`user-${spotOwnerId}`).emit('booking-received', booking);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const users = [];

app.post('/register', (req, res) => {
  const { username, email, password, uid } = req.body;
  
  console.log('Registration attempt received:', { username, email, uid });
  console.log('Current users in system:', users.map(u => ({ uid: u.uid, username: u.username, email: u.email })));
  
  if (!username || !email || !uid) {
    console.log('Registration failed: Missing required fields');
    return res.status(400).json({ message: 'Username, email and user ID are required' });
  }
  
  const existingUser = users.find((user) => user.uid === uid);
  if (existingUser) {
    console.log('Registration: User already exists with UID:', uid);
    // If user exists and trying to register with same UID (e.g., Google user), just return success
    return res.status(200).json({ message: 'User already registered', ok: true });
  }

  const emailExists = users.find((user) => user.email === email && user.uid !== uid);
  if (emailExists) {
    console.log('Registration failed: Email already registered with different account');
    return res.status(400).json({ message: 'Email already registered with different account' });
  }

  const user = { username, email, password: password || '', uid };
  users.push(user);
  console.log('Registration successful for user:', username);
  res.status(201).set({'Content-Type': 'application/json'}).json({ message: 'User registered successfully', ok: true });
});

app.post('/login', (req, res) => {
  res.set({'Content-Type': 'application/json'});
  const { uid } = req.body;
  
  console.log('Login attempt received for UID:', uid);
  console.log('Current users in system:', users.map(u => ({ uid: u.uid, username: u.username })));
  
  if (!uid) {
    console.log('Login failed: No UID provided');
    return res.status(400).send({ message: 'User ID is required' });
  }
  
  const user = users.find((user) => user.uid === uid);
  if (!user) {
    console.log('Login failed: User not found for UID:', uid);
    // Try to auto-register Google users if they exist in Firebase but not in our backend
    return res.status(401).json({ 
      message: 'User not found. Please register first', 
      ok: false,
      requiresRegistration: true 
    });
  }
  
  console.log('Login successful for user:', user.username);
  res.json({ message: 'Logged in successfully', ok: true, user });
});

let parkingSpots = [];
let bookings = [];

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend server is running',
    timestamp: new Date().toISOString(),
    usersCount: users.length,
    parkingSpotsCount: parkingSpots.length,
    bookingsCount: bookings.length
  });
});

// Debug endpoint to check current data
app.get('/debug/data', (req, res) => {
  res.json({
    totalUsers: users.length,
    totalParkingSpots: parkingSpots.length,
    totalBookings: bookings.length,
    users: users.map(u => ({ uid: u.uid, username: u.username })),
    parkingSpots: parkingSpots.map(p => ({ 
      id: p.id, 
      location: p.location, 
      owner: p.owner,
      ownerName: p.ownerName
    }))
  });
});

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

// Check spot availability for given time period
function isSpotAvailable(spotId, startTime, endTime) {
  const spotBookings = bookings.filter(b => b.spotId === spotId);
  return !spotBookings.some(booking => {
    const bookingStart = new Date(booking.startTime);
    const bookingEnd = new Date(booking.endTime);
    const checkStart = new Date(startTime);
    const checkEnd = new Date(endTime);
    return !(checkEnd <= bookingStart || checkStart >= bookingEnd);
  });
}

app.post('/parking-spots', async (req, res) => {
  console.log('Creating new parking spot:', req.body);
  const {
    location,
    coordinates,
    hourlyRate,
    maxDuration,
    securityFeatures,
    termsAndConditions,
    images = []
  } = req.body;

  if (!location || !hourlyRate || !termsAndConditions) {
    return res.status(400).send({ message: 'Location, hourly rate, and terms are required' });
  }

  // Get user from users array using userId
  const user = users.find(u => u.uid === req.body.userId);
  if (!user) {
    return res.status(404).send({ message: 'User not found' });
  }

  const parkingSpot = {
    id: Date.now().toString(),
    location,
    coordinates,
    hourlyRate,
    maxDuration,
    securityFeatures,
    termsAndConditions,
    images,
    rating: 0,
    reviews: [],
    owner: user.uid,
    ownerName: user.username,
    createdAt: new Date(),
    bookings: [],
    available: true
  };

  try {
    parkingSpots.push(parkingSpot);
    console.log('New parking spot added:', parkingSpot.id);
    console.log('Total parking spots now:', parkingSpots.length);
    console.log('Created by user:', user.username);

    res.status(201).send({ 
      message: 'Parking spot listed successfully', 
      spot: {
        ...parkingSpot,
        owner: parkingSpot.owner,
        ownerName: parkingSpot.ownerName
      } 
    });
  } catch (error) {
    console.error('Error saving parking spot:', error);
    res.status(500).send({ message: 'Failed to save parking spot' });
  }
});

app.get('/parking-spots', (req, res) => {
  const { search, minPrice, maxPrice, rating, lat, lng, radius, userId } = req.query;
  
  console.log('Fetching spots. UserID:', userId);
  console.log('Total spots in system:', parkingSpots.length);

  // First, return all spots with owner information
  let filteredSpots = parkingSpots.map(spot => ({
    ...spot,
    isOwner: spot.owner === userId,
    // Allow booking only if: user is logged in, spot is not owned by user, and spot is available
    canBook: userId && spot.owner !== userId && spot.available
  }));

  // Apply text search filter
  if (search) {
    filteredSpots = filteredSpots.filter(spot =>
      spot.location.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Apply price range filter
  if (minPrice) {
    filteredSpots = filteredSpots.filter(spot => {
      const price = parseFloat(spot.hourlyRate.replace(/[^0-9.]/g, ''));
      return price >= parseFloat(minPrice);
    });
  }

  if (maxPrice) {
    filteredSpots = filteredSpots.filter(spot => {
      const price = parseFloat(spot.hourlyRate.replace(/[^0-9.]/g, ''));
      return price <= parseFloat(maxPrice);
    });
  }

  // Apply rating filter
  if (rating) {
    filteredSpots = filteredSpots.filter(spot => 
      spot.rating >= parseFloat(rating)
    );
  }

  // Optional location-based filtering
  if (lat && lng && radius) {
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const searchRadius = parseFloat(radius); // in kilometers

    // Add distance to all spots
    filteredSpots = filteredSpots.map(spot => ({
      ...spot,
      distance: calculateDistance(
        userLat,
        userLng,
        spot.coordinates[0],
        spot.coordinates[1]
      )
    }));

    // Sort by distance but don't filter out spots
    filteredSpots.sort((a, b) => a.distance - b.distance);
  }

  console.log('Sending filtered spots:', filteredSpots.length);
  // Log some sample spots for debugging
  if (filteredSpots.length > 0) {
    console.log('Sample spot:', {
      location: filteredSpots[0].location,
      owner: filteredSpots[0].ownerName,
      isOwner: filteredSpots[0].isOwner,
      canBook: filteredSpots[0].canBook
    });
  }
  res.json(filteredSpots);
});

// New endpoint to check spot availability
app.get('/parking-spots/:spotId/availability', (req, res) => {
  const { spotId } = req.params;
  const { startTime, endTime } = req.query;

  if (!startTime || !endTime) {
    return res.status(400).send({ message: 'Start time and end time are required' });
  }

  const spot = parkingSpots.find(s => s.id === spotId);
  if (!spot) {
    return res.status(404).send({ message: 'Parking spot not found' });
  }

  const available = isSpotAvailable(spotId, startTime, endTime);
  res.send({ available });
});

// Add a new route for booking parking spots
app.post('/parking-spots/:spotId/book', (req, res) => {
  const { spotId } = req.params;
  const { startTime, endTime, userId } = req.body;

  if (!startTime || !endTime || !userId) {
    return res.status(400).send({ message: 'Start time, end time, and user ID are required' });
  }

  const spot = parkingSpots.find(s => s.id === spotId);
  
  // Check if user is trying to book their own spot
  if (spot.owner === userId) {
    return res.status(400).send({ message: 'Cannot book your own parking spot' });
  }

  // Check if spot is available for booking
  if (!spot.available) {
    return res.status(400).send({ message: 'This spot is not available for booking' });
  }
  if (!spot) {
    return res.status(404).send({ message: 'Parking spot not found' });
  }

  // Check if the spot is available for the requested time
  const isAvailable = isSpotAvailable(spotId, startTime, endTime);

  if (!isAvailable) {
    return res.status(400).send({ message: 'Spot is not available for the requested time' });
  }

  const booking = {
    id: Date.now().toString(),
    spotId,
    userId,
    userName: users.find(u => u.id === userId)?.username || 'Unknown User',
    startTime,
    endTime,
    status: 'confirmed',
    createdAt: new Date(),
    spotOwner: spot.owner,
    spotOwnerName: spot.ownerName,
    location: spot.location
  };

  bookings.push(booking);
  spot.bookings.push(booking.id);

  // Add the booking information to the spot's history
  if (!spot.bookingHistory) {
    spot.bookingHistory = [];
  }
  spot.bookingHistory.push({
    bookingId: booking.id,
    startTime,
    endTime,
    userId
  });

  // Emit real-time booking notification to spot owner
  io.to(`user-${spot.owner}`).emit('booking-received', {
    ...booking,
    spotDetails: {
      location: spot.location,
      hourlyRate: spot.hourlyRate,
      ownerName: spot.ownerName
    }
  });

  // Emit spot availability update to all users viewing this spot
  io.to(`spot-${spotId}`).emit('spot-availability-updated', {
    spotId,
    available: isSpotAvailable(spotId, startTime, endTime)
  });

  res.status(201).send({ message: 'Booking confirmed', booking });
});

// Get user's listings
app.get('/users/:userId/listings', (req, res) => {
  const { userId } = req.params;
  const userListings = parkingSpots.filter(spot => spot.owner === userId);
  console.log('User listings found:', userListings.length, 'for user:', userId);
  res.json(userListings);
});

// Get user's booking history
app.get('/users/:userId/bookings', (req, res) => {
  const { userId } = req.params;
  const userBookings = bookings.filter(booking => booking.userId === userId);
  
  const bookingsWithDetails = userBookings.map(booking => {
    const spot = parkingSpots.find(s => s.id === booking.spotId);
    return {
      ...booking,
      spotDetails: {
        location: spot.location,
        hourlyRate: spot.hourlyRate,
        coordinates: spot.coordinates
      }
    };
  });

  res.send(bookingsWithDetails);
});

// Add a new route for adding reviews
app.post('/parking-spots/:spotId/reviews', (req, res) => {
  const { spotId } = req.params;
  const { rating, comment, userId } = req.body;

  const spot = parkingSpots.find(s => s.id === spotId);
  if (!spot) {
    return res.status(404).send({ message: 'Parking spot not found' });
  }

  const review = {
    id: Date.now().toString(),
    rating,
    comment,
    userId,
    createdAt: new Date()
  };

  spot.reviews.push(review);

  // Update spot rating
  const totalRating = spot.reviews.reduce((sum, r) => sum + r.rating, 0);
  spot.rating = totalRating / spot.reviews.length;

  res.status(201).send({ message: 'Review added successfully', review });
});

// Booking Management Routes
app.post('/bookings/:bookingId/cancel', async (req, res) => {
  const { bookingId } = req.params;
  try {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    booking.status = 'cancelled';
    
    // Emit real-time cancellation notification
    io.to(`user-${booking.spotOwner}`).emit('booking-cancelled', {
      bookingId,
      spotId: booking.spotId,
      userName: booking.userName
    });

    // Emit spot availability update
    const spot = parkingSpots.find(s => s.id === booking.spotId);
    if (spot) {
      io.to(`spot-${booking.spotId}`).emit('spot-availability-updated', {
        spotId: booking.spotId,
        available: true
      });
    }

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel booking' });
  }
});

app.post('/bookings/:bookingId/modify', async (req, res) => {
  const { bookingId } = req.params;
  const { startTime, endTime } = req.body;
  
  try {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if new time slot is available
    const isAvailable = isSpotAvailable(booking.spotId, startTime, endTime);
    if (!isAvailable) {
      return res.status(400).json({ message: 'Selected time slot is not available' });
    }

    booking.startTime = startTime;
    booking.endTime = endTime;
    booking.modifiedAt = new Date();

    res.json({ message: 'Booking modified successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Failed to modify booking' });
  }
});

// Settings Routes
app.put('/users/:userId/settings/notifications', async (req, res) => {
  const { userId } = req.params;
  const settings = req.body;
  
  try {
    const user = users.find(u => u.uid === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.notificationSettings = {
      ...user.notificationSettings,
      ...settings
    };

    res.json({ message: 'Notification settings updated', settings: user.notificationSettings });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update notification settings' });
  }
});

app.put('/users/:userId/settings/payment-methods', async (req, res) => {
  const { userId } = req.params;
  const { paymentMethod } = req.body;
  
  try {
    const user = users.find(u => u.uid === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.paymentMethods) {
      user.paymentMethods = [];
    }

    user.paymentMethods.push({
      id: Date.now().toString(),
      ...paymentMethod,
      createdAt: new Date()
    });

    res.json({ message: 'Payment method added', paymentMethods: user.paymentMethods });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add payment method' });
  }
});

app.get('/', (req, res) => {
  res.send('ParkShare Backend');
});

server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
