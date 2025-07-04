import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
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
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

function BookingModal({ open, onClose, spot }) {
  const navigate = useNavigate();
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const calculateTotalPrice = () => {
    if (!startTime || !endTime) return 0;
    
    const hours = Math.ceil((endTime - startTime) / (1000 * 60 * 60));
    const rate = parseFloat(spot.hourlyRate.replace(/[^0-9.]/g, ''));
    return hours * rate;
  };

  const handleBooking = async () => {
    if (!currentUser) {
      setError('Please log in to book a parking spot');
      return;
    }

    if (!startTime || !endTime) {
      setError('Please select both start and end times');
      return;
    }

    if (endTime <= startTime) {
      setError('End time must be after start time');
      return;
    }

    const hours = Math.ceil((endTime - startTime) / (1000 * 60 * 60));
    if (spot.maxDuration && hours > spot.maxDuration) {
      setError(`Maximum parking duration is ${spot.maxDuration} hours`);
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess(false);

    try {
      // First check availability
      const availabilityResponse = await fetch(
        `http://localhost:3001/parking-spots/${spot.id}/availability?startTime=${startTime.toISOString()}&endTime=${endTime.toISOString()}`
      );
      const availabilityData = await availabilityResponse.json();

      if (!availabilityData.available) {
        setError('This spot is not available for the selected time period');
        return;
      }

      // If available, proceed with booking
      const response = await fetch(`http://localhost:3001/parking-spots/${spot.id}/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startTime,
          endTime,
          userId: currentUser?.uid,
          userName: currentUser?.displayName || currentUser?.email,
          spotDetails: {
            location: spot.location,
            hourlyRate: spot.hourlyRate,
            ownerName: spot.ownerName,
            coordinates: spot.coordinates
          }
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose(true);
          navigate('/profile'); // Navigate to profile page after successful booking
        }, 2000);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Booking error:', error);
      setError('Failed to process booking. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: '#1E3A8A', color: 'white' }}>
        Book Parking Spot
      </DialogTitle>
      
      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {spot?.location}
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

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <DateTimePicker
                label="Start Time"
                value={startTime}
                onChange={setStartTime}
                minDateTime={new Date()}
                renderInput={(props) => <TextField {...props} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DateTimePicker
                label="End Time"
                value={endTime}
                onChange={setEndTime}
                minDateTime={startTime || new Date()}
                renderInput={(props) => <TextField {...props} fullWidth />}
              />
            </Grid>
          </Grid>
        </LocalizationProvider>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Booking confirmed successfully! Redirecting to your bookings...
          </Alert>
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
                {startTime && endTime
                  ? `${Math.ceil((endTime - startTime) / (1000 * 60 * 60))} hours`
                  : '-'}
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
        <Button
          variant="contained"
          onClick={handleBooking}
          disabled={isProcessing || success}
          sx={{
            bgcolor: '#1E3A8A',
            '&:hover': {
              bgcolor: '#1E40AF',
            },
          }}
        >
          {isProcessing ? 'Processing...' : success ? 'Booked!' : 'Confirm Booking'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default BookingModal;
