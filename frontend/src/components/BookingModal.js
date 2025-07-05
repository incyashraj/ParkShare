import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRealtime } from '../contexts/RealtimeContext';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  Grid,
  Divider,
  Snackbar,
} from '@mui/material';
import ReceiptDownload from './ReceiptDownload';

function BookingModal({ open, onClose, spot }) {
  const navigate = useNavigate();
  const { addNotification } = useRealtime();
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Set default dates when modal opens
  useEffect(() => {
    if (open) {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      setStartDate(now.toISOString().split('T')[0]);
      setStartTime(now.toTimeString().slice(0, 5));
      setEndDate(tomorrow.toISOString().split('T')[0]);
      setEndTime(now.toTimeString().slice(0, 5));
    }
  }, [open]);

  const calculateTotalPrice = () => {
    if (!startDate || !startTime || !endDate || !endTime) return 0;
    
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);
    
    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) return 0;
    
    const hours = Math.ceil((endDateTime - startDateTime) / (1000 * 60 * 60));
    const rate = parseFloat(spot.hourlyRate.replace(/[^0-9.]/g, ''));
    return Math.max(0, hours * rate);
  };

  const handleBooking = async () => {
    console.log('handleBooking called');
    console.log('currentUser:', currentUser);
    console.log('startDate:', startDate, 'startTime:', startTime);
    console.log('endDate:', endDate, 'endTime:', endTime);
    console.log('spot:', spot);

    if (!currentUser) {
      setError('Please log in to book a parking spot');
      return;
    }

    if (!startDate || !startTime || !endDate || !endTime) {
      setError('Please select both start and end dates/times');
      return;
    }

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);
    
    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      setError('Please enter valid dates and times');
      return;
    }

    if (endDateTime <= startDateTime) {
      setError('End time must be after start time');
      return;
    }

    const hours = Math.ceil((endDateTime - startDateTime) / (1000 * 60 * 60));
    if (spot.maxDuration && hours > spot.maxDuration) {
      setError(`Maximum parking duration is ${spot.maxDuration} hours`);
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess(false);

    try {
      // Create booking data
      const bookingData = {
        spotId: spot.id,
        userId: currentUser?.uid,
        userName: currentUser?.displayName || currentUser?.email,
        userEmail: currentUser?.email,
        spotTitle: spot.title || spot.location,
        spotLocation: spot.location,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        hours: hours,
        totalPrice: calculateTotalPrice(),
        hourlyRate: spot.hourlyRate
      };
      
      console.log('Creating booking with data:', bookingData);

      // Call the backend to create the booking
      const response = await fetch(`http://localhost:3001/parking-spots/${spot.id}/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create booking');
      }

      const result = await response.json();
      console.log('Booking created successfully:', result);
      
      setSuccess(true);
      setBookingData(result.booking);
      
      // Show success notification
      setShowSuccessSnackbar(true);
      
      // Add notification to the notification center
      const notification = {
        id: Date.now(),
        type: 'booking',
        title: 'Booking Confirmed! 🎉',
        message: `Your booking for ${result.booking.spotTitle || result.booking.spotLocation} has been confirmed.`,
        data: {
          bookingId: result.booking.id,
          spotId: result.booking.spotId,
          type: 'booking-confirmation'
        },
        timestamp: new Date(),
        read: false
      };
      
      // Add to notifications context
      addNotification(notification);
      
    } catch (error) {
      console.error('Error creating booking:', error);
      setError(error.message || 'Failed to create booking. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };





  const handleClose = () => {
    onClose(true);
    navigate('/profile');
  };

  const handleNotificationClick = () => {
    // Navigate to the user's bookings page
    navigate('/profile?tab=bookings');
  };

  const getDurationText = () => {
    if (!startDate || !startTime || !endDate || !endTime) return '-';
    
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);
    
    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) return '-';
    
    const hours = Math.ceil((endDateTime - startDateTime) / (1000 * 60 * 60));
    return `${hours} hours`;
  };

  return (
    <>
      <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1E3A8A', color: 'white' }}>
          Book Parking Spot
        </DialogTitle>
        
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {spot?.title || spot?.location}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Listed by: {spot?.ownerName}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Rate: {spot?.hourlyRate}/hour
            </Typography>
            {spot?.maxDuration && (
              <Typography variant="body2" color="text.secondary">
                Maximum duration: {spot?.maxDuration} hours
              </Typography>
            )}
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Start Time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="End Time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                Booking confirmed successfully! Your receipt has been generated.
              </Alert>
              {bookingData && (
                <ReceiptDownload 
                  booking={bookingData}
                  spot={spot}
                  user={currentUser}
                />
              )}
            </Box>
          )}

          <Box sx={{ mt: 3, p: 2, bgcolor: '#F3F4F6', borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Booking Summary
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Duration:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">
                  {getDurationText()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Total Price:
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" fontWeight="bold">
                  {spot?.hourlyRate?.charAt(0)}
                  {calculateTotalPrice()}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => onClose(false)}>
            Cancel
          </Button>
          {!success ? (
            <Button
              variant="contained"
              onClick={handleBooking}
              disabled={isProcessing}
              sx={{
                bgcolor: '#1E3A8A',
                '&:hover': {
                  bgcolor: '#1E40AF',
                },
              }}
            >
              {isProcessing ? 'Processing...' : 'Confirm Booking'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleClose}
              sx={{
                bgcolor: '#1E3A8A',
                '&:hover': {
                  bgcolor: '#1E40AF',
                },
              }}
            >
              View My Bookings
            </Button>
          )}
        </DialogActions>
      </Dialog>



      {/* Success Snackbar */}
      <Snackbar
        open={showSuccessSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSuccessSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSuccessSnackbar(false)}
          severity="success"
          sx={{ width: '100%' }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={handleNotificationClick}
            >
              View Booking
            </Button>
          }
        >
          Booking confirmed successfully! Check your notifications for details.
        </Alert>
      </Snackbar>
    </>
  );
}

export default BookingModal;
