import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdvancedSearch from './components/AdvancedSearch';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
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
} from '@mui/icons-material';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import MapComponent from './components/MapComponent';
import LoadingSpinner from './components/LoadingSpinner';
import FloatingActionButton from './components/FloatingActionButton';
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
  
  // Search and filter states
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
  const [sortOptions] = useState([
    { value: 'distance', label: 'Distance' },
    { value: 'price', label: 'Price' },
    { value: 'rating', label: 'Rating' },
    { value: 'availability', label: 'Availability' },
  ]);

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









  const applyLocationUpdates = useCallback((position) => {
    const { latitude, longitude } = position.coords;
    setUserLocation([latitude, longitude]);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        applyLocationUpdates,
        (error) => {
          console.error('Error getting location:', error);
          setError('Could not get your location. Using default location.');
          setOpenSnackbar(true);
        }
      );
    }
  }, [applyLocationUpdates]);

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        (error) => {
          setError('Could not get your location');
          setOpenSnackbar(true);
        }
      );
    }
  };

  const handleAdvancedSearch = (searchParams) => {
    setSearchTerm(searchParams.location || searchParams.search || '');
    setPriceRange(searchParams.priceRange);
    setRatingFilter(searchParams.rating);
    setDistanceFilter(searchParams.distance);
    setAvailabilityFilter(searchParams.availability);
    setSortBy(searchParams.sortBy || 'distance');
    setShowFilters(false);
  };

  const handleToggleFavorite = (spotId) => {
    setFavorites(prev => 
      prev.includes(spotId) 
        ? prev.filter(id => id !== spotId)
        : [...prev, spotId]
    );
  };

  const handleSortChange = (sortBy) => {
    setSortBy(sortBy);
  };

  const sortSpots = (spotsToSort) => {
    const sorted = [...spotsToSort];
    switch (sortBy) {
      case 'price':
        return sorted.sort((a, b) => a.hourlyRate - b.hourlyRate);
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'availability':
        return sorted.sort((a, b) => (a.isAvailable ? 1 : 0) - (b.isAvailable ? 1 : 0));
      case 'distance':
      default:
        return sorted; // Already sorted by distance from backend
    }
  };

  // Apply availability filter first, then sort
  const applyAvailabilityFilter = (spotsToFilter) => {
    if (availabilityFilter === 'available') {
      return spotsToFilter.filter(spot => spot.available === true);
    }
    return spotsToFilter;
  };

  const filteredAndSortedSpots = sortSpots(applyAvailabilityFilter(filteredSpots));

  const handleFilterClick = () => {
    // This could open a filter modal or scroll to filters
    console.log('Filter clicked');
  };

  const getCurrentSpots = () => {
    const startIndex = (currentPage - 1) * spotsPerPage;
    const endIndex = startIndex + spotsPerPage;
    return filteredAndSortedSpots.slice(startIndex, endIndex);
  };



  const handleFavorite = (spotId, isFavorite) => {
    setSpots(prevSpots =>
      prevSpots.map(spot =>
        spot.id === spotId
          ? { ...spot, isFavorite }
          : spot
      )
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPriceRange([0, 50]);
    setRatingFilter(0);
    setDistanceFilter(10);
    setAvailabilityFilter('all');
    setSortBy('distance');
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
      {/* Header with View Toggle and Advanced Search */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" fontWeight="bold" color="primary">
            Find Parking Spots
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Chip
              icon={<LiveIcon />}
              label={isConnected ? 'Live Updates' : 'Offline'}
              color={isConnected ? 'success' : 'error'}
              size="small"
            />
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
            <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <Tabs value={viewMode} onChange={(e, newValue) => setViewMode(newValue)} size="small">
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
        </Box>

        {/* Advanced Search */}
        {showFilters && (
          <Fade in timeout={300}>
            <Box sx={{ mb: 3 }}>
              <AdvancedSearch
                onSearch={handleAdvancedSearch}
                onClear={() => setShowFilters(false)}
              />
            </Box>
          </Fade>
        )}

        {/* Sort and Filter Bar */}
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {filteredAndSortedSpots.length} spots found
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
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Sort by:
              </Typography>
              {sortOptions.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  variant={sortBy === option.value ? 'filled' : 'outlined'}
                  color={sortBy === option.value ? 'primary' : 'default'}
                  onClick={() => handleSortChange(option.value)}
                  size="small"
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          </Box>
        </Paper>
      </Box>

      <Grid container spacing={4}>
        {/* Filters Section */}
        <Grid item xs={12} md={3}>
          <Fade in timeout={500}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ color: '#1E3A8A', fontWeight: 600 }}>
                  Quick Filters
                </Typography>
              </Box>
            
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                placeholder="Search location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>Price Range (per hour)</Typography>
              <Slider
                value={priceRange}
                onChange={(e, newValue) => setPriceRange(newValue)}
                valueLabelDisplay="auto"
                min={0}
                max={50}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">₹{priceRange[0]}</Typography>
                <Typography variant="body2">₹{priceRange[1]}</Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>Minimum Rating</Typography>
              <Rating
                value={ratingFilter}
                onChange={(e, newValue) => setRatingFilter(newValue)}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>Distance (km)</Typography>
              <Slider
                value={distanceFilter}
                onChange={(e, newValue) => setDistanceFilter(newValue)}
                valueLabelDisplay="auto"
                min={0.1}
                max={20}
              />
              <Typography variant="body2" textAlign="center">
                {distanceFilter.toFixed(1)} km
              </Typography>
            </Box>
            </Paper>
          </Fade>
        </Grid>

        {/* Map and List Section */}
        <Grid item xs={12} md={9}>
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
                    markers={filteredAndSortedSpots.map(spot => ({
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
                      const spot = filteredAndSortedSpots.find(s => 
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
                <Grid item xs={12}>
                  <LoadingSpinner message="Loading parking spots..." />
                </Grid>
              ) : filteredAndSortedSpots.length === 0 ? (
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', p: 6 }}>
                    <Typography variant="h5" color="text.secondary" gutterBottom>
                      No parking spots found
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Try adjusting your filters or search criteria
                    </Typography>
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
                    />
                  </Grid>
                ))
              )}
            </Grid>
          )}
        </Grid>
      </Grid>



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
      
      <FloatingActionButton
        onLocationClick={handleLocationClick}
        onFilterClick={handleFilterClick}
      />

      {/* Results Summary */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" color="text.secondary">
          {filteredAndSortedSpots.length} spots found
        </Typography>
        <Chip
          label={`Page ${currentPage} of ${Math.ceil(filteredAndSortedSpots.length / spotsPerPage)}`}
          variant="outlined"
        />
      </Box>

      {/* Pagination */}
      {filteredAndSortedSpots.length > spotsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={Math.ceil(filteredAndSortedSpots.length / spotsPerPage)}
            page={currentPage}
            onChange={(e, page) => setCurrentPage(page)}
            color="primary"
            size="large"
          />
        </Box>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => window.location.href = '/list'}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default ParkingSpotList;