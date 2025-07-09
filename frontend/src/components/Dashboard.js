import { Container, Grid, Card, CardContent, Typography, Box, Avatar, Button } from '@mui/material';
import { LocalParking, AttachMoney, TrendingUp, Person } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect, useCallback } from 'react';
import './Dashboard.css';
import { API_BASE } from '../apiConfig';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalSpent: 0,
    averageRating: 0,
    favoriteSpots: 0,
    recentActivity: [],
    upcomingBookings: [],
    quickStats: {
      monthlySavings: 0,
      environmentalImpact: 0,
      efficiencyScore: 0,
      parkingTime: 0,
    },
    platformStats: {
      totalSpots: 0,
      availableSpots: 0,
      totalUsers: 0,
      totalRevenue: 0,
      averageRating: 0,
      occupancyRate: 0,
      recentBookings: 0,
    }
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      // Fetch real statistics from backend
      const statsResponse = await fetch(`${API_BASE}/stats`);
      const stats = await statsResponse.json();
      
      // Fetch user's bookings
      const bookingsResponse = await fetch(`${API_BASE}/api/bookings?userId=${currentUser?.uid}`);
      const userBookings = await bookingsResponse.json();
      
      // Calculate user-specific stats
      const userTotalSpent = userBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
      const userAverageRating = userBookings.length > 0 
        ? userBookings.reduce((sum, booking) => sum + (booking.rating || 0), 0) / userBookings.length 
        : 0;
      
      // Recent activity from bookings
      const recentActivity = userBookings.slice(0, 5).map(booking => ({
        id: booking.id,
        type: 'booking',
        title: `Booked ${booking.spotName || 'Parking Spot'}`,
        description: `${booking.hours || 1} hours • $${booking.totalPrice || 0}`,
        timestamp: new Date(booking.createdAt),
        icon: LocalParking,
      }));
      
      // Upcoming bookings (mock for now - would need date filtering)
      const upcomingBookings = userBookings.slice(0, 3).map(booking => ({
        id: booking.id,
        location: booking.spotName || 'Parking Spot',
        date: new Date(booking.createdAt).toLocaleDateString('en-US', { 
          month: 'short', 
          day: '2-digit', 
          year: 'numeric' 
        }),
        time: `${booking.startTime || '10:00 AM'} - ${booking.endTime || '12:00 PM'}`,
        price: booking.totalPrice || 0,
      }));
      
      const dashboardData = {
        totalBookings: userBookings.length,
        totalSpent: Math.round(userTotalSpent * 100) / 100,
        averageRating: Math.round(userAverageRating * 10) / 10,
        favoriteSpots: 0, // Would need favorites API
        recentActivity,
        upcomingBookings,
        quickStats: {
          monthlySavings: Math.round((userTotalSpent * 0.2) * 100) / 100, // 20% savings estimate
          environmentalImpact: userBookings.length * 2.5, // CO2 saved per booking
          efficiencyScore: Math.min(100, Math.round((userBookings.length / 10) * 100)),
          parkingTime: userBookings.length * 2, // Average 2 hours per booking
        },
        // Platform stats
        platformStats: {
          totalSpots: stats.totalSpots,
          availableSpots: stats.availableSpots,
          totalUsers: stats.totalUsers,
          totalRevenue: stats.totalRevenue,
          averageRating: stats.averageRating,
          occupancyRate: stats.occupancyRate,
          recentBookings: stats.recentBookings,
        }
      };
      
      setDashboardData(dashboardData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to mock data if API fails
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
            icon: LocalParking,
          },
        ],
        upcomingBookings: [
          {
            id: 1,
            location: 'Downtown Premium Parking',
            date: new Date().toLocaleDateString('en-US', { 
              month: 'short', 
              day: '2-digit', 
              year: 'numeric' 
            }),
            time: '10:00 AM - 12:00 PM',
            price: 30,
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
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser, fetchDashboardData]);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
          Welcome back, {currentUser?.displayName || currentUser?.email}!
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
                  <LocalParking />
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
                  <AttachMoney />
                </Avatar>
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
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <TrendingUp />
                </Avatar>
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
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <Person />
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

      {/* Platform Statistics */}
      {dashboardData.platformStats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Platform Overview
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="primary" fontWeight="bold">
                        {dashboardData.platformStats.totalSpots || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Spots
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="success.main" fontWeight="bold">
                        {dashboardData.platformStats.totalUsers || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active Users
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="warning.main" fontWeight="bold">
                        ${dashboardData.platformStats.totalRevenue || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Revenue
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="info.main" fontWeight="bold">
                        {dashboardData.platformStats.occupancyRate || 0}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Occupancy Rate
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ py: 2 }}
                    href="/search"
                  >
                    Find Parking
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ py: 2 }}
                    href="/list"
                  >
                    List Your Spot
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ py: 2 }}
                    href="/bookings"
                  >
                    View Bookings
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ py: 2 }}
                    href="/profile"
                  >
                    My Profile
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      {dashboardData.recentActivity.length > 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Recent Activity
                </Typography>
                <Box>
                  {dashboardData.recentActivity.map((activity) => (
                    <Box key={activity.id} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {activity.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {activity.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {activity.timestamp.toLocaleDateString()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Upcoming Bookings
                </Typography>
                <Box>
                  {dashboardData.upcomingBookings.map((booking) => (
                    <Box key={booking.id} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {booking.location}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {booking.date} • {booking.time}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        ${booking.price}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Dashboard;