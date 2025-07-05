import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Tabs,
  Tab,
  Alert,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Slider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Badge
} from '@mui/material';
import {
  LocalParking,
  Favorite,
  FavoriteBorder,
  Directions,
  Refresh,
  MyLocation,
  Notifications,
  TrendingUp,
  TimeIcon,
  LocationIcon,
  SecurityIcon,
  HistoryIcon,
  SettingsIcon,
  FilterIcon,
  ListIcon,
  MapIcon,
  StarIcon,
  MoneyIcon,
  PersonIcon,
  AddIcon,
  EditIcon,
  DeleteIcon,
  VisibilityIcon,
  BookmarkIcon,
  BookmarkBorderIcon,
  ParkingIcon
} from '@mui/icons-material';
import { format, subDays } from 'date-fns';
import { auth } from '../firebase';
import LiveMapComponent from './LiveMapComponent';
import { useRealtime } from '../contexts/RealtimeContext';
import BookingModal from './BookingModal';
import NotificationCenter from './NotificationCenter';

const LiveMapDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalSpent: 0,
    averageRating: 0,
    favoriteSpots: 0,
    recentActivity: [],
    upcomingBookings: [],
    quickStats: {},
  });

  const { realtimeState } = useRealtime();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        fetchDashboardData();
        fetchFavorites();
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchDashboardData = async () => {
    // Mock data - replace with actual API calls
    const mockData = {
      totalBookings: 47,
      totalSpent: 342.50,
      averageRating: 4.6,
      favoriteSpots: 8,
      recentActivity: [
        {
          id: 1,
          type: 'booking',
          title: 'Booked Downtown Premium Parking',
          description: '2 hours • ₹30',
          timestamp: new Date(),
          icon: ParkingIcon,
        },
        {
          id: 2,
          type: 'review',
          title: 'Left a 5-star review',
          description: 'Mall Parking Garage',
          timestamp: subDays(new Date(), 1),
          icon: StarIcon,
        },
        {
          id: 3,
          type: 'favorite',
          title: 'Added to favorites',
          description: 'Airport Long-term Parking',
          timestamp: subDays(new Date(), 2),
          icon: FavoriteIcon,
        },
      ],
      upcomingBookings: [
        {
          id: 1,
          location: 'Downtown Premium Parking',
          date: format(subDays(new Date(), -1), 'MMM dd, yyyy'),
          time: '10:00 AM - 12:00 PM',
          price: 30,
        },
        {
          id: 2,
          location: 'Mall Parking Garage',
          date: format(subDays(new Date(), -3), 'MMM dd, yyyy'),
          time: '2:00 PM - 4:00 PM',
          price: 16,
        },
      ],
      quickStats: {
        monthlySavings: 45.20,
        environmentalImpact: 156.7,
        efficiencyScore: 87,
        parkingTime: 23.4,
      },
    };
    setDashboardData(mockData);
  };

  const fetchFavorites = async () => {
    // Mock favorites data
    const mockFavorites = [
      { id: '1', location: 'Downtown Premium Parking', coordinates: [19.0760, 72.8777] },
      { id: '2', location: 'Mall Parking Garage', coordinates: [19.0765, 72.8782] },
    ];
    setFavorites(mockFavorites);
  };

  const handleSpotClick = (spot) => {
    setSelectedSpot(spot);
    setShowBookingModal(true);
  };

  const handleMapClick = (latlng) => {
    console.log('Map clicked at:', latlng);
  };

  const quickActions = [
    {
      title: 'Find Parking',
      description: 'Search for available spots',
      icon: SearchIcon,
      color: '#3B82F6',
      action: () => navigate('/search'),
    },
    {
      title: 'List Your Spot',
      description: 'Earn money by sharing',
      icon: AddIcon,
      color: '#10B981',
      action: () => navigate('/list'),
    },
    {
      title: 'My Favorites',
      description: 'View saved spots',
      icon: BookmarkIcon,
      color: '#F59E0B',
      action: () => navigate('/favorites'),
    },
    {
      title: 'Analytics',
      description: 'View your stats',
      icon: AnalyticsIcon,
      color: '#8B5CF6',
      action: () => navigate('/analytics'),
    },
  ];

  const getActivityIcon = (activity) => {
    const IconComponent = activity.icon;
    return <IconComponent sx={{ fontSize: 20 }} />;
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'booking':
        return 'primary';
      case 'review':
        return 'warning';
      case 'favorite':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
          Welcome back, {user?.displayName || user?.email?.split('@')[0]}! 👋
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Here's what's happening with your parking today
        </Typography>
      </Box>

      {/* Quick Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText'
                }}>
                  <ParkingIcon />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardData.totalBookings}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Bookings
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  bgcolor: 'success.light',
                  color: 'success.contrastText'
                }}>
                  <MoneyIcon />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    ${dashboardData.totalSpent}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Spent
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  bgcolor: 'warning.light',
                  color: 'warning.contrastText'
                }}>
                  <StarIcon />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardData.averageRating}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average Rating
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  bgcolor: 'error.light',
                  color: 'error.contrastText'
                }}>
                  <FavoriteIcon />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardData.favoriteSpots}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Favorite Spots
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Area */}
      <Grid container spacing={3}>
        {/* Left Sidebar - Quick Actions & Stats */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Quick Actions */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Grid container spacing={2}>
                  {quickActions.map((action, index) => (
                    <Grid item xs={6} key={index}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<action.icon />}
                        onClick={action.action}
                        sx={{
                          height: 80,
                          flexDirection: 'column',
                          gap: 1,
                          borderColor: action.color,
                          color: action.color,
                          '&:hover': {
                            borderColor: action.color,
                            bgcolor: `${action.color}10`,
                          },
                        }}
                      >
                        <Typography variant="body2" fontWeight="bold">
                          {action.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {action.description}
                        </Typography>
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {dashboardData.recentActivity.map((activity) => (
                    <Box key={activity.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ 
                        p: 1, 
                        borderRadius: 1, 
                        bgcolor: `${getActivityColor(activity.type)}.light`,
                        color: `${getActivityColor(activity.type)}.contrastText`
                      }}>
                        {getActivityIcon(activity)}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {activity.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {activity.description} • {format(activity.timestamp, 'MMM dd, HH:mm')}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Upcoming Bookings */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Upcoming Bookings
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {dashboardData.upcomingBookings.map((booking) => (
                    <Box key={booking.id} sx={{ 
                      p: 2, 
                      borderRadius: 1, 
                      bgcolor: 'grey.50',
                      border: '1px solid',
                      borderColor: 'grey.200'
                    }}>
                      <Typography variant="body2" fontWeight="medium">
                        {booking.location}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {booking.date} • {booking.time}
                      </Typography>
                      <Typography variant="body2" color="primary" fontWeight="bold">
                        ${booking.price}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>

        {/* Right Side - Live Map */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '70vh' }}>
            <CardContent sx={{ p: 0, height: '100%' }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                p: 2,
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}>
                <Typography variant="h6">
                  Live Parking Map
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Toggle View">
                    <IconButton
                      onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
                      size="small"
                    >
                      {viewMode === 'map' ? <ListIcon /> : <MapIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Filters">
                    <IconButton size="small">
                      <FilterIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              <Box sx={{ height: 'calc(100% - 60px)' }}>
                <LiveMapComponent
                  center={[19.0760, 72.8777]}
                  zoom={13}
                  height="100%"
                  spots={realtimeState.spots || []}
                  favorites={favorites}
                  onSpotClick={handleSpotClick}
                  onMapClick={handleMapClick}
                  showRealTimeUpdates={true}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Floating Action Buttons */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => navigate('/list')}
      >
        <AddIcon />
      </Fab>

      {/* Notification Center */}
      <NotificationCenter />

      {/* Booking Modal */}
      <BookingModal
        open={showBookingModal}
        onClose={(success) => {
          setShowBookingModal(false);
          setSelectedSpot(null);
          if (success) {
            // Handle successful booking
          }
        }}
        spot={selectedSpot}
      />
    </Container>
  );
};

export default LiveMapDashboard; 