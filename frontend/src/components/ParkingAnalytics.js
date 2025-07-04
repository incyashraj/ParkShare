import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  LocalParking as ParkingIcon,
  AttachMoney as MoneyIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  Speed as SpeedIcon,
  EmojiNature as EmojiNatureIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

const ParkingAnalytics = ({ user }) => {
  const [timeRange, setTimeRange] = useState('month');
  const [activeTab, setActiveTab] = useState(0);
  const [analytics, setAnalytics] = useState({
    totalBookings: 0,
    totalSpent: 0,
    averageRating: 0,
    favoriteSpots: [],
    spendingTrend: [],
    usagePattern: [],
    environmentalImpact: {},
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockAnalytics = {
      totalBookings: 47,
      totalSpent: 342.50,
      averageRating: 4.6,
      favoriteSpots: [
        { name: 'Downtown Premium', bookings: 12, totalSpent: 180 },
        { name: 'Mall Parking', bookings: 8, totalSpent: 64 },
        { name: 'Airport Parking', bookings: 6, totalSpent: 72 },
      ],
      spendingTrend: [
        { month: 'Jan', amount: 45 },
        { month: 'Feb', amount: 52 },
        { month: 'Mar', amount: 38 },
        { month: 'Apr', amount: 67 },
        { month: 'May', amount: 58 },
        { month: 'Jun', amount: 82 },
      ],
      usagePattern: [
        { day: 'Monday', bookings: 8 },
        { day: 'Tuesday', bookings: 12 },
        { day: 'Wednesday', bookings: 10 },
        { day: 'Thursday', bookings: 15 },
        { day: 'Friday', bookings: 18 },
        { day: 'Saturday', bookings: 6 },
        { day: 'Sunday', bookings: 4 },
      ],
      environmentalImpact: {
        co2Saved: 156.7, // kg
        treesEquivalent: 2.3,
        fuelSaved: 67.8, // liters
        distanceWalked: 23.4, // km
      },
    };
    setAnalytics(mockAnalytics);
  }, [timeRange]);

  const getTimeRangeData = () => {
    const now = new Date();
    switch (timeRange) {
      case 'week':
        return { start: subDays(now, 7), end: now };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'year':
        return { start: new Date(now.getFullYear(), 0, 1), end: now };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  };

  const calculateSavings = () => {
    // Mock calculation - replace with actual logic
    const avgParkingCost = 12; // Average cost per hour
    const avgBookingDuration = 2.5; // Average hours per booking
    const traditionalCost = analytics.totalBookings * avgParkingCost * avgBookingDuration;
    return traditionalCost - analytics.totalSpent;
  };

  const getEfficiencyScore = () => {
    const score = Math.min(100, (analytics.averageRating / 5) * 100);
    return Math.round(score);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Parking Analytics
        </Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            label="Time Range"
          >
            <MenuItem value="week">This Week</MenuItem>
            <MenuItem value="month">This Month</MenuItem>
            <MenuItem value="year">This Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ParkingIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {analytics.totalBookings}
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
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <MoneyIcon color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    ${analytics.totalSpent}
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
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <StarIcon color="warning" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {analytics.averageRating}
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
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUpIcon color="info" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    ${calculateSavings().toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Money Saved
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Analytics */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Usage Patterns" />
          <Tab label="Spending Analysis" />
          <Tab label="Environmental Impact" />
          <Tab label="Favorite Spots" />
        </Tabs>
      </Paper>

      {/* Usage Patterns Tab */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Weekly Usage Pattern
              </Typography>
              <List>
                {analytics.usagePattern.map((pattern, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CalendarIcon color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary={pattern.day}
                      secondary={`${pattern.bookings} bookings`}
                    />
                    <LinearProgress
                      variant="determinate"
                      value={(pattern.bookings / 18) * 100}
                      sx={{ width: 100 }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Efficiency Score
              </Typography>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h2" color="primary" fontWeight="bold">
                  {getEfficiencyScore()}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Parking Efficiency
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={getEfficiencyScore()}
                  sx={{ mt: 2, height: 8, borderRadius: 4 }}
                />
              </Box>
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Based on your booking patterns and ratings
                </Typography>
                <Chip icon={<SpeedIcon />} label="Above Average" color="success" />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Spending Analysis Tab */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Spending Trend
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'end', gap: 2, height: 200 }}>
                {analytics.spendingTrend.map((item, index) => (
                  <Box key={index} sx={{ flex: 1, textAlign: 'center' }}>
                    <Box
                      sx={{
                        height: `${(item.amount / 82) * 150}px`,
                        bgcolor: 'primary.main',
                        borderRadius: 1,
                        mb: 1,
                        minHeight: 20,
                      }}
                    />
                    <Typography variant="caption">{item.month}</Typography>
                    <Typography variant="body2">${item.amount}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Cost Breakdown
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Average per booking"
                    secondary={`$${(analytics.totalSpent / analytics.totalBookings).toFixed(2)}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Monthly average"
                    secondary={`$${(analytics.totalSpent / 6).toFixed(2)}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Savings vs traditional"
                    secondary={`${((calculateSavings() / (analytics.totalSpent + calculateSavings())) * 100).toFixed(1)}%`}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Environmental Impact Tab */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Environmental Impact
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <EmojiNatureIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h5" fontWeight="bold">
                      {analytics.environmentalImpact.co2Saved}kg
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      CO₂ Saved
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <SecurityIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h5" fontWeight="bold">
                      {analytics.environmentalImpact.treesEquivalent}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Trees Equivalent
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <SpeedIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h5" fontWeight="bold">
                      {analytics.environmentalImpact.fuelSaved}L
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Fuel Saved
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <LocationIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h5" fontWeight="bold">
                      {analytics.environmentalImpact.distanceWalked}km
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Distance Walked
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Sustainability Score
              </Typography>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h2" color="success" fontWeight="bold">
                  87%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Green Parking Score
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={87}
                  sx={{ mt: 2, height: 8, borderRadius: 4, bgcolor: 'success.light' }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                You're making a positive environmental impact by choosing shared parking solutions!
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Favorite Spots Tab */}
      {activeTab === 3 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Most Used Parking Spots
          </Typography>
          <List>
            {analytics.favoriteSpots.map((spot, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <ParkingIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={spot.name}
                  secondary={`${spot.bookings} bookings • $${spot.totalSpent} spent`}
                />
                <Chip 
                  label={`#${index + 1}`} 
                  color={index === 0 ? 'primary' : 'default'}
                  variant={index === 0 ? 'filled' : 'outlined'}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default ParkingAnalytics; 