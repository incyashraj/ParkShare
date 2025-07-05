import React from 'react';
import { Button, Box, Typography, Alert } from '@mui/material';
import { useRealtime } from './contexts/RealtimeContext';

const TestComponent = () => {
  const { addNotification } = useRealtime();

  const testBookingNotification = () => {
    const notification = {
      id: Date.now(),
      type: 'booking',
      title: 'Test Booking Confirmed! 🎉',
      message: 'This is a test booking confirmation notification.',
      data: {
        bookingId: 'test-booking-123',
        spotId: 'test-spot-456',
        type: 'booking-confirmation'
      },
      timestamp: new Date(),
      read: false
    };
    
    addNotification(notification);
    console.log('Test booking notification added');
  };

  const testGlobalNotification = () => {
    if (window.addNotification) {
      const notification = {
        id: Date.now(),
        type: 'announcement',
        title: 'Global Test Notification',
        message: 'This notification was added using the global function.',
        data: {},
        timestamp: new Date(),
        read: false
      };
      
      window.addNotification(notification);
      console.log('Global test notification added');
    } else {
      console.log('Global addNotification not available');
    }
  };

  const testBookingFlow = async () => {
    try {
      // Test the booking endpoint directly
      const response = await fetch('http://localhost:3001/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spotId: 'spot_downtown_001',
          userId: 'test-user-123',
          userName: 'Test User',
          userEmail: 'test@example.com',
          spotTitle: 'Downtown Premium Parking',
          spotLocation: '123 Main Street, Downtown',
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          endTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(), // Tomorrow + 2 hours
          hours: 2,
          totalPrice: 30,
          hourlyRate: '$15',
          paymentMethod: 'Test Mode'
        }),
      });

      const result = await response.json();
      console.log('Booking test result:', result);
      
      if (response.ok) {
        // Add success notification
        const notification = {
          id: Date.now(),
          type: 'booking',
          title: 'Test Booking Successful! 🎉',
          message: `Test booking created: ${result.booking.id}`,
          data: {
            bookingId: result.booking.id,
            spotId: result.booking.spotId,
            type: 'booking-confirmation'
          },
          timestamp: new Date(),
          read: false
        };
        
        addNotification(notification);
      } else {
        console.error('Booking test failed:', result);
      }
    } catch (error) {
      console.error('Error testing booking flow:', error);
    }
  };

  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2, m: 2 }}>
      <Typography variant="h6" gutterBottom>
        Notification & Booking Test Component
      </Typography>
      
      <Alert severity="info" sx={{ mb: 2 }}>
        Use these buttons to test the notification system and booking flow.
      </Alert>
      
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button 
          variant="contained" 
          onClick={testBookingNotification}
          sx={{ bgcolor: 'success.main' }}
        >
          Test Booking Notification
        </Button>
        <Button 
          variant="contained" 
          onClick={testGlobalNotification}
          sx={{ bgcolor: 'info.main' }}
        >
          Test Global Notification
        </Button>
        <Button 
          variant="contained" 
          onClick={testBookingFlow}
          sx={{ bgcolor: 'warning.main' }}
        >
          Test Booking Flow
        </Button>
      </Box>
    </Box>
  );
};

export default TestComponent; 