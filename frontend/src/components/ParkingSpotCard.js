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
  Bookmark,
  BookmarkBorder,
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
        hours: 2,
      });
      
      // Show success message
      setSnackbarMessage('Booking successful! Check your email for confirmation.');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      
    } catch (err) {
      console.error('Payment success handling error:', err);
      setSnackbarMessage('Booking successful but there was an issue updating the UI.');
      setSnackbarSeverity('warning');
      setOpenSnackbar(true);
    }
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setSnackbarMessage('Payment failed. Please try again.');
    setSnackbarSeverity('error');
    setOpenSnackbar(true);
    setShowPaymentModal(false);
  };

  const handleMessageSubmit = async (message) => {
    try {
      await sendMessage(spot.owner, message);
      setShowMessageDialog(false);
      setSnackbarMessage('Message sent successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
    } catch (error) {
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

  const getSpotImage = () => {
    if (imageError) {
      return `https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=200&fit=crop`;
    }
    
    if (spot.images && spot.images.length > 0) {
      return typeof spot.images[0] === 'string' 
        ? spot.images[0] 
        : spot.images[0].url || spot.images[0].preview;
    }
    
    return `https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=200&fit=crop`;
  };

  const getVehicleIcon = (vehicleType) => {
    switch (vehicleType?.toLowerCase()) {
      case 'car':
        return <DirectionsCar />;
      case 'suv':
        return <DirectionsCar />;
      case 'truck':
        return <DirectionsCar />;
      case 'motorcycle':
        return <DirectionsBike />;
      default:
        return <LocalParking />;
    }
  };

  const getAmenityIcon = (amenity) => {
    switch (amenity?.toLowerCase()) {
      case 'electric':
      case 'charging':
        return <ElectricCar />;
      case 'security':
      case 'camera':
        return <Security />;
      case 'covered':
        return <LocalParking />;
      default:
        return <CheckCircle />;
    }
  };

  return (
    <>
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          cursor: 'pointer',
          borderRadius: 4,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          '&:hover': {
            transform: 'translateY(-12px) scale(1.02)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            borderColor: '#22C55E',
            '& .card-media': {
              transform: 'scale(1.05)',
            },
            '& .price-badge': {
              transform: 'scale(1.1)',
            },
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
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 3,
              px: 1.5,
              py: 0.5,
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
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

        {/* Image Section */}
        <Box sx={{ position: 'relative', height: 220 }}>
          {!imageLoaded && !imageError && (
            <Skeleton 
              variant="rectangular" 
              height={220} 
              sx={{ bgcolor: 'rgba(0,0,0,0.1)' }}
            />
          )}
          <CardMedia
            component="img"
            height="220"
            image={getSpotImage()}
            alt={spot.title || 'Parking Spot'}
            className="card-media"
            sx={{ 
              objectFit: 'cover',
              width: '100%',
              height: '100%',
              transition: 'transform 0.4s ease',
              display: imageLoaded ? 'block' : 'none',
            }}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
          />
          
          {/* Gradient overlay */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '70%',
              background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
            }}
          />
          
          {/* Price badge */}
          <Box
            className="price-badge"
            sx={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
              color: 'white',
              px: 2.5,
              py: 1,
              borderRadius: 3,
              fontWeight: 'bold',
              fontSize: '1rem',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              transition: 'transform 0.3s ease',
            }}
          >
            ₹{spot.price}/hr
          </Box>

          {/* Vehicle type indicator */}
          {spot.vehicleType && (
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                fontSize: '0.8rem',
                fontWeight: 500,
                backdropFilter: 'blur(10px)',
              }}
            >
              {getVehicleIcon(spot.vehicleType)}
              {spot.vehicleType}
            </Box>
          )}
        </Box>
        
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
          {/* Header with title and favorite button */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography 
              variant="h6" 
              component="h2" 
              fontWeight="700" 
              sx={{ 
                flex: 1,
                fontSize: '1.2rem',
                lineHeight: 1.3,
                color: '#1e293b',
                mb: 0.5,
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
                  transform: 'scale(1.15)',
                  bgcolor: 'rgba(239, 68, 68, 0.1)',
                },
                transition: 'all 0.2s ease'
              }}
            >
              {isFavorite ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
          </Box>

          {/* Location */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
            <LocationOn sx={{ fontSize: 18, color: '#64748b', mr: 1 }} />
            <Typography 
              variant="body2" 
              sx={{ 
                flex: 1,
                color: '#64748b',
                fontSize: '0.9rem',
                fontWeight: 500,
                lineHeight: 1.4,
              }}
            >
              {spot.address}
            </Typography>
          </Box>

          {/* Rating and reviews */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating 
              value={spot.rating || 0} 
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
              {spot.rating || 0} ({spot.reviewCount || 0} reviews)
            </Typography>
          </Box>

          {/* Distance */}
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

          {/* Features/Amenities */}
          {spot.features && spot.features.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
              {spot.features.slice(0, 3).map((feature, index) => (
                <Chip
                  key={index}
                  label={feature}
                  size="small"
                  variant="outlined"
                  icon={getAmenityIcon(feature)}
                  sx={{ 
                    fontSize: '0.7rem',
                    height: 26,
                    borderColor: '#e2e8f0',
                    color: '#64748b',
                    '&:hover': {
                      borderColor: '#22C55E',
                      color: '#22C55E',
                      bgcolor: 'rgba(34, 197, 94, 0.05)',
                    },
                    transition: 'all 0.2s ease'
                  }}
                />
              ))}
              {spot.features.length > 3 && (
                <Chip
                  label={`+${spot.features.length - 3} more`}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    fontSize: '0.7rem',
                    height: 26,
                    borderColor: '#e2e8f0',
                    color: '#64748b',
                  }}
                />
              )}
            </Box>
          )}

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
                  height: 26,
                  ...(isAvailable ? {
                    bgcolor: '#22C55E',
                    color: 'white',
                    boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)',
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

          {/* Owner information */}
          {spot.ownerName && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 2, 
              p: 1.5, 
              bgcolor: '#f8fafc', 
              borderRadius: 3,
              border: '1px solid #e2e8f0',
            }}>
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
                    width: 32, 
                    height: 32, 
                    fontSize: '1rem', 
                    mr: 1.5,
                    bgcolor: '#22C55E',
                    fontWeight: 600,
                    boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)',
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

          {/* Action buttons */}
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
                background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.9rem',
                py: 1.2,
                borderRadius: 3,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                  boxShadow: '0 6px 16px rgba(34, 197, 94, 0.4)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.3s ease'
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