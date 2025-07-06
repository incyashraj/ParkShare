import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  Chip,
  IconButton,
  Divider,
  Avatar,
  Grid,
  Paper,
  Fade,
  Zoom,
} from '@mui/material';
import {
  Close as CloseIcon,
  LocalParking as ParkingIcon,
  Payment as PaymentIcon,
  Security as SecurityIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Message as MessageIcon,
  Cancel as CancelIcon,
  Star as StarIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';

const NotificationPopup = ({ notification, open, onClose, onAction }) => {
  if (!notification) return null;

  const getNotificationIcon = (notification) => {
    const iconProps = {
      sx: {
        fontSize: 32,
      }
    };

    switch (notification.type) {
      case 'booking':
        return <CheckCircleIcon {...iconProps} sx={{ ...iconProps.sx, color: 'success.main' }} />;
      case 'cancellation':
        return <CancelIcon {...iconProps} sx={{ ...iconProps.sx, color: 'error.main' }} />;
      case 'message':
        return <MessageIcon {...iconProps} sx={{ ...iconProps.sx, color: 'primary.main' }} />;
      case 'availability':
        return <TimeIcon {...iconProps} sx={{ ...iconProps.sx, color: 'warning.main' }} />;
      case 'payment':
        return <PaymentIcon {...iconProps} sx={{ ...iconProps.sx, color: 'success.main' }} />;
      case 'security':
        return <SecurityIcon {...iconProps} sx={{ ...iconProps.sx, color: 'info.main' }} />;
      case 'spot-booked':
        return <ParkingIcon {...iconProps} sx={{ ...iconProps.sx, color: 'primary.main' }} />;
      case 'announcement':
        return <InfoIcon {...iconProps} sx={{ ...iconProps.sx, color: 'info.main' }} />;
      default:
        return <InfoIcon {...iconProps} sx={{ ...iconProps.sx, color: 'text.secondary' }} />;
    }
  };

  const getNotificationColor = (notification) => {
    switch (notification.type) {
      case 'booking':
        return 'success';
      case 'cancellation':
        return 'error';
      case 'message':
        return 'primary';
      case 'availability':
        return 'warning';
      case 'payment':
        return 'success';
      case 'security':
        return 'info';
      case 'spot-booked':
        return 'primary';
      case 'announcement':
        return 'info';
      default:
        return 'default';
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes} minutes ago`;
    } else if (hours < 24) {
      return `${hours} hours ago`;
    } else {
      return `${days} days ago`;
    }
  };

  const getDetailedTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderNotificationDetails = () => {
    switch (notification.type) {
      case 'booking':
        return (
          <Fade in timeout={600}>
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      backgroundColor: 'success.light', 
                      color: 'success.contrastText',
                      borderRadius: 2,
                      boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CheckCircleIcon />
                      <Typography variant="h6">Booking Confirmed</Typography>
                    </Box>
                    <Typography variant="body2">
                      Your parking spot has been successfully booked.
                    </Typography>
                  </Paper>
                </Grid>
                {notification.data?.spotId && (
                  <Grid item xs={12}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1, 
                      p: 2, 
                      border: 1, 
                      borderColor: 'divider', 
                      borderRadius: 2,
                      backgroundColor: 'background.paper',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    }}>
                      <LocationIcon color="primary" />
                      <Typography variant="body2">
                        Spot ID: {notification.data.spotId}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Fade>
        );

      case 'message':
        return (
          <Fade in timeout={600}>
            <Box>
              <Paper 
                sx={{ 
                  p: 2, 
                  backgroundColor: 'primary.light', 
                  color: 'primary.contrastText',
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <MessageIcon />
                  <Typography variant="h6">New Message</Typography>
                </Box>
                <Typography variant="body2">
                  You have received a new message from another user.
                </Typography>
              </Paper>
              {notification.data?.senderId && (
                <Box sx={{ 
                  mt: 2, 
                  p: 2, 
                  border: 1, 
                  borderColor: 'divider', 
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon color="primary" />
                    <Typography variant="body2">
                      From: {notification.data.senderId}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Fade>
        );

      case 'payment':
        return (
          <Fade in timeout={600}>
            <Box>
              <Paper 
                sx={{ 
                  p: 2, 
                  backgroundColor: 'success.light', 
                  color: 'success.contrastText',
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <PaymentIcon />
                  <Typography variant="h6">Payment Received</Typography>
                </Box>
                <Typography variant="body2">
                  Payment has been successfully processed.
                </Typography>
              </Paper>
              {notification.data?.amount && (
                <Box sx={{ 
                  mt: 2, 
                  p: 2, 
                  border: 1, 
                  borderColor: 'divider', 
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MoneyIcon color="success" />
                    <Typography variant="h6" color="success.main">
                      ₹{notification.data.amount}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Fade>
        );

      case 'availability':
        return (
          <Fade in timeout={600}>
            <Box>
              <Paper 
                sx={{ 
                  p: 2, 
                  backgroundColor: 'warning.light', 
                  color: 'warning.contrastText',
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(255, 152, 0, 0.15)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TimeIcon />
                  <Typography variant="h6">Availability Update</Typography>
                </Box>
                <Typography variant="body2">
                  The availability of your parking spot has been updated.
                </Typography>
              </Paper>
            </Box>
          </Fade>
        );

      case 'announcement':
        return (
          <Fade in timeout={600}>
            <Box>
              <Paper 
                sx={{ 
                  p: 2, 
                  backgroundColor: 'info.light', 
                  color: 'info.contrastText',
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(3, 169, 244, 0.15)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <InfoIcon />
                  <Typography variant="h6">System Announcement</Typography>
                </Box>
                <Typography variant="body2">
                  Important system update or announcement.
                </Typography>
              </Paper>
            </Box>
          </Fade>
        );

      default:
        return (
          <Fade in timeout={600}>
            <Box>
              <Paper sx={{ 
                p: 2, 
                backgroundColor: 'grey.100',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              }}>
                <Typography variant="body2" color="text.secondary">
                  No additional details available for this notification type.
                </Typography>
              </Paper>
            </Box>
          </Fade>
        );
    }
  };

  const getActionButton = () => {
    switch (notification.type) {
      case 'booking':
        return (
          <Button
            variant="contained"
            color="primary"
            onClick={() => onAction && onAction(notification)}
            startIcon={<CalendarIcon />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
              }
            }}
          >
            View Booking Details
          </Button>
        );
      case 'message':
        return (
          <Button
            variant="contained"
            color="primary"
            onClick={() => onAction && onAction(notification)}
            startIcon={<MessageIcon />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
              }
            }}
          >
            Open Chat
          </Button>
        );
      case 'payment':
        return (
          <Button
            variant="contained"
            color="success"
            onClick={() => onAction && onAction(notification)}
            startIcon={<PaymentIcon />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(76, 175, 80, 0.4)',
              }
            }}
          >
            View Receipt
          </Button>
        );
      case 'availability':
        return (
          <Button
            variant="contained"
            color="warning"
            onClick={() => onAction && onAction(notification)}
            startIcon={<TimeIcon />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(255, 152, 0, 0.4)',
              }
            }}
          >
            Update Availability
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden',
        }
      }}
      TransitionComponent={Zoom}
      transitionDuration={300}
    >
      <DialogTitle sx={{ pb: 1, backgroundColor: 'background.paper' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Zoom in timeout={400}>
              <Box>
                {getNotificationIcon(notification)}
              </Box>
            </Zoom>
            <Box>
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                {notification.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={notification.type}
                  color={getNotificationColor(notification)}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    borderRadius: 1,
                    fontWeight: 500,
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  {getTimeAgo(notification.timestamp)}
                </Typography>
              </Box>
            </Box>
          </Box>
          <IconButton 
            onClick={onClose} 
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'action.hover',
                color: 'text.primary',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3, backgroundColor: 'background.default' }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6, color: 'text.primary' }}>
            {notification.message}
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {getDetailedTime(notification.timestamp)}
            </Typography>
          </Box>
        </Box>

        {renderNotificationDetails()}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 3, gap: 2, backgroundColor: 'background.paper' }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          Close
        </Button>
        {getActionButton()}
      </DialogActions>
    </Dialog>
  );
};

export default NotificationPopup; 