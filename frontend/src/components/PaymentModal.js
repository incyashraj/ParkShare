import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  loadStripe
} from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
// import ErrorIcon from '@mui/icons-material/Error';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_BASE } from '../apiConfig';
import ReceiptDownload from './ReceiptDownload';
import { useAuth } from '../contexts/AuthContext';
import Confetti from 'react-confetti';

// Initialize Stripe
const stripePromise = loadStripe('pk_test_51RhGUIFfuH7KoJbsGqc8UHhP2LhkeF9Ysqp4dggt3tKOgcYXpyNDt5HdvHyZ5fq1CBdGIJxsh7QXD6jG8ftdpfcT00Ry6UIfqm');

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

const CheckoutForm = ({ bookingData, onSuccess, onError, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testMode, setTestMode] = useState(false);
  const [showRedirectNotice, setShowRedirectNotice] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(3);
  const [redirectUrl, setRedirectUrl] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    // Check if user is logged in
    if (!bookingData.userId) {
      setError('Please log in to complete your booking.');
      setLoading(false);
      return;
    }

    // Validate required fields before making API call
    const requiredFields = [
      'spotId', 'userId', 'price', 'spotTitle', 'startTime', 'endTime', 'hours'
    ];
    
    // Handle different field names that might be passed from different components
    const payload = {
      spotId: bookingData.spotId,
      userId: bookingData.userId,
      price: bookingData.totalPrice || bookingData.price || bookingData.paymentAmount,
      spotTitle: bookingData.spotTitle || bookingData.spotLocation || bookingData.title,
      startTime: bookingData.startTime,
      endTime: bookingData.endTime,
      hours: bookingData.hours || bookingData.duration || 1
    };
    
    // Log payload for debugging
    console.log('Creating payment session with payload:', payload);
    console.log('Original bookingData:', bookingData);
    
    for (const field of requiredFields) {
      if (!payload[field] && payload[field] !== 0) {
        setError(`Missing required field: ${field}. Please try again or contact support.`);
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch(`${API_BASE}/api/payments/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok || !data.sessionUrl) {
        throw new Error(data.message || 'Failed to create payment session');
      }
      const stripe = await stripePromise;
      handleStripeRedirect(data.sessionUrl);
    } catch (error) {
      setError(error.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStripeRedirect = (url) => {
    setRedirectUrl(url);
    setShowRedirectNotice(true);
    setRedirectCountdown(3);
    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      setRedirectCountdown(count);
      if (count === 0) {
        clearInterval(interval);
        window.location.href = url;
      }
    }, 1000);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}
      <Typography variant="h6" gutterBottom>Payment Details</Typography>
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Amount: ₹{bookingData.totalPrice}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Spot: {bookingData.spotTitle}
        </Typography>
      </Box>
      <Typography variant="body2" color="info.main" sx={{ mb: 2 }}>
        You will be redirected to Stripe for secure payment. Your booking will be confirmed only after payment is successful.
      </Typography>
      <DialogActions sx={{ px: 0 }}>
        <Button onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={loading} startIcon={loading && <CircularProgress size={20} />}>
          {loading ? 'Redirecting...' : `Pay ₹${bookingData.totalPrice}`}
        </Button>
      </DialogActions>
      <Dialog open={showRedirectNotice}>
        <DialogTitle>Redirecting to Payment</DialogTitle>
        <DialogContent>
          <Alert severity="info">
            You will be redirected to the payment page in {redirectCountdown} second{redirectCountdown !== 1 ? 's' : ''}...
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowRedirectNotice(false);
            window.location.href = redirectUrl;
          }} color="primary">
            Go Now
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const PaymentModal = ({ open, onClose, bookingData, onSuccess }) => {
  const handleSuccess = (result) => {
    onSuccess(result);
    onClose();
  };

  const handleError = (errorMessage) => {
    console.error('Payment error:', errorMessage);
  };

  // Validate bookingData before rendering
  if (!bookingData) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Booking Error</DialogTitle>
        <DialogContent>
          <Alert severity="error">
            Booking data is missing. Please try booking again.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Check for required fields
  const requiredFields = ['spotId', 'userId', 'totalPrice', 'startTime', 'endTime'];
  const missingFields = requiredFields.filter(field => !bookingData[field]);
  
  if (missingFields.length > 0) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Booking Error</DialogTitle>
        <DialogContent>
          <Alert severity="error">
            Missing required booking information: {missingFields.join(', ')}. Please try booking again.
          </Alert>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Debug info: {JSON.stringify(bookingData, null, 2)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Complete Your Booking
      </DialogTitle>
      <DialogContent>
        <Elements stripe={stripePromise}>
          <CheckoutForm
            bookingData={bookingData}
            onSuccess={handleSuccess}
            onError={handleError}
            onCancel={onClose}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;

export function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const { currentUser } = useAuth();
  const [showConfetti, setShowConfetti] = useState(false);

  // Auto-download receipt when booking is confirmed
  useEffect(() => {
    if (booking && currentUser) {
      // Use the same logic as ReceiptDownload's handleDownloadReceipt
      const downloadReceipt = async () => {
        try {
          const response = await fetch(`${API_BASE}/receipts/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId: booking.id, userId: currentUser.uid || currentUser.id })
          });
          if (!response.ok) throw new Error('Failed to generate receipt');
          const data = await response.json();
          if (data.downloadUrl) {
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
            }
          }
        } catch (e) {
          // Ignore download errors for auto-download
        }
      };
      downloadReceipt();
      setShowConfetti(true);
      // Hide confetti after 4 seconds
      setTimeout(() => setShowConfetti(false), 4000);
    }
  }, [booking, currentUser]);

  useEffect(() => {
    let isMounted = true;
    let retryTimeout;
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setError('No payment session found.');
      setLoading(false);
      return;
    }
    const confirmPaymentAndCreateBooking = () => {
      fetch(`${API_BASE}/api/payments/confirm-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId })
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.booking) {
            if (isMounted) {
              setBooking(data.booking);
              setLoading(false);
              setError(null);
            }
          } else {
            if (retryCount < 5) {
              // Retry after 2 seconds
              retryTimeout = setTimeout(() => {
                setRetryCount(c => c + 1);
              }, 2000);
            } else {
              if (isMounted) {
                setError('Payment confirmation failed. If you just completed payment, please wait a few seconds and refresh this page.');
                setLoading(false);
              }
            }
          }
        })
        .catch(err => {
          if (retryCount < 5) {
            retryTimeout = setTimeout(() => {
              setRetryCount(c => c + 1);
            }, 2000);
          } else {
            if (isMounted) {
              setError('Failed to confirm payment and create booking.');
              setLoading(false);
            }
          }
        });
    };
    confirmPaymentAndCreateBooking();
    return () => {
      isMounted = false;
      if (retryTimeout) clearTimeout(retryTimeout);
    };
    // eslint-disable-next-line
  }, [searchParams, retryCount]);

  if (loading) return <Box textAlign="center" mt={8}><CircularProgress /><Typography sx={{mt:2}}>Confirming your payment and creating booking...</Typography></Box>;
  if (error) return <Box textAlign="center" mt={8}><Alert severity="error">{error}</Alert></Box>;

  return (
    <Box textAlign="center" mt={8}>
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={300} />}
      <Typography variant="h4" color="success.main" gutterBottom>
        Payment Successful!
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Your payment was successful and your booking is now confirmed. You will receive a confirmation email shortly.
      </Typography>
      <Box sx={{ mb: 3, p: 3, border: '1px solid #e0e0e0', borderRadius: 2, display: 'inline-block', textAlign: 'left' }}>
        <Typography variant="h6">Booking Details</Typography>
        <Typography><strong>Booking ID:</strong> {booking.id}</Typography>
        <Typography><strong>Spot:</strong> {booking.spotTitle || booking.spotLocation || booking.location}</Typography>
        <Typography><strong>Start:</strong> {new Date(booking.startTime).toLocaleString()}</Typography>
        <Typography><strong>End:</strong> {new Date(booking.endTime).toLocaleString()}</Typography>
        <Typography><strong>Amount Paid:</strong> ₹{booking.totalPrice}</Typography>
        {booking.spotDetails && (
          <>
            <Typography><strong>Location:</strong> {booking.spotDetails.location}</Typography>
            <Typography><strong>Hourly Rate:</strong> {booking.spotDetails.hourlyRate}</Typography>
          </>
        )}
        {booking.status && (
          <Typography><strong>Status:</strong> {booking.status}</Typography>
        )}
      </Box>
      <Box sx={{ mb: 3 }}>
        {/* Manual Download/Email Receipt */}
        <ReceiptDownload booking={booking} user={currentUser} />
      </Box>
      <Box sx={{ mb: 3 }}>
        <Button variant="contained" color="primary" sx={{ mr: 2 }} onClick={() => navigate('/profile?tab=bookings')}>View My Bookings</Button>
        <Button variant="outlined" sx={{ mr: 2 }} onClick={() => navigate('/')}>Book Another Spot</Button>
        <Button variant="outlined" onClick={() => navigate('/')}>Back to Home</Button>
      </Box>
    </Box>
  );
}

export function PaymentCancel() {
  const navigate = useNavigate();
  return (
    <Box textAlign="center" mt={8}>
      <Typography variant="h4" color="error.main" gutterBottom>
        Payment Cancelled
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Your payment was cancelled or failed. No booking was made. You can try again or contact support if you need help.
      </Typography>
      <Button variant="contained" color="primary" onClick={() => navigate('/')}>Back to Home</Button>
    </Box>
  );
} 