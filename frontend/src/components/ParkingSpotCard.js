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
  Badge
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
  VerifiedUser
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useRealtime } from '../contexts/RealtimeContext';
import PaymentModal from './PaymentModal';
import './ParkingSpotCard.css';
import { useAuth } from '../contexts/AuthContext';

const ParkingSpotCard = ({ spot, onBook, onFavorite, onShare, user, onMessage }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { spotStatus, isConnected, socket } = useRealtime();
  const [isFavorite, setIsFavorite] = useState(spot.isFavorite || false);
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
    setIsFavorite(!isFavorite);
    if (onFavorite) {
      onFavorite(spot.id, !isFavorite);
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
      
      // Call the onBook callback for UI updates
      if (onBook) {
        await onBook({
          spotId: spot.id,
          spotName: spot.title || spot.location,
          startTime: bookingData.startTime,
          endTime: bookingData.endTime,
          date: bookingData.date,
          hours: bookingData.hours,
          totalPrice: paymentAmount,
          bookingId: paymentResult.id || `booking_${Date.now()}`,
        });
      }
      
      // Close all dialogs
      setShowBookingDialog(false);
      setShowPaymentModal(false);
      setPaymentIntent(null);
      setPaymentAmount(0);
      
      // Reset booking data
      setBookingData({
        startTime: '',
        endTime: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        hours: 1,
      });
      
      // Show success message
      setSnackbarMessage('Payment successful! Booking confirmed.');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      
    } catch (err) {
      console.error('Payment success handling error:', err);
      setError(err.message || 'Payment successful but there was an issue. Please contact support.');
      setShowPaymentModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setError('Payment failed. Please try again.');
    setShowPaymentModal(false);
    setLoading(false);
  };

  const handleMessageSubmit = async (message) => {
    if (spot.owner && currentUser) {
      sendMessage(spot.owner, message);
      setShowMessageDialog(false);
    }
  };

  const calculateDistance = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    }
    return `${distance.toFixed(1)}km away`;
  };

  const getAvailabilityColor = (available) => {
    return available ? 'success' : 'error';
  };

  const getAvailabilityText = (available) => {
    return available ? 'Available' : 'Occupied';
  };

  const getLastUpdatedText = () => {
    if (!spotStatus?.lastUpdated) return null;
    
    try {
      const now = new Date();
      const updated = new Date(spotStatus.lastUpdated);
      
      // Check if the date is valid
      if (isNaN(updated.getTime())) {
        return null;
      }
      
      const diff = now - updated;
      const minutes = Math.floor(diff / (1000 * 60));
      
      if (minutes < 1) return 'Just updated';
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      return `${Math.floor(hours / 24)}d ago`;
    } catch (error) {
      console.warn('Error parsing last updated time:', error);
      return null;
    }
  };

  return (
    <>
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'all 0.3s ease',
          position: 'relative',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4,
          },
        }}
      >
        {/* Real-time indicator */}
        <Fade in={isConnected}>
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: 1,
              px: 1,
              py: 0.5,
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: 'success.main',
                animation: 'pulse 2s infinite',
              }}
            />
            <Typography variant="caption" color="success.main" sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}>
              LIVE
            </Typography>
          </Box>
        </Fade>

        <CardMedia
          component="img"
          height="200"
          image={
            spot.images && spot.images.length > 0 
              ? (typeof spot.images[0] === 'string' 
                  ? spot.images[0] 
                  : spot.images[0].url || spot.images[0].preview)
              : `https://via.placeholder.com/400x200/1E3A8A/FFFFFF?text=${encodeURIComponent(spot.title || 'Parking Spot')}`
          }
          alt={spot.title || 'Parking Spot'}
          sx={{ objectFit: 'cover' }}
        />
        
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h6" component="h2" fontWeight="bold" sx={{ flex: 1 }}>
              {spot.title}
            </Typography>
            <IconButton 
              onClick={handleFavorite}
              size="small"
              sx={{ color: isFavorite ? 'error.main' : 'grey.500' }}
            >
              {isFavorite ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
              {spot.address}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating 
              value={spot.rating} 
              readOnly 
              size="small" 
              sx={{ mr: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              {spot.rating} ({spot.reviewCount || 0} reviews)
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AccessTime sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              {calculateDistance(spot.distance)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {spot.features?.map((feature, index) => (
              <Chip
                key={index}
                label={feature}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            ))}
          </Box>

          {/* Real-time availability status */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AttachMoney sx={{ color: 'primary.main', mr: 0.5 }} />
              <Typography variant="h6" color="primary.main" fontWeight="bold">
                ${spot.price}/hr
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
              <Chip
                label={getAvailabilityText(isAvailable)}
                color={getAvailabilityColor(isAvailable)}
                size="small"
                variant={isAvailable ? 'filled' : 'outlined'}
                icon={spotStatus?.lastUpdated ? <TrendingUp /> : undefined}
              />
              {getLastUpdatedText() && (
                <Typography variant="caption" color="text.secondary">
                  {getLastUpdatedText()}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Owner status */}
          {spot.ownerName && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Circle
                    sx={{
                      fontSize: 12,
                      color: ownerOnline ? 'success.main' : 'grey.500',
                    }}
                  />
                }
              >
                <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem', mr: 1 }}>
                  {spot.ownerName.charAt(0).toUpperCase()}
                </Avatar>
              </Badge>
              <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                {spot.ownerName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {spot.isVerifiedHost && (
                  <Tooltip title="Verified Host">
                    <VerifiedUser sx={{ fontSize: 16, color: 'success.main' }} />
                  </Tooltip>
                )}
                <Typography variant="caption" color="text.secondary">
                  {ownerOnline ? 'Online' : 'Offline'}
                </Typography>
              </Box>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Info />}
              fullWidth
              onClick={() => navigate(`/spot/${spot.id}`)}
            >
              Details
            </Button>
            {!spot.isOwner && spot.owner && (
              <Tooltip title="Message owner">
                <IconButton
                  size="small"
                  onClick={handleMessage}
                  disabled={!ownerOnline}
                  sx={{ 
                    color: ownerOnline ? 'primary.main' : 'grey.400',
                    border: '1px solid',
                    borderColor: ownerOnline ? 'primary.main' : 'grey.400',
                  }}
                >
                  <Message />
                </IconButton>
              </Tooltip>
            )}
            <Button
              variant="contained"
              size="small"
              fullWidth
              disabled={!isAvailable || !isConnected}
              onClick={handleBook}
              sx={{ minWidth: 'auto' }}
            >
              {!isConnected ? 'Connecting...' : isAvailable ? 'Book Now' : 'Unavailable'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Booking Dialog */}
      <Dialog 
        open={showBookingDialog} 
        onClose={() => setShowBookingDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Book Parking Spot
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
                  ${(spot.price * bookingData.hours).toFixed(2)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBookingDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleBookingSubmit} 
            variant="contained"
            disabled={loading || !bookingData.startTime}
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
      >
        <DialogTitle>
          Message {spot.ownerName}
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
        <DialogActions>
          <Button onClick={() => setShowMessageDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={() => handleMessageSubmit("Hi! I'm interested in your parking spot.")}
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

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default ParkingSpotCard; 