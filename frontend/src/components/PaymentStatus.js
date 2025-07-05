import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Grid,
  Divider
} from '@mui/material';
import {
  Payment as PaymentIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const PaymentStatus = ({ booking }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return <PaymentIcon />;
      case 'pending':
        return <ScheduleIcon />;
      case 'failed':
        return <PaymentIcon />;
      case 'cancelled':
        return <ScheduleIcon />;
      default:
        return <PaymentIcon />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Helper to safely format dates
  const safeFormat = (dateStr, formatStr = 'MMM dd, yyyy HH:mm') => {
    const date = new Date(dateStr);
    return isNaN(date) ? 'N/A' : format(date, formatStr);
  };

  return (
    <Card elevation={1} sx={{ mb: 2 }}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" component="div">
                {booking.spot?.title || 'Parking Spot'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <ScheduleIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {safeFormat(booking.startTime)} - {safeFormat(booking.endTime)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <MoneyIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Total: {formatCurrency(booking.totalAmount || booking.amount || 0)}
              </Typography>
            </Box>

            {booking.paymentMethod && (
              <Typography variant="body2" color="text.secondary">
                Payment Method: {booking.paymentMethod}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', height: '100%' }}>
              <Chip
                icon={getStatusIcon(booking.paymentStatus || booking.status)}
                label={booking.paymentStatus || booking.status || 'Unknown'}
                color={getStatusColor(booking.paymentStatus || booking.status)}
                sx={{ mb: 2 }}
              />
              
              <Typography variant="h6" color="primary" fontWeight="bold">
                {formatCurrency(booking.totalAmount || booking.amount || 0)}
              </Typography>

              {booking.bookingId && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  ID: {booking.bookingId}
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>

        {booking.notes && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary">
              <strong>Notes:</strong> {booking.notes}
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentStatus; 