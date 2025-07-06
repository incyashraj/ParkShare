import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  Divider,
  IconButton,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Badge,
  Card,
  CardContent,
  Avatar,
  Fade,
  Slide,
  Grow,
  useTheme,
  useMediaQuery,
  Stack,
  Tooltip,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
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
  Delete as DeleteIcon,
  MarkEmailRead as MarkReadIcon,
  ArrowBack as ArrowBackIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Search as SearchIcon,
  MoreVert as MoreIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ClearAll as ClearAllIcon,
  SelectAll as SelectAllIcon,
  UnfoldMore as UnfoldMoreIcon,
  UnfoldLess as UnfoldLessIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useRealtime } from '../contexts/RealtimeContext';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const {
    notifications,
    isConnected,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    clearNotification
  } = useRealtime();

  const [activeTab, setActiveTab] = useState(0);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [expandedNotifications, setExpandedNotifications] = useState(new Set());
  const [showSpeedDial, setShowSpeedDial] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  const filteredNotifications = activeTab === 0 
    ? unreadNotifications.filter(n => 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : readNotifications.filter(n => 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSelectedNotifications([]);
  };

  const handleMarkAsRead = (notificationId) => {
    markNotificationAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    setLoading(true);
    setTimeout(() => {
      markAllNotificationsAsRead();
      setLoading(false);
    }, 500);
  };

  const handleDeleteNotification = (notificationId) => {
    clearNotification(notificationId);
  };

  const handleDeleteSelected = () => {
    setLoading(true);
    setTimeout(() => {
      selectedNotifications.forEach(id => clearNotification(id));
      setSelectedNotifications([]);
      setLoading(false);
    }, 500);
  };

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleToggleExpanded = (notificationId) => {
    setExpandedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleOpenNotification = (notification, event) => {
    event.stopPropagation();
    setSelectedNotification(notification);
    setNotificationDialogOpen(true);
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
  };

  const handleCloseNotificationDialog = () => {
    setNotificationDialogOpen(false);
    setSelectedNotification(null);
  };

  const handleDeleteFromDialog = () => {
    if (selectedNotification) {
      handleDeleteNotification(selectedNotification.id);
      handleCloseNotificationDialog();
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const getNotificationIcon = (notification) => {
    const iconProps = {
      sx: {
        fontSize: 24,
        color: notification.read ? 'text.secondary' : 'primary.main'
      }
    };

    switch (notification.type) {
      case 'booking':
        return <CheckCircleIcon {...iconProps} sx={{ ...iconProps.sx, color: '#00A699' }} />;
      case 'cancellation':
        return <CancelIcon {...iconProps} sx={{ ...iconProps.sx, color: '#FF5A5F' }} />;
      case 'message':
        return <MessageIcon {...iconProps} sx={{ ...iconProps.sx, color: '#007A87' }} />;
      case 'availability':
        return <TimeIcon {...iconProps} sx={{ ...iconProps.sx, color: '#FFB400' }} />;
      case 'payment':
        return <PaymentIcon {...iconProps} sx={{ ...iconProps.sx, color: '#00A699' }} />;
      case 'security':
        return <SecurityIcon {...iconProps} sx={{ ...iconProps.sx, color: '#007A87' }} />;
      case 'spot-booked':
        return <ParkingIcon {...iconProps} sx={{ ...iconProps.sx, color: '#FF385C' }} />;
      case 'announcement':
        return <InfoIcon {...iconProps} sx={{ ...iconProps.sx, color: '#007A87' }} />;
      default:
        return <InfoIcon {...iconProps} />;
    }
  };

  const getNotificationColor = (notification) => {
    switch (notification.type) {
      case 'booking': return '#00A699';
      case 'cancellation': return '#FF5A5F';
      case 'message': return '#007A87';
      case 'availability': return '#FFB400';
      case 'payment': return '#00A699';
      case 'security': return '#007A87';
      case 'spot-booked': return '#FF385C';
      case 'announcement': return '#007A87';
      default: return '#717171';
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

  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    const priorityDiff = getNotificationPriority(a) - getNotificationPriority(b);
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  const speedDialActions = [
    {
      icon: <MarkReadIcon />,
      name: 'Mark All Read',
      action: handleMarkAllAsRead,
      disabled: unreadNotifications.length === 0
    },
    {
      icon: <SelectAllIcon />,
      name: selectedNotifications.length === filteredNotifications.length ? 'Deselect All' : 'Select All',
      action: handleSelectAll,
      disabled: filteredNotifications.length === 0
    },
    {
      icon: <RefreshIcon />,
      name: 'Refresh',
      action: handleRefresh
    },
    {
      icon: <ClearAllIcon />,
      name: 'Clear All',
      action: clearAllNotifications,
      disabled: notifications.length === 0
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{ 
              mr: 2,
              color: 'primary.main',
              '&:hover': { backgroundColor: 'rgba(255, 56, 92, 0.08)' }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              Notifications
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              Stay updated with your parking activities
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip
              label={isConnected ? 'Connected' : 'Connecting...'}
              size="small"
              color={isConnected ? 'success' : 'warning'}
              variant="outlined"
              icon={isConnected ? <CheckCircleIcon /> : <CircularProgress size={16} />}
            />
            <Tooltip title="Refresh">
              <IconButton
                onClick={handleRefresh}
                disabled={loading}
                sx={{ 
                  color: 'primary.main',
                  '&:hover': { backgroundColor: 'rgba(255, 56, 92, 0.08)' }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #FF385C 0%, #FF5A5F 100%)',
            color: 'white',
            borderRadius: 3,
            transition: 'transform 0.2s ease',
            '&:hover': { transform: 'translateY(-2px)' }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {notifications.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Notifications
                  </Typography>
                </Box>
                <NotificationsIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ 
            background: 'linear-gradient(135deg, #00A699 0%, #00D1C1 100%)',
            color: 'white',
            borderRadius: 3,
            transition: 'transform 0.2s ease',
            '&:hover': { transform: 'translateY(-2px)' }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {unreadNotifications.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Unread
                  </Typography>
                </Box>
                <NotificationsIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ 
            background: 'linear-gradient(135deg, #007A87 0%, #0099A8 100%)',
            color: 'white',
            borderRadius: 3,
            transition: 'transform 0.2s ease',
            '&:hover': { transform: 'translateY(-2px)' }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {readNotifications.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Read
                  </Typography>
                </Box>
                <MarkReadIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Action Bar */}
        <Paper sx={{ p: 3, borderRadius: 3, mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button
                variant="contained"
                startIcon={<MarkReadIcon />}
                onClick={handleMarkAllAsRead}
                disabled={unreadNotifications.length === 0 || loading}
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  backgroundColor: '#FF385C',
                  color: 'white',
                  '&:hover': { backgroundColor: '#E31C5F' },
                  boxShadow: '0 2px 8px rgba(255, 56, 92, 0.15)'
                }}
              >
                Mark All Read
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<SelectAllIcon />}
                onClick={handleSelectAll}
                disabled={filteredNotifications.length === 0}
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  borderColor: '#FF385C',
                  color: '#FF385C',
                  backgroundColor: 'white',
                  '&:hover': {
                    borderColor: '#E31C5F',
                    color: '#E31C5F',
                    backgroundColor: 'rgba(255, 56, 92, 0.08)'
                  }
                }}
              >
                {selectedNotifications.length === filteredNotifications.length ? 'Deselect All' : 'Select All'}
              </Button>

              {selectedNotifications.length > 0 && (
                <Button
                  variant="contained"
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteSelected}
                  disabled={loading}
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none',
                    backgroundColor: '#FF385C',
                    color: 'white',
                    '&:hover': { backgroundColor: '#E31C5F' },
                    boxShadow: '0 2px 8px rgba(255, 56, 92, 0.15)'
                  }}
                >
                  Delete Selected ({selectedNotifications.length})
                </Button>
              )}
            </Stack>

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<ClearAllIcon />}
                onClick={clearAllNotifications}
                disabled={notifications.length === 0 || loading}
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  borderColor: '#FF385C',
                  color: '#FF385C',
                  backgroundColor: 'white',
                  '&:hover': {
                    borderColor: '#E31C5F',
                    color: '#E31C5F',
                    backgroundColor: 'rgba(255, 56, 92, 0.08)'
                  }
                }}
              >
                Clear All
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Box>

      {/* Tabs */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            backgroundColor: '#F7F7F7',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '16px',
              minHeight: 64,
              color: '#717171',
              '&.Mui-selected': {
                color: '#FF385C',
                fontWeight: 600,
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#FF385C',
              height: 3,
            }
          }}
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative' }}>
                <Typography>Unread</Typography>
                <Badge 
                  badgeContent={unreadNotifications.length} 
                  color="error" 
                  max={99}
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '12px',
                      height: '20px',
                      minWidth: '20px',
                      padding: '0 6px'
                    }
                  }}
                />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative' }}>
                <Typography>Read</Typography>
                <Badge 
                  badgeContent={readNotifications.length} 
                  color="default" 
                  max={99}
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '12px',
                      height: '20px',
                      minWidth: '20px',
                      padding: '0 6px'
                    }
                  }}
                />
              </Box>
            } 
          />
        </Tabs>

        {/* Notifications List */}
        <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
              <CircularProgress size={40} />
            </Box>
          ) : sortedNotifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 8 }}>
              <NotificationsIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 3, opacity: 0.5 }} />
              <Typography variant="h5" color="text.secondary" gutterBottom>
                {activeTab === 0 ? 'No unread notifications' : 'No read notifications'}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
                {activeTab === 0 
                  ? 'You\'re all caught up! New notifications will appear here when they arrive.'
                  : 'No notifications have been read yet. Mark some as read to see them here.'
                }
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {sortedNotifications.map((notification, index) => (
                <Grow key={notification.id} in timeout={200 + index * 100}>
                  <ListItem
                    sx={{
                      borderBottom: '1px solid #F0F0F0',
                      backgroundColor: notification.read ? 'transparent' : '#FFF8F8',
                      '&:hover': {
                        backgroundColor: notification.read ? '#F7F7F7' : '#FFF0F0',
                      },
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      position: 'relative',
                      '&::before': notification.read ? {} : {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 4,
                        backgroundColor: getNotificationColor(notification),
                        borderRadius: '0 2px 2px 0'
                      }
                    }}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <ListItemIcon sx={{ minWidth: 48, mr: 2 }}>
                      <Avatar
                        sx={{
                          backgroundColor: `${getNotificationColor(notification)}15`,
                          color: getNotificationColor(notification),
                          width: 48,
                          height: 48
                        }}
                      >
                        {getNotificationIcon(notification)}
                      </Avatar>
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography
                            variant="subtitle1"
                            fontWeight={notification.read ? 400 : 600}
                            color="text.primary"
                            sx={{ flexGrow: 1 }}
                          >
                            {notification.title}
                          </Typography>
                          <Chip
                            label={notification.type}
                            size="small"
                            sx={{
                              backgroundColor: `${getNotificationColor(notification)}15`,
                              color: getNotificationColor(notification),
                              fontWeight: 500,
                              textTransform: 'capitalize'
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1, lineHeight: 1.5 }}
                          >
                            {notification.message}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              {getTimeAgo(notification.timestamp)}
                            </Typography>
                            {!notification.read && (
                              <Chip
                                label="New"
                                size="small"
                                sx={{
                                  backgroundColor: '#FF385C',
                                  color: 'white',
                                  fontSize: '10px',
                                  height: 20
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      }
                    />
                    
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Tooltip title="Open notification">
                        <IconButton
                          size="small"
                          onClick={(e) => handleOpenNotification(notification, e)}
                          sx={{
                            color: 'text.secondary',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.08)',
                              color: '#FF385C'
                            }
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Toggle details">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleExpanded(notification.id);
                          }}
                          sx={{
                            color: 'text.secondary',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.08)'
                            }
                          }}
                        >
                          {expandedNotifications.has(notification.id) 
                            ? <UnfoldLessIcon fontSize="small" />
                            : <UnfoldMoreIcon fontSize="small" />
                          }
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={selectedNotifications.includes(notification.id) ? 'Deselect' : 'Select'}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectNotification(notification.id);
                          }}
                          sx={{
                            color: selectedNotifications.includes(notification.id) 
                              ? '#FF385C' 
                              : 'text.secondary',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 56, 92, 0.08)'
                            }
                          }}
                        >
                          {selectedNotifications.includes(notification.id) 
                            ? <FavoriteIcon fontSize="small" />
                            : <FavoriteBorderIcon fontSize="small" />
                          }
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notification.id);
                          }}
                          sx={{
                            color: 'text.secondary',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 90, 95, 0.08)',
                              color: '#FF5A5F'
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </ListItem>
                </Grow>
              ))}
            </List>
          )}
        </Box>
      </Paper>

      {/* Notification Dialog */}
      <Dialog
        open={notificationDialogOpen}
        onClose={handleCloseNotificationDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }
        }}
      >
        {selectedNotification && (
          <>
            <DialogTitle sx={{ 
              pb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <Avatar
                sx={{
                  backgroundColor: `${getNotificationColor(selectedNotification)}15`,
                  color: getNotificationColor(selectedNotification),
                  width: 48,
                  height: 48
                }}
              >
                {getNotificationIcon(selectedNotification)}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  {selectedNotification.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {getTimeAgo(selectedNotification.timestamp)}
                </Typography>
              </Box>
              <IconButton
                onClick={handleCloseNotificationDialog}
                sx={{ color: 'text.secondary' }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ pt: 2 }}>
              <Box sx={{ mb: 3 }}>
                <Chip
                  label={selectedNotification.type}
                  size="small"
                  sx={{
                    backgroundColor: `${getNotificationColor(selectedNotification)}15`,
                    color: getNotificationColor(selectedNotification),
                    fontWeight: 500,
                    textTransform: 'capitalize',
                    mb: 2
                  }}
                />
                <DialogContentText sx={{ 
                  fontSize: '16px', 
                  lineHeight: 1.6,
                  color: 'text.primary',
                  mb: 2
                }}>
                  {selectedNotification.message}
                </DialogContentText>
                {selectedNotification.details && (
                  <Paper sx={{ p: 2, backgroundColor: '#F7F7F7', borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {selectedNotification.details}
                    </Typography>
                  </Paper>
                )}
              </Box>
            </DialogContent>
            
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button
                onClick={handleCloseNotificationDialog}
                sx={{ 
                  color: 'text.secondary',
                  textTransform: 'none'
                }}
              >
                Close
              </Button>
              <Button
                onClick={handleDeleteFromDialog}
                startIcon={<DeleteIcon />}
                variant="outlined"
                color="error"
                sx={{ 
                  textTransform: 'none',
                  borderColor: '#FF5A5F',
                  color: '#FF5A5F',
                  '&:hover': {
                    borderColor: '#E31C5F',
                    backgroundColor: 'rgba(255, 90, 95, 0.08)'
                  }
                }}
              >
                Delete
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Mobile Speed Dial */}
      {isMobile && (
        <SpeedDial
          ariaLabel="Notification actions"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
          open={showSpeedDial}
          onOpen={() => setShowSpeedDial(true)}
          onClose={() => setShowSpeedDial(false)}
        >
          {speedDialActions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={() => {
                action.action();
                setShowSpeedDial(false);
              }}
              disabled={action.disabled}
            />
          ))}
        </SpeedDial>
      )}
    </Container>
  );
};

export default NotificationsPage; 