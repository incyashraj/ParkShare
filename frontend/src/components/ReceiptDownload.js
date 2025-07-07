import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box, CircularProgress, Alert, IconButton, Tooltip } from '@mui/material';
import { Download as DownloadIcon, Email as EmailIcon, Receipt as ReceiptIcon } from '@mui/icons-material';
import { useState } from 'react';
import { API_BASE } from '../apiConfig';

const ReceiptDownload = ({ booking, spot, user }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleDownloadReceipt = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_BASE}/receipts/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: booking.id,
          userId: user?.uid || user?.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate receipt');
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
        } else {
          throw new Error('Failed to download file');
        }
      } else {
        throw new Error('No download URL provided');
      }

      setSuccess('Receipt downloaded successfully!');
    } catch (error) {
      console.error('Error downloading receipt:', error);
      setError('Failed to download receipt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmailReceipt = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_BASE}/receipts/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: booking.id,
          userId: user?.uid || user?.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send receipt email');
      }

      const data = await response.json();
      setSuccess('Receipt sent to your email successfully!');
    } catch (error) {
      console.error('Error sending receipt email:', error);
      setError('Failed to send receipt email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2 }}>
        <ReceiptIcon sx={{ color: 'primary.main' }} />
        <Typography variant="h6" fontWeight="bold">
          Download Receipt
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
          onClick={handleDownloadReceipt}
          disabled={loading}
          sx={{
            bgcolor: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}
        >
          Download PDF
        </Button>

        <Button
          variant="outlined"
          startIcon={loading ? <CircularProgress size={20} /> : <EmailIcon />}
          onClick={handleSendEmailReceipt}
          disabled={loading}
          sx={{
            borderColor: 'primary.main',
            color: 'primary.main',
            '&:hover': {
              borderColor: 'primary.dark',
              bgcolor: 'primary.light',
            },
          }}
        >
          Send to Email
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Download your booking receipt as a PDF or have it sent to your email address.
      </Typography>
    </Box>
  );
};

export default ReceiptDownload;