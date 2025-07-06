import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  Rating,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  FormGroup,
  Checkbox,
} from '@mui/material';
import {
  LocationOn,
  Star,
  Favorite,
  FavoriteBorder,
  Share,
  Phone,
  Email,
  Security,
  LocalParking,
  DirectionsCar,
  Wifi,
  LocalCarWash,
  EvStation,
  Accessible,
  DirectionsBike,
  Wc,
  Info,
  CalendarToday,
  Person,
  Verified,
  Message,
  BookOnline,
  ArrowBack,
  MyLocation,
  CheckCircle,
  Warning,
  Edit,
} from '@mui/icons-material';

import { useAuth } from '../contexts/AuthContext';
import { useRealtime } from '../contexts/RealtimeContext';
import BookingModal from './BookingModal';

import ReviewsAndRatings from './ReviewsAndRatings';
import MapComponent from './MapComponent';


const ParkingSpotDetail = () => {
  const { spotId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addNotification } = useRealtime() || {};
  
  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const [selectedTab, setSelectedTab] = useState(0);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editData, setEditData] = useState({
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
    maxVehicleLength: '',
    parkingType: 'lot',
    coordinates: null,
    images: []
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Check if current user is the owner of this spot
  const isOwner = currentUser && spot && spot.owner === currentUser.uid;

  useEffect(() => {
    fetchSpotDetails();
  }, [spotId, currentUser?.uid]);

  const fetchSpotDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching spot details for spotId:', spotId);
      console.log('Current user:', currentUser);
      
      if (!spotId) {
        throw new Error('No spot ID provided');
      }
      
      const userId = currentUser?.uid || 'none';
      const url = `http://localhost:3001/parking-spots/${spotId}?userId=${userId}`;
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url);
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Parking spot not found');
        }
        throw new Error(`Failed to fetch spot details: ${response.status}`);
      }
      
      const spotData = await response.json();
      console.log('Received spot data:', spotData);
      
      if (!spotData || !spotData.id) {
        throw new Error('Invalid spot data received');
      }
      
      setSpot(spotData);
      console.log('Spot data set successfully');
    } catch (error) {
      console.error('Error fetching spot details:', error);
      setError(error.message || 'Failed to load parking spot details');
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Implement favorite functionality
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: spot?.title || 'Parking Spot',
        text: `Check out this parking spot: ${spot?.location}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // TODO: Show success message
    }
  };

  const handleBooking = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setShowBookingModal(true);
  };

  const handleContactHost = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    // Navigate to messaging system with the host
    navigate(`/messages?recipient=${spot?.owner}&subject=Inquiry about ${spot?.title}`);
  };

  const handleBookingComplete = (success) => {
    setShowBookingModal(false);
    if (success) {
      fetchSpotDetails(); // Refresh spot data
    }
  };

  const handleEdit = () => {
    if (!spot) return;
    
    setEditData({
      title: spot.title || '',
      description: spot.description || '',
      hourlyRate: spot.hourlyRate ? spot.hourlyRate.replace(/[^0-9.]/g, '') : '',
      location: spot.location || '',
      termsAndConditions: spot.termsAndConditions || '',
      available24h: spot.available24h !== undefined ? spot.available24h : true,
      maxDuration: spot.maxDuration ? spot.maxDuration.replace(/[^0-9]/g, '') : '',
      advanceBooking: spot.advanceBooking || 24,
      securityFeatures: spot.securityFeatures || [],
      amenities: spot.amenities || [],
      vehicleTypes: spot.vehicleTypes || ['car'],
      maxVehicleHeight: spot.maxVehicleHeight || '',
      maxVehicleLength: spot.maxVehicleLength || '',
      parkingType: spot.parkingType || 'lot',
      coordinates: spot.coordinates || null,
      images: spot.images || []
    });
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!spot) return;
    
    setEditLoading(true);
    setEditError('');
    
    try {
      const response = await fetch(`http://localhost:3001/parking-spots/${spot.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editData,
          hourlyRate: `₹ ${editData.hourlyRate}`,
          userId: currentUser.uid
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update parking spot');
      }

      // Refresh spot data
      await fetchSpotDetails();
      
      setShowEditDialog(false);
      if (addNotification) {
        addNotification('Parking spot updated successfully!', 'success');
      }
    } catch (error) {
      setEditError('Failed to update parking spot: ' + error.message);
    } finally {
      setEditLoading(false);
    }
  };

  const getAvailabilityColor = () => {
    if (!spot) return 'default';
    return spot.available ? 'success' : 'error';
  };

  const getAvailabilityText = () => {
    if (!spot) return 'Loading...';
    return spot.available ? 'Available Now' : 'Currently Occupied';
  };

  const getAmenityIcon = (amenity) => {
    const iconMap = {
      'Security': <Security />,
      'Covered': <LocalParking />,
      'EV Charging': <EvStation />,
      'Car Wash': <LocalCarWash />,
      'WiFi': <Wifi />,
      'Accessible': <Accessible />,
      'Bike Parking': <DirectionsBike />,
      'Restroom': <Wc />,
      'cctv': <Security />,
      'security_guard': <Security />,
      'fenced': <Security />,
      'well_lit': <Security />,
      'covered': <LocalParking />,
      'ev_charging': <EvStation />,
      'car_wash': <LocalCarWash />,
      'shuttle_service': <DirectionsCar />,
      'accessible': <Accessible />,
      'bike_racks': <DirectionsBike />,
      'restroom': <Wc />,
    };
    return iconMap[amenity] || <Info />;
  };



  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error || !spot) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Parking spot not found'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 10, md: 12 }, mb: 8 }}>
      {/* Back Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back to Search
        </Button>
      </Box>

      <Grid container spacing={4} alignItems="flex-start">
        {/* Main Content */}
        <Grid item xs={12} lg={8}>
          {/* Image Gallery */}
          <Box sx={{ position: 'relative', mb: 3 }}>
            <Card sx={{ overflow: 'hidden', position: 'relative' }}>
              <CardMedia
                component="img"
                height="400"
                image={(() => {
                  if (spot.images && spot.images.length > 0) {
                    // If images is an array of URLs or base64 data, use the first one
                    if (typeof spot.images[0] === 'string') {
                      return spot.images[0];
                    }
                    // If images is an array of objects with data property (base64)
                    if (spot.images[0] && typeof spot.images[0] === 'object' && spot.images[0].data) {
                      return spot.images[0].data;
                    }
                  }
                  return 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=800&h=400&fit=crop';
                })()}
                alt={spot.title || spot.location}
                sx={{ objectFit: 'cover', width: '100%' }}
              />
              {/* Image Overlay with Actions */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  display: 'flex',
                  gap: 1,
                  zIndex: 2,
                  background: 'rgba(255,255,255,0.85)',
                  borderRadius: 2,
                  p: 0.5,
                  boxShadow: 1,
                }}
              >
                <Tooltip title="Add to Favorites">
                  <IconButton
                    onClick={handleFavorite}
                    sx={{ bgcolor: 'transparent', '&:hover': { bgcolor: 'white' } }}
                  >
                    {isFavorite ? <Favorite sx={{ color: 'red' }} /> : <FavoriteBorder />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Share">
                  <IconButton
                    onClick={handleShare}
                    sx={{ bgcolor: 'transparent', '&:hover': { bgcolor: 'white' } }}
                  >
                    <Share />
                  </IconButton>
                </Tooltip>
              </Box>
            </Card>
          </Box>

          {/* Spot Information */}
          <Card sx={{ mb: 3, p: { xs: 2, md: 3 } }}>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'flex-start' }, mb: 2, gap: 2 }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {spot.title || spot.location}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LocationOn color="action" />
                    <Typography variant="body1" color="text.secondary">
                      {spot.location}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Rating value={spot.rating || 0} precision={0.1} readOnly />
                    <Typography variant="body2" color="text.secondary">
                      {spot.rating || 0} ({spot.reviews?.length || 0} reviews)
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                  <Typography variant="h3" color="primary" fontWeight="bold">
                    ₹{parseFloat(spot.hourlyRate?.replace(/[^0-9.]/g, '') || '0')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    per hour
                  </Typography>
                </Box>
              </Box>

              {/* Availability Status */}
              <Box sx={{ mb: 3 }}>
                <Chip
                  icon={spot.available ? <CheckCircle /> : <Warning />}
                  label={getAvailabilityText()}
                  color={getAvailabilityColor()}
                  variant="filled"
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>

              {/* Quick Stats */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      {spot.maxDuration || '24h'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Max Duration
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      {spot.bookings?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Bookings
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      {spot.parkingType || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Type
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      {spot.available24h ? '24/7' : 'Limited'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Access
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Amenities */}
              {spot.amenities && spot.amenities.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                    Amenities
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {spot.amenities.map((amenity, idx) => (
                      <Chip
                        key={idx}
                        icon={getAmenityIcon(amenity)}
                        label={amenity.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Description */}
              {spot.description && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                    About this spot
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {spot.description}
                  </Typography>
                </Box>
              )}

              {/* About Owner */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                  About the owner
                </Typography>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
                      <Person />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {spot.ownerName || 'Parking Owner'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Member since {spot.createdAt ? new Date(spot.createdAt).getFullYear() : '2024'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Message />}
                      onClick={() => setShowContactDialog(true)}
                    >
                      Contact Owner
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Verified />}
                    >
                      Verified Host
                    </Button>
                  </Box>
                </Card>
              </Box>
            </CardContent>
          </Card>

          {/* Tabs Section */}
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
                <Tab label="Description" />
                <Tab label="Amenities" />
                <Tab label="Location" />
                <Tab label="Reviews" />
              </Tabs>
            </Box>
            <CardContent>
              {selectedTab === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    About This Parking Spot
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {spot.description || spot.termsAndConditions || 'This is a premium parking spot located in a convenient area. Perfect for short-term and long-term parking needs.'}
                  </Typography>
                  
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Terms & Conditions
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {spot.termsAndConditions || 'Standard parking terms and conditions apply. Users must follow parking rules and respect the property.'}
                  </Typography>
                </Box>
              )}

              {selectedTab === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Amenities & Features
                  </Typography>
                  <Grid container spacing={2}>
                    {spot.securityFeatures?.map((feature, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                          {getAmenityIcon(feature)}
                          <Typography variant="body2">{feature}</Typography>
                        </Box>
                      </Grid>
                    ))}
                    {spot.amenities?.map((amenity, index) => (
                      <Grid item xs={12} sm={6} key={`amenity-${index}`}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                          {getAmenityIcon(amenity)}
                          <Typography variant="body2">{amenity}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {selectedTab === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Location & Map
                  </Typography>
                  <Box sx={{ height: 300, mb: 2 }}>
                    <MapComponent
                      center={spot.coordinates || [19.0760, 72.8777]}
                      zoom={15}
                      height="300px"
                      markers={[{
                        position: spot.coordinates || [19.0760, 72.8777],
                        popup: (
                          <Box sx={{ p: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">{spot.title || spot.location}</Typography>
                            <Typography variant="body2" color="primary" fontWeight="bold">
                              ₹{parseFloat(spot.hourlyRate?.replace(/[^0-9.]/g, '') || '0')}/hour
                            </Typography>
                          </Box>
                        )
                      }]}
                    />
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<MyLocation />}
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition((position) => {
                          const { latitude, longitude } = position.coords;
                          const url = `https://www.google.com/maps/dir/${latitude},${longitude}/${spot.coordinates?.[0]},${spot.coordinates?.[1]}`;
                          window.open(url, '_blank');
                        });
                      }
                    }}
                  >
                    Get Directions
                  </Button>
                </Box>
              )}

              {selectedTab === 3 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Reviews & Ratings
                  </Typography>
                  <ReviewsAndRatings spotId={spotId} />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Booking Sidebar */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ position: { lg: 'sticky' }, top: { lg: 100 } }}>
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                Book this spot
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="h3" color="primary" fontWeight="bold" sx={{ mb: 1 }}>
                  ₹{parseFloat(spot.hourlyRate?.replace(/[^0-9.]/g, '') || '0')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  per hour
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Chip
                  icon={spot.available ? <CheckCircle /> : <Warning />}
                  label={getAvailabilityText()}
                  color={getAvailabilityColor()}
                  variant="filled"
                  sx={{ fontWeight: 'bold', mb: 2 }}
                />
                
                {spot.available && !spot.isOwner && (
                  <Typography variant="body2" color="text.secondary">
                    Available for booking - Select your preferred time and date
                  </Typography>
                )}
              </Box>

              {spot.available && !spot.isOwner && (
                <>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={<BookOnline />}
                    onClick={() => {
                      console.log('Book Now button clicked!');
                      handleBooking();
                    }}
                    sx={{ mb: 2, py: 1.5, bgcolor: '#22C55E', '&:hover': { bgcolor: '#16A34A' } }}
                  >
                    Book Now
                  </Button>
                  
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    startIcon={<Message />}
                    onClick={handleContactHost}
                    sx={{ 
                      mb: 2, 
                      py: 1.5, 
                      borderColor: '#007A87', 
                      color: '#007A87', 
                      '&:hover': { 
                        borderColor: '#005F6B', 
                        backgroundColor: 'rgba(0, 122, 135, 0.05)' 
                      } 
                    }}
                  >
                    Contact Host
                  </Button>
                </>
              )}

              {!spot.available && (
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled
                  sx={{ mb: 2, py: 1.5 }}
                >
                  Currently Unavailable
                </Button>
              )}

              {spot.isOwner && (
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled
                  sx={{ mb: 2, py: 1.5 }}
                >
                  Your Spot
                </Button>
              )}

              {isOwner && (
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  startIcon={<Edit />}
                  onClick={handleEdit}
                  sx={{ mb: 2, py: 1.5, borderColor: '#FF385C', color: '#FF385C', '&:hover': { borderColor: '#E31C5F', backgroundColor: 'rgba(255, 56, 92, 0.05)' } }}
                >
                  Edit Spot
                </Button>
              )}

              {!currentUser && (
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Please log in to book this spot
                </Typography>
              )}

              {spot.isOwner && (
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  You cannot book your own spot
                </Typography>
              )}
            </Card>

            {/* Map Component */}
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Location
              </Typography>
              <Box sx={{ height: 200, borderRadius: 2, overflow: 'hidden' }}>
                <MapComponent
                  center={spot.coordinates || [19.076, 72.8777]}
                  zoom={15}
                  spots={[spot]}
                  showSpotMarkers={true}
                />
              </Box>
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* Contact Owner Dialog */}
      <Dialog
        open={showContactDialog}
        onClose={() => setShowContactDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Contact {spot.ownerName || 'Owner'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Send a message to the owner about this parking spot.
          </Typography>
          <TextField
            label="Subject"
            fullWidth
            defaultValue={`Inquiry about ${spot.title || spot.location}`}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Message"
            multiline
            rows={4}
            fullWidth
            placeholder="Hi! I'm interested in your parking spot..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowContactDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={() => {
              // TODO: Implement message sending
              console.log('Sending message to owner');
              setShowContactDialog(false);
            }}
          >
            Send Message
          </Button>
        </DialogActions>
      </Dialog>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          open={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          spot={spot}
          onBookingComplete={handleBookingComplete}
        />
      )}

      {/* Edit Spot Dialog */}
      <Dialog open={showEditDialog && editData && editData.securityFeatures && editData.amenities} onClose={() => setShowEditDialog(false)} maxWidth="lg" fullWidth>
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
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  fullWidth
                  multiline
                  rows={3}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Location"
                  value={editData.location}
                  onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Hourly Rate (₹)"
                  value={editData.hourlyRate}
                  onChange={(e) => setEditData({ ...editData, hourlyRate: e.target.value })}
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
                    value={editData.parkingType}
                    onChange={(e) => setEditData({ ...editData, parkingType: e.target.value })}
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
                    value={editData.vehicleTypes}
                    onChange={(e) => setEditData({ ...editData, vehicleTypes: e.target.value })}
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
                  value={editData.maxDuration}
                  onChange={(e) => setEditData({ ...editData, maxDuration: e.target.value })}
                  fullWidth
                  type="number"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Advance Booking (hours)"
                  value={editData.advanceBooking}
                  onChange={(e) => setEditData({ ...editData, advanceBooking: e.target.value })}
                  fullWidth
                  type="number"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Max Vehicle Height (m)"
                  value={editData.maxVehicleHeight}
                  onChange={(e) => setEditData({ ...editData, maxVehicleHeight: e.target.value })}
                  fullWidth
                  type="number"
                  step="0.1"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Max Vehicle Length (m)"
                  value={editData.maxVehicleLength}
                  onChange={(e) => setEditData({ ...editData, maxVehicleLength: e.target.value })}
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
                      checked={editData.available24h}
                      onChange={(e) => setEditData({ ...editData, available24h: e.target.checked })}
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
                          checked={editData.securityFeatures?.includes(feature) || false}
                          onChange={(e) => {
                            const currentFeatures = editData.securityFeatures || [];
                            const newFeatures = e.target.checked
                              ? [...currentFeatures, feature]
                              : currentFeatures.filter(f => f !== feature);
                            setEditData({ ...editData, securityFeatures: newFeatures });
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
                          checked={editData.amenities?.includes(amenity) || false}
                          onChange={(e) => {
                            const currentAmenities = editData.amenities || [];
                            const newAmenities = e.target.checked
                              ? [...currentAmenities, amenity]
                              : currentAmenities.filter(a => a !== amenity);
                            setEditData({ ...editData, amenities: newAmenities });
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
                  value={editData.termsAndConditions}
                  onChange={(e) => setEditData({ ...editData, termsAndConditions: e.target.value })}
                  fullWidth
                  multiline
                  rows={4}
                  required
                />
              </Grid>
            </Grid>
            {editError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {editError}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowEditDialog(false);
            setEditError('');
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveEdit} 
            variant="contained" 
            color="primary"
            disabled={editLoading}
          >
            {editLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
};

export default ParkingSpotDetail; 