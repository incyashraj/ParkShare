import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Grid,
  Divider,
  Button,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { API_BASE } from '../apiConfig';

const BookingCard = ({ booking, onCancel, isCancelling = false }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'paid':
        return <ScheduleIcon />;
      case 'pending':
        return <ScheduleIcon />;
      case 'cancelled':
        return <CancelIcon />;
      default:
        return <ScheduleIcon />;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Helper to safely format dates
  const safeFormat = (dateStr, formatStr = 'MMM dd, yyyy HH:mm') => {
    try {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? 'N/A' : format(date, formatStr);
    } catch (error) {
      return 'N/A';
    }
  };

  const calculateDuration = (startTime, endTime) => {
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const diffMs = end - start;
      const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
      return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } catch (error) {
      return 'N/A';
    }
  };

  const handleDownloadReceipt = async () => {
    setDownloading(true);
    setDownloadError(null);
    
    try {
      const response = await fetch(`${API_BASE}/receipts/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: booking.id,
          userId: booking.userId || booking.userId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate receipt');
      }

      const data = await response.json();
      
      if (data.downloadUrl) {
        // Download the file
        const downloadResponse = await fetch(`${API_BASE}${data.downloadUrl}`);
        if (downloadResponse.ok) {
          const blob = await downloadResponse.blob();
          
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = data.fileName || `receipt_${booking.id}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          setDownloadSuccess(true);
        } else {
          throw new Error('Failed to download receipt file');
        }
      } else {
        throw new Error('No download URL received');
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      setDownloadError(error.message || 'Failed to download receipt. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card elevation={2} sx={{ mb: 2, '&:hover': { boxShadow: 4 } }}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" component="div">
                {booking.spotDetails?.location || booking.location || 'Parking Spot'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <ScheduleIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {safeFormat(booking.startTime)} - {safeFormat(booking.endTime)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Duration: {calculateDuration(booking.startTime, booking.endTime)}
              </Typography>
            </Box>

            {booking.spotDetails?.hourlyRate && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MoneyIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Rate: {booking.spotDetails.hourlyRate}/hour
                </Typography>
              </Box>
            )}

            <Typography variant="body2" color="text.secondary">
              Booked on: {safeFormat(booking.createdAt, 'MMM dd, yyyy')}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', height: '100%' }}>
              <Chip
                icon={getStatusIcon(booking.status)}
                label={booking.status || 'Unknown'}
                color={getStatusColor(booking.status)}
                sx={{ mb: 2 }}
              />
              
              <Typography variant="h6" color="primary" fontWeight="bold" sx={{ mb: 2 }}>
                {formatCurrency(booking.totalPrice || booking.totalAmount)}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', width: '100%' }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ReceiptIcon />}
                  fullWidth
                  disabled={downloading}
                  onClick={handleDownloadReceipt}
                >
                  {downloading ? 'Downloading...' : 'Download Receipt'}
                </Button>
                
                {booking.status === 'confirmed' && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<CancelIcon />}
                    color="error"
                    fullWidth
                    disabled={isCancelling}
                    onClick={() => onCancel && onCancel(booking.id)}
                  >
                    {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
                  </Button>
                )}
                
                {booking.status === 'cancelled' && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    Cancelled on: {safeFormat(booking.cancelledAt, 'MMM dd, yyyy HH:mm')}
                  </Typography>
                )}
              </Box>

              <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
                ID: {booking.id}
              </Typography>
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
      
      {/* Success/Error Notifications */}
      <Snackbar
        open={downloadSuccess}
        autoHideDuration={3000}
        onClose={() => setDownloadSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setDownloadSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Receipt downloaded successfully!
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={!!downloadError}
        autoHideDuration={5000}
        onClose={() => setDownloadError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setDownloadError(null)} severity="error" sx={{ width: '100%' }}>
          {downloadError}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default BookingCard; 