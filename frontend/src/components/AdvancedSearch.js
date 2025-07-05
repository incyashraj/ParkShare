import { Box, Paper, Typography, TextField, Slider, FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel, Button, Chip, Grid, Accordion, AccordionSummary, AccordionDetails, IconButton, Divider,  } from '@mui/material';
import { Search as SearchIcon, FilterList as FilterIcon, Clear as ClearIcon, ExpandMore as ExpandMoreIcon, LocationOn as LocationIcon, AttachMoney as MoneyIcon, AccessTime as TimeIcon, Security as SecurityIcon, LocalParking as ParkingIcon,  } from '@mui/icons-material';
import { useState } from 'react';

const AdvancedSearch = ({ onSearch, onClear }) => {
  const [searchParams, setSearchParams] = useState({
    location: '',
    priceRange: [0, 50],
    date: '',
    time: '',
    duration: 2,
    amenities: [],
    availability: 'all',
    rating: 0,
    distance: 5,
  });

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

  const handleSearch = () => {
    onSearch(searchParams);
  };

  const handleClear = () => {
    setSearchParams({
      location: '',
      priceRange: [0, 50],
      date: '',
      time: '',
      duration: 2,
      amenities: [],
      availability: 'all',
      rating: 0,
      distance: 5,
    });
    onClear();
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SearchIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" fontWeight="bold">
          Advanced Search
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
            max={100}
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
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              size="large"
            >
              Search Spots
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default AdvancedSearch;