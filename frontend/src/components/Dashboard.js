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
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Divider,
  LinearProgress,
  IconButton,
  Paper,
  Badge,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import {
  LocalParking as ParkingIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Bookmark as BookmarkIcon,
  Assessment as AnalyticsIcon,
  Add as AddIcon,
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  EmojiNature as EmojiNatureIcon,
  Favorite as FavoriteIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { format, subDays } from 'date-fns';
import { auth } from '../firebase';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalSpent: 0,
    averageRating: 0,
    favoriteSpots: 0,
    recentActivity: [],
    upcomingBookings: [],
    quickStats: {},
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        fetchDashboardData();
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
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <ParkingIcon />
                </Avatar>
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
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <MoneyIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    ₹{dashboardData.totalSpent}
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
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <StarIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardData.averageRating}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Rating
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
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <FavoriteIcon />
                </Avatar>
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

      {/* Main Content */}
      <Grid container spacing={4}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          {/* Quick Actions */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                {quickActions.map((action, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<action.icon />}
                      onClick={action.action}
                      sx={{
                        p: 2,
                        height: 'auto',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        textAlign: 'left',
                        borderColor: action.color,
                        color: action.color,
                        '&:hover': {
                          borderColor: action.color,
                          backgroundColor: `${action.color}10`,
                        },
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight="bold">
                        {action.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
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
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Recent Activity
              </Typography>
              <List>
                {dashboardData.recentActivity.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: `${getActivityColor(activity.type)}.light` }}>
                          {getActivityIcon(activity)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.title}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {activity.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {format(activity.timestamp, 'MMM dd, h:mm a')}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < dashboardData.recentActivity.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
          {/* Upcoming Bookings */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Upcoming Bookings
              </Typography>
              {dashboardData.upcomingBookings.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <CalendarIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    No upcoming bookings
                  </Typography>
                </Box>
              ) : (
                <List>
                  {dashboardData.upcomingBookings.map((booking, index) => (
                    <React.Fragment key={booking.id}>
                      <ListItem>
                        <ListItemIcon>
                          <ParkingIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={booking.location}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {booking.date} • {booking.time}
                              </Typography>
                              <Typography variant="body2" color="primary" fontWeight="bold">
                                ₹{booking.price}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < dashboardData.upcomingBookings.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/bookings')}
                sx={{ mt: 2 }}
              >
                View All Bookings
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                This Month
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Monthly Savings</Typography>
                  <Typography variant="body2" fontWeight="bold" color="success.main">
                    ₹{dashboardData.quickStats.monthlySavings}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={75}
                  sx={{ height: 8, borderRadius: 4, bgcolor: 'success.light' }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Efficiency Score</Typography>
                  <Typography variant="body2" fontWeight="bold" color="primary.main">
                    {dashboardData.quickStats.efficiencyScore}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={dashboardData.quickStats.efficiencyScore}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">CO₂ Saved</Typography>
                  <Typography variant="body2" fontWeight="bold" color="success.main">
                    {dashboardData.quickStats.environmentalImpact}kg
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={60}
                  sx={{ height: 8, borderRadius: 4, bgcolor: 'success.light' }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
                <Chip
                  icon={<EmojiNatureIcon />}
                  label="Eco-friendly"
                  color="success"
                  size="small"
                />
                <Chip
                  icon={<SpeedIcon />}
                  label="Efficient"
                  color="primary"
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 