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
          cursor: 'pointer',
          borderRadius: 3,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid #e2e8f0',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            borderColor: '#22C55E',
          },
        }}
        onClick={() => navigate(`/spot/${spot.id}`)}
      >
        {/* Real-time indicator */}
        <Fade in={isConnected}>
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 2,
              px: 1.5,
              py: 0.5,
              backdropFilter: 'blur(10px)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#22C55E',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': {
                    boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.7)',
                  },
                  '70%': {
                    boxShadow: '0 0 0 10px rgba(34, 197, 94, 0)',
                  },
                  '100%': {
                    boxShadow: '0 0 0 0 rgba(34, 197, 94, 0)',
                  },
                },
              }}
            />
            <Typography 
              variant="caption" 
              sx={{ 
                fontSize: '0.75rem', 
                fontWeight: '700',
                color: '#22C55E',
                letterSpacing: '0.5px'
              }}
            >
              LIVE
            </Typography>
          </Box>
        </Fade>

        <Box sx={{ position: 'relative', height: 200 }}>
          <CardMedia
            component="img"
            height="200"
            image={
              spot.images && spot.images.length > 0 
                ? (typeof spot.images[0] === 'string' 
                    ? spot.images[0] 
                    : spot.images[0].url || spot.images[0].preview)
                : `https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=200&fit=crop`
            }
            alt={spot.title || 'Parking Spot'}
            sx={{ 
              objectFit: 'cover',
              width: '100%',
              height: '100%'
            }}
          />
          {/* Gradient overlay */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '60%',
              background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
            }}
          />
          {/* Price badge */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              background: 'rgba(34, 197, 94, 0.95)',
              color: 'white',
              px: 2,
              py: 0.5,
              borderRadius: 2,
              fontWeight: 'bold',
              fontSize: '0.9rem',
              backdropFilter: 'blur(10px)',
            }}
          >
            ₹{spot.price}/hr
          </Box>
        </Box>
        
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography 
              variant="h6" 
              component="h2" 
              fontWeight="700" 
              sx={{ 
                flex: 1,
                fontSize: '1.1rem',
                lineHeight: 1.3,
                color: '#1e293b'
              }}
            >
              {spot.title}
            </Typography>
            <IconButton 
              onClick={(e) => {
                e.stopPropagation();
                handleFavorite();
              }}
              size="small"
              sx={{ 
                color: isFavorite ? '#ef4444' : '#94a3b8',
                '&:hover': {
                  color: isFavorite ? '#dc2626' : '#ef4444',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease'
              }}
            >
              {isFavorite ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
            <LocationOn sx={{ fontSize: 18, color: '#64748b', mr: 1 }} />
            <Typography 
              variant="body2" 
              sx={{ 
                flex: 1,
                color: '#64748b',
                fontSize: '0.9rem',
                fontWeight: 500
              }}
            >
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
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#64748b',
                fontSize: '0.85rem',
                fontWeight: 500
              }}
            >
              {spot.rating} ({spot.reviewCount || 0} reviews)
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AccessTime sx={{ fontSize: 18, color: '#64748b', mr: 1 }} />
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#64748b',
                fontSize: '0.9rem',
                fontWeight: 500
              }}
            >
              {calculateDistance(spot.distance)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {spot.features?.slice(0, 3).map((feature, index) => (
              <Chip
                key={index}
                label={feature}
                size="small"
                variant="outlined"
                sx={{ 
                  fontSize: '0.7rem',
                  height: 24,
                  borderColor: '#e2e8f0',
                  color: '#64748b',
                  '&:hover': {
                    borderColor: '#22C55E',
                    color: '#22C55E',
                  }
                }}
              />
            ))}
            {spot.features?.length > 3 && (
              <Chip
                label={`+${spot.features.length - 3} more`}
                size="small"
                variant="outlined"
                sx={{ 
                  fontSize: '0.7rem',
                  height: 24,
                  borderColor: '#e2e8f0',
                  color: '#64748b',
                }}
              />
            )}
          </Box>

          {/* Availability status */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
              <Chip
                label={getAvailabilityText(isAvailable)}
                color={getAvailabilityColor(isAvailable)}
                size="small"
                variant={isAvailable ? 'filled' : 'outlined'}
                icon={spotStatus?.lastUpdated ? <TrendingUp /> : undefined}
                sx={{
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  height: 24,
                  ...(isAvailable ? {
                    bgcolor: '#22C55E',
                    color: 'white',
                  } : {
                    borderColor: '#ef4444',
                    color: '#ef4444',
                  })
                }}
              />
              {getLastUpdatedText() && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#94a3b8',
                    fontSize: '0.7rem',
                    fontWeight: 500
                  }}
                >
                  {getLastUpdatedText()}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Owner status */}
          {spot.ownerName && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2 }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Circle
                    sx={{
                      fontSize: 10,
                      color: ownerOnline ? '#22C55E' : '#94a3b8',
                    }}
                  />
                }
              >
                <Avatar 
                  sx={{ 
                    width: 28, 
                    height: 28, 
                    fontSize: '0.9rem', 
                    mr: 1.5,
                    bgcolor: '#22C55E',
                    fontWeight: 600
                  }}
                >
                  {spot.ownerName.charAt(0).toUpperCase()}
                </Avatar>
              </Badge>
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#1e293b',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    mb: 0.5
                  }}
                >
                  {spot.ownerName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {spot.isVerifiedHost && (
                    <Tooltip title="Verified Host">
                      <VerifiedUser sx={{ fontSize: 14, color: '#22C55E' }} />
                    </Tooltip>
                  )}
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: ownerOnline ? '#22C55E' : '#94a3b8',
                      fontSize: '0.75rem',
                      fontWeight: 500
                    }}
                  >
                    {ownerOnline ? 'Online' : 'Offline'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
            {!spot.isOwner && spot.owner && (
              <Tooltip title="Message owner">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMessage();
                  }}
                  disabled={!ownerOnline}
                  sx={{ 
                    color: ownerOnline ? '#22C55E' : '#cbd5e1',
                    border: '1px solid',
                    borderColor: ownerOnline ? '#22C55E' : '#cbd5e1',
                    '&:hover': {
                      bgcolor: ownerOnline ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s ease'
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
              startIcon={<Info />}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/spot/${spot.id}`);
              }}
              sx={{ 
                bgcolor: '#22C55E',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.9rem',
                py: 1,
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                '&:hover': { 
                  bgcolor: '#16A34A',
                  boxShadow: '0 6px 16px rgba(34, 197, 94, 0.4)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease'
              }}
            >
              View Details
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