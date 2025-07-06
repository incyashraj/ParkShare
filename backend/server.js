const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const stripe = require('stripe')('sk_test_51RhGUIFfuH7KoJbsGqc8UHhP2LhkeF9Ysqp4dggt3tKOgcYXpyNDt5HdvHyZ5fq1CBdGIJxsh7QXD6jG8ftdpfcT00Ry6UIfqm');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const receiptService = require('./services/receiptService');
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
const port = 3001;

// ===== TEST MODE CONFIGURATION =====
// Set this to true to bypass payments for testing
const TEST_MODE = true; // Change to false for production
const TEST_USER_IDS = [
  'oefQiaqHBQUkJxJIo2yhn3m6k9j1',
  'test123',
  'test-user-123',
  'user_john_123',
  'user_jane_456',
  'user_mike_789',
  'user_sarah_101'
]; // Add your test user IDs here
// ===================================

// Data persistence files
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SPOTS_FILE = path.join(DATA_DIR, 'spots.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const CONVERSATIONS_FILE = path.join(DATA_DIR, 'conversations.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');

// File upload configuration
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const ATTACHMENTS_DIR = path.join(UPLOADS_DIR, 'attachments');

// Ensure upload directories exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(ATTACHMENTS_DIR)) {
  fs.mkdirSync(ATTACHMENTS_DIR, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, ATTACHMENTS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow PDF and image files
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and image files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// ===== Support Ticket System =====
const SUPPORT_TICKETS_FILE = path.join(DATA_DIR, 'supportTickets.json');
let supportTickets = [];

function saveSupportTickets() {
  saveData(SUPPORT_TICKETS_FILE, supportTickets);
}

function isAdmin(userId) {
  const user = users.find(u => u.uid === userId);
  return user && (user.isAdmin || user.email === 'incyashraj@gmail.com');
}

// Create a new support ticket
app.post('/api/support/tickets', (req, res) => {
  try {
    const userId = req.headers.authorization?.replace('Bearer ', '');
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = users.find(u => u.uid === userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { subject, message } = req.body;
    if (!subject || !message) return res.status(400).json({ message: 'Subject and message required' });
    const ticket = {
      id: `ticket_${Date.now()}`,
      userId,
      user: { uid: user.uid, username: user.username, email: user.email },
      subject,
      message,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedTo: null,
      responses: []
    };
    supportTickets.push(ticket);
    saveSupportTickets();
    res.status(201).json({ message: 'Ticket submitted', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit ticket' });
  }
});

// List all tickets (admin) or own tickets (user)
app.get('/api/support/tickets', (req, res) => {
  try {
    const userId = req.headers.authorization?.replace('Bearer ', '');
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const admin = isAdmin(userId);
    let tickets = admin ? supportTickets : supportTickets.filter(t => t.userId === userId);
    res.json({ tickets });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tickets' });
  }
});

// Get single ticket (admin or owner)
app.get('/api/support/tickets/:id', (req, res) => {
  try {
    const userId = req.headers.authorization?.replace('Bearer ', '');
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const ticket = supportTickets.find(t => t.id === req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (!isAdmin(userId) && ticket.userId !== userId) return res.status(403).json({ message: 'Forbidden' });
    res.json({ ticket });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch ticket' });
  }
});

// Respond to a ticket (admin or user)
app.post('/api/support/tickets/:id/respond', (req, res) => {
  try {
    const userId = req.headers.authorization?.replace('Bearer ', '');
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const ticket = supportTickets.find(t => t.id === req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (!isAdmin(userId) && ticket.userId !== userId) return res.status(403).json({ message: 'Forbidden' });
    const user = users.find(u => u.uid === userId);
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message required' });
    const response = {
      id: `resp_${Date.now()}`,
      userId,
      user: { uid: user.uid, username: user.username, email: user.email },
      message,
      createdAt: new Date().toISOString()
    };
    ticket.responses.push(response);
    ticket.updatedAt = new Date().toISOString();
    saveSupportTickets();
    res.json({ message: 'Response added', response });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add response' });
  }
});

// Update ticket (status, assignment)
app.patch('/api/support/tickets/:id', (req, res) => {
  try {
    const userId = req.headers.authorization?.replace('Bearer ', '');
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!isAdmin(userId)) return res.status(403).json({ message: 'Forbidden' });
    const ticket = supportTickets.find(t => t.id === req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    const { status, assignedTo } = req.body;
    if (status) ticket.status = status;
    if (assignedTo) ticket.assignedTo = assignedTo;
    ticket.updatedAt = new Date().toISOString();
    saveSupportTickets();
    res.json({ message: 'Ticket updated', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update ticket' });
  }
});

// Delete ticket (admin only)
app.delete('/api/support/tickets/:id', (req, res) => {
  try {
    const userId = req.headers.authorization?.replace('Bearer ', '');
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!isAdmin(userId)) return res.status(403).json({ message: 'Forbidden' });
    const idx = supportTickets.findIndex(t => t.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Ticket not found' });
    supportTickets.splice(idx, 1);
    saveSupportTickets();
    res.json({ message: 'Ticket deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete ticket' });
  }
});
// ===================================

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load data from files
const loadData = (filePath, defaultValue = []) => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error loading data from ${filePath}:`, error);
  }
  return defaultValue;
};

// Save data to files
const saveData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error saving data to ${filePath}:`, error);
  }
};

// Initialize data
let users = loadData(USERS_FILE, []);
let parkingSpots = loadData(SPOTS_FILE, []);
let bookings = loadData(BOOKINGS_FILE, []);
let conversations = loadData(CONVERSATIONS_FILE, []);
let messages = loadData(MESSAGES_FILE, []);
supportTickets = loadData(SUPPORT_TICKETS_FILE, []);
let verificationCodes = {}; // Store verification codes temporarily

console.log(`Loaded ${users.length} users, ${parkingSpots.length} spots, ${bookings.length} bookings, ${conversations.length} conversations, ${messages.length} messages, ${supportTickets.length} support tickets`);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static(UPLOADS_DIR));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Enhanced real-time data structures
const connectedUsers = new Map(); // socketId -> userData
const userSessions = new Map(); // userId -> socketId
const spotWatchers = new Map(); // spotId -> Set of socketIds
const userPresence = new Map(); // userId -> { online: boolean, lastSeen: Date, lastActivity: string, status: 'online'|'away'|'offline' }
const presenceTimeouts = new Map(); // userId -> timeoutId for away status

// Socket.IO connection handling with enhanced features
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user authentication and join personal room
  socket.on('authenticate-user', (userData) => {
    const { uid, username, email } = userData;
    
    // Store user connection data
    connectedUsers.set(socket.id, { uid, username, email });
    userSessions.set(uid, socket.id);
    
    // Set user as online
    userPresence.set(uid, { 
      online: true, 
      lastSeen: new Date(),
      lastActivity: 'logged in',
      status: 'online'
    });
    
    // Clear any existing away timeout
    if (presenceTimeouts.has(uid)) {
      clearTimeout(presenceTimeouts.get(uid));
      presenceTimeouts.delete(uid);
    }
    
    // Join user's personal room for notifications
    socket.join(`user-${uid}`);
    
    // Join user to general announcements room
    socket.join('announcements');
    
    // Emit user online status to relevant users
    emitUserPresenceUpdate(uid, 'online', 'logged in');
    
    console.log(`User ${username} (${uid}) authenticated and online`);
    
    // Send current user's data back
    socket.emit('user-authenticated', { uid, username, email });
  });

  // Join user to spot-specific room for real-time updates
  socket.on('join-spot-room', (spotId) => {
    socket.join(`spot-${spotId}`);
    
    // Track spot watchers
    if (!spotWatchers.has(spotId)) {
      spotWatchers.set(spotId, new Set());
    }
    spotWatchers.get(spotId).add(socket.id);
    
    // Send current spot status
    const spot = parkingSpots.find(s => s.id === spotId);
    if (spot) {
      socket.emit('spot-status', {
        spotId,
        available: spot.available,
        currentBookings: spot.bookings?.length || 0,
        lastUpdated: spot.lastUpdated || new Date()
      });
    }
  });

  // Leave spot room
  socket.on('leave-spot-room', (spotId) => {
    socket.leave(`spot-${spotId}`);
    
    // Remove from spot watchers
    if (spotWatchers.has(spotId)) {
      spotWatchers.get(spotId).delete(socket.id);
      if (spotWatchers.get(spotId).size === 0) {
        spotWatchers.delete(spotId);
      }
    }
  });

  // Handle real-time spot availability updates
  socket.on('spot-availability-change', (data) => {
    const { spotId, available, reason } = data;
    const spot = parkingSpots.find(s => s.id === spotId);
    
    if (spot) {
      spot.available = available;
      spot.lastUpdated = new Date();
      
      // Emit to all users watching this spot
      io.to(`spot-${spotId}`).emit('spot-availability-updated', { 
        spotId, 
        available,
        reason,
        lastUpdated: spot.lastUpdated
      });
      
      // Notify spot owner
      if (spot.owner) {
        io.to(`user-${spot.owner}`).emit('spot-status-changed', {
          spotId,
          available,
          reason,
          location: spot.location
        });
      }
    }
  });

  // Handle real-time booking notifications
  socket.on('new-booking', (data) => {
    const { spotOwnerId, booking } = data;
    
    // Enhanced booking notification
    const notification = {
      type: 'booking',
      title: 'New Booking Received',
      message: `${booking.userName} booked your spot at ${booking.spotDetails?.location}`,
      booking,
      timestamp: new Date()
    };
    
    io.to(`user-${spotOwnerId}`).emit('booking-received', notification);
    
    // Emit to spot room for real-time updates
    io.to(`spot-${booking.spotId}`).emit('spot-booked', {
      spotId: booking.spotId,
      booking,
      timestamp: new Date()
    });
  });

  // Handle real-time messaging
  socket.on('send-message', (data) => {
    const { recipientId, message, senderId, senderName } = data;
    
    const messageData = {
      id: Date.now().toString(),
      senderId,
      senderName,
      recipientId,
      message,
      timestamp: new Date(),
      read: false
    };
    
    // Send to recipient
    io.to(`user-${recipientId}`).emit('new-message', messageData);
    
    // Send confirmation to sender
    socket.emit('message-sent', messageData);
  });

  // Handle user typing indicators
  socket.on('typing-start', (data) => {
    const { recipientId, senderId } = data;
    io.to(`user-${recipientId}`).emit('user-typing', { senderId, typing: true });
  });

  socket.on('typing-stop', (data) => {
    const { recipientId, senderId } = data;
    io.to(`user-${recipientId}`).emit('user-typing', { senderId, typing: false });
  });

  // Handle real-time spot search/filtering
  socket.on('spot-search', (filters) => {
    const { lat, lng, radius, minPrice, maxPrice, search } = filters;
    
    // Filter spots based on criteria
    let filteredSpots = parkingSpots.filter(spot => {
      if (search && !spot.location.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      
      if (minPrice) {
        const price = parseFloat(spot.hourlyRate.replace(/[^0-9.]/g, ''));
        if (price < parseFloat(minPrice)) return false;
      }
      
      if (maxPrice) {
        const price = parseFloat(spot.hourlyRate.replace(/[^0-9.]/g, ''));
        if (price > parseFloat(maxPrice)) return false;
      }
      
      if (lat && lng && radius) {
        const distance = calculateDistance(lat, lng, spot.coordinates[0], spot.coordinates[1]);
        if (distance > parseFloat(radius)) return false;
      }
      
      return true;
    });
    
    // Send filtered results back
    socket.emit('spot-search-results', {
      spots: filteredSpots,
      total: filteredSpots.length,
      filters
    });
  });

  // Handle user activity tracking
  socket.on('user-activity', (activity) => {
    const userData = connectedUsers.get(socket.id);
    if (userData) {
      const { uid } = userData;
      
      // Update presence data
      const presenceData = userPresence.get(uid) || { online: false, lastSeen: new Date() };
      presenceData.online = true;
      presenceData.lastSeen = new Date();
      presenceData.lastActivity = activity;
      presenceData.status = 'online';
      userPresence.set(uid, presenceData);
      
      // Clear any existing away timeout
      if (presenceTimeouts.has(uid)) {
        clearTimeout(presenceTimeouts.get(uid));
        presenceTimeouts.delete(uid);
      }
      
      // Set new away timeout (5 minutes of inactivity)
      const awayTimeout = setTimeout(() => setUserAway(uid), 5 * 60 * 1000);
      presenceTimeouts.set(uid, awayTimeout);
      
      // Emit presence update if status changed
      emitUserPresenceUpdate(uid, 'online', activity);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const userData = connectedUsers.get(socket.id);
    
    if (userData) {
      const { uid } = userData;
      
      // Clear away timeout
      if (presenceTimeouts.has(uid)) {
        clearTimeout(presenceTimeouts.get(uid));
        presenceTimeouts.delete(uid);
      }
      
      // Update presence to offline
      userPresence.set(uid, { 
        online: false, 
        lastSeen: new Date(),
        lastActivity: 'disconnected',
        status: 'offline'
      });
      
      // Remove from tracking
      connectedUsers.delete(socket.id);
      userSessions.delete(uid);
      
      // Emit user offline status
      emitUserPresenceUpdate(uid, 'offline', 'disconnected');
      
      console.log(`User ${userData.username} (${uid}) disconnected and offline`);
    }
    
    // Remove from all spot watchers
    spotWatchers.forEach((watchers, spotId) => {
      if (watchers.has(socket.id)) {
        watchers.delete(socket.id);
        if (watchers.size === 0) {
          spotWatchers.delete(spotId);
        }
      }
    });
    
    console.log('User disconnected:', socket.id);
  });
});

// Helper function to emit user presence updates
function emitUserPresenceUpdate(userId, status, lastActivity = null) {
  const user = users.find(u => u.uid === userId);
  if (user) {
    const presenceData = userPresence.get(userId) || { online: false, lastSeen: new Date() };
    
    // Emit to users who might be interested (e.g., spot owners, message recipients)
    io.emit('user-presence-update', {
      userId,
      username: user.username,
      status,
      online: status === 'online',
      lastSeen: presenceData.lastSeen,
      lastActivity: lastActivity || presenceData.lastActivity,
      timestamp: new Date()
    });
  }
}

// Helper function to set user away status after inactivity
function setUserAway(userId) {
  const presenceData = userPresence.get(userId);
  if (presenceData && presenceData.status === 'online') {
    presenceData.status = 'away';
    presenceData.lastSeen = new Date();
    userPresence.set(userId, presenceData);
    emitUserPresenceUpdate(userId, 'away');
  }
}

// Helper function to get user presence status
function getUserPresenceStatus(userId) {
  const presenceData = userPresence.get(userId);
  if (!presenceData) {
    return { status: 'offline', lastSeen: null, lastActivity: null };
  }
  
  // Check if user should be marked as away (inactive for 5 minutes)
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  if (presenceData.status === 'online' && presenceData.lastSeen < fiveMinutesAgo) {
    presenceData.status = 'away';
    userPresence.set(userId, presenceData);
  }
  
  return presenceData;
}

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
  
  // Save to file for persistence
  saveData(USERS_FILE, users);
  
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
  // Filter out cancelled bookings
  const activeBookings = bookings.filter(b => 
    b.spotId === spotId && 
    b.status !== 'cancelled'
  );
  
  return !activeBookings.some(booking => {
    const bookingStart = new Date(booking.startTime);
    const bookingEnd = new Date(booking.endTime);
    const checkStart = new Date(startTime);
    const checkEnd = new Date(endTime);
    return !(checkEnd <= bookingStart || checkStart >= bookingEnd);
  });
}

app.post('/parking-spots', async (req, res) => {
  const {
    location,
    coordinates,
    hourlyRate,
    maxDuration,
    securityFeatures,
    termsAndConditions,
    images = [],
    title,
    description,
    parkingType,
    amenities = [],
    available24h,
    advanceBooking,
    vehicleTypes = [],
    maxVehicleHeight,
    maxVehicleLength,
    userId
  } = req.body;

  if (!location || !hourlyRate || !termsAndConditions) {
    return res.status(400).send({ message: 'Location, hourly rate, and terms are required' });
  }

  // Get user from users array using userId
  const user = users.find(u => u.uid === userId);
  if (!user) {
    return res.status(404).send({ message: 'User not found. Please log in again.' });
  }

  // Process images - convert base64 data to URLs or use existing URLs
  const processedImages = images.map((image, index) => {
    // If it's already a URL string, use it as-is
    if (typeof image === 'string') {
      return image;
    }
    
    // If it's a base64 image object, use the data URL
    if (image && typeof image === 'object' && image.data) {
      return image.data; // This is the base64 data URL
    }
    
    // Default fallback
    return `https://via.placeholder.com/400x300/FF385C/FFFFFF?text=Parking+Spot`;
  });

  const parkingSpot = {
    id: Date.now().toString(),
    location,
    coordinates,
    hourlyRate,
    maxDuration,
    securityFeatures,
    termsAndConditions,
    images: processedImages,
    title: title || location,
    description: description || 'Parking spot available for booking',
    parkingType: parkingType || 'street',
    amenities,
    available24h: available24h !== undefined ? available24h : true,
    advanceBooking: advanceBooking || 24,
    vehicleTypes,
    maxVehicleHeight,
    maxVehicleLength,
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
    
    // Save to file for persistence
    saveData(SPOTS_FILE, parkingSpots);
    
    console.log('New parking spot added:', parkingSpot.id, 'by user:', user.username);

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

  // First, return all spots with owner information
  let filteredSpots = parkingSpots.map(spot => {
    // Check if spot has any active (non-cancelled) bookings
    const activeBookings = bookings.filter(b => 
      b.spotId === spot.id && 
      b.status !== 'cancelled'
    );
    
    // Spot is available if it has no active bookings
    const isActuallyAvailable = activeBookings.length === 0;
    
    return {
      ...spot,
      isOwner: spot.owner === userId,
      available: isActuallyAvailable,
      // Allow booking only if: user is logged in, spot is not owned by user, and spot is actually available
      canBook: userId && spot.owner !== userId && isActuallyAvailable
    };
  });

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

  res.json(filteredSpots);
});

// New endpoint to get a single parking spot by ID
app.get('/parking-spots/:spotId', (req, res) => {
  const { spotId } = req.params;
  const { userId } = req.query;
  
  const spot = parkingSpots.find(s => s.id === spotId);
  
  if (!spot) {
    return res.status(404).json({ message: 'Parking spot not found' });
  }
  
  // Check if spot has any active (non-cancelled) bookings
  const activeBookings = bookings.filter(b => 
    b.spotId === spot.id && 
    b.status !== 'cancelled'
  );
  
  // Spot is available if it has no active bookings
  const isActuallyAvailable = activeBookings.length === 0;
  
  // Add owner information and booking permissions
  const spotWithDetails = {
    ...spot,
    isOwner: spot.owner === userId,
    available: isActuallyAvailable,
    canBook: userId && spot.owner !== userId && isActuallyAvailable
  };
  
  res.json(spotWithDetails);
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

// Endpoint to get parking spots by user ID
app.get('/spots/user/:userId', (req, res) => {
  const { userId } = req.params;
  
  // Find all spots owned by this user
  const userSpots = parkingSpots.filter(spot => spot.owner === userId);
  
  // Add availability status to each spot
  const spotsWithAvailability = userSpots.map(spot => {
    const activeBookings = bookings.filter(b => 
      b.spotId === spot.id && 
      b.status !== 'cancelled'
    );
    
    return {
      ...spot,
      available: activeBookings.length === 0
    };
  });
  
  res.json(spotsWithAvailability);
});

// Endpoint to update a parking spot
app.put('/parking-spots/:spotId', (req, res) => {
  const { spotId } = req.params;
  const {
    title,
    description,
    location,
    hourlyRate,
    maxDuration,
    termsAndConditions,
    available24h,
    advanceBooking,
    securityFeatures,
    amenities,
    vehicleTypes,
    maxVehicleHeight,
    maxVehicleLength,
    userId
  } = req.body;

  // Find the spot
  const spotIndex = parkingSpots.findIndex(spot => spot.id === spotId);
  if (spotIndex === -1) {
    return res.status(404).send({ message: 'Parking spot not found' });
  }

  const spot = parkingSpots[spotIndex];

  // Check if user owns this spot
  if (spot.owner !== userId) {
    return res.status(403).send({ message: 'You can only edit your own parking spots' });
  }

  // Update the spot
  parkingSpots[spotIndex] = {
    ...spot,
    title: title || spot.title,
    description: description || spot.description,
    location: location || spot.location,
    hourlyRate: hourlyRate || spot.hourlyRate,
    maxDuration: maxDuration || spot.maxDuration,
    termsAndConditions: termsAndConditions || spot.termsAndConditions,
    available24h: available24h !== undefined ? available24h : spot.available24h,
    advanceBooking: advanceBooking || spot.advanceBooking,
    securityFeatures: securityFeatures || spot.securityFeatures,
    amenities: amenities || spot.amenities,
    vehicleTypes: vehicleTypes || spot.vehicleTypes,
    maxVehicleHeight: maxVehicleHeight || spot.maxVehicleHeight,
    maxVehicleLength: maxVehicleLength || spot.maxVehicleLength,
    updatedAt: new Date()
  };

  // Save to file for persistence
  saveData(SPOTS_FILE, parkingSpots);

  console.log('Parking spot updated:', spotId, 'by user:', userId);

  res.json({ 
    message: 'Parking spot updated successfully', 
    spot: parkingSpots[spotIndex]
  });
});

// Real-time endpoints
app.get('/realtime/connected-users', (req, res) => {
  const connectedUsersList = Array.from(connectedUsers.values()).map(user => ({
    uid: user.uid,
    username: user.username,
    online: true
  }));
  
  res.json({
    connectedUsers: connectedUsersList,
    totalConnected: connectedUsersList.length
  });
});

app.get('/realtime/user-presence/:userId', (req, res) => {
  const { userId } = req.params;
  const presence = userPresence.get(userId);
  
  if (presence) {
    res.json(presence);
  } else {
    res.status(404).json({ message: 'User presence not found' });
  }
});

app.get('/realtime/spot-watchers/:spotId', (req, res) => {
  const { spotId } = req.params;
  const watchers = spotWatchers.get(spotId);
  
  if (watchers) {
    const watcherUsers = Array.from(watchers).map(socketId => {
      const userData = connectedUsers.get(socketId);
      return userData ? { uid: userData.uid, username: userData.username } : null;
    }).filter(Boolean);
    
    res.json({
      spotId,
      watchers: watcherUsers,
      totalWatchers: watcherUsers.length
    });
  } else {
    res.json({
      spotId,
      watchers: [],
      totalWatchers: 0
    });
  }
});

// Enhanced booking endpoint with real-time features
app.post('/parking-spots/:spotId/book', (req, res) => {
  const { spotId } = req.params;
  const { startTime, endTime, userId, userName, userEmail, hours, totalPrice, hourlyRate } = req.body;

  if (!startTime || !endTime || !userId) {
    return res.status(400).send({ message: 'Start time, end time, and user ID are required' });
  }

  const spot = parkingSpots.find(s => s.id === spotId);
  
  if (!spot) {
    return res.status(404).send({ message: 'Parking spot not found' });
  }

  // Check if user is trying to book their own spot
  if (spot.owner === userId) {
    return res.status(400).send({ message: 'Cannot book your own parking spot' });
  }

  // Check if spot is available for booking
  if (!spot.available) {
    return res.status(400).send({ message: 'This spot is not available for booking' });
  }

  // Check if the spot is available for the requested time
  const isAvailable = isSpotAvailable(spotId, startTime, endTime);

  if (!isAvailable) {
    return res.status(400).send({ message: 'Spot is not available for the requested time' });
  }

  const user = users.find(u => u.uid === userId);
  const booking = {
    id: `booking_${Date.now()}`,
    spotId,
    userId,
    userName: userName || user?.username || 'Unknown User',
    userEmail: userEmail || user?.email,
    startTime,
    endTime,
    hours: hours || 1,
    totalPrice: totalPrice || 0,
    hourlyRate: hourlyRate || spot.hourlyRate,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    spotOwner: spot.owner,
    spotOwnerName: spot.ownerName,
    location: spot.location,
    spotDetails: {
      location: spot.location,
      hourlyRate: spot.hourlyRate,
      coordinates: spot.coordinates
    }
  };

  bookings.push(booking);
  
  // Add booking to spot's bookings array
  if (!spot.bookings) {
    spot.bookings = [];
  }
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

  // Save data to files
  saveData(SPOTS_FILE, parkingSpots);
  saveData(BOOKINGS_FILE, bookings);

  // Enhanced real-time notifications
  const bookingNotification = {
    type: 'booking',
    title: 'New Booking Received',
    message: `${booking.userName} booked your spot at ${spot.location}`,
    booking,
    timestamp: new Date()
  };

  // Emit to spot owner
  io.to(`user-${spot.owner}`).emit('booking-received', bookingNotification);
  
  // Emit to all users watching this spot
  io.to(`spot-${spotId}`).emit('spot-booked', {
    spotId,
    booking,
    timestamp: new Date()
  });

  // Emit spot availability update
  const stillAvailable = isSpotAvailable(spotId, startTime, endTime);
  io.to(`spot-${spotId}`).emit('spot-availability-updated', {
    spotId,
    available: stillAvailable,
    reason: 'New booking',
    lastUpdated: new Date()
  });

  // Send push notification to spot owner if they're not online
  if (!userSessions.has(spot.owner)) {
    // Store notification for when user comes online
    if (!spot.pendingNotifications) {
      spot.pendingNotifications = [];
    }
    spot.pendingNotifications.push(bookingNotification);
  }

  console.log(`Booking created: ${booking.id} for spot ${spotId} by user ${userId}`);

  res.status(201).send({ message: 'Booking confirmed', booking });
});

// Get user's listings
app.get('/users/:userId/listings', (req, res) => {
  const { userId } = req.params;
  const userListings = parkingSpots.filter(spot => spot.owner === userId);
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
    
    // Update booking status
    booking.status = 'cancelled';
    booking.cancelledAt = new Date().toISOString();
    
    // Find the spot and update its availability
    const spot = parkingSpots.find(s => s.id === booking.spotId);
    if (spot) {
      // Remove the cancelled booking from spot's bookings array (stores booking IDs)
      if (spot.bookings) {
        spot.bookings = spot.bookings.filter(bookingIdInSpot => bookingIdInSpot !== bookingId);
      }
      
      // Check if there are any other active bookings for this spot
      const activeBookings = bookings.filter(b => 
        b.spotId === booking.spotId && 
        b.status !== 'cancelled' && 
        b.id !== bookingId
      );
      
      // If no active bookings, mark spot as available
      if (activeBookings.length === 0) {
        spot.available = true;
        spot.lastUpdated = new Date().toISOString();
      }
      
      // Save updated data
      saveData(SPOTS_FILE, parkingSpots);
      saveData(BOOKINGS_FILE, bookings);
      
      // Emit real-time updates
      io.to(`spot-${booking.spotId}`).emit('spot-availability-updated', {
        spotId: booking.spotId,
        available: spot.available,
        lastUpdated: spot.lastUpdated
      });
      
      // Emit cancellation notification to spot owner
      if (booking.spotOwner) {
        io.to(`user-${booking.spotOwner}`).emit('booking-cancelled', {
          bookingId,
          spotId: booking.spotId,
          userName: booking.userName,
          spotName: spot.title || spot.location
        });
      }
      
      // Emit cancellation notification to user
      io.to(`user-${booking.userId}`).emit('booking-cancelled', {
        bookingId,
        spotId: booking.spotId,
        spotName: spot.title || spot.location,
        message: 'Your booking has been cancelled successfully'
      });
      
      console.log(`Booking ${bookingId} cancelled. Spot ${booking.spotId} is now ${spot.available ? 'available' : 'unavailable'}`);
    }

    res.json({ 
      message: 'Booking cancelled successfully',
      spotAvailable: spot ? spot.available : false
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
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

// Proxy payment endpoint for testing
app.post('/proxy-payment', async (req, res) => {
  try {
    const { amount, spotId, userId, userName, spotName, hours } = req.body;

    if (!amount || !spotId || !userId) {
      return res.status(400).json({ 
        error: 'Missing required fields: amount, spotId, userId' 
      });
    }

    // Create a temporary booking for payment processing
    const booking = {
      id: `booking_${Date.now()}`,
      spotId: spotId,
      userId: userId,
      userName: userName || 'Parking User',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + (hours || 1) * 60 * 60 * 1000).toISOString(),
      totalPrice: amount,
      createdAt: new Date().toISOString(),
      status: 'paid',
      paymentId: `proxy_${Date.now()}`,
      paidAt: new Date(),
      paymentAmount: amount,
      isProxyPayment: true
    };
    
    // Add to bookings array
    bookings.push(booking);
    
    // Update spot availability
    const spot = parkingSpots.find(s => s.id === spotId);
    if (spot) {
      spot.bookings.push(booking);
      spot.available = false;
    }

    // Save data
    saveData(SPOTS_FILE, parkingSpots);
    saveData(BOOKINGS_FILE, bookings);

    // Emit real-time notifications
    if (spot) {
      io.to(`user-${spot.owner}`).emit('payment-received', {
        type: 'payment',
        title: 'Payment Received',
        message: `Payment of $${amount} received for booking at ${spot.location}`,
        booking: booking,
        spot: spot,
        timestamp: new Date()
      });

      io.to(`user-${userId}`).emit('payment-success', {
        type: 'payment',
        title: 'Payment Successful',
        message: `Your payment of $${amount} has been processed successfully`,
        booking: booking,
        spot: spot,
        timestamp: new Date()
      });

      io.to(`spot-${spotId}`).emit('booking-status-updated', {
        spotId: spotId,
        bookingId: booking.id,
        status: 'paid',
        timestamp: new Date()
      });
    }

    console.log(`Proxy payment successful for booking ${booking.id}: $${amount}`);

    res.json({
      success: true,
      booking: booking,
      message: 'Payment processed successfully'
    });
  } catch (error) {
    console.error('Error processing proxy payment:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

// Create payment intent for booking
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, spotId, userId, bookingDetails } = req.body;
    
    if (!amount || !spotId || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user is in test mode
    if (TEST_MODE && TEST_USER_IDS.includes(userId)) {
      return res.json({
        testMode: true,
        message: 'Test mode enabled - payment will be bypassed',
        amount: amount
      });
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        spotId: spotId,
        userId: userId,
        bookingDetails: JSON.stringify(bookingDetails)
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amount
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Stripe webhook endpoint
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = 'whsec_test_endpoint_secret'; // You'll need to set this up in Stripe dashboard

  let event;

  try {
    // For testing, if endpoint secret is not configured, try to parse without verification
    if (endpointSecret === 'whsec_test_endpoint_secret') {
      event = JSON.parse(req.body);
      console.log('Webhook received (test mode):', event.type);
    } else {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handlePaymentSuccess(paymentIntent);
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      await handlePaymentFailure(failedPayment);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Handle successful payment
async function handlePaymentSuccess(paymentIntent) {
  const { bookingId, spotId, userId } = paymentIntent.metadata;
  
  try {
    // Find and update the booking
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      booking.status = 'paid';
      booking.paymentId = paymentIntent.id;
      booking.paidAt = new Date();
      booking.paymentAmount = paymentIntent.amount / 100; // Convert from cents

      // Find the spot
      const spot = parkingSpots.find(s => s.id === spotId);
      if (spot) {
        // Emit real-time payment success notification to spot owner
        io.to(`user-${spot.owner}`).emit('payment-received', {
          type: 'payment',
          title: 'Payment Received',
          message: `Payment of $${booking.paymentAmount} received for booking at ${spot.location}`,
          booking: booking,
          spot: spot,
          timestamp: new Date()
        });

        // Emit payment success notification to the booker
        io.to(`user-${userId}`).emit('payment-success', {
          type: 'payment',
          title: 'Payment Successful',
          message: `Your payment of $${booking.paymentAmount} has been processed successfully`,
          booking: booking,
          spot: spot,
          timestamp: new Date()
        });

        // Emit booking status update to all users watching this spot
        io.to(`spot-${spotId}`).emit('booking-status-updated', {
          spotId: spotId,
          bookingId: bookingId,
          status: 'paid',
          timestamp: new Date()
        });
      }

      console.log(`Payment successful for booking ${bookingId}: $${booking.paymentAmount}`);
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

// Handle failed payment
async function handlePaymentFailure(paymentIntent) {
  const { bookingId, spotId, userId } = paymentIntent.metadata;
  
  try {
    // Find and update the booking
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      booking.status = 'payment_failed';
      booking.paymentFailureReason = paymentIntent.last_payment_error?.message || 'Payment failed';

      // Emit payment failure notification to the booker
      io.to(`user-${userId}`).emit('payment-failed', {
        type: 'payment',
        title: 'Payment Failed',
        message: `Your payment failed: ${booking.paymentFailureReason}`,
        booking: booking,
        timestamp: new Date()
      });

      console.log(`Payment failed for booking ${bookingId}: ${booking.paymentFailureReason}`);
    }
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

// Get payment status for a booking
app.get('/bookings/:bookingId/payment-status', (req, res) => {
  const { bookingId } = req.params;
  
  const booking = bookings.find(b => b.id === bookingId);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  res.json({
    bookingId: booking.id,
    status: booking.status,
    paymentId: booking.paymentId,
    paidAt: booking.paidAt,
    paymentAmount: booking.paymentAmount,
    paymentFailureReason: booking.paymentFailureReason
  });
});

// Create a new booking with payment
app.post('/bookings', async (req, res) => {
  try {
    const { 
      spotId, 
      userId, 
      userName, 
      startTime, 
      endTime, 
      totalPrice, 
      hours,
      paymentIntentId,
      paymentMethod 
    } = req.body;
    
    if (!spotId || !userId || !userName) {
      return res.status(400).json({ message: 'Missing required booking fields' });
    }
    
    const spot = parkingSpots.find(s => s.id === spotId);
    if (!spot) {
      return res.status(404).json({ message: 'Spot not found' });
    }
    
    // Check if spot is available
    if (!spot.available) {
      return res.status(400).json({ message: 'Spot already booked' });
    }

    let paymentStatus = 'pending';
    let paymentId = null;
    let paidAt = null;
    let isTestBooking = false;

    // Handle payment based on test mode
    if (TEST_MODE) {
      // Test mode - bypass payment for any user
      paymentStatus = 'paid';
      paymentId = `test_${Date.now()}`;
      paidAt = new Date().toISOString();
      isTestBooking = true;
      console.log(`Test booking for user ${userId} - payment bypassed (TEST_MODE)`);
    } else if (paymentIntentId) {
      // Real payment - verify with Stripe
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (paymentIntent.status === 'succeeded') {
          paymentStatus = 'paid';
          paymentId = paymentIntent.id;
          paidAt = new Date().toISOString();
          
          // Transfer payment to spot owner (if they have Stripe account)
          await transferPaymentToOwner(paymentIntent, spot, totalPrice);
          
        } else {
          return res.status(400).json({ message: 'Payment not completed' });
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        return res.status(400).json({ message: 'Payment verification failed' });
      }
    } else {
      return res.status(400).json({ message: 'Payment required for booking' });
    }

    // Create booking
    const booking = {
      id: `booking_${Date.now()}`,
      spotId,
      userId,
      userName,
      startTime: startTime || new Date().toISOString(),
      endTime: endTime || new Date(Date.now() + (hours || 2) * 60 * 60 * 1000).toISOString(),
      totalPrice: totalPrice || spot.price || 15,
      hours: hours || 2,
      createdAt: new Date().toISOString(),
      status: paymentStatus,
      paymentId: paymentId,
      paidAt: paidAt,
      paymentAmount: totalPrice,
      paymentMethod: paymentMethod || 'Credit Card',
      isTestBooking: isTestBooking
    };
    
    bookings.push(booking);
    
    // Add booking to spot
    if (!spot.bookings) spot.bookings = [];
    spot.bookings.push(booking);
    spot.available = false;
    
    // Save data
    saveData(SPOTS_FILE, parkingSpots);
    saveData(BOOKINGS_FILE, bookings);

    // Generate receipt
    try {
      const user = users.find(u => u.uid === userId || u.id === userId);
      if (user) {
        await receiptService.generateAndSendReceipt(booking, spot, user);
      }
    } catch (error) {
      console.error('Error generating receipt for booking:', error);
    }

    // Send notification to spot owner
    if (spot.owner) {
      io.to(`user-${spot.owner}`).emit('booking-received', {
        type: 'booking',
        title: 'New Booking Received',
        message: `${userName} booked your spot at ${spot.location}`,
        booking: booking,
        spot: spot,
        timestamp: new Date()
      });
    }

    // Send notification to the user who made the booking
    io.to(`user-${userId}`).emit('booking-confirmation', {
      type: 'booking',
      title: 'Booking Confirmed! 🎉',
      message: `Your booking for ${spot.title || spot.location} has been confirmed successfully.`,
      booking: booking,
      spot: spot,
      timestamp: new Date()
    });

    console.log(`Booking created: ${booking.id} for spot ${spotId} (${paymentStatus})`);
    
    res.status(201).json({ 
      message: `Booking successful (${paymentStatus})`, 
      booking, 
      spot: {
        id: spot.id,
        title: spot.title,
        location: spot.location
      },
      testMode: isTestBooking
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Failed to create booking' });
  }
});

// Helper function to transfer payment to spot owner
async function transferPaymentToOwner(paymentIntent, spot, amount) {
  try {
    // For now, we'll just log the transfer
    // In production, you'd need to:
    // 1. Store spot owner's Stripe account ID
    // 2. Use Stripe Connect to transfer funds
    // 3. Handle platform fees
    
    console.log(`Payment transfer to owner ${spot.ownerName} (${spot.owner}): $${amount}`);
    console.log(`Payment Intent ID: ${paymentIntent.id}`);
    
    // Example of how to implement Stripe Connect transfer:
    // const transfer = await stripe.transfers.create({
    //   amount: Math.round(amount * 100 * 0.9), // 90% to owner, 10% platform fee
    //   currency: 'usd',
    //   destination: spot.ownerStripeAccountId,
    //   source_transaction: paymentIntent.latest_charge,
    // });
    
  } catch (error) {
    console.error('Error transferring payment to owner:', error);
    // Don't fail the booking if transfer fails
  }
}

// Get bookings for a user
app.get('/bookings', (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ message: 'userId required' });
  }
  const userBookings = bookings.filter(b => b.userId === userId);
  
  const bookingsWithDetails = userBookings.map(booking => {
    const spot = parkingSpots.find(s => s.id === booking.spotId);
    return {
      ...booking,
      spotDetails: spot ? {
        location: spot.location,
        hourlyRate: spot.hourlyRate,
        coordinates: spot.coordinates
      } : null
    };
  });
  
  res.json(bookingsWithDetails);
});

app.get('/', (req, res) => {
  res.send('ParkShare Backend');
});

// Create test data for development
const createTestData = () => {
  console.log('Creating test data...');
  
  // Test users
  const testUsers = [
    { username: 'john_doe', email: 'john@example.com', uid: 'user_john_123' },
    { username: 'jane_smith', email: 'jane@example.com', uid: 'user_jane_456' },
    { username: 'mike_wilson', email: 'mike@example.com', uid: 'user_mike_789' },
    { username: 'sarah_jones', email: 'sarah@example.com', uid: 'user_sarah_101' }
  ];
  
  // Test parking spots
  const testSpots = [
    {
      id: 'spot_downtown_001',
      title: 'Downtown Premium Parking',
      location: '123 Main Street, Downtown',
      coordinates: [19.0760, 72.8777],
      hourlyRate: '$15',
      price: 15,
      description: 'Premium parking in the heart of downtown with 24/7 security',
      available: true,
      available24h: true,
      status: 'available',
      owner: 'user_john_123',
      ownerName: 'John Doe',
      images: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=250&fit=crop'
      ],
      securityFeatures: ['cctv', 'security_guard'],
      amenities: ['covered', 'ev_charging', 'car_wash'],
      rating: 4.5,
      reviewCount: 12,
      parkingType: 'lot',
      advanceBooking: 24,
      vehicleTypes: ['car', 'suv'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'spot_airport_002',
      title: 'Airport Express Parking',
      location: '456 Airport Road, Near Terminal 1',
      coordinates: [19.0896, 72.8656],
      hourlyRate: '$20',
      price: 20,
      description: 'Convenient parking near airport with shuttle service',
      available: true,
      available24h: true,
      status: 'available',
      owner: 'user_jane_456',
      ownerName: 'Jane Smith',
      images: [
        'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop'
      ],
      securityFeatures: ['cctv', 'fenced'],
      amenities: ['shuttle_service', 'covered', 'accessible'],
      rating: 4.8,
      reviewCount: 25,
      parkingType: 'lot',
      advanceBooking: 48,
      vehicleTypes: ['car', 'suv', 'truck'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'spot_mall_003',
      title: 'Shopping Mall Parking',
      location: '789 Mall Drive, Shopping District',
      coordinates: [19.0624, 72.8898],
      hourlyRate: '$10',
      price: 10,
      description: 'Affordable parking near popular shopping mall',
      available: true,
      available24h: false,
      status: 'available',
      owner: 'user_mike_789',
      ownerName: 'Mike Wilson',
      images: [
        'https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop'
      ],
      securityFeatures: ['cctv'],
      amenities: ['restroom', 'bike_racks'],
      rating: 4.2,
      reviewCount: 8,
      parkingType: 'lot',
      advanceBooking: 12,
      vehicleTypes: ['car'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'spot_residential_004',
      title: 'Residential Street Parking',
      location: '321 Oak Street, Residential Area',
      coordinates: [19.0736, 72.8816],
      hourlyRate: '$8',
      price: 8,
      description: 'Quiet residential parking with easy access',
      available: true,
      available24h: true,
      status: 'available',
      owner: 'user_sarah_101',
      ownerName: 'Sarah Jones',
      images: [
        'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=250&fit=crop'
      ],
      securityFeatures: ['well_lit'],
      amenities: ['accessible'],
      rating: 4.0,
      reviewCount: 5,
      parkingType: 'street',
      advanceBooking: 6,
      vehicleTypes: ['car'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'spot_office_005',
      title: 'Office Building Parking',
      location: '555 Business Center, Financial District',
      coordinates: [19.0789, 72.8712],
      hourlyRate: '$18',
      price: 18,
      description: 'Professional parking in business district',
      available: false,
      available24h: false,
      status: 'occupied',
      owner: 'user_john_123',
      ownerName: 'John Doe',
      images: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=250&fit=crop'
      ],
      securityFeatures: ['cctv', 'security_guard', 'fenced'],
      amenities: ['covered', 'accessible'],
      rating: 4.3,
      reviewCount: 15,
      parkingType: 'covered_lot',
      advanceBooking: 24,
      vehicleTypes: ['car', 'suv'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'spot_hospital_006',
      title: 'Hospital Parking',
      location: '777 Medical Center Drive',
      coordinates: [19.0856, 72.8789],
      hourlyRate: '$12',
      price: 12,
      description: 'Convenient parking near medical facilities',
      available: false,
      available24h: true,
      status: 'occupied',
      owner: 'user_jane_456',
      ownerName: 'Jane Smith',
      images: [
        'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=250&fit=crop'
      ],
      securityFeatures: ['cctv', 'well_lit'],
      amenities: ['accessible', 'restroom'],
      rating: 4.1,
      reviewCount: 22,
      parkingType: 'lot',
      advanceBooking: 12,
      vehicleTypes: ['car'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'spot_stadium_007',
      title: 'Stadium Parking',
      location: '888 Sports Complex Road',
      coordinates: [19.0698, 72.8845],
      hourlyRate: '$25',
      price: 25,
      description: 'Event parking with easy stadium access',
      available: true,
      available24h: false,
      status: 'available',
      owner: 'user_mike_789',
      ownerName: 'Mike Wilson',
      images: [
        'https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop'
      ],
      securityFeatures: ['cctv', 'security_guard'],
      amenities: ['restroom', 'food_vendors'],
      rating: 4.6,
      reviewCount: 18,
      parkingType: 'lot',
      advanceBooking: 48,
      vehicleTypes: ['car', 'suv', 'truck'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'spot_university_008',
      title: 'University Campus Parking',
      location: '999 Education Boulevard',
      coordinates: [19.0723, 72.8678],
      hourlyRate: '$6',
      price: 6,
      description: 'Student-friendly parking near campus',
      available: false,
      available24h: false,
      status: 'occupied',
      owner: 'user_sarah_101',
      ownerName: 'Sarah Jones',
      images: [
        'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=250&fit=crop',
        'https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=250&fit=crop'
      ],
      securityFeatures: ['cctv'],
      amenities: ['bike_racks', 'accessible'],
      rating: 3.8,
      reviewCount: 9,
      parkingType: 'lot',
      advanceBooking: 6,
      vehicleTypes: ['car', 'bike'],
      createdAt: new Date().toISOString()
    }
  ];
  
  // Add test users if they don't exist
  testUsers.forEach(user => {
    if (!users.find(u => u.uid === user.uid)) {
      users.push(user);
      console.log(`Added test user: ${user.username}`);
    }
  });
  
  // Add test spots if they don't exist
  testSpots.forEach(spot => {
    if (!parkingSpots.find(s => s.id === spot.id)) {
      parkingSpots.push(spot);
      console.log(`Added test spot: ${spot.title}`);
    }
  });
  
  // Save to files
  saveData(USERS_FILE, users);
  saveData(SPOTS_FILE, parkingSpots);
  
  console.log(`Test data created: ${users.length} users, ${parkingSpots.length} spots`);
};

// Call createTestData on server start
createTestData();

// Get dashboard statistics
app.get('/stats', (req, res) => {
  try {
    const totalSpots = parkingSpots.length;
    const availableSpots = parkingSpots.filter(spot => spot.available).length;
    const totalUsers = users.length;
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
    
    // Calculate average rating
    const spotsWithRatings = parkingSpots.filter(spot => spot.rating);
    const averageRating = spotsWithRatings.length > 0 
      ? spotsWithRatings.reduce((sum, spot) => sum + spot.rating, 0) / spotsWithRatings.length 
      : 0;
    
    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentBookings = bookings.filter(booking => 
      new Date(booking.createdAt) > sevenDaysAgo
    );
    
    // Popular locations
    const locationStats = parkingSpots.reduce((acc, spot) => {
      const area = spot.location.split(',')[0]; // Get first part of address
      acc[area] = (acc[area] || 0) + 1;
      return acc;
    }, {});
    
    const popularLocations = Object.entries(locationStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([location, count]) => ({ location, count }));
    
    const stats = {
      totalSpots,
      availableSpots,
      totalUsers,
      totalBookings,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageRating: Math.round(averageRating * 10) / 10,
      recentBookings: recentBookings.length,
      popularLocations,
      occupancyRate: totalSpots > 0 ? Math.round(((totalSpots - availableSpots) / totalSpots) * 100) : 0
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ message: 'Failed to get statistics' });
  }
});

// Verification endpoints
app.post('/verify/send-email-code', (req, res) => {
  const { email, userId } = req.body;
  
  if (!email || !userId) {
    return res.status(400).json({ message: 'Email and userId are required' });
  }

  // Generate a 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store the code temporarily (in production, use Redis or database)
  if (!verificationCodes) verificationCodes = {};
  verificationCodes[`email_${userId}`] = {
    code,
    email,
    timestamp: Date.now(),
    attempts: 0
  };

  console.log(`Email verification code for ${email}: ${code}`);

  // In production, send actual email here
  // For now, just return success
  res.json({ 
    message: 'Verification code sent successfully',
    code: code // Remove this in production
  });
});

app.post('/verify/email', (req, res) => {
  const { email, code, userId } = req.body;
  
  if (!email || !code || !userId) {
    return res.status(400).json({ message: 'Email, code, and userId are required' });
  }

  const storedData = verificationCodes?.[`email_${userId}`];
  
  if (!storedData || storedData.email !== email) {
    return res.status(400).json({ message: 'Invalid verification request' });
  }

  if (storedData.attempts >= 3) {
    delete verificationCodes[`email_${userId}`];
    return res.status(400).json({ message: 'Too many attempts. Please request a new code.' });
  }

  if (Date.now() - storedData.timestamp > 10 * 60 * 1000) { // 10 minutes
    delete verificationCodes[`email_${userId}`];
    return res.status(400).json({ message: 'Verification code expired. Please request a new code.' });
  }

  if (storedData.code !== code) {
    storedData.attempts++;
    return res.status(400).json({ message: 'Invalid verification code' });
  }

  // Mark email as verified
  const user = users.find(u => u.id === userId);
  if (user) {
    user.emailVerified = true;
    user.verifiedEmail = email;
  }

  // Clean up
  delete verificationCodes[`email_${userId}`];

  res.json({ message: 'Email verified successfully' });
});

app.post('/verify/send-mobile-code', (req, res) => {
  const { mobile, userId } = req.body;
  
  if (!mobile || !userId) {
    return res.status(400).json({ message: 'Mobile number and userId are required' });
  }

  // Generate a 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store the code temporarily
  if (!verificationCodes) verificationCodes = {};
  verificationCodes[`mobile_${userId}`] = {
    code,
    mobile,
    timestamp: Date.now(),
    attempts: 0
  };

  console.log(`Mobile verification code for ${mobile}: ${code}`);

  // In production, send actual SMS here
  // For now, just return success
  res.json({ 
    message: 'Verification code sent successfully',
    code: code // Remove this in production
  });
});

app.post('/verify/mobile', (req, res) => {
  const { mobile, code, userId } = req.body;
  
  if (!mobile || !code || !userId) {
    return res.status(400).json({ message: 'Mobile number, code, and userId are required' });
  }

  const storedData = verificationCodes?.[`mobile_${userId}`];
  
  if (!storedData || storedData.mobile !== mobile) {
    return res.status(400).json({ message: 'Invalid verification request' });
  }

  if (storedData.attempts >= 3) {
    delete verificationCodes[`mobile_${userId}`];
    return res.status(400).json({ message: 'Too many attempts. Please request a new code.' });
  }

  if (Date.now() - storedData.timestamp > 10 * 60 * 1000) { // 10 minutes
    delete verificationCodes[`mobile_${userId}`];
    return res.status(400).json({ message: 'Verification code expired. Please request a new code.' });
  }

  if (storedData.code !== code) {
    storedData.attempts++;
    return res.status(400).json({ message: 'Invalid verification code' });
  }

  // Mark mobile as verified
  const user = users.find(u => u.id === userId);
  if (user) {
    user.mobileVerified = true;
    user.verifiedMobile = mobile;
    user.isVerifiedHost = true; // User becomes verified host
  }

  // Clean up
  delete verificationCodes[`mobile_${userId}`];

  res.json({ message: 'Mobile number verified successfully' });
});

// Get user verification status
app.get('/verify/status/:userId', (req, res) => {
  const { userId } = req.params;
  
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    emailVerified: user.emailVerified || false,
    mobileVerified: user.mobileVerified || false,
    isVerifiedHost: user.isVerifiedHost || false,
    verifiedEmail: user.verifiedEmail,
    verifiedMobile: user.verifiedMobile
  });
});

// Get user verification status (alternative endpoint for Profile page)
app.get('/users/:userId/verification', (req, res) => {
  const { userId } = req.params;
  
  const user = users.find(u => u.uid === userId || u.id === userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    emailVerified: user.emailVerified || false,
    mobileVerified: user.mobileVerified || false,
    isVerifiedHost: user.isVerifiedHost || false,
    verifiedEmail: user.verifiedEmail,
    verifiedMobile: user.verifiedMobile
  });
});

// Receipt generation endpoints
app.post('/receipts/generate', async (req, res) => {
  try {
    const { bookingId, userId } = req.body;
    
    if (!bookingId || !userId) {
      return res.status(400).json({ message: 'Booking ID and User ID are required' });
    }

    // Find the booking
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Find the spot
    const spot = parkingSpots.find(s => s.id === booking.spotId);
    if (!spot) {
      return res.status(404).json({ message: 'Parking spot not found' });
    }

    // Find the user
    const user = users.find(u => u.uid === userId || u.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate receipt
    const { filePath, fileName } = await receiptService.generateReceiptPDF(booking, spot, user);
    
    res.json({
      message: 'Receipt generated successfully',
      fileName,
      downloadUrl: `/receipts/download/${fileName}`
    });

  } catch (error) {
    console.error('Error generating receipt:', error);
    res.status(500).json({ message: 'Failed to generate receipt' });
  }
});

app.get('/receipts/download/:fileName', (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(__dirname, 'receipts', fileName);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Receipt file not found' });
    }

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).json({ message: 'Failed to download receipt' });
      }
    });
  } catch (error) {
    console.error('Error serving receipt file:', error);
    res.status(500).json({ message: 'Failed to serve receipt file' });
  }
});

app.post('/receipts/send-email', async (req, res) => {
  try {
    const { bookingId, userId } = req.body;
    
    if (!bookingId || !userId) {
      return res.status(400).json({ message: 'Booking ID and User ID are required' });
    }

    // Find the booking
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Find the spot
    const spot = parkingSpots.find(s => s.id === booking.spotId);
    if (!spot) {
      return res.status(404).json({ message: 'Parking spot not found' });
    }

    // Find the user
    const user = users.find(u => u.uid === userId || u.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate and send receipt
    const result = await receiptService.generateAndSendReceipt(booking, spot, user);
    
    res.json({
      message: 'Receipt sent successfully',
      fileName: result.fileName
    });

  } catch (error) {
    console.error('Error sending receipt email:', error);
    res.status(500).json({ message: 'Failed to send receipt email' });
  }
});

// Test booking endpoint - bypasses payments entirely
app.post('/bookings/test', async (req, res) => {
  const { spotId, userId, userName, startTime, endTime, totalPrice, hours } = req.body;
  
  if (!spotId || !userId || !userName) {
    return res.status(400).json({ message: 'Missing required booking fields' });
  }
  
  const spot = parkingSpots.find(s => s.id === spotId);
  if (!spot) {
    return res.status(404).json({ message: 'Spot not found' });
  }
  
  // Check if spot is available
  if (!spot.available) {
    return res.status(400).json({ message: 'Spot already booked' });
  }
  
  // Create booking with test payment
  const booking = {
    id: `booking_${Date.now()}`,
    spotId,
    userId,
    userName,
    startTime: startTime || new Date().toISOString(),
    endTime: endTime || new Date(Date.now() + (hours || 2) * 60 * 60 * 1000).toISOString(),
    totalPrice: totalPrice || spot.price || 15,
    hours: hours || 2,
    createdAt: new Date().toISOString(),
    status: 'paid',
    paymentId: `test_${Date.now()}`,
    paidAt: new Date().toISOString(),
    paymentAmount: totalPrice || spot.price || 15,
    isTestBooking: true
  };
  
  bookings.push(booking);
  
  // Add booking to spot
  if (!spot.bookings) spot.bookings = [];
  spot.bookings.push(booking);
  spot.available = false;
  
  // Save data
  saveData(SPOTS_FILE, parkingSpots);
  saveData(BOOKINGS_FILE, bookings);

  // Generate receipt
  try {
    const user = users.find(u => u.uid === userId || u.id === userId);
    if (user) {
      await receiptService.generateAndSendReceipt(booking, spot, user);
    }
  } catch (error) {
    console.error('Error generating receipt for test booking:', error);
  }

  console.log(`Test booking created: ${booking.id} for spot ${spotId}`);
  
  res.status(201).json({ 
    message: 'Test booking successful (payment bypassed)', 
    booking, 
    spot: {
      id: spot.id,
      title: spot.title,
      location: spot.location
    }
  });
});

// Get all users (for admin purposes)
app.get('/users', (req, res) => {
  try {
    // Return users without sensitive information
    const safeUsers = users.map(user => ({
      uid: user.uid,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt || new Date().toISOString()
    }));
    res.json(safeUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all bookings (for admin purposes)
app.get('/bookings/all', (req, res) => {
  try {
    const bookingsWithDetails = bookings.map(booking => {
      const spot = parkingSpots.find(s => s.id === booking.spotId);
      return {
        ...booking,
        spotDetails: spot ? {
          location: spot.location,
          hourlyRate: spot.hourlyRate,
          coordinates: spot.coordinates
        } : null
      };
    });
    res.json(bookingsWithDetails);
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ===== MESSAGING SYSTEM API ENDPOINTS =====

// Get all conversations for a user
app.get('/api/conversations', (req, res) => {
  try {
    const userId = req.headers.authorization?.replace('Bearer ', '');
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userConversations = conversations.filter(conv => 
      conv.participants.some(p => p.id === userId || p.uid === userId)
    );

    // Add last message and unread count to each conversation
    const conversationsWithDetails = userConversations.map(conv => {
      const convMessages = messages.filter(m => m.conversationId === conv.id);
      const lastMessage = convMessages.length > 0 
        ? convMessages[convMessages.length - 1] 
        : null;
      
      const unreadCount = convMessages.filter(m => 
        m.senderId !== userId && !m.read
      ).length;

      return {
        ...conv,
        lastMessage,
        unreadCount
      };
    });

    res.json({ conversations: conversationsWithDetails });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get messages for a specific conversation
app.get('/api/conversations/:conversationId/messages', (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is a participant
    const isParticipant = conversation.participants.some(p => p.id === userId || p.uid === userId);
    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const conversationMessages = messages
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json({ messages: conversationMessages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new conversation or find existing one
app.post('/api/conversations', (req, res) => {
  try {
    const { participants, subject, initialMessage } = req.body;
    const userId = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!participants || participants.length !== 2) {
      return res.status(400).json({ message: 'Invalid participants' });
    }

    // Get user details for participants
    const participantDetails = participants.map(participantId => {
      const user = users.find(u => u.uid === participantId || u.id === participantId);
      return {
        id: user?.uid || participantId,
        uid: user?.uid || participantId,
        username: user?.username || 'Unknown User',
        email: user?.email || ''
      };
    });

    // Check for blocked users
    const currentUser = users.find(u => u.uid === userId);
    if (currentUser && currentUser.blockedUsers) {
      const otherParticipant = participantDetails.find(p => p.id !== userId);
      if (otherParticipant && currentUser.blockedUsers.includes(otherParticipant.id)) {
        return res.status(403).json({ 
          message: 'Cannot create conversation with blocked user',
          blockedUser: otherParticipant.username
        });
      }
    }

    // Check if other participant has blocked the current user
    const otherParticipant = participantDetails.find(p => p.id !== userId);
    if (otherParticipant) {
      const otherUser = users.find(u => u.uid === otherParticipant.id);
      if (otherUser && otherUser.blockedUsers && otherUser.blockedUsers.includes(userId)) {
        return res.status(403).json({ 
          message: 'Cannot create conversation - you have been blocked by this user'
        });
      }
    }

    // Check if a conversation already exists between these participants
    const existingConversation = conversations.find(conv => {
      const convParticipantIds = conv.participants.map(p => p.id || p.uid);
      const requestParticipantIds = participantDetails.map(p => p.id || p.uid);
      
      // Check if both participants match (order doesn't matter)
      return convParticipantIds.length === requestParticipantIds.length &&
             convParticipantIds.every(id => requestParticipantIds.includes(id)) &&
             requestParticipantIds.every(id => convParticipantIds.includes(id));
    });

    let conversation;
    if (existingConversation) {
      // Use existing conversation
      conversation = existingConversation;
      console.log(`Using existing conversation: ${conversation.id} between ${participantDetails.map(p => p.username).join(' and ')}`);
    } else {
      // Create new conversation
      conversation = {
        id: `conv_${Date.now()}`,
        participants: participantDetails,
        subject: subject || 'New Conversation',
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      };

      conversations.push(conversation);
      saveData(CONVERSATIONS_FILE, conversations);
      console.log(`Created new conversation: ${conversation.id} between ${participantDetails.map(p => p.username).join(' and ')}`);
    }

    // Create initial message if provided
    if (initialMessage) {
      const message = {
        id: `msg_${Date.now()}`,
        conversationId: conversation.id,
        senderId: userId,
        content: initialMessage,
        timestamp: new Date().toISOString(),
        read: false
      };

      messages.push(message);
      saveData(MESSAGES_FILE, messages);

      // Update conversation last activity
      conversation.lastActivity = new Date().toISOString();
      saveData(CONVERSATIONS_FILE, conversations);

      // Emit real-time notification to other participant
      if (otherParticipant) {
        io.to(`user-${otherParticipant.id}`).emit('new-message', {
          conversationId: conversation.id,
          message,
          sender: users.find(u => u.uid === userId)
        });
      }
    }

    res.status(201).json({ conversation });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Send a new message
app.post('/api/messages', (req, res) => {
  try {
    const { conversationId, content, senderId } = req.body;
    const userId = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is a participant
    const isParticipant = conversation.participants.some(p => p.id === userId || p.uid === userId);
    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check for blocked users in conversation
    const currentUser = users.find(u => u.uid === userId);
    const otherParticipants = conversation.participants.filter(p => p.id !== userId);
    
    if (currentUser && currentUser.blockedUsers) {
      const blockedParticipants = otherParticipants.filter(p => 
        currentUser.blockedUsers.includes(p.id)
      );
      
      if (blockedParticipants.length > 0) {
        return res.status(403).json({ 
          message: 'Cannot send message to blocked users',
          blockedUsers: blockedParticipants.map(p => p.username)
        });
      }
    }

    // Check if current user is blocked by other participants
    for (const participant of otherParticipants) {
      const participantUser = users.find(u => u.uid === participant.id);
      if (participantUser && participantUser.blockedUsers && participantUser.blockedUsers.includes(userId)) {
        return res.status(403).json({ 
          message: 'Cannot send message - you have been blocked by one or more participants'
        });
      }
    }

    const message = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId: userId,
      content,
      attachments: req.body.attachments || [],
      timestamp: new Date().toISOString(),
      read: false
    };

    messages.push(message);
    saveData(MESSAGES_FILE, messages);

    // Update conversation last activity
    conversation.lastActivity = new Date().toISOString();
    saveData(CONVERSATIONS_FILE, conversations);

    // Emit real-time notification to other participants
    otherParticipants.forEach(participant => {
      io.to(`user-${participant.id}`).emit('new-message', {
        conversationId,
        message,
        sender: users.find(u => u.uid === userId)
      });
    });

    res.status(201).json({ message });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Upload file attachment for messages
app.post('/api/messages/upload-attachment', upload.single('attachment'), (req, res) => {
  try {
    const userId = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileInfo = {
      id: `file_${Date.now()}`,
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      url: `/uploads/attachments/${req.file.filename}`,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedBy: userId,
      uploadedAt: new Date().toISOString()
    };

    res.status(201).json({ 
      message: 'File uploaded successfully',
      file: fileInfo
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get file attachment
app.get('/api/messages/attachment/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const userId = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const filePath = path.join(ATTACHMENTS_DIR, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete file attachment
app.delete('/api/messages/attachment/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const userId = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const filePath = path.join(ATTACHMENTS_DIR, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Remove file from disk
    fs.unlinkSync(filePath);
    
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark messages as read
app.put('/api/conversations/:conversationId/read', (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Mark all messages in this conversation as read for this user
    const conversationMessages = messages.filter(m => m.conversationId === conversationId);
    conversationMessages.forEach(message => {
      if (message.senderId !== userId && !message.read) {
        message.read = true;
      }
    });

    saveData(MESSAGES_FILE, messages);
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all users (for messaging - non-admin users)
app.get('/api/users/messaging', (req, res) => {
  try {
    const userId = req.headers.authorization?.replace('Bearer ', '');
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const currentUser = users.find(u => u.uid === userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return users without sensitive information, excluding current user and blocked users
    const safeUsers = users
      .filter(user => {
        // Exclude current user
        if (user.uid === userId) return false;
        
        // Exclude users that current user has blocked
        if (currentUser.blockedUsers && currentUser.blockedUsers.includes(user.uid)) return false;
        
        // Exclude users who have blocked current user
        if (user.blockedUsers && user.blockedUsers.includes(userId)) return false;
        
        return true;
      })
      .map(user => ({
        uid: user.uid,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt || new Date().toISOString()
      }));
    
    res.json({ users: safeUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user profile by ID
app.get('/api/users/:userId/profile', (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.headers.authorization?.replace('Bearer ', '');
    
    if (!currentUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = users.find(u => u.uid === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's parking spots
    const userSpots = parkingSpots.filter(spot => spot.owner === userId);
    
    // Get user's reviews (from bookings)
    const userReviews = bookings
      .filter(booking => booking.spotOwner === userId && booking.review)
      .map(booking => ({
        id: booking.id,
        rating: booking.review.rating,
        comment: booking.review.comment,
        reviewer: users.find(u => u.uid === booking.userId)?.username || 'Unknown',
        date: booking.review.date || booking.createdAt
      }));

    // Calculate user stats
    const totalSpots = userSpots.length;
    const totalBookings = bookings.filter(b => b.spotOwner === userId).length;
    const averageRating = userReviews.length > 0 
      ? userReviews.reduce((sum, review) => sum + review.rating, 0) / userReviews.length 
      : 0;

    const profile = {
      uid: user.uid,
      username: user.username || 'Unknown User',
      email: user.email || '',
      fullName: user.fullName || user.username || 'Unknown User',
      phone: user.phone || '',
      location: user.location || '',
      verified: user.verified || false,
      hostSince: user.hostSince || '',
      createdAt: user.createdAt || user.hostSince || new Date().toISOString(),
      totalSpots,
      totalBookings,
      averageRating: Math.round(averageRating * 10) / 10,
      reviews: userReviews,
      spots: userSpots.map(spot => ({
        id: spot.id,
        title: spot.title,
        location: spot.location,
        price: spot.price,
        available: spot.available,
        image: spot.image
      }))
    };

    res.json({ profile });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Star/Unstar conversation
app.post('/api/conversations/:conversationId/star', (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is a participant
    const isParticipant = conversation.participants.some(p => p.id === userId || p.uid === userId);
    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Toggle starred status
    if (!conversation.starred) {
      conversation.starred = {};
    }
    conversation.starred[userId] = !conversation.starred[userId];
    
    saveData(CONVERSATIONS_FILE, conversations);
    
    res.json({ 
      conversation,
      starred: conversation.starred[userId]
    });
  } catch (error) {
    console.error('Error starring conversation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mute/Unmute conversation
app.post('/api/conversations/:conversationId/mute', (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is a participant
    const isParticipant = conversation.participants.some(p => p.id === userId || p.uid === userId);
    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Toggle muted status
    if (!conversation.muted) {
      conversation.muted = {};
    }
    conversation.muted[userId] = !conversation.muted[userId];
    
    saveData(CONVERSATIONS_FILE, conversations);
    
    res.json({ 
      conversation,
      muted: conversation.muted[userId]
    });
  } catch (error) {
    console.error('Error muting conversation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Archive/Unarchive conversation
app.post('/api/conversations/:conversationId/archive', (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is a participant
    const isParticipant = conversation.participants.some(p => p.id === userId || p.uid === userId);
    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Toggle archived status
    if (!conversation.archived) {
      conversation.archived = {};
    }
    conversation.archived[userId] = !conversation.archived[userId];
    
    saveData(CONVERSATIONS_FILE, conversations);
    
    res.json({ 
      conversation,
      archived: conversation.archived[userId]
    });
  } catch (error) {
    console.error('Error archiving conversation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Block/Unblock user
app.post('/api/users/:userId/block', (req, res) => {
  try {
    const { userId } = req.params;
    const { blocked } = req.body;
    const currentUserId = req.headers.authorization?.replace('Bearer ', '');
    
    if (!currentUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (userId === currentUserId) {
      return res.status(400).json({ message: 'Cannot block yourself' });
    }

    const currentUser = users.find(u => u.uid === currentUserId);
    const userToBlock = users.find(u => u.uid === userId);
    
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!userToBlock) {
      return res.status(404).json({ message: 'User to block not found' });
    }

    // Initialize blocked users array if it doesn't exist
    if (!currentUser.blockedUsers) {
      currentUser.blockedUsers = [];
    }

    if (blocked) {
      // Add to blocked users if not already blocked
      if (!currentUser.blockedUsers.includes(userId)) {
        currentUser.blockedUsers.push(userId);
        // Store timestamp when user was blocked
        if (!userToBlock.blockedAt) {
          userToBlock.blockedAt = {};
        }
        userToBlock.blockedAt[currentUserId] = new Date().toISOString();
      }
    } else {
      // Remove from blocked users
      currentUser.blockedUsers = currentUser.blockedUsers.filter(id => id !== userId);
      // Remove timestamp
      if (userToBlock.blockedAt) {
        delete userToBlock.blockedAt[currentUserId];
      }
    }
    
    saveData(USERS_FILE, users);
    
    res.json({ 
      blocked,
      blockedUsers: currentUser.blockedUsers
    });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Report user
app.post('/api/users/:userId/report', (req, res) => {
  try {
    const { userId } = req.params;
    const { reason, description } = req.body;
    const currentUserId = req.headers.authorization?.replace('Bearer ', '');
    
    if (!currentUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (userId === currentUserId) {
      return res.status(400).json({ message: 'Cannot report yourself' });
    }

    const report = {
      id: `report_${Date.now()}`,
      reporterId: currentUserId,
      reportedUserId: userId,
      reason,
      description,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    // Initialize reports array if it doesn't exist
    if (!global.reports) {
      global.reports = [];
    }
    
    global.reports.push(report);
    
    // Save reports to file
    const REPORTS_FILE = path.join(DATA_DIR, 'reports.json');
    saveData(REPORTS_FILE, global.reports);
    
    res.status(201).json({ 
      message: 'User reported successfully',
      report
    });
  } catch (error) {
    console.error('Error reporting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete conversation
app.delete('/api/conversations/:conversationId', (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is a participant
    const isParticipant = conversation.participants.some(p => p.id === userId || p.uid === userId);
    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Remove conversation and all its messages
    conversations = conversations.filter(c => c.id !== conversationId);
    messages = messages.filter(m => m.conversationId !== conversationId);
    
    saveData(CONVERSATIONS_FILE, conversations);
    saveData(MESSAGES_FILE, messages);
    
    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Support Panel Endpoints

// Get all reports
app.get('/api/support/reports', (req, res) => {
  try {
    const userId = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if user is admin (you can implement proper admin check)
    const currentUser = users.find(u => u.uid === userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize reports if not exists
    if (!global.reports) {
      global.reports = [];
    }

    // Enrich reports with user information
    const enrichedReports = global.reports.map(report => {
      const reportedUser = users.find(u => u.uid === report.reportedUserId);
      const reporter = users.find(u => u.uid === report.reporterId);
      
      return {
        ...report,
        reportedUser: reportedUser ? {
          uid: reportedUser.uid,
          username: reportedUser.username,
          email: reportedUser.email
        } : null,
        reporter: reporter ? {
          uid: reporter.uid,
          username: reporter.username,
          email: reporter.email
        } : null,
        createdAt: report.timestamp,
        priority: report.priority || 'medium'
      };
    });

    res.json({ reports: enrichedReports });
  } catch (error) {
    console.error('Error getting reports:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get support stats
app.get('/api/support/stats', (req, res) => {
  try {
    const userId = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Initialize reports if not exists
    if (!global.reports) {
      global.reports = [];
    }

    const stats = {
      total: global.reports.length,
      pending: global.reports.filter(r => r.status === 'pending').length,
      resolved: global.reports.filter(r => r.status === 'resolved').length,
      urgent: global.reports.filter(r => r.status === 'urgent').length
    };

    res.json({ stats });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update report status
app.post('/api/support/reports/:reportId/:action', (req, res) => {
  try {
    const { reportId, action } = req.params;
    const { response } = req.body;
    const userId = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Initialize reports if not exists
    if (!global.reports) {
      global.reports = [];
    }

    const report = global.reports.find(r => r.id === reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Update report based on action
    if (action === 'resolve') {
      report.status = 'resolved';
      report.resolvedAt = new Date().toISOString();
      report.resolvedBy = userId;
    } else if (action === 'urgent') {
      report.status = 'urgent';
      report.priority = 'high';
    }

    if (response) {
      report.response = response;
      report.responseAt = new Date().toISOString();
      report.respondedBy = userId;
    }

    // Save reports to file
    const REPORTS_FILE = path.join(DATA_DIR, 'reports.json');
    saveData(REPORTS_FILE, global.reports);
    
    res.json({ 
      message: 'Report updated successfully',
      report
    });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get blocked users for a user
app.get('/api/users/:userId/blocked', (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.headers.authorization?.replace('Bearer ', '');
    
    if (!currentUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (userId !== currentUserId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const currentUser = users.find(u => u.uid === currentUserId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get blocked users with their details
    const blockedUsers = (currentUser.blockedUsers || []).map(blockedUserId => {
      const blockedUser = users.find(u => u.uid === blockedUserId);
      return blockedUser ? {
        uid: blockedUser.uid,
        username: blockedUser.username,
        email: blockedUser.email,
        fullName: blockedUser.fullName || blockedUser.username,
        blockedAt: blockedUser.blockedAt || new Date().toISOString()
      } : null;
    }).filter(Boolean);

    res.json({ blockedUsers });
  } catch (error) {
    console.error('Error getting blocked users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all users (admin only)
app.get('/api/users', (req, res) => {
  try {
    const userId = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!isAdmin(userId)) {
      return res.status(403).json({ message: 'Forbidden - Admin access required' });
    }

    // Return users with sensitive data filtered out
    const safeUsers = users.map(user => ({
      uid: user.uid,
      username: user.username,
      email: user.email,
      fullName: user.fullName || user.username,
      isAdmin: user.isAdmin || false,
      createdAt: user.createdAt || user.timestamp,
      lastSeen: user.lastSeen,
      isVerified: user.isVerified || false,
      totalBookings: bookings.filter(b => b.userId === user.uid).length,
      totalSpots: parkingSpots.filter(s => s.owner === user.uid).length
    }));

    res.json({ users: safeUsers });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user details (admin only)
app.get('/api/users/:userId/details', (req, res) => {
  try {
    const { userId } = req.params;
    const adminUserId = req.headers.authorization?.replace('Bearer ', '');
    
    if (!adminUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!isAdmin(adminUserId)) {
      return res.status(403).json({ message: 'Forbidden - Admin access required' });
    }

    const user = users.find(u => u.uid === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's bookings
    const userBookings = bookings.filter(b => b.userId === userId);
    
    // Get user's spots
    const userSpots = parkingSpots.filter(s => s.owner === userId);
    
    // Get user's reports (as reporter)
    const userReports = (global.reports || []).filter(r => r.reporterId === userId);
    
    // Get reports against user
    const reportsAgainstUser = (global.reports || []).filter(r => r.reportedUserId === userId);

    // Get user presence status
    const presenceStatus = getUserPresenceStatus(userId);

    const userDetails = {
      uid: user.uid,
      username: user.username,
      email: user.email,
      fullName: user.fullName || user.username,
      isAdmin: user.isAdmin || false,
      isVerified: user.isVerified || false,
      createdAt: user.createdAt || user.timestamp,
      lastSeen: user.lastSeen,
      totalBookings: userBookings.length,
      totalSpots: userSpots.length,
      totalReports: userReports.length,
      reportsAgainst: reportsAgainstUser.length,
      bookings: userBookings.slice(0, 10), // Last 10 bookings
      spots: userSpots.slice(0, 10), // Last 10 spots
      reports: userReports.slice(0, 10), // Last 10 reports
      reportsAgainst: reportsAgainstUser.slice(0, 10), // Last 10 reports against
      // Presence information
      presence: presenceStatus
    };

    res.json({ user: userDetails });
  } catch (error) {
    console.error('Error getting user details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user presence status (public endpoint)
app.get('/api/users/:userId/presence', (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.headers.authorization?.replace('Bearer ', '');
    
    if (!requestingUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = users.find(u => u.uid === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const presenceStatus = getUserPresenceStatus(userId);

    res.json({ 
      userId,
      username: user.username,
      presence: presenceStatus
    });
  } catch (error) {
    console.error('Error getting user presence:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all online users (admin only)
app.get('/api/admin/online-users', (req, res) => {
  try {
    const adminUserId = req.headers.authorization?.replace('Bearer ', '');
    
    if (!adminUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!isAdmin(adminUserId)) {
      return res.status(403).json({ message: 'Forbidden - Admin access required' });
    }

    const onlineUsers = [];
    userPresence.forEach((presence, userId) => {
      const user = users.find(u => u.uid === userId);
      if (user && presence.status !== 'offline') {
        onlineUsers.push({
          uid: userId,
          username: user.username,
          email: user.email,
          status: presence.status,
          lastSeen: presence.lastSeen,
          lastActivity: presence.lastActivity
        });
      }
    });

    res.json({ 
      onlineUsers,
      totalOnline: onlineUsers.length,
      totalUsers: users.length
    });
  } catch (error) {
    console.error('Error getting online users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user role (admin only)
app.patch('/api/users/:userId/role', (req, res) => {
  try {
    const { userId } = req.params;
    const adminUserId = req.headers.authorization?.replace('Bearer ', '');
    const { isAdmin: newAdminStatus } = req.body;
    
    if (!adminUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!isAdmin(adminUserId)) {
      return res.status(403).json({ message: 'Forbidden - Admin access required' });
    }

    const user = users.find(u => u.uid === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isAdmin = newAdminStatus;
    saveData(USERS_FILE, users);

    res.json({ 
      message: 'User role updated successfully',
      user: {
        uid: user.uid,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Ban/Unban user (admin only)
app.patch('/api/users/:userId/ban', (req, res) => {
  try {
    const { userId } = req.params;
    const adminUserId = req.headers.authorization?.replace('Bearer ', '');
    const { banned, reason } = req.body;
    
    if (!adminUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!isAdmin(adminUserId)) {
      return res.status(403).json({ message: 'Forbidden - Admin access required' });
    }

    const user = users.find(u => u.uid === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.banned = banned;
    user.bannedAt = banned ? new Date().toISOString() : null;
    user.banReason = banned ? reason : null;
    user.bannedBy = banned ? adminUserId : null;
    
    saveData(USERS_FILE, users);

    res.json({ 
      message: `User ${banned ? 'banned' : 'unbanned'} successfully`,
      user: {
        uid: user.uid,
        username: user.username,
        email: user.email,
        banned: user.banned,
        bannedAt: user.bannedAt,
        banReason: user.banReason
      }
    });
  } catch (error) {
    console.error('Error updating user ban status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get system analytics (admin only)
app.get('/api/admin/analytics', (req, res) => {
  try {
    const userId = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!isAdmin(userId)) {
      return res.status(403).json({ message: 'Forbidden - Admin access required' });
    }

    // Calculate analytics
    const totalUsers = users.length;
    const totalSpots = parkingSpots.length;
    const totalBookings = bookings.length;
    const totalTickets = supportTickets.length;
    const totalReports = (global.reports || []).length;

    // Active users (users with bookings in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = users.filter(user => {
      const userBookings = bookings.filter(b => b.userId === user.uid);
      return userBookings.some(b => new Date(b.createdAt) > thirtyDaysAgo);
    }).length;

    // Revenue analytics (if payment data exists)
    const totalRevenue = bookings.reduce((sum, booking) => {
      return sum + (booking.amount || 0);
    }, 0);

    // Popular spots
    const spotBookings = {};
    bookings.forEach(booking => {
      if (booking.spotId) {
        spotBookings[booking.spotId] = (spotBookings[booking.spotId] || 0) + 1;
      }
    });

    const popularSpots = Object.entries(spotBookings)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([spotId, count]) => {
        const spot = parkingSpots.find(s => s.id === spotId);
        return {
          spotId,
          location: spot?.location || 'Unknown',
          bookings: count
        };
      });

    // Recent activity
    const recentBookings = bookings
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    const recentTickets = supportTickets
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    const analytics = {
      overview: {
        totalUsers,
        totalSpots,
        totalBookings,
        totalTickets,
        totalReports,
        activeUsers,
        totalRevenue: totalRevenue.toFixed(2)
      },
      popularSpots,
      recentBookings,
      recentTickets,
      generatedAt: new Date().toISOString()
    };

    res.json({ analytics });
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all parking spots (admin only)
app.get('/api/admin/spots', (req, res) => {
  try {
    const userId = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!isAdmin(userId)) {
      return res.status(403).json({ message: 'Forbidden - Admin access required' });
    }

    const spotsWithDetails = parkingSpots.map(spot => {
      const owner = users.find(u => u.uid === spot.owner);
      const spotBookings = bookings.filter(b => b.spotId === spot.id);
      
      return {
        ...spot,
        ownerDetails: owner ? {
          uid: owner.uid,
          username: owner.username,
          email: owner.email
        } : null,
        totalBookings: spotBookings.length,
        revenue: spotBookings.reduce((sum, b) => sum + (b.amount || 0), 0)
      };
    });

    res.json({ spots: spotsWithDetails });
  } catch (error) {
    console.error('Error getting spots:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all bookings (admin only)
app.get('/api/admin/bookings', (req, res) => {
  try {
    const userId = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!isAdmin(userId)) {
      return res.status(403).json({ message: 'Forbidden - Admin access required' });
    }

    const bookingsWithDetails = bookings.map(booking => {
      const user = users.find(u => u.uid === booking.userId);
      const spot = parkingSpots.find(s => s.id === booking.spotId);
      const owner = spot ? users.find(u => u.uid === spot.owner) : null;
      
      return {
        ...booking,
        userDetails: user ? {
          uid: user.uid,
          username: user.username,
          email: user.email
        } : null,
        spotDetails: spot ? {
          id: spot.id,
          location: spot.location,
          title: spot.title
        } : null,
        ownerDetails: owner ? {
          uid: owner.uid,
          username: owner.username,
          email: owner.email
        } : null
      };
    });

    res.json({ bookings: bookingsWithDetails });
  } catch (error) {
    console.error('Error getting bookings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete spot (admin only)
app.delete('/api/admin/spots/:spotId', (req, res) => {
  try {
    const { spotId } = req.params;
    const userId = req.headers.authorization?.replace('Bearer ', '');
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!isAdmin(userId)) {
      return res.status(403).json({ message: 'Forbidden - Admin access required' });
    }

    const spotIndex = parkingSpots.findIndex(s => s.id === spotId);
    if (spotIndex === -1) {
      return res.status(404).json({ message: 'Spot not found' });
    }

    // Remove spot
    parkingSpots.splice(spotIndex, 1);
    saveData(SPOTS_FILE, parkingSpots);

    // Cancel all bookings for this spot
    const spotBookings = bookings.filter(b => b.spotId === spotId);
    spotBookings.forEach(booking => {
      booking.status = 'cancelled';
      booking.cancelledAt = new Date().toISOString();
      booking.cancelledBy = userId;
      booking.cancelReason = 'Spot removed by admin';
    });
    saveData(BOOKINGS_FILE, bookings);

    res.json({ 
      message: 'Spot deleted successfully',
      cancelledBookings: spotBookings.length
    });
  } catch (error) {
    console.error('Error deleting spot:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Cancel booking (admin only)
app.patch('/api/admin/bookings/:bookingId/cancel', (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.headers.authorization?.replace('Bearer ', '');
    const { reason } = req.body;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!isAdmin(userId)) {
      return res.status(403).json({ message: 'Forbidden - Admin access required' });
    }

    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date().toISOString();
    booking.cancelledBy = userId;
    booking.cancelReason = reason || 'Cancelled by admin';

    saveData(BOOKINGS_FILE, bookings);

    res.json({ 
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
