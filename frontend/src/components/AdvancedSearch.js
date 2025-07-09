import { Box, Paper, Typography, TextField, Slider, FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel, Button, Chip, Grid, Accordion, AccordionSummary, AccordionDetails, IconButton, Divider, Alert, CircularProgress, FormHelperText } from '@mui/material';
import { Search as SearchIcon, FilterList as FilterIcon, Clear as ClearIcon, ExpandMore as ExpandMoreIcon, LocationOn as LocationIcon, AttachMoney as MoneyIcon, AccessTime as TimeIcon, Security as SecurityIcon, LocalParking as ParkingIcon } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ParkingSpotCard from './ParkingSpotCard';
import { API_BASE } from '../apiConfig';

const AdvancedSearch = () => {
  const navigate = useNavigate();
  const [maxPrice, setMaxPrice] = useState(200);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useState({
    location: '',
    priceRange: [0, 200], // Will be updated based on maxPrice
    date: '',
    time: '',
    duration: 2,
    amenities: [],
    availability: 'all',
    rating: 0,
    distance: 5,
  });

  // Add state for validation
  const [validationError, setValidationError] = useState('');

  // Fetch maximum price from parking spots
  useEffect(() => {
    const fetchMaxPrice = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/parking-spots`);
        const data = await response.json();
        
        if (Array.isArray(data)) {
          const prices = data.map(spot => 
            parseFloat(spot.hourlyRate?.replace(/[^0-9.]/g, '') || '0')
          );
          const calculatedMaxPrice = Math.max(...prices, 200); // Ensure minimum of 200
          setMaxPrice(calculatedMaxPrice);
          
          // Update price range if current max is less than calculated max
          if (searchParams.priceRange[1] < calculatedMaxPrice) {
            setSearchParams(prev => ({
              ...prev,
              priceRange: [0, calculatedMaxPrice]
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching max price:', error);
      }
    };

    fetchMaxPrice();
  }, []);

  const amenities = [
    { id: 'security', label: 'Security Camera', icon: SecurityIcon },
    { id: 'covered', label: 'Covered Parking', icon: ParkingIcon },
    { id: 'electric', label: 'Electric Charging', icon: ParkingIcon },
    { id: 'accessible', label: 'Accessible', icon: ParkingIcon },
    { id: 'valet', label: 'Valet Service', icon: ParkingIcon },
    { id: 'wash', label: 'Car Wash', icon: ParkingIcon },
  ];

  const availabilityOptions = [
    { value: 'all', label: 'All Spots' },
    { value: 'available', label: 'Available Now' },
    { value: 'reserved', label: 'Reserved Spots' },
    { value: 'instant', label: 'Instant Booking' },
  ];

  const handleAmenityChange = (amenityId) => {
    setSearchParams(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setValidationError('');
    
    // Validate required fields for accurate availability
    if (!searchParams.date || !searchParams.time) {
      setValidationError('Please select both date and time to get accurate availability status.');
      setLoading(false);
      return;
    }

    if (searchParams.duration <= 0) {
      setValidationError('Please select a valid duration.');
      setLoading(false);
      return;
    }
    
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (searchParams.location) {
        queryParams.append('location', searchParams.location);
      }
      
      if (searchParams.priceRange[0] > 0 || searchParams.priceRange[1] < maxPrice) {
        queryParams.append('minPrice', searchParams.priceRange[0]);
        queryParams.append('maxPrice', searchParams.priceRange[1]);
      }
      
      // Always include date, time, and duration for accurate availability
      queryParams.append('date', searchParams.date);
      queryParams.append('time', searchParams.time);
      queryParams.append('duration', searchParams.duration);
      
      if (searchParams.amenities.length > 0) {
        queryParams.append('amenities', searchParams.amenities.join(','));
      }
      
      if (searchParams.availability !== 'all') {
        queryParams.append('availability', searchParams.availability);
      }
      
      if (searchParams.rating > 0) {
        queryParams.append('minRating', searchParams.rating);
      }
      
      if (searchParams.distance < 20) {
        queryParams.append('maxDistance', searchParams.distance);
      }

      const response = await fetch(`${API_BASE}/api/parking-spots/search?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }
      
      const data = await response.json();
      setSearchResults(Array.isArray(data) ? data : []);
      
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to perform search. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchParams({
      location: '',
      priceRange: [0, maxPrice], // Use dynamic maximum price
      date: '',
      time: '',
      duration: 2,
      amenities: [],
      availability: 'all',
      rating: 0,
      distance: 5,
    });
    setSearchResults([]);
    setError('');
    setValidationError('');
  };

  const handleSpotClick = (spotId) => {
    navigate(`/spot/${spotId}`);
  };

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        Advanced Search
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SearchIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" fontWeight="bold">
            Search Filters
          </Typography>
        </Box>

        {/* Required Fields Notice */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Important:</strong> Please select date, time, and duration to get accurate availability status. 
            This ensures the availability shown in search results matches the detail view.
          </Typography>
        </Alert>

        {/* Validation Error */}
        {validationError && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {validationError}
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Location & Price Range */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Location"
              placeholder="Enter location or address"
              value={searchParams.location}
              onChange={(e) => setSearchParams(prev => ({ ...prev, location: e.target.value }))}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Price Range (₹/hr)
            </Typography>
            <Slider
              value={searchParams.priceRange}
              onChange={(event, newValue) => setSearchParams(prev => ({ ...prev, priceRange: newValue }))}
              valueLabelDisplay="auto"
              min={0}
              max={maxPrice}
              step={10}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                ₹{searchParams.priceRange[0]}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ₹{searchParams.priceRange[1]}
              </Typography>
            </Box>
          </Grid>

          {/* Date & Time - Required Fields */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="date"
              label="Date *"
              value={searchParams.date}
              onChange={(e) => setSearchParams(prev => ({ ...prev, date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              required
              error={!searchParams.date}
              helperText={!searchParams.date ? 'Date is required' : ''}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="time"
              label="Time *"
              value={searchParams.time}
              onChange={(e) => setSearchParams(prev => ({ ...prev, time: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              required
              error={!searchParams.time}
              helperText={!searchParams.time ? 'Time is required' : ''}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth required error={!searchParams.duration || searchParams.duration <= 0}>
              <InputLabel>Duration *</InputLabel>
              <Select
                value={searchParams.duration}
                onChange={(e) => setSearchParams(prev => ({ ...prev, duration: e.target.value }))}
              >
                <MenuItem value={1}>1 hour</MenuItem>
                <MenuItem value={2}>2 hours</MenuItem>
                <MenuItem value={4}>4 hours</MenuItem>
                <MenuItem value={8}>8 hours</MenuItem>
                <MenuItem value={24}>24 hours</MenuItem>
              </Select>
              {(!searchParams.duration || searchParams.duration <= 0) && (
                <FormHelperText>Duration is required</FormHelperText>
              )}
            </FormControl>
          </Grid>

          {/* Availability & Rating */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Availability</InputLabel>
              <Select
                value={searchParams.availability}
                onChange={(e) => setSearchParams(prev => ({ ...prev, availability: e.target.value }))}
              >
                {availabilityOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Minimum Rating
            </Typography>
            <Slider
              value={searchParams.rating}
              onChange={(event, newValue) => setSearchParams(prev => ({ ...prev, rating: newValue }))}
              valueLabelDisplay="auto"
              min={0}
              max={5}
              step={0.5}
              marks={[
                { value: 0, label: '0' },
                { value: 2.5, label: '2.5' },
                { value: 5, label: '5' }
              ]}
            />
            <Typography variant="body2" color="text.secondary" align="center">
              {searchParams.rating} stars
            </Typography>
          </Grid>

          {/* Distance */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Maximum Distance (km)
            </Typography>
            <Slider
              value={searchParams.distance}
              onChange={(event, newValue) => setSearchParams(prev => ({ ...prev, distance: newValue }))}
              valueLabelDisplay="auto"
              min={1}
              max={20}
              step={1}
              marks={[
                { value: 1, label: '1km' },
                { value: 10, label: '10km' },
                { value: 20, label: '20km' }
              ]}
            />
            <Typography variant="body2" color="text.secondary" align="center">
              {searchParams.distance} km
            </Typography>
          </Grid>

          {/* Amenities */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Amenities
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {amenities.map((amenity) => {
                const IconComponent = amenity.icon;
                return (
                  <FormControlLabel
                    key={amenity.id}
                    control={
                      <Checkbox
                        checked={searchParams.amenities.includes(amenity.id)}
                        onChange={() => handleAmenityChange(amenity.id)}
                        size="small"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <IconComponent sx={{ fontSize: 16 }} />
                        {amenity.label}
                      </Box>
                    }
                    sx={{ 
                      border: '1px solid #e0e0e0', 
                      borderRadius: 1, 
                      px: 1, 
                      py: 0.5,
                      '&:hover': { bgcolor: 'grey.50' }
                    }}
                  />
                );
              })}
            </Box>
          </Grid>

          {/* Selected Amenities Display */}
          {searchParams.amenities.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Selected Amenities:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {searchParams.amenities.map(amenityId => {
                  const amenity = amenities.find(a => a.id === amenityId);
                  return (
                    <Chip
                      key={amenityId}
                      label={amenity?.label}
                      onDelete={() => handleAmenityChange(amenityId)}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  );
                })}
              </Box>
            </Grid>
          )}

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleClear}
              >
                Clear All
              </Button>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                onClick={handleSearch}
                size="large"
                disabled={loading || !searchParams.date || !searchParams.time || !searchParams.duration}
              >
                {loading ? 'Searching...' : 'Search Spots'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Search Results ({searchResults.length} spots found)
          </Typography>
          <Grid container spacing={3}>
            {searchResults.map((spot) => (
              <Grid item xs={12} sm={6} md={4} key={spot.id}>
                <ParkingSpotCard 
                  spot={spot} 
                  onClick={() => handleSpotClick(spot.id)}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {!loading && searchResults.length === 0 && !error && !validationError && (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No search performed yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Use the filters above to search for parking spots. Make sure to select date, time, and duration for accurate results.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default AdvancedSearch;