import { Box, Paper, Typography, TextField, Slider, FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel, Button, Chip, Grid, Accordion, AccordionSummary, AccordionDetails, IconButton, Divider, Alert, CircularProgress } from '@mui/material';
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

  // Fetch maximum price from parking spots
  useEffect(() => {
    const fetchMaxPrice = async () => {
      try {
        const response = await fetch(`${API_BASE}/parking-spots`);
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
      
      if (searchParams.date) {
        queryParams.append('date', searchParams.date);
      }
      
      if (searchParams.time) {
        queryParams.append('time', searchParams.time);
      }
      
      if (searchParams.duration) {
        queryParams.append('duration', searchParams.duration);
      }
      
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

      const response = await fetch(`${API_BASE}/parking-spots/search?${queryParams.toString()}`);
      
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

        <Grid container spacing={3}>
          {/* Location & Basic Search */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Location"
              placeholder="Enter address or landmark"
              value={searchParams.location}
              onChange={(e) => setSearchParams(prev => ({ ...prev, location: e.target.value }))}
              InputProps={{
                startAdornment: <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="Date"
              value={searchParams.date}
              onChange={(e) => setSearchParams(prev => ({ ...prev, date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Price Range */}
          <Grid item xs={12}>
            <Typography gutterBottom>
              Price Range (per hour): ${searchParams.priceRange[0]} - ${searchParams.priceRange[1]}
            </Typography>
            <Slider
              value={searchParams.priceRange}
              onChange={(e, newValue) => setSearchParams(prev => ({ ...prev, priceRange: newValue }))}
              valueLabelDisplay="auto"
              min={0}
              max={maxPrice}
              sx={{ color: 'primary.main' }}
            />
          </Grid>

          {/* Duration & Time */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Duration</InputLabel>
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
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="time"
              label="Time"
              value={searchParams.time}
              onChange={(e) => setSearchParams(prev => ({ ...prev, time: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
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
            <Typography gutterBottom>
              Minimum Rating: {searchParams.rating}+ stars
            </Typography>
            <Slider
              value={searchParams.rating}
              onChange={(e, newValue) => setSearchParams(prev => ({ ...prev, rating: newValue }))}
              valueLabelDisplay="auto"
              min={0}
              max={5}
              step={0.5}
              sx={{ color: 'primary.main' }}
            />
          </Grid>

          {/* Distance */}
          <Grid item xs={12}>
            <Typography gutterBottom>
              Maximum Distance: {searchParams.distance} km
            </Typography>
            <Slider
              value={searchParams.distance}
              onChange={(e, newValue) => setSearchParams(prev => ({ ...prev, distance: newValue }))}
              valueLabelDisplay="auto"
              min={1}
              max={20}
              sx={{ color: 'primary.main' }}
            />
          </Grid>

          {/* Amenities */}
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Amenities & Features
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  {amenities.map((amenity) => (
                    <Grid item xs={12} sm={6} md={4} key={amenity.id}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={searchParams.amenities.includes(amenity.id)}
                            onChange={() => handleAmenityChange(amenity.id)}
                            color="primary"
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <amenity.icon sx={{ mr: 1, fontSize: 20 }} />
                            {amenity.label}
                          </Box>
                        }
                      />
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Selected Filters */}
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
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search Spots'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Search Results */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

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

      {!loading && searchResults.length === 0 && !error && (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No search performed yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Use the filters above to search for parking spots
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default AdvancedSearch;