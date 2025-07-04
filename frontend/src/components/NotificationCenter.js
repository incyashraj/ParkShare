import React, { useState } from 'react';
import {
  Box,
  Badge,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Chip,
  Divider,
  Button,
  Fade,
  Slide,
  Paper
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  EventNote as BookingIcon,
  Cancel as CancelIcon,
  LocationOn as LocationIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useRealtime } from '../contexts/RealtimeContext';
import { format } from 'date-fns';

const NotificationCenter = () => {
  const { notifications, clearNotification, clearAllNotifications, isConnected } = useRealtime();
  const [open, setOpen] = useState(false);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking':
        return <BookingIcon color="primary" />;
      case 'cancellation':
        return <CancelIcon color="error" />;
      case 'availability':
        return <LocationIcon color="info" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'booking':
        return 'success';
      case 'cancellation':
        return 'error';
      case 'availability':
        return 'info';
      default:
        return 'default';
    }
  };

  const handleNotificationClick = (notification) => {
    // Handle notification click - could navigate to relevant page
    console.log('Notification clicked:', notification);
    clearNotification(notification.id);
  };

  const unreadCount = notifications.length;

  return (
    <>
      <IconButton
        color="inherit"
        onClick={() => setOpen(true)}
        sx={{
          position: 'relative',
          '&:hover': {
            transform: 'scale(1.1)',
            transition: 'transform 0.2s ease-in-out'
          }
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          {unreadCount > 0 ? (
            <NotificationsActiveIcon sx={{ color: '#1E3A8A' }} />
          ) : (
            <NotificationsIcon sx={{ color: '#1E3A8A' }} />
          )}
        </Badge>
        {!isConnected && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 8,
              height: 8,
              backgroundColor: '#f44336',
              borderRadius: '50%',
              animation: 'pulse 2s infinite'
            }}
          />
        )}
      </IconButton>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: 400,
            maxWidth: '90vw',
            backgroundColor: '#f8fafc',
            borderLeft: '1px solid #e2e8f0'
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#1E3A8A', fontWeight: 600 }}>
              Notifications
            </Typography>
            <IconButton onClick={() => setOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Chip
              label={isConnected ? 'Connected' : 'Disconnected'}
              color={isConnected ? 'success' : 'error'}
              size="small"
              icon={isConnected ? <CheckCircleIcon /> : <CloseIcon />}
            />
            {notifications.length > 0 && (
              <Button
                size="small"
                onClick={clearAllNotifications}
                sx={{ color: '#64748b', fontSize: '0.75rem' }}
              >
                Clear All
              </Button>
            )}
          </Box>
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <NotificationsIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                No notifications yet
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notification, index) => (
                <Slide
                  key={notification.id}
                  direction="left"
                  in={true}
                  timeout={300 + index * 100}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      m: 1,
                      borderRadius: 2,
                      border: '1px solid #e2e8f0',
                      backgroundColor: 'white',
                      '&:hover': {
                        backgroundColor: '#f8fafc',
                        transform: 'translateY(-1px)',
                        transition: 'all 0.2s ease-in-out'
                      }
                    }}
                  >
                    <ListItem
                      button
                      onClick={() => handleNotificationClick(notification)}
                      sx={{ py: 2 }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {getNotificationIcon(notification.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                            {notification.title}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {notification.message}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Chip
                                label={notification.type}
                                color={getNotificationColor(notification.type)}
                                size="small"
                                sx={{ fontSize: '0.7rem' }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {format(notification.timestamp, 'MMM dd, HH:mm')}
                              </Typography>
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
                        sx={{ ml: 1 }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </ListItem>
                  </Paper>
                </Slide>
              ))}
            </List>
          )}
        </Box>
      </Drawer>

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default NotificationCenter; 