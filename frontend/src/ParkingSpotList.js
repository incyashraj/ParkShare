import React, { useState, useEffect, useCallback } from 'react';
import BookingModal from './components/BookingModal';
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
} from '@mui/icons-material';
import { auth } from './firebase';
import MapComponent from './components/MapComponent';
import LoadingSpinner from './components/LoadingSpinner';
import FloatingActionButton from './components/FloatingActionButton';
import ParkingSpotCard from './components/ParkingSpotCard';
import { useRealtime } from './contexts/RealtimeContext';

const initialCenter = [19.0760, 72.8777]; // Mumbai coordinates

function ParkingSpotList() {
  const { joinSpotRoom, leaveSpotRoom, isConnected } = useRealtime();
  const [spots, setSpots] = useState([]);
  const [filteredSpots, setFilteredSpots] = useState([]);
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(initialCenter);
  const [filters, setFilters] = useState({
    search: '',
    priceRange: [0, 1000],
    rating: 0,
    amenities: [],
    availability: 'all',
    distance: 10,
    sortBy: 'distance',
  });
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
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
    queryParams.append('minPrice', filters.priceRange[0]);
    queryParams.append('maxPrice', filters.priceRange[1]);
    queryParams.append('rating', filters.rating);
    if (filters.search) {
      queryParams.append('search', filters.search);
    }

    try {
      const response = await fetch(`http://localhost:3001/parking-spots?${queryParams.toString()}`);
      const data = await response.json();
      console.log('Fetched parking spots:', data.length);

      if (Array.isArray(data)) {
        setSpots(data);
        setFilteredSpots(data);

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
  }, [filters]);

  useEffect(() => {
    fetchParkingSpots();
  }, [fetchParkingSpots]);

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

  const checkAvailability = useCallback(async (spotId, startTime, endTime) => {
    try {
      const response = await fetch(
        `http://localhost:3001/parking-spots/${spotId}/availability?startTime=${startTime}&endTime=${endTime}`
      );
      const data = await response.json();
      return data.available;
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  }, []);

  const [selectedSpotForBooking, setSelectedSpotForBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const handleBooking = async (spot) => {
    // If the BookingModal is open with selected dates, check availability first
    if (selectedSpotForBooking && selectedSpotForBooking.startTime && selectedSpotForBooking.endTime) {
      const isAvailable = await checkAvailability(
        spot.id,
        selectedSpotForBooking.startTime,
        selectedSpotForBooking.endTime
      );

      if (!isAvailable) {
        setError('This spot is not available for the selected time period');
        setOpenSnackbar(true);
        return;
      }
    }

    setSelectedSpotForBooking(spot);
    setShowBookingModal(true);
  };

  const handleBookingComplete = (success) => {
    setShowBookingModal(false);
    if (success) {
      // Refresh the spots list
      fetchParkingSpots();
    }
  };

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
    setFilters(prev => ({
      ...prev,
      ...searchParams,
    }));
    setShowAdvancedSearch(false);
  };

  const handleToggleFavorite = (spotId) => {
    setFavorites(prev => 
      prev.includes(spotId) 
        ? prev.filter(id => id !== spotId)
        : [...prev, spotId]
    );
  };

  const handleSortChange = (sortBy) => {
    setFilters(prev => ({ ...prev, sortBy }));
  };

  const sortSpots = (spotsToSort) => {
    const sorted = [...spotsToSort];
    switch (filters.sortBy) {
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

  const filteredAndSortedSpots = sortSpots(filteredSpots);

  const handleFilterClick = () => {
    // This could open a filter modal or scroll to filters
    console.log('Filter clicked');
  };

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
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            >
              Advanced Search
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
        {showAdvancedSearch && (
          <Fade in timeout={300}>
            <Box sx={{ mb: 3 }}>
              <AdvancedSearch onSearch={handleAdvancedSearch} onClear={() => setShowAdvancedSearch(false)} />
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
                    checked={filters.availability === 'available'}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      availability: e.target.checked ? 'available' : 'all' 
                    }))}
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
                  variant={filters.sortBy === option.value ? 'filled' : 'outlined'}
                  color={filters.sortBy === option.value ? 'primary' : 'default'}
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
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
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
                value={filters.priceRange}
                onChange={(e, newValue) => setFilters(prev => ({ ...prev, priceRange: newValue }))}
                valueLabelDisplay="auto"
                min={0}
                max={1000}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">₹{filters.priceRange[0]}</Typography>
                <Typography variant="body2">₹{filters.priceRange[1]}</Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>Minimum Rating</Typography>
              <Rating
                value={filters.rating}
                onChange={(e, newValue) => setFilters(prev => ({ ...prev, rating: newValue }))}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>Distance (km)</Typography>
              <Slider
                value={filters.distance}
                onChange={(e, newValue) => setFilters(prev => ({ ...prev, distance: newValue }))}
                valueLabelDisplay="auto"
                min={1}
                max={20}
              />
              <Typography variant="body2" textAlign="center">
                {filters.distance} km
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
                            onClick={() => handleBooking(spot)}
                            sx={{ mt: 1 }}
                          >
                            Book Now
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
                        handleBooking(spot);
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
                filteredAndSortedSpots.map((spot, index) => (
                  <Grid item xs={12} sm={6} lg={4} key={spot.id || index}>
                    <ParkingSpotCard
                      spot={spot}
                      onBook={handleBooking}
                      index={index}
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

      <BookingModal
        open={showBookingModal}
        onClose={handleBookingComplete}
        spot={selectedSpotForBooking}
      />

      {/* Error Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="error"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
      
      <FloatingActionButton
        onLocationClick={handleLocationClick}
        onFilterClick={handleFilterClick}
      />
    </Container>
  );
}

export default ParkingSpotList;
