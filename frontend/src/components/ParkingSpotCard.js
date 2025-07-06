import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  Rating,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert,
  Snackbar,
  Avatar,
  Tooltip,
  Fade,
  Divider,
  Badge,
  LinearProgress,
  Skeleton,
  CardActionArea,
  Stack,
  Paper,
} from '@mui/material';
import {
  LocationOn,
  AccessTime,
  AttachMoney,
  Favorite,
  FavoriteBorder,
  Message,
  Info,
  TrendingUp,
  Circle,
  VerifiedUser,
  LocalParking,
  ElectricCar,
  Security,
  DirectionsCar,
  DirectionsWalk,
  DirectionsBike,
  LocalTaxi,
  Schedule,
  Star,

  Share,
  Phone,
  Email,
  CalendarToday,
  CheckCircle,
  Cancel,
  Warning,
  Speed,
  WifiTethering,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useRealtime } from '../contexts/RealtimeContext';
import PaymentModal from './PaymentModal';
import './ParkingSpotCard.css';
import { useAuth } from '../contexts/AuthContext';

const ParkingSpotCard = ({ spot, onBook, onFavorite, onShare, user, onMessage, isFavorite, onToggleFavorite }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Check if this is the current user's listing
  const isMyListing = currentUser && spot.owner === currentUser.uid;
  const { spotStatus, isConnected, socket } = useRealtime();
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '10:00',
    hours: 2,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [ownerOnline, setOwnerOnline] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Join/leave spot room for real-time updates
  useEffect(() => {
    if (spot.id && isConnected && socket) {
      socket.emit('join-spot-room', spot.id);
      return () => {
        socket.emit('leave-spot-room', spot.id);
      };
    }
  }, [spot.id, isConnected, socket]);

  // Use real-time status if available, otherwise fall back to spot data
  const isAvailable = spotStatus?.available !== undefined ? spotStatus.available : spot.available;
  
  // Check if owner is online (placeholder function - implement based on your real-time system)
  const isUserOnline = (userId) => {
    // This should be implemented based on your real-time user status system
    return false; // Placeholder - always returns false for now
  };

  // Placeholder function for sending messages (implement based on your messaging system)
  const sendMessage = async (recipientId, message) => {
    // This should be implemented based on your messaging system
    console.log(`Sending message to ${recipientId}: ${message}`);
    // TODO: Implement actual message sending functionality
    return true; // Placeholder - always returns success for now
  };

  // Update owner online status
  useEffect(() => {
    if (spot.owner) {
      setOwnerOnline(isUserOnline(spot.owner));
    }
  }, [spot.owner]);

  const handleFavorite = () => {
    if (onToggleFavorite) {
      onToggleFavorite();
    }
  };

  const handleBook = () => {
    if (!currentUser) {
      setError('Please log in to book a parking spot');
      return;
    }
    setShowBookingDialog(true);
  };

  const handleMessage = () => {
    setShowMessageDialog(true);
  };

  const handleBookingSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Validate date and time inputs
      if (!bookingData.date || !bookingData.startTime) {
        throw new Error('Please select both date and start time');
      }

      // Create a valid date string and validate it
      const dateTimeString = `${bookingData.date}T${bookingData.startTime}`;
      const startDateTime = new Date(dateTimeString);
      
      // Check if the date is valid
      if (isNaN(startDateTime.getTime())) {
        throw new Error('Invalid date or time selected');
      }

      // Calculate end time
      const endDateTime = new Date(startDateTime.getTime() + (bookingData.hours * 60 * 60 * 1000));
      
      // Validate end time
      if (isNaN(endDateTime.getTime())) {
        throw new Error('Invalid end time calculation');
      }

      // Calculate total price
      const totalPrice = spot.price * bookingData.hours;
      setPaymentAmount(totalPrice);
      
      // Set up booking data for payment modal with validated dates
      setBookingData({
        ...bookingData,
        totalPrice: totalPrice,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString()
      });
      
      // Close booking dialog and show payment modal
      setShowBookingDialog(false);
      setShowPaymentModal(true);
      
    } catch (err) {
      console.error('Booking setup error:', err);
      setError(err.message || 'Failed to set up booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentResult) => {
    try {
      console.log('Payment successful:', paymentResult);
      
      // Create booking with payment confirmation
      const bookingResponse = await fetch('http://localhost:3001/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spotId: spot.id,
          userId: currentUser.uid,
          startTime: bookingData.startTime,
          endTime: bookingData.endTime,
          totalPrice: paymentAmount,
          paymentIntentId: paymentResult.paymentIntent.id,
          status: 'confirmed'
        }),
      });

      if (!bookingResponse.ok) {
        throw new Error('Failed to create booking');
      }

      const booking = await bookingResponse.json();
      
      setSnackbarMessage('Booking confirmed! Check your email for details.');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      setShowPaymentModal(false);
      
      // Navigate to booking details or dashboard
      navigate('/bookings');
      
    } catch (error) {
      console.error('Booking creation error:', error);
      setSnackbarMessage('Payment successful but booking creation failed. Please contact support.');
      setSnackbarSeverity('warning');
      setOpenSnackbar(true);
    }
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setSnackbarMessage('Payment failed. Please try again.');
    setSnackbarSeverity('error');
    setOpenSnackbar(true);
  };

  const handleMessageSubmit = async (message) => {
    try {
      const success = await sendMessage(spot.owner, message);
      if (success) {
        setSnackbarMessage('Message sent successfully!');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
        setShowMessageDialog(false);
      } else {
        setSnackbarMessage('Failed to send message. Please try again.');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error('Message error:', error);
      setSnackbarMessage('Failed to send message. Please try again.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const calculateDistance = (distance) => {
    if (!distance) return 'Distance not available';
    if (distance < 1) return `${Math.round(distance * 1000)}m away`;
    return `${distance.toFixed(1)}km away`;
  };

  const getAvailabilityColor = (available) => {
    return available ? 'success' : 'error';
  };

  const getAvailabilityText = (available) => {
    return available ? 'Available' : 'Unavailable';
  };

  const getLastUpdatedText = () => {
    if (!spotStatus?.lastUpdated) return null;
    
    const now = new Date();
    const lastUpdated = new Date(spotStatus.lastUpdated);
    const diffInMinutes = Math.floor((now - lastUpdated) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getSpotImage = () => {
    // Check if spot has images array and use the first image
    if (spot.images && spot.images.length > 0) {
      // If images is an array of URLs or base64 data, use the first one
      if (typeof spot.images[0] === 'string') {
        return spot.images[0];
      }
      // If images is an array of objects with data property (base64)
      if (spot.images[0] && typeof spot.images[0] === 'object' && spot.images[0].data) {
        return spot.images[0].data;
      }
      // If images is an array of File objects, create object URL
      if (spot.images[0] instanceof File) {
        return URL.createObjectURL(spot.images[0]);
      }
    }
    
    // Check for single imageUrl property
    if (spot.imageUrl) return spot.imageUrl;
    
    // Default images based on vehicle type
    const defaultImages = {
      car: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=300&fit=crop',
      motorcycle: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      bicycle: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=300&fit=crop',
      truck: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=300&fit=crop',
    };
    
    return defaultImages[spot.vehicleType?.toLowerCase()] || defaultImages.car;
  };

  const getVehicleIcon = (vehicleType) => {
    const icons = {
      car: <DirectionsCar sx={{ fontSize: 16 }} />,
      motorcycle: <DirectionsBike sx={{ fontSize: 16 }} />,
      bicycle: <DirectionsBike sx={{ fontSize: 16 }} />,
      truck: <DirectionsCar sx={{ fontSize: 16 }} />,
    };
    return icons[vehicleType?.toLowerCase()] || <LocalParking sx={{ fontSize: 16 }} />;
  };

  const getAmenityIcon = (amenity) => {
    const icons = {
      'Security Camera': <Security sx={{ fontSize: 16 }} />,
      'Electric Charging': <ElectricCar sx={{ fontSize: 16 }} />,
      'Covered': <LocalParking sx={{ fontSize: 16 }} />,
      '24/7 Access': <AccessTime sx={{ fontSize: 16 }} />,
      'WiFi': <WifiTethering sx={{ fontSize: 16 }} />,
      'Well Lit': <Visibility sx={{ fontSize: 16 }} />,
    };
    return icons[amenity] || <CheckCircle sx={{ fontSize: 16 }} />;
  };



  // Airbnb-style price
  const priceText = `₹${spot.price}/hr`;

  // Airbnb-style rating
  const rating = spot.rating || 0;



  // Status chip styling
  const statusChipStyle = {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: spot.available ? '#34C759' : '#FF3B30',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    zIndex: 2,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  return (
    <>
      <Card 
        className="airbnb-parking-card"
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          cursor: 'pointer',
          borderRadius: 3,
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DDDDDD',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            borderColor: '#FF385C',
            '& .card-media': {
              transform: 'scale(1.05)',
            },
            '& .price-badge': {
              transform: 'scale(1.05)',
            },
            '& .favorite-button': {
              opacity: 1,
            },
          },
        }}
        onClick={() => navigate(`/spot/${spot.id}`)}
      >
        {/* Image Section */}
        <Box sx={{ position: 'relative', height: 240 }}>
          {!imageLoaded && !imageError && (
            <Skeleton 
              variant="rectangular" 
              height={240} 
              sx={{ bgcolor: '#F7F7F7' }}
            />
          )}
          <CardMedia
            component="img"
            height="240"
            image={getSpotImage()}
            alt={spot.title || 'Parking Spot'}
            className="card-media"
            sx={{ 
              objectFit: 'cover',
              width: '100%',
              height: '100%',
              transition: 'transform 0.3s ease',
              display: imageLoaded ? 'block' : 'none',
            }}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
          />
          
          {/* Status Chip */}
          <div style={statusChipStyle}>
            {spot.available ? 'Available' : 'Occupied'}
          </div>

          {/* My Listing Indicator */}
          {isMyListing && (
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              backgroundColor: '#007AFF',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600',
              zIndex: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              My Listing
            </div>
          )}

          {/* Favorite Button */}
          <IconButton 
            onClick={(e) => {
              e.stopPropagation();
              handleFavorite();
            }}
            className="favorite-button"
            sx={{ 
              position: 'absolute',
              top: isMyListing ? 50 : 12,
              left: 12,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              color: isFavorite ? '#FF385C' : '#222222',
              opacity: isFavorite ? 1 : 0.8,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                transform: 'scale(1.1)',
                color: '#FF385C',
              },
            }}
          >
            {isFavorite ? <Favorite /> : <FavoriteBorder />}
          </IconButton>





          {/* Vehicle Type Badge */}
          {spot.vehicleType && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 12,
                right: 12,
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                fontSize: '0.75rem',
                fontWeight: 500,
                backdropFilter: 'blur(10px)',
              }}
            >
              {getVehicleIcon(spot.vehicleType)}
              {spot.vehicleType}
            </Box>
          )}


        </Box>
        
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
          {/* Title */}
          <Typography 
            variant="h6" 
            component="h2" 
            sx={{ 
              fontSize: '1.1rem',
              fontWeight: 600,
              lineHeight: 1.3,
              color: '#222222',
              mb: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {spot.title}
          </Typography>

          {/* Rating and Reviews */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
            <Rating 
              value={rating} 
              readOnly 
              size="small" 
              sx={{ mr: 1, '& .MuiRating-iconFilled': { color: '#FF385C' } }}
            />
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#717171',
                fontSize: '0.8rem',
                fontWeight: 400
              }}
            >
              {rating.toFixed(2)}
            </Typography>
          </Box>

          {/* Distance */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
            <AccessTime sx={{ fontSize: 16, color: '#717171', mr: 0.5 }} />
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#717171',
                fontSize: '0.85rem',
                fontWeight: 400
              }}
            >
              {calculateDistance(spot.distance)}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Booking Dialog */}
      <Dialog 
        open={showBookingDialog} 
        onClose={() => setShowBookingDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            Book Parking Spot
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            {spot.title}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Date"
                type="date"
                value={bookingData.date}
                onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Start Time"
                type="time"
                value={bookingData.startTime}
                onChange={(e) => setBookingData({ ...bookingData, startTime: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Hours"
                type="number"
                value={bookingData.hours}
                onChange={(e) => setBookingData({ ...bookingData, hours: parseInt(e.target.value) || 1 })}
                fullWidth
                inputProps={{ min: 1, max: 24 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Total Price:</Typography>
                <Typography variant="h6" color="primary.main" fontWeight="bold">
                  ₹{(spot.price * bookingData.hours).toFixed(2)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setShowBookingDialog(false)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleBookingSubmit} 
            variant="contained"
            disabled={loading || !bookingData.startTime}
            sx={{
              background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
              }
            }}
          >
            {loading ? 'Booking...' : 'Confirm Booking'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Message Dialog */}
      <Dialog 
        open={showMessageDialog} 
        onClose={() => setShowMessageDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          }
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Message {spot.ownerName}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Send a message about this parking spot
          </Typography>
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Message"
            multiline
            rows={4}
            fullWidth
            placeholder="Hi! I'm interested in your parking spot..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setShowMessageDialog(false)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={() => handleMessageSubmit("Hi! I'm interested in your parking spot.")}
            sx={{
              background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
              }
            }}
          >
            Send Message
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Payment Modal */}
      <PaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        booking={{
          id: paymentIntent?.bookingId || `temp_${Date.now()}`,
          spotId: spot.id,
          userId: currentUser?.uid,
          userName: currentUser?.displayName || currentUser?.email,
          spotLocation: spot.title || spot.location,
          startTime: bookingData.startTime,
          endTime: bookingData.endTime,
          totalPrice: paymentAmount,
          duration: `${bookingData.hours} hour${bookingData.hours > 1 ? 's' : ''}`,
          status: 'pending_payment'
        }}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
      />
    </>
  );
};

export default ParkingSpotCard; 