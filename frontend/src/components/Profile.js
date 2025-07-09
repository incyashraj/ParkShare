import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';
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
  Avatar,
  Tab,
  Tabs,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Tooltip,
  Fab,
  FormControl,
  FormControlLabel,
  FormGroup,
  Checkbox,
  Select,
  InputLabel
} from '@mui/material';
import {
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Edit as EditIcon,
  VerifiedUser,
  Email,
  Phone,
  BookOnline as BookingsIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Block as BlockIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import BookingCard from './BookingCard';
import BlockedUsersManager from './BlockedUsersManager';
import { API_BASE } from '../apiConfig';

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
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedBookingForEdit, setSelectedBookingForEdit] = useState(null);
  const [newStartTime, setNewStartTime] = useState(null);
  const [newEndTime, setNewEndTime] = useState(null);
  
  // Edit listing state
  const [openEditListingDialog, setOpenEditListingDialog] = useState(false);
  const [selectedListingForEdit, setSelectedListingForEdit] = useState(null);
  const [editListingData, setEditListingData] = useState({
    title: '',
    description: '',
    hourlyRate: '',
    location: '',
    termsAndConditions: '',
    available24h: true,
    maxDuration: '',
    advanceBooking: 24,
    securityFeatures: [],
    amenities: [],
    vehicleTypes: ['car'],
    maxVehicleHeight: '',
    maxVehicleLength: ''
  });
  const [editListingLoading, setEditListingLoading] = useState(false);
  
  // New state for enhanced functionality
  const [editProfileDialog, setEditProfileDialog] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    displayName: '',
    email: '',
    phone: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    totalEarnings: 0,
    totalListings: 0,
    averageRating: 0,
    completionPercentage: 0
  });

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      setError('Failed to log out');
    }
    handleMenuClose();
  };

  const handleEditProfile = () => {
    setEditProfileData({
      displayName: currentUser?.displayName || '',
      email: currentUser?.email || '',
      phone: currentUser?.phoneNumber || ''
    });
    setEditProfileDialog(true);
  };

  const handleSaveProfile = async () => {
    setProfileLoading(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName: editProfileData.displayName
      });
      
      setCurrentUser(prev => ({
        ...prev,
        displayName: editProfileData.displayName
      }));
      
      setSuccessMessage('Profile updated successfully!');
      setEditProfileDialog(false);
      
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      setError('Failed to update profile: ' + error.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const calculateStats = () => {
    const totalBookings = bookings.length;
    const activeBookings = bookings.filter(b => 
      new Date(b.endTime) > new Date() && b.status !== 'cancelled'
    ).length;
    const totalEarnings = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const totalListings = listings.length;
    const averageRating = bookings.length > 0 ? 
      bookings.reduce((sum, b) => sum + (b.rating || 0), 0) / bookings.length : 0;
    
    // Calculate profile completion percentage
    const profileFields = [
      currentUser?.displayName,
      currentUser?.email,
      verificationStatus.emailVerified,
      verificationStatus.mobileVerified,
      listings.length > 0
    ];
    const completedFields = profileFields.filter(Boolean).length;
    const completionPercentage = (completedFields / profileFields.length) * 100;

    setStats({
      totalBookings,
      activeBookings,
      totalEarnings,
      totalListings,
      averageRating,
      completionPercentage
    });
  };

  const handleCancelBooking = async (bookingId) => {
    if (!currentUser) {
      setError('You must be logged in to cancel a booking');
      return;
    }

    // Show confirmation dialog
    const booking = bookings.find(b => b.id === bookingId);
    setBookingToCancel(booking);
    setShowCancelConfirm(true);
  };

  const confirmCancelBooking = async () => {
    if (!bookingToCancel) return;

    setCancellingBooking(bookingToCancel.id);
    setShowCancelConfirm(false);
    
    try {
      const response = await fetch(`${API_BASE}/api/bookings/${bookingToCancel.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      const result = await response.json();
      
      // Update the bookings list by marking the booking as cancelled
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingToCancel.id 
            ? { ...booking, status: 'cancelled', cancelledAt: new Date().toISOString() }
            : booking
        )
      );

      // Show success message
      setError(null);
      setSuccessMessage('Booking cancelled successfully! The parking spot is now available again.');
      console.log('Booking cancelled successfully:', result);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
      
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setError('Failed to cancel booking. Please try again.');
    } finally {
      setCancellingBooking(null);
      setBookingToCancel(null);
    }
  };

  const handleEditBooking = (booking) => {
    setSelectedBookingForEdit(booking);
    setNewStartTime(new Date(booking.startTime));
    setNewEndTime(new Date(booking.endTime));
    setOpenEditDialog(true);
  };

  const handleSaveBookingEdit = async () => {
    try {
      // Validate dates
      if (!newStartTime || !newEndTime) {
        setError('Please select both start and end times');
        return;
      }

      if (newEndTime <= newStartTime) {
        setError('End time must be after start time');
        return;
      }

      // Check if the new time is in the future
      if (newStartTime <= new Date()) {
        setError('Start time must be in the future');
        return;
      }

      const response = await fetch(`${API_BASE}/api/bookings/${selectedBookingForEdit.id}/modify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startTime: newStartTime.toISOString(),
          endTime: newEndTime.toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to modify booking');
      }

      const result = await response.json();
      
      // Update the bookings list
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === selectedBookingForEdit.id 
            ? { ...booking, startTime: newStartTime.toISOString(), endTime: newEndTime.toISOString() }
            : booking
        )
      );

      setSuccessMessage('Booking updated successfully!');
      setOpenEditDialog(false);
      setError(null);
      
      setTimeout(() => setSuccessMessage(''), 5000);
      
    } catch (error) {
      console.error('Error updating booking:', error);
      setError(error.message);
    }
  };

  const handleEditListing = (listing) => {
    setSelectedListingForEdit(listing);
    setEditListingData({
      title: listing.title || listing.location,
      description: listing.description || '',
      hourlyRate: listing.hourlyRate ? listing.hourlyRate.replace(/[^0-9.]/g, '') : '',
      location: listing.location || '',
      termsAndConditions: listing.termsAndConditions || '',
      available24h: listing.available24h !== undefined ? listing.available24h : true,
      maxDuration: listing.maxDuration ? listing.maxDuration.replace(/[^0-9]/g, '') : '',
      advanceBooking: listing.advanceBooking || 24,
      securityFeatures: listing.securityFeatures || [],
      amenities: listing.amenities || [],
      vehicleTypes: listing.vehicleTypes || ['car'],
      maxVehicleHeight: listing.maxVehicleHeight || '',
      maxVehicleLength: listing.maxVehicleLength || '',
      parkingType: listing.parkingType || 'lot',
      coordinates: listing.coordinates || null,
      images: listing.images || []
    });
    setOpenEditListingDialog(true);
  };

  const handleSaveListingEdit = async () => {
    if (!selectedListingForEdit) {
      setError('No listing selected for editing');
      return;
    }

    setEditListingLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/parking-spots/${selectedListingForEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editListingData,
          hourlyRate: `₹ ${editListingData.hourlyRate}`,
          userId: currentUser.uid
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update parking spot');
      }

      // Refresh data
      await fetchData(currentUser.uid);
      
      setSuccessMessage('Parking spot updated successfully!');
      setOpenEditListingDialog(false);
      setSelectedListingForEdit(null);
      
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      setError('Failed to update parking spot: ' + error.message);
    } finally {
      setEditListingLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        fetchData(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUser && bookings.length > 0) {
      calculateStats();
    }
  }, [currentUser, bookings, listings, verificationStatus]);

  const fetchData = async (userId) => {
    try {
      setBookingsLoading(true);
      setListingsLoading(true);
      setError(null);
      setNetworkError(null);

      const [bookingsResponse, listingsResponse, verificationResponse] = await Promise.allSettled([
        fetch(`${API_BASE}/api/users/${userId}/bookings`),
        fetch(`${API_BASE}/api/spots/user/${userId}`),
        fetch(`${API_BASE}/api/users/${userId}/verification`)
      ]);

      // Handle bookings
      if (bookingsResponse.status === 'fulfilled' && bookingsResponse.value.ok) {
        const bookingsData = await bookingsResponse.value.json();
        setBookings(bookingsData);
      } else {
        console.error('Failed to fetch bookings');
      }

      // Handle listings
      if (listingsResponse.status === 'fulfilled' && listingsResponse.value.ok) {
        const listingsData = await listingsResponse.value.json();
        setListings(listingsData);
      } else {
        console.error('Failed to fetch listings');
      }

      // Handle verification status
      if (verificationResponse.status === 'fulfilled' && verificationResponse.value.ok) {
        const verificationData = await verificationResponse.value.json();
        setVerificationStatus(verificationData);
      } else {
        console.error('Failed to fetch verification status');
      }

    } catch (error) {
      console.error('Network error:', error);
      setNetworkError('Failed to connect to server. Please check your internet connection.');
    } finally {
      setBookingsLoading(false);
      setListingsLoading(false);
    }
  };

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
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<EditIcon />}
            variant="outlined"
            onClick={handleEditProfile}
          >
            Edit Profile
          </Button>
          <IconButton onClick={handleMenuClick}>
            <SettingsIcon />
          </IconButton>
        </Box>
      </Box>
      
      {/* Profile Completion Progress */}
      <Box sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Profile Completion
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {Math.round(stats.completionPercentage)}%
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={stats.completionPercentage} 
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>
    </Paper>
  );

  const renderQuickStats = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ textAlign: 'center', p: 2 }}>
          <BookingsIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
          <Typography variant="h4" color="primary.main">
            {stats.totalBookings}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Bookings
          </Typography>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ textAlign: 'center', p: 2 }}>
          <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
          <Typography variant="h4" color="success.main">
            {stats.activeBookings}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Active Bookings
          </Typography>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ textAlign: 'center', p: 2 }}>
          <MoneyIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
          <Typography variant="h4" color="warning.main">
            ${stats.totalEarnings}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Earnings
          </Typography>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ textAlign: 'center', p: 2 }}>
          <LocationIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
          <Typography variant="h4" color="info.main">
            {stats.totalListings}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            My Listings
          </Typography>
        </Card>
      </Grid>
    </Grid>
  );

  const renderListings = () => (
    <Grid container spacing={3}>
      {listings.map((listing) => {
        // Get bookings for this listing
        const listingBookings = bookings.filter(booking => booking.spotId === listing.id);
        
        return (
          <Grid item xs={12} key={listing.id}>
            <Card sx={{ mb: 2 }}>
              <CardMedia
                component="img"
                height="140"
                image={listing.images?.[0] || 'https://via.placeholder.com/400x200?text=No+Image'}
                alt={listing.location}
              />
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {listing.location}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Rate: {listing.hourlyRate}/hour
                    </Typography>
                    <Chip
                      label={listing.available ? 'Available' : 'Not Available'}
                      color={listing.available ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  <Button
                    startIcon={<EditIcon />}
                    size="small"
                    onClick={() => handleEditListing(listing)}
                  >
                    Edit Spot
                  </Button>
                </Box>

                {/* Bookings for this listing */}
                <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                  Bookings ({listingBookings.length})
                </Typography>
                
                {listingBookings.length === 0 ? (
                  <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No bookings for this spot yet.
                  </Typography>
                ) : (
                  <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                    {listingBookings.map((booking) => (
                      <Card key={booking.id} sx={{ mb: 1, bgcolor: 'background.default' }}>
                        <CardContent sx={{ py: 1.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {booking.userName || 'Unknown User'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(booking.startTime).toLocaleDateString()} - {new Date(booking.endTime).toLocaleDateString()}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                ${booking.totalPrice || 'N/A'}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Chip
                                label={booking.status || 'confirmed'}
                                color={booking.status === 'confirmed' ? 'success' : 'default'}
                                size="small"
                              />
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<EditIcon />}
                                onClick={() => handleEditBooking(booking)}
                              >
                                Edit
                              </Button>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        );
      })}
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
          <Typography color="text.secondary" textAlign="center">
            No bookings found. 
            <Button color="primary" onClick={() => navigate('/')} sx={{ ml: 1 }}>
              Browse Parking Spots
            </Button>
          </Typography>
        </Grid>
      ) : (
        bookings.map((booking) => (
          <Grid item xs={12} key={booking.id}>
            <BookingCard 
              booking={booking} 
              onCancel={handleCancelBooking}
              isCancelling={cancellingBooking === booking.id}
            />
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
        
        {/* Success Message */}
        {successMessage && (
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              mb: 3, 
              bgcolor: 'success.light', 
              color: 'success.contrastText',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant="body1">
              {successMessage}
            </Typography>
            <Button 
              size="small" 
              color="inherit" 
              onClick={() => setSuccessMessage('')}
            >
              ✕
            </Button>
          </Paper>
        )}
        
        {/* Error Message */}
        {error && (
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              mb: 3, 
              bgcolor: 'error.light', 
              color: 'error.contrastText',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Typography variant="body1">
              {error}
            </Typography>
            <Button 
              size="small" 
              color="inherit" 
              onClick={() => setError(null)}
            >
              ✕
            </Button>
          </Paper>
        )}

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

        {/* Quick Stats Dashboard */}
        {renderQuickStats()}

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            variant="fullWidth"
          >
            <Tab label="My Bookings" />
            <Tab label="My Listings" />
            <Tab label="Verification" />
            <Tab label="Analytics" />
            <Tab label="Blocked Users" />
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

        <TabPanel value={tabValue} index={3}>
          <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default' }}>
            <Typography variant="h6" gutterBottom>
              Analytics & Insights
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Booking Performance
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <BookingsIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={`${stats.totalBookings} Total Bookings`}
                          secondary="All time bookings"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <TrendingUpIcon color="success" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={`${stats.activeBookings} Active Bookings`}
                          secondary="Currently active"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <StarIcon color="warning" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={`${stats.averageRating.toFixed(1)} Average Rating`}
                          secondary="From all bookings"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Financial Summary
                    </Typography>
                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <MoneyIcon color="success" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={`$${stats.totalEarnings} Total Earnings`}
                          secondary="From completed bookings"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <LocationIcon color="info" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={`${stats.totalListings} Active Listings`}
                          secondary="Your parking spots"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircleIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={`${Math.round(stats.completionPercentage)}% Profile Complete`}
                          secondary="Profile completion status"
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Recent Activity
                    </Typography>
                    {bookings.length > 0 ? (
                      <List>
                        {bookings.slice(0, 5).map((booking, index) => (
                          <ListItem key={booking.id} divider={index < 4}>
                            <ListItemIcon>
                              <ScheduleIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={`Booking for ${booking.spotDetails?.location || 'Parking Spot'}`}
                              secondary={`${new Date(booking.startTime).toLocaleDateString()} - ${booking.status}`}
                            />
                            <Chip 
                              label={booking.status} 
                              color={booking.status === 'confirmed' ? 'success' : 'default'}
                              size="small"
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography color="text.secondary" textAlign="center">
                        No recent activity
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.default' }}>
            <BlockedUsersManager />
          </Paper>
        </TabPanel>
      </Box>
      
      {/* Cancellation Confirmation Dialog */}
      <Dialog
        open={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Cancel Booking
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to cancel your booking for:
          </Typography>
          <Typography variant="h6" color="primary" gutterBottom>
            {bookingToCancel?.spotDetails?.location || bookingToCancel?.location || 'Parking Spot'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone. The parking spot will become available again for other users.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowCancelConfirm(false)}
            disabled={cancellingBooking}
          >
            Keep Booking
          </Button>
          <Button 
            onClick={confirmCancelBooking}
            color="error"
            variant="contained"
            disabled={cancellingBooking}
          >
            {cancellingBooking ? 'Cancelling...' : 'Cancel Booking'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Booking Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Booking</DialogTitle>
        <DialogContent>
          <Box py={2}>
            {selectedBookingForEdit && (
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Editing booking for: <strong>{selectedBookingForEdit.userName || 'Unknown User'}</strong>
              </Typography>
            )}
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <DateTimePicker
                    label="New Start Time"
                    value={newStartTime}
                    onChange={setNewStartTime}
                    renderInput={(props) => <TextField {...props} fullWidth />}
                    minDateTime={new Date()}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DateTimePicker
                    label="New End Time"
                    value={newEndTime}
                    onChange={setNewEndTime}
                    renderInput={(props) => <TextField {...props} fullWidth />}
                    minDateTime={newStartTime || new Date()}
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenEditDialog(false);
            setError(null);
          }}>
            Cancel
          </Button>
          <Button onClick={handleSaveBookingEdit} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileDialog} onClose={() => setEditProfileDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Box py={2}>
            <TextField
              label="Display Name"
              value={editProfileData.displayName}
              onChange={(e) => setEditProfileData({ ...editProfileData, displayName: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Email"
              value={editProfileData.email}
              onChange={(e) => setEditProfileData({ ...editProfileData, email: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Phone"
              value={editProfileData.phone}
              onChange={(e) => setEditProfileData({ ...editProfileData, phone: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditProfileDialog(false);
            setError(null);
          }}>
            Cancel
          </Button>
          <Button onClick={handleSaveProfile} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Listing Dialog */}
      <Dialog open={openEditListingDialog} onClose={() => setOpenEditListingDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Edit Parking Spot</DialogTitle>
        <DialogContent>
          <Box py={2}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Basic Information</Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Title"
                  value={editListingData.title}
                  onChange={(e) => setEditListingData({ ...editListingData, title: e.target.value })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  value={editListingData.description}
                  onChange={(e) => setEditListingData({ ...editListingData, description: e.target.value })}
                  fullWidth
                  multiline
                  rows={3}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Location"
                  value={editListingData.location}
                  onChange={(e) => setEditListingData({ ...editListingData, location: e.target.value })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Hourly Rate (₹)"
                  value={editListingData.hourlyRate}
                  onChange={(e) => setEditListingData({ ...editListingData, hourlyRate: e.target.value })}
                  fullWidth
                  type="number"
                  required
                />
              </Grid>

              {/* Parking Type and Vehicle Types */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Parking Details</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Parking Type</InputLabel>
                  <Select
                    value={editListingData.parkingType}
                    onChange={(e) => setEditListingData({ ...editListingData, parkingType: e.target.value })}
                    label="Parking Type"
                  >
                    <MenuItem value="street">Street Parking</MenuItem>
                    <MenuItem value="lot">Parking Lot</MenuItem>
                    <MenuItem value="covered_lot">Covered Lot</MenuItem>
                    <MenuItem value="garage">Garage</MenuItem>
                    <MenuItem value="underground">Underground</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Vehicle Types</InputLabel>
                  <Select
                    multiple
                    value={editListingData.vehicleTypes}
                    onChange={(e) => setEditListingData({ ...editListingData, vehicleTypes: e.target.value })}
                    label="Vehicle Types"
                    renderValue={(selected) => selected.join(', ')}
                  >
                    <MenuItem value="car">Car</MenuItem>
                    <MenuItem value="suv">SUV</MenuItem>
                    <MenuItem value="bike">Bike</MenuItem>
                    <MenuItem value="truck">Truck</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Booking Settings */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Booking Settings</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Max Duration (hours)"
                  value={editListingData.maxDuration}
                  onChange={(e) => setEditListingData({ ...editListingData, maxDuration: e.target.value })}
                  fullWidth
                  type="number"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Advance Booking (hours)"
                  value={editListingData.advanceBooking}
                  onChange={(e) => setEditListingData({ ...editListingData, advanceBooking: e.target.value })}
                  fullWidth
                  type="number"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Max Vehicle Height (m)"
                  value={editListingData.maxVehicleHeight}
                  onChange={(e) => setEditListingData({ ...editListingData, maxVehicleHeight: e.target.value })}
                  fullWidth
                  type="number"
                  step="0.1"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Max Vehicle Length (m)"
                  value={editListingData.maxVehicleLength}
                  onChange={(e) => setEditListingData({ ...editListingData, maxVehicleLength: e.target.value })}
                  fullWidth
                  type="number"
                  step="0.1"
                />
              </Grid>

              {/* Features */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Features & Amenities</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editListingData.available24h}
                      onChange={(e) => setEditListingData({ ...editListingData, available24h: e.target.checked })}
                    />
                  }
                  label="Available 24/7"
                />
              </Grid>

              {/* Security Features */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>Security Features</Typography>
                <FormGroup row>
                  {['cctv', 'security_guard', 'fenced', 'well_lit'].map((feature) => (
                    <FormControlLabel
                      key={feature}
                      control={
                        <Checkbox
                          checked={editListingData.securityFeatures.includes(feature)}
                          onChange={(e) => {
                            const newFeatures = e.target.checked
                              ? [...editListingData.securityFeatures, feature]
                              : editListingData.securityFeatures.filter(f => f !== feature);
                            setEditListingData({ ...editListingData, securityFeatures: newFeatures });
                          }}
                        />
                      }
                      label={feature.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    />
                  ))}
                </FormGroup>
              </Grid>

              {/* Amenities */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>Amenities</Typography>
                <FormGroup row>
                  {['covered', 'ev_charging', 'accessible', 'car_wash', 'valet_service'].map((amenity) => (
                    <FormControlLabel
                      key={amenity}
                      control={
                        <Checkbox
                          checked={editListingData.amenities.includes(amenity)}
                          onChange={(e) => {
                            const newAmenities = e.target.checked
                              ? [...editListingData.amenities, amenity]
                              : editListingData.amenities.filter(a => a !== amenity);
                            setEditListingData({ ...editListingData, amenities: newAmenities });
                          }}
                        />
                      }
                      label={amenity.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    />
                  ))}
                </FormGroup>
              </Grid>

              {/* Terms and Conditions */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Terms & Conditions</Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Terms and Conditions"
                  value={editListingData.termsAndConditions}
                  onChange={(e) => setEditListingData({ ...editListingData, termsAndConditions: e.target.value })}
                  fullWidth
                  multiline
                  rows={4}
                  required
                />
              </Grid>
            </Grid>
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenEditListingDialog(false);
            setError(null);
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveListingEdit} 
            variant="contained" 
            color="primary"
            disabled={editListingLoading}
          >
            {editListingLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Profile;
