import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  TextField,
  Slider,
  Paper,
  Rating,
  InputAdornment,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  Fade,
  Grow,
  Zoom,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Badge,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  ToggleButton,
  ToggleButtonGroup,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Skeleton,
  AlertTitle,
  Breadcrumbs,
  Link,
  Checkbox,
} from '@mui/material';
import {
  Search as SearchIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  WifiTethering as LiveIcon,
  ViewList as ListIcon,
  Map as MapIcon,
  FilterList as FilterIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Sort as SortIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  AccessTime as TimeIcon,
  ViewModule as GridIcon,
  Clear as ClearIcon,
  Add as AddIcon,
  MyLocation as MyLocationIcon,
  ExpandMore as ExpandMoreIcon,
  LocalParking as ParkingIcon,
  ElectricCar as ElectricIcon,
  Accessibility as AccessibilityIcon,
  LocalCarWash as CarWashIcon,
  DirectionsCar as CarIcon,
  DirectionsWalk as WalkIcon,
  DirectionsBike as BikeIcon,
  LocalTaxi as TaxiIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import MapComponent from './components/MapComponent';
import LoadingSpinner from './components/LoadingSpinner';
import ParkingSpotCard from './components/ParkingSpotCard';
import { useRealtime } from './contexts/RealtimeContext';

const initialCenter = [19.0760, 72.8777]; // Mumbai coordinates

const ParkingSpotList = () => {
  const navigate = useNavigate();
  const { joinSpotRoom, leaveSpotRoom, isConnected } = useRealtime();
  const [spots, setSpots] = useState([]);
  const [filteredSpots, setFilteredSpots] = useState([]);
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(initialCenter);
  const [user, setUser] = useState(null);
  
  // Enhanced search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 50]);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [distanceFilter, setDistanceFilter] = useState(10);
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('distance');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [spotsPerPage] = useState(12);
  const [favorites, setFavorites] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [vehicleType, setVehicleType] = useState('all');
  const [parkingType, setParkingType] = useState('all');
  const [instantBooking, setInstantBooking] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const sortOptions = [
    { value: 'distance', label: 'Distance', icon: LocationIcon },
    { value: 'price', label: 'Price', icon: MoneyIcon },
    { value: 'rating', label: 'Rating', icon: StarIcon },
    { value: 'availability', label: 'Availability', icon: ScheduleIcon },
    { value: 'popularity', label: 'Popularity', icon: TrendingIcon },
  ];

  const amenities = [
    { id: 'security', label: 'Security Camera', icon: SecurityIcon },
    { id: 'covered', label: 'Covered Parking', icon: ParkingIcon },
    { id: 'electric', label: 'Electric Charging', icon: ElectricIcon },
    { id: 'accessible', label: 'Accessible', icon: AccessibilityIcon },
    { id: 'car_wash', label: 'Car Wash', icon: CarWashIcon },
    { id: 'valet', label: 'Valet Service', icon: ParkingIcon },
  ];

  const vehicleTypes = [
    { value: 'all', label: 'All Vehicles', icon: CarIcon },
    { value: 'car', label: 'Car', icon: CarIcon },
    { value: 'suv', label: 'SUV', icon: CarIcon },
    { value: 'truck', label: 'Truck', icon: CarIcon },
    { value: 'motorcycle', label: 'Motorcycle', icon: BikeIcon },
  ];

  const parkingTypes = [
    { value: 'all', label: 'All Types', icon: ParkingIcon },
    { value: 'street', label: 'Street Parking', icon: ParkingIcon },
    { value: 'lot', label: 'Parking Lot', icon: ParkingIcon },
    { value: 'garage', label: 'Garage', icon: ParkingIcon },
    { value: 'underground', label: 'Underground', icon: ParkingIcon },
  ];

  const fetchParkingSpots = useCallback(async () => {
    setLoading(true);
    let queryParams = new URLSearchParams();
    const currentUser = auth.currentUser;
    console.log('Current user:', currentUser?.uid);

    // Always include current user ID for proper owner checks
    queryParams.append('userId', currentUser?.uid || 'none');

    // Add filter parameters
    queryParams.append('minPrice', priceRange[0]);
    queryParams.append('maxPrice', priceRange[1]);
    queryParams.append('rating', ratingFilter);
    if (searchTerm) {
      queryParams.append('search', searchTerm);
    }

    try {
      const response = await fetch(`http://localhost:3001/parking-spots?${queryParams.toString()}`);
      const data = await response.json();
      console.log('Fetched parking spots:', data.length);

      if (Array.isArray(data)) {
        // Transform the data to match the expected format
        const transformedSpots = data.map(spot => ({
          ...spot,
          title: spot.title || spot.location,
          address: spot.location,
          price: parseFloat(spot.hourlyRate?.replace(/[^0-9.]/g, '') || '0'),
          rating: spot.rating || 0,
          reviewCount: spot.reviews?.length || 0,
          features: [
            ...(spot.securityFeatures || []),
            ...(spot.amenities || [])
          ],
          distance: spot.distance || 0,
          available: spot.available !== false,
          images: spot.images || [],
          ownerName: spot.ownerName || 'Unknown',
          isOwner: spot.isOwner || false,
          canBook: spot.canBook !== false
        }));

        setSpots(transformedSpots);
        setFilteredSpots(transformedSpots);

        // If geolocation is available, update user location but don't filter spots
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              setUserLocation([latitude, longitude]);
            },
            (error) => {
              console.error('Error getting location:', error);
              setError('Could not get your location. Using default location.');
              setOpenSnackbar(true);
            }
          );
        }
      } else {
        console.error('Invalid data format received:', data);
        setError('Failed to load parking spots');
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error('Error fetching parking spots:', error);
      setError('Failed to fetch parking spots');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  }, [priceRange, ratingFilter, searchTerm]);

  useEffect(() => {
    fetchParkingSpots();
  }, [fetchParkingSpots]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  // Join spot rooms for real-time updates
  useEffect(() => {
    spots.forEach(spot => {
      joinSpotRoom(spot.id);
    });

    return () => {
      spots.forEach(spot => {
        leaveSpotRoom(spot.id);
      });
    };
  }, [spots, joinSpotRoom, leaveSpotRoom]);

  // Apply filters and sorting
  const filteredAndSortedSpots = useCallback(() => {
    let filtered = [...spots];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(spot =>
        spot.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spot.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply price filter
    filtered = filtered.filter(spot => {
      const price = parseFloat(spot.hourlyRate?.replace(/[^0-9.]/g, '') || '0');
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Apply rating filter
    if (ratingFilter > 0) {
      filtered = filtered.filter(spot => (spot.rating || 0) >= ratingFilter);
    }

    // Apply availability filter
    if (availabilityFilter === 'available') {
      filtered = filtered.filter(spot => spot.available);
    }

    // Apply amenities filter
    if (selectedAmenities.length > 0) {
      filtered = filtered.filter(spot =>
        selectedAmenities.every(amenity => 
          spot.features?.includes(amenity) || spot.amenities?.includes(amenity)
        )
      );
    }

    // Apply vehicle type filter
    if (vehicleType !== 'all') {
      filtered = filtered.filter(spot =>
        spot.vehicleTypes?.includes(vehicleType) || true // Default to true if no vehicle types specified
      );
    }

    // Apply parking type filter
    if (parkingType !== 'all') {
      filtered = filtered.filter(spot => spot.parkingType === parkingType);
    }

    // Apply instant booking filter
    if (instantBooking) {
      filtered = filtered.filter(spot => spot.canBook);
    }

    // Sort spots
    const sorted = sortSpots(filtered);
    return sorted;
  }, [spots, searchTerm, priceRange, ratingFilter, availabilityFilter, selectedAmenities, vehicleType, parkingType, instantBooking]);

  const sortSpots = (spotsToSort) => {
    switch (sortBy) {
      case 'price':
        return [...spotsToSort].sort((a, b) => a.price - b.price);
      case 'rating':
        return [...spotsToSort].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'availability':
        return [...spotsToSort].sort((a, b) => {
          if (a.available && !b.available) return -1;
          if (!a.available && b.available) return 1;
          return 0;
        });
      case 'popularity':
        return [...spotsToSort].sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
      case 'distance':
      default:
        return [...spotsToSort].sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }
  };

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setSnackbarMessage('Location updated successfully!');
          setSnackbarSeverity('success');
          setOpenSnackbar(true);
        },
        (error) => {
          setSnackbarMessage('Could not get your location');
          setSnackbarSeverity('error');
          setOpenSnackbar(true);
        }
      );
    }
  };

  const handleAdvancedSearch = (searchParams) => {
    setSearchTerm(searchParams.location || '');
    setPriceRange(searchParams.priceRange || [0, 50]);
    setRatingFilter(searchParams.rating || 0);
    setDistanceFilter(searchParams.distance || 10);
    setSelectedAmenities(searchParams.amenities || []);
    setShowFilters(false);
  };

  const handleToggleFavorite = (spotId) => {
    setFavorites(prev => 
      prev.includes(spotId) 
        ? prev.filter(id => id !== spotId)
        : [...prev, spotId]
    );
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
  };

  const handleFilterClick = () => {
    setShowFilters(!showFilters);
  };

  const getCurrentSpots = () => {
    const startIndex = (currentPage - 1) * spotsPerPage;
    const endIndex = startIndex + spotsPerPage;
    return filteredAndSortedSpots().slice(startIndex, endIndex);
  };

  const handleFavorite = (spotId, isFavorite) => {
    if (isFavorite) {
      setFavorites(prev => [...prev, spotId]);
    } else {
      setFavorites(prev => prev.filter(id => id !== spotId));
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPriceRange([0, 50]);
    setRatingFilter(0);
    setDistanceFilter(10);
    setAvailabilityFilter('all');
    setSortBy('distance');
    setSelectedAmenities([]);
    setVehicleType('all');
    setParkingType('all');
    setInstantBooking(false);
    setCurrentPage(1);
  };

  const saveSearch = () => {
    const searchConfig = {
      id: Date.now(),
      name: `Search ${savedSearches.length + 1}`,
      searchTerm,
      priceRange,
      ratingFilter,
      distanceFilter,
      availabilityFilter,
      selectedAmenities,
      vehicleType,
      parkingType,
      instantBooking,
      timestamp: new Date().toISOString()
    };
    setSavedSearches(prev => [...prev, searchConfig]);
    setSnackbarMessage('Search saved successfully!');
    setSnackbarSeverity('success');
    setOpenSnackbar(true);
  };

  const loadSearch = (savedSearch) => {
    setSearchTerm(savedSearch.searchTerm);
    setPriceRange(savedSearch.priceRange);
    setRatingFilter(savedSearch.ratingFilter);
    setDistanceFilter(savedSearch.distanceFilter);
    setAvailabilityFilter(savedSearch.availabilityFilter);
    setSelectedAmenities(savedSearch.selectedAmenities);
    setVehicleType(savedSearch.vehicleType);
    setParkingType(savedSearch.parkingType);
    setInstantBooking(savedSearch.instantBooking);
    setShowSavedSearches(false);
    setCurrentPage(1);
  };

  const handleAmenityToggle = (amenityId) => {
    setSelectedAmenities(prev =>
      prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/" underline="hover">
          Home
        </Link>
        <Typography color="text.primary">Search Parking</Typography>
      </Breadcrumbs>

      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
              Find Your Perfect Parking Spot
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Discover convenient parking options near you
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Chip
              icon={<LiveIcon />}
              label={isConnected ? 'Live Updates' : 'Offline'}
              color={isConnected ? 'success' : 'error'}
              size="small"
            />
            <Button
              variant="outlined"
              startIcon={<BookmarkIcon />}
              onClick={() => setShowSavedSearches(true)}
            >
              Saved Searches
            </Button>
            <Button
              variant="contained"
              startIcon={<FilterIcon />}
              onClick={handleFilterClick}
            >
              Filters
            </Button>
          </Box>
        </Box>

        {/* Main Search Bar */}
        <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder="Search by location, landmark, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleLocationClick} size="small">
                      <MyLocationIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1 }}
            />
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={saveSearch}
              disabled={!searchTerm && priceRange[0] === 0 && priceRange[1] === 50}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
            >
              Clear
            </Button>
          </Box>
        </Paper>

        {/* Quick Filters */}
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {filteredAndSortedSpots().length} spots found
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={availabilityFilter === 'available'}
                    onChange={(e) => setAvailabilityFilter(e.target.checked ? 'available' : 'all')}
                    size="small"
                  />
                }
                label="Available only"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={instantBooking}
                    onChange={(e) => setInstantBooking(e.target.checked)}
                    size="small"
                  />
                }
                label="Instant booking"
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Sort by:
              </Typography>
              <ToggleButtonGroup
                value={sortBy}
                exclusive
                onChange={(e, newValue) => newValue && handleSortChange(newValue)}
                size="small"
              >
                {sortOptions.map((option) => (
                  <ToggleButton key={option.value} value={option.value}>
                    <option.icon sx={{ mr: 0.5, fontSize: 16 }} />
                    {option.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Grid container spacing={4}>
        {/* Enhanced Filters Section */}
        <Grid item xs={12} md={3}>
          <Fade in timeout={500}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, position: 'sticky', top: 20 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ color: '#1E3A8A', fontWeight: 600 }}>
                  Filters
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  <ExpandMoreIcon 
                    sx={{ 
                      transform: showAdvancedFilters ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s'
                    }} 
                  />
                </IconButton>
              </Box>

              {/* Price Range */}
              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom fontWeight="medium">
                  Price Range (₹/hour)
                </Typography>
                <Slider
                  value={priceRange}
                  onChange={(e, newValue) => setPriceRange(newValue)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={100}
                  sx={{ color: 'primary.main' }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">₹{priceRange[0]}</Typography>
                  <Typography variant="body2">₹{priceRange[1]}</Typography>
                </Box>
              </Box>

              {/* Rating Filter */}
              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom fontWeight="medium">
                  Minimum Rating
                </Typography>
                <Rating
                  value={ratingFilter}
                  onChange={(e, newValue) => setRatingFilter(newValue)}
                  size="large"
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {ratingFilter}+ stars
                </Typography>
              </Box>

              {/* Distance Filter */}
              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom fontWeight="medium">
                  Distance (km)
                </Typography>
                <Slider
                  value={distanceFilter}
                  onChange={(e, newValue) => setDistanceFilter(newValue)}
                  valueLabelDisplay="auto"
                  min={0.1}
                  max={20}
                  sx={{ color: 'primary.main' }}
                />
                <Typography variant="body2" textAlign="center">
                  {distanceFilter.toFixed(1)} km
                </Typography>
              </Box>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <Fade in timeout={300}>
                  <Box>
                    {/* Vehicle Type */}
                    <Box sx={{ mb: 3 }}>
                      <Typography gutterBottom fontWeight="medium">
                        Vehicle Type
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Select
                          value={vehicleType}
                          onChange={(e) => setVehicleType(e.target.value)}
                        >
                          {vehicleTypes.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <type.icon fontSize="small" />
                                {type.label}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>

                    {/* Parking Type */}
                    <Box sx={{ mb: 3 }}>
                      <Typography gutterBottom fontWeight="medium">
                        Parking Type
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Select
                          value={parkingType}
                          onChange={(e) => setParkingType(e.target.value)}
                        >
                          {parkingTypes.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <type.icon fontSize="small" />
                                {type.label}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>

                    {/* Amenities */}
                    <Box sx={{ mb: 3 }}>
                      <Typography gutterBottom fontWeight="medium">
                        Amenities
                      </Typography>
                      <List dense>
                        {amenities.map((amenity) => (
                          <ListItem key={amenity.id} dense>
                            <ListItemIcon>
                              <Checkbox
                                checked={selectedAmenities.includes(amenity.id)}
                                onChange={() => handleAmenityToggle(amenity.id)}
                                size="small"
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <amenity.icon fontSize="small" />
                                  {amenity.label}
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Box>
                </Fade>
              )}
            </Paper>
          </Fade>
        </Grid>

        {/* Results Section */}
        <Grid item xs={12} md={9}>
          {/* View Mode Toggle */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              {viewMode === 'map' ? 'Map View' : 'List View'}
            </Typography>
            <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <Tabs value={viewMode} onChange={(e, newValue) => setViewMode(newValue)} size="small">
                <Tab 
                  value="grid" 
                  icon={<GridIcon />} 
                  label="Grid" 
                  sx={{ minHeight: 40 }}
                />
                <Tab 
                  value="list" 
                  icon={<ListIcon />} 
                  label="List" 
                  sx={{ minHeight: 40 }}
                />
                <Tab 
                  value="map" 
                  icon={<MapIcon />} 
                  label="Map" 
                  sx={{ minHeight: 40 }}
                />
              </Tabs>
            </Box>
          </Box>

          {/* Results Content */}
          {viewMode === 'map' ? (
            <Zoom in timeout={800}>
              <Paper elevation={3} sx={{ height: '600px', borderRadius: 3 }}>
                {loading ? (
                  <LoadingSpinner message="Loading parking spots..." />
                ) : (
                  <MapComponent
                    center={userLocation}
                    zoom={13}
                    height="600px"
                    markers={filteredAndSortedSpots().map(spot => ({
                      position: spot.coordinates,
                      popup: (
                        <Box sx={{ p: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">{spot.location}</Typography>
                          <Typography variant="body2" color="primary" fontWeight="bold">
                            ₹{spot.hourlyRate}/hour
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <Rating value={spot.rating || 0} readOnly size="small" />
                            <Typography variant="caption">
                              ({spot.rating || 0})
                            </Typography>
                          </Box>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => navigate(`/spot/${spot.id}`)}
                            sx={{ 
                              mt: 1,
                              bgcolor: '#22C55E',
                              '&:hover': { bgcolor: '#16A34A' }
                            }}
                          >
                            View Details
                          </Button>
                        </Box>
                      )
                    }))}
                    onMarkerClick={(marker) => {
                      const spot = filteredAndSortedSpots().find(s => 
                        s.coordinates[0] === marker.position[0] && 
                        s.coordinates[1] === marker.position[1]
                      );
                      if (spot) {
                        navigate(`/spot/${spot.id}`);
                      }
                    }}
                  />
                )}
              </Paper>
            </Zoom>
          ) : (
            <Grid container spacing={3}>
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <Grid item xs={12} sm={6} lg={4} key={index}>
                    <Card>
                      <Skeleton variant="rectangular" height={200} />
                      <CardContent>
                        <Skeleton variant="text" height={24} />
                        <Skeleton variant="text" height={20} />
                        <Skeleton variant="text" height={20} />
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : filteredAndSortedSpots().length === 0 ? (
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', p: 6 }}>
                    <InfoIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h5" color="text.secondary" gutterBottom>
                      No parking spots found
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                      Try adjusting your filters or search criteria
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<RefreshIcon />}
                      onClick={clearFilters}
                    >
                      Clear All Filters
                    </Button>
                  </Box>
                </Grid>
              ) : (
                getCurrentSpots().map((spot, index) => (
                  <Grid item xs={12} sm={6} lg={4} key={spot.id || index}>
                    <ParkingSpotCard
                      spot={spot}
                      onFavorite={handleFavorite}
                      user={user}
                      isFavorite={favorites.includes(spot.id)}
                      onToggleFavorite={() => handleToggleFavorite(spot.id)}
                      onBook={async (bookingData) => {
                        // Handle booking success
                        setSnackbarMessage('Booking successful!');
                        setSnackbarSeverity('success');
                        setOpenSnackbar(true);
                      }}
                    />
                  </Grid>
                ))
              )}
            </Grid>
          )}
        </Grid>
      </Grid>

      {/* Pagination */}
      {filteredAndSortedSpots().length > spotsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={Math.ceil(filteredAndSortedSpots().length / spotsPerPage)}
            page={currentPage}
            onChange={(e, page) => setCurrentPage(page)}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Saved Searches Dialog */}
      <Dialog
        open={showSavedSearches}
        onClose={() => setShowSavedSearches(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BookmarkIcon />
            Saved Searches
          </Box>
        </DialogTitle>
        <DialogContent>
          {savedSearches.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <BookmarkBorderIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No saved searches
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Save your favorite search criteria for quick access
              </Typography>
            </Box>
          ) : (
            <List>
              {savedSearches.map((search) => (
                <ListItem key={search.id} divider>
                  <ListItemText
                    primary={search.name}
                    secondary={`${search.searchTerm || 'Any location'} • ₹${search.priceRange[0]}-${search.priceRange[1]}/hour`}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => loadSearch(search)}
                  >
                    Load
                  </Button>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSavedSearches(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => navigate('/list')}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default ParkingSpotList;