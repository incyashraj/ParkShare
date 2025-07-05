import React, { useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Alert,
  CircularProgress
} from '@mui/material';
import { useAuth } from './contexts/AuthContext';

const TestBooking = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const testBooking = async () => {
    if (!currentUser) {
      setError('Please log in first');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Create a test booking
      const now = new Date();
      const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
      
      const bookingData = {
        spotId: 'spot_downtown_001', // Use an existing spot ID
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email,
        userEmail: currentUser.email,
        startTime: now.toISOString(),
        endTime: endTime.toISOString(),
        hours: 2,
        totalPrice: 30,
        hourlyRate: 'INR 15'
      };

      console.log('Creating test booking with data:', bookingData);

      const response = await fetch(`http://localhost:3001/parking-spots/${bookingData.spotId}/book`, {
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

      const bookingResult = await response.json();
      console.log('Booking created successfully:', bookingResult);
      setResult(bookingResult);
      
    } catch (error) {
      console.error('Error creating booking:', error);
      setError(error.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const testFetchBookings = async () => {
    if (!currentUser) {
      setError('Please log in first');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`http://localhost:3001/users/${currentUser.uid}/bookings`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const bookings = await response.json();
      console.log('Fetched bookings:', bookings);
      setResult({ type: 'bookings', data: bookings });
      
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError(error.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Booking System Test
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current User: {currentUser ? currentUser.email : 'Not logged in'}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button
              variant="contained"
              onClick={testBooking}
              disabled={loading || !currentUser}
            >
              {loading ? <CircularProgress size={20} /> : 'Test Create Booking'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={testFetchBookings}
              disabled={loading || !currentUser}
            >
              {loading ? <CircularProgress size={20} /> : 'Test Fetch Bookings'}
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {result && (
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                {result.type === 'bookings' ? 'Bookings Fetched Successfully!' : 'Booking Created Successfully!'}
              </Typography>
              
              {result.type === 'bookings' ? (
                <Typography>
                  Found {result.data.length} booking(s)
                </Typography>
              ) : (
                <Typography>
                  Booking ID: {result.booking?.id}
                </Typography>
              )}
              
              <pre style={{ fontSize: '12px', overflow: 'auto', maxHeight: '200px' }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </Alert>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default TestBooking; 