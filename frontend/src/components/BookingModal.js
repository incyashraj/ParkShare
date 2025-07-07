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
import PaymentModal from './PaymentModal';
import { parse, isValid } from 'date-fns';

function BookingModal({ open, onClose, spot, onBookingComplete }) {
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingBookingDetails, setPendingBookingDetails] = useState(null);

  // Inline error state for each field
  const [fieldErrors, setFieldErrors] = useState({});
  const startDateRef = React.useRef();
  const startTimeRef = React.useRef();
  const endDateRef = React.useRef();
  const endTimeRef = React.useRef();

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
      setError('');
      setSuccess(false);
      setBookingData(null);
      setShowSuccessSnackbar(false);
      setShowPaymentModal(false);
      setPendingBookingDetails(null);
    }
  }, [open]);

  const calculateTotalPrice = () => {
    if (!startDate || !startTime || !endDate || !endTime) return 0;
    
    const startDateTime = parse(`${startDate} ${startTime}`, 'yyyy-MM-dd HH:mm', new Date());
    const endDateTime = parse(`${endDate} ${endTime}`, 'yyyy-MM-dd HH:mm', new Date());
    
    if (!isValid(startDateTime) || !isValid(endDateTime)) return 0;
    
    const hours = Math.ceil((endDateTime - startDateTime) / (1000 * 60 * 60));
    const rate = parseFloat(spot.hourlyRate.replace(/[^0-9.]/g, ''));
    return Math.max(0, hours * rate);
  };

  const validateFields = () => {
    const errors = {};
    if (!startDate) errors.startDate = 'Start date is required';
    if (!startTime) errors.startTime = 'Start time is required';
    if (!endDate) errors.endDate = 'End date is required';
    if (!endTime) errors.endTime = 'End time is required';
    let startDateTime, endDateTime;
    if (startDate && startTime) {
      startDateTime = parse(`${startDate} ${startTime}`, 'yyyy-MM-dd HH:mm', new Date());
      if (!isValid(startDateTime)) {
        errors.startTime = 'Invalid start date/time';
        console.log('Invalid start:', startDate, startTime, startDateTime);
      }
    }
    if (endDate && endTime) {
      endDateTime = parse(`${endDate} ${endTime}`, 'yyyy-MM-dd HH:mm', new Date());
      if (!isValid(endDateTime)) {
        errors.endTime = 'Invalid end date/time';
        console.log('Invalid end:', endDate, endTime, endDateTime);
      }
    }
    if (
      startDate && startTime && endDate && endTime &&
      isValid(startDateTime) && isValid(endDateTime) &&
      endDateTime <= startDateTime
    ) {
      errors.endTime = 'End time must be after start time';
    }
    return errors;
  };

  const allFieldsValid = () => {
    const errors = validateFields();
    return Object.keys(errors).length === 0;
  };

  const handleBooking = () => {
    if (!currentUser) {
      setError('Please log in to book a parking spot');
      return;
    }
    const errors = validateFields();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      // Focus the first invalid field
      if (errors.startDate && startDateRef.current) startDateRef.current.focus();
      else if (errors.startTime && startTimeRef.current) startTimeRef.current.focus();
      else if (errors.endDate && endDateRef.current) endDateRef.current.focus();
      else if (errors.endTime && endTimeRef.current) endTimeRef.current.focus();
      setError('Please fill all required fields correctly');
      return;
    }
    const startDateTime = parse(`${startDate} ${startTime}`, 'yyyy-MM-dd HH:mm', new Date());
    const endDateTime = parse(`${endDate} ${endTime}`, 'yyyy-MM-dd HH:mm', new Date());
    if (!isValid(startDateTime) || !isValid(endDateTime)) {
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
    const bookingDetails = {
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
    setPendingBookingDetails(bookingDetails);
    setShowPaymentModal(true);
    // Do not call onBookingComplete or close the modal yet
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
    
    const startDateTime = parse(`${startDate} ${startTime}`, 'yyyy-MM-dd HH:mm', new Date());
    const endDateTime = parse(`${endDate} ${endTime}`, 'yyyy-MM-dd HH:mm', new Date());
    
    if (!isValid(startDateTime) || !isValid(endDateTime)) return '-';
    
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
                label={<><span style={{color:'red'}}>*</span> Start Date</>}
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setFieldErrors(f => ({...f, startDate: undefined})); }}
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputRef={startDateRef}
                error={!!fieldErrors.startDate}
                helperText={fieldErrors.startDate}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={<><span style={{color:'red'}}>*</span> Start Time</>}
                type="time"
                value={startTime}
                onChange={(e) => { setStartTime(e.target.value); setFieldErrors(f => ({...f, startTime: undefined})); }}
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputRef={startTimeRef}
                error={!!fieldErrors.startTime}
                helperText={fieldErrors.startTime}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={<><span style={{color:'red'}}>*</span> End Date</>}
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setFieldErrors(f => ({...f, endDate: undefined})); }}
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputRef={endDateRef}
                error={!!fieldErrors.endDate}
                helperText={fieldErrors.endDate}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={<><span style={{color:'red'}}>*</span> End Time</>}
                type="time"
                value={endTime}
                onChange={(e) => { setEndTime(e.target.value); setFieldErrors(f => ({...f, endTime: undefined})); }}
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputRef={endTimeRef}
                error={!!fieldErrors.endTime}
                helperText={fieldErrors.endTime}
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
              disabled={isProcessing || !allFieldsValid()}
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
              Close
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

      {/* Payment Modal Integration */}
      <PaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        bookingData={pendingBookingDetails}
        onSuccess={() => {
          setShowPaymentModal(false);
          setSuccess(true);
          setShowSuccessSnackbar(true);
          if (typeof onBookingComplete === 'function') {
            onBookingComplete(pendingBookingDetails);
          }
        }}
      />
    </>
  );
}

export default BookingModal;
