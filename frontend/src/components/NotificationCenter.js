import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  Avatar,
  Tooltip,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
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
} from '@mui/icons-material';
import { useRealtime } from '../contexts/RealtimeContext';

const NotificationCenter = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const {
    notifications,
    clearNotification,
    clearAllNotifications,
    markNotificationAsRead,
    isConnected
  } = useRealtime();

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    // Show snackbar for new notifications
    if (notifications.length > 0 && !notifications[0].read) {
      const latestNotification = notifications[0];
      setSnackbarMessage(latestNotification.message);
      setShowSnackbar(true);
    }
  }, [notifications]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markNotificationAsRead(notification.id);
    }
    
    // Handle different notification types
    switch (notification.type) {
      case 'booking':
        // Navigate to booking details or profile with bookings tab
        if (notification.data?.type === 'booking-confirmation') {
          navigate('/profile?tab=bookings');
        } else {
          navigate('/profile?tab=bookings');
        }
        break;
      case 'message':
        // Open chat with sender
        console.log('Open chat with:', notification.data.senderId);
        break;
      case 'availability':
        // Navigate to spot details
        console.log('Navigate to spot:', notification.data.spotId);
        break;
      default:
        console.log('Handle notification:', notification);
    }
    
    handleClose();
  };

  const markAllAsRead = () => {
    notifications.forEach(notification => {
      if (!notification.read) {
        markNotificationAsRead(notification.id);
      }
    });
  };

  // Add test notification for debugging
  const addTestNotification = () => {
    const testNotification = {
      id: Date.now(),
      type: 'announcement',
      title: 'Test Notification',
      message: 'This is a test notification to verify the system is working.',
      data: {},
      timestamp: new Date(),
      read: false
    };
    // This would normally be handled by the context, but for testing we can add it directly
    console.log('Test notification added:', testNotification);
  };

  // Add test notification on component mount for debugging
  useEffect(() => {
    // Only add test notification if there are no notifications
    if (notifications.length === 0) {
      setTimeout(() => {
        addTestNotification();
      }, 2000);
    }
  }, [notifications.length]);

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  const getNotificationIcon = (notification) => {
    const iconProps = {
      sx: {
        fontSize: 20,
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

  const getNotificationPriority = (notification) => {
    switch (notification.type) {
      case 'booking':
      case 'message':
        return 1;
      case 'cancellation':
      case 'security':
        return 2;
      case 'availability':
      case 'payment':
        return 3;
      default:
        return 4;
    }
  };

  // Sort notifications by priority and timestamp
  const sortedNotifications = [...notifications].sort((a, b) => {
    const priorityDiff = getNotificationPriority(a) - getNotificationPriority(b);
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  return (
    <>
      <Tooltip title={isConnected ? "Notifications" : "Connecting to notifications..."}>
        <IconButton
          color="inherit"
          onClick={handleClick}
          sx={{ 
            position: 'relative',
            color: 'primary.main',
            '&:hover': {
              backgroundColor: 'rgba(30, 58, 138, 0.08)',
            }
          }}
          disabled={!isConnected}
        >
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <NotificationsIcon sx={{ fontSize: 24 }} />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 450,
            maxHeight: 600,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" fontWeight="bold">
              Notifications
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {unreadCount > 0 && (
                <Button
                  size="small"
                  onClick={markAllAsRead}
                  sx={{ textTransform: 'none' }}
                >
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  size="small"
                  onClick={clearAllNotifications}
                  sx={{ textTransform: 'none', color: 'error.main' }}
                >
                  Clear all
                </Button>
              )}
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            </Typography>
            <Chip
              label={isConnected ? 'Connected' : 'Connecting...'}
              size="small"
              color={isConnected ? 'success' : 'warning'}
              variant="outlined"
            />
          </Box>
        </Box>

        <List sx={{ p: 0 }}>
          {sortedNotifications.length > 0 ? (
            sortedNotifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  button
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    backgroundColor: notification.read ? 'transparent' : 'action.hover',
                    '&:hover': {
                      backgroundColor: 'action.selected',
                    },
                    position: 'relative',
                  }}
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: notification.read ? 400 : 600,
                            flex: 1,
                          }}
                        >
                          {notification.title}
                        </Typography>
                        {!notification.read && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: `${getNotificationColor(notification)}.main`,
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                        >
                          {notification.message}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {getTimeAgo(notification.timestamp)}
                          </Typography>
                          <Chip
                            label={notification.type}
                            size="small"
                            color={getNotificationColor(notification)}
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        </Box>
                      </Box>
                    }
                  />
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearNotification(notification.id);
                    }}
                    sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
                  >
                    <ErrorIcon fontSize="small" />
                  </IconButton>
                </ListItem>
                {index < sortedNotifications.length - 1 && <Divider />}
              </React.Fragment>
            ))
          ) : (
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    No notifications yet
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary" textAlign="center">
                    We'll notify you about bookings, messages, and updates
                  </Typography>
                }
              />
            </ListItem>
          )}
        </List>

        {sortedNotifications.length > 0 && (
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={() => {
                handleClose();
                // Navigate to notifications page
                window.location.href = '/notifications';
              }}
            >
              View All Notifications
            </Button>
          </Box>
        )}
      </Menu>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={4000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setShowSnackbar(false)}
          severity="info"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default NotificationCenter; 