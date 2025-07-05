import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../firebase';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Button,
  Divider,
  Avatar,
  Tab,
  Tabs,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Edit as EditIcon,
  VerifiedUser,
  Email,
  Phone
} from '@mui/icons-material';
import { format } from 'date-fns';
import PaymentStatus from './PaymentStatus';

function TabPanel({ children, value, index }) {
  return (
    <Box hidden={value !== index} sx={{ pt: 3 }}>
      {value === index && children}
    </Box>
  );
}

function Profile() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [listings, setListings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [networkError, setNetworkError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState({
    emailVerified: false,
    mobileVerified: false,
    isVerifiedHost: false,
    verifiedEmail: '',
    verifiedMobile: ''
  });

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      setError('Failed to log out');
    }
    handleMenuClose();
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user) {
        navigate('/login');
        return;
      }
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchBookings = async (userId) => {
      setBookingsLoading(true);
      try {
        const bookingsResponse = await fetch(`http://localhost:3001/bookings?userId=${userId}`);
        if (!bookingsResponse.ok) {
          throw new Error('Failed to fetch bookings');
        }
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData);
      } catch (err) {
        setNetworkError('Failed to fetch bookings');
        console.error('Bookings fetch error:', err);
      } finally {
        setBookingsLoading(false);
      }
    };

    const fetchListings = async (userId) => {
      setListingsLoading(true);
      try {
        const listingsResponse = await fetch(`http://localhost:3001/users/${userId}/listings`);
        if (!listingsResponse.ok) {
          throw new Error('Failed to fetch listings');
        }
        const listingsData = await listingsResponse.json();
        setListings(listingsData);
      } catch (err) {
        setNetworkError('Failed to fetch listings');
        console.error('Listings fetch error:', err);
      } finally {
        setListingsLoading(false);
      }
    };

    const fetchVerificationStatus = async (userId) => {
      try {
        const response = await fetch(`http://localhost:3001/verify/status/${userId}`);
        if (response.ok) {
          const status = await response.json();
          setVerificationStatus(status);
        }
      } catch (err) {
        console.error('Verification status fetch error:', err);
      }
    };

    const fetchData = async () => {
      if (!currentUser) return;
      const userId = currentUser.uid;
      await Promise.all([
        fetchBookings(userId),
        fetchListings(userId),
        fetchVerificationStatus(userId)
      ]);
    };

    fetchData();
  }, [currentUser]);

  const renderUserInfo = () => (
    <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: 'background.default' }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center">
          <Avatar
            sx={{ width: 80, height: 80, mr: 2 }}
            src={currentUser?.photoURL}
          >
            {currentUser?.displayName?.[0] || currentUser?.email?.[0]}
          </Avatar>
          <Box>
            <Typography variant="h5">
              {currentUser?.displayName || currentUser?.email}
            </Typography>
            <Typography color="text.secondary">
              Member since {new Date(currentUser?.metadata?.creationTime).toLocaleDateString()}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              {verificationStatus.isVerifiedHost ? (
                <Chip
                  icon={<VerifiedUser />}
                  label="Verified Host"
                  color="success"
                  size="small"
                />
              ) : (
                <Chip
                  label="Unverified"
                  color="default"
                  size="small"
                />
              )}
            </Box>
          </Box>
        </Box>
        <IconButton onClick={handleMenuClick}>
          <SettingsIcon />
        </IconButton>
      </Box>
    </Paper>
  );

  const renderListings = () => (
    <Grid container spacing={3}>
      {listings.map((listing) => (
        <Grid item xs={12} sm={6} key={listing.id}>
          <Card>
            <CardMedia
              component="img"
              height="140"
              image={listing.images?.[0] || 'https://via.placeholder.com/400x200?text=No+Image'}
              alt={listing.location}
            />
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {listing.location}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Rate: {listing.hourlyRate}/hour
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Chip
                  label={listing.available ? 'Available' : 'Not Available'}
                  color={listing.available ? 'success' : 'default'}
                  size="small"
                />
                <Button
                  startIcon={<EditIcon />}
                  size="small"
                  onClick={() => {/* TODO: Add edit functionality */}}
                >
                  Edit
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
      {listings.length === 0 && (
        <Grid item xs={12}>
          <Typography color="text.secondary" textAlign="center">
            No listings found. 
            <Button color="primary" onClick={() => navigate('/list')}>
              Add a Parking Spot
            </Button>
          </Typography>
        </Grid>
      )}
    </Grid>
  );

  const renderBookings = () => (
    <Grid container spacing={3}>
      {bookings.length === 0 ? (
        <Grid item xs={12}>
          <Typography color="text.secondary">
            No bookings found.
          </Typography>
        </Grid>
      ) : (
        bookings.map((booking) => (
          <Grid item xs={12} key={booking.id}>
            <PaymentStatus booking={booking} />
          </Grid>
        ))
      )}
    </Grid>
  );

  if (bookingsLoading && listingsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || networkError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography color="error">{error || networkError}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        {renderUserInfo()}

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleLogout}>
            <LogoutIcon sx={{ mr: 1 }} />
            Logout
          </MenuItem>
        </Menu>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            variant="fullWidth"
          >
            <Tab label="My Bookings" />
            <Tab label="My Listings" />
            <Tab label="Verification" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {bookingsLoading ? (
            <Box display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          ) : (
            renderBookings()
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {listingsLoading ? (
            <Box display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          ) : (
            renderListings()
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default' }}>
            <Typography variant="h6" gutterBottom>
              Verification Status
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Email sx={{ mr: 1, color: verificationStatus.emailVerified ? 'success.main' : 'text.secondary' }} />
                      <Typography variant="h6">Email Verification</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {verificationStatus.emailVerified ? 
                        `Verified: ${verificationStatus.verifiedEmail}` : 
                        'Email not verified yet'
                      }
                    </Typography>
                    <Chip
                      label={verificationStatus.emailVerified ? 'Verified' : 'Not Verified'}
                      color={verificationStatus.emailVerified ? 'success' : 'default'}
                      size="small"
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Phone sx={{ mr: 1, color: verificationStatus.mobileVerified ? 'success.main' : 'text.secondary' }} />
                      <Typography variant="h6">Mobile Verification</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {verificationStatus.mobileVerified ? 
                        `Verified: ${verificationStatus.verifiedMobile}` : 
                        'Mobile number not verified yet'
                      }
                    </Typography>
                    <Chip
                      label={verificationStatus.mobileVerified ? 'Verified' : 'Not Verified'}
                      color={verificationStatus.mobileVerified ? 'success' : 'default'}
                      size="small"
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            {!verificationStatus.isVerifiedHost && (
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Become a verified host to build trust with renters
                </Typography>
                <Button
                  variant="contained"
                  component={Link}
                  to="/verify"
                  startIcon={<VerifiedUser />}
                  sx={{ mt: 2 }}
                >
                  Verify My Account
                </Button>
              </Box>
            )}
            
            {verificationStatus.isVerifiedHost && (
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Chip
                  icon={<VerifiedUser />}
                  label="Verified Host"
                  color="success"
                  size="large"
                  sx={{ fontSize: '1.1rem', py: 1 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Congratulations! You are a verified host. Your listings will be marked with a verified badge.
                </Typography>
              </Box>
            )}
          </Paper>
        </TabPanel>
      </Box>
    </Container>
  );
}

export default Profile;
