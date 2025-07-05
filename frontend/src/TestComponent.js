import React from 'react';
import { Button, Box, Typography } from '@mui/material';
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

  return (
    <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2, m: 2 }}>
      <Typography variant="h6" gutterBottom>
        Notification Test Component
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
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
      </Box>
    </Box>
  );
};

export default TestComponent; 