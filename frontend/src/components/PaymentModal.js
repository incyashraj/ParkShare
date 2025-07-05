import React, { useState } from 'react';
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
import { 
  Error, 
} from '@mui/icons-material';

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setError('Stripe not loaded');
      setLoading(false);
      return;
    }

    try {
      // Create payment intent
      const paymentIntentResponse = await fetch('http://localhost:3001/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: bookingData.totalPrice,
          spotId: bookingData.spotId,
          userId: bookingData.userId,
          bookingDetails: bookingData
        }),
      });

      const paymentIntentData = await paymentIntentResponse.json();

      if (paymentIntentData.testMode) {
        // Test mode - bypass payment
        setTestMode(true);
        setLoading(false);
        
        // Create booking directly
        const bookingResponse = await fetch('http://localhost:3001/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...bookingData,
            paymentMethod: 'Test Mode'
          }),
        });

        const bookingResult = await bookingResponse.json();
        
        if (bookingResponse.ok) {
          onSuccess(bookingResult);
        } else {
          onError(bookingResult.message);
        }
        return;
      }

      if (!paymentIntentData.clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        paymentIntentData.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: bookingData.userName,
              email: bookingData.userEmail,
            },
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Create booking with payment
        const bookingResponse = await fetch('http://localhost:3001/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...bookingData,
            paymentIntentId: paymentIntent.id,
            paymentMethod: 'Credit Card'
          }),
        });

        const bookingResult = await bookingResponse.json();
        
        if (bookingResponse.ok) {
          onSuccess(bookingResult);
        } else {
          onError(bookingResult.message);
        }
      }

    } catch (error) {
      console.error('Payment error:', error);
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {testMode && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Test mode enabled - payment will be bypassed for development
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="h6" gutterBottom>
        Payment Details
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Amount: ${bookingData.totalPrice}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Spot: {bookingData.spotTitle}
        </Typography>
      </Box>

      {!testMode && (
        <Box sx={{ mb: 3 }}>
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </Box>
      )}

      <DialogActions sx={{ px: 0 }}>
        <Button onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={!stripe || loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {testMode ? 'Confirm Booking (Test)' : `Pay $${bookingData.totalPrice}`}
        </Button>
      </DialogActions>
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

  if (!bookingData) return null;

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