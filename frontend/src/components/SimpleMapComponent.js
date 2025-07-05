import { Box, Card, Typography, Button, TextField, Grid } from '@mui/material';
import { LocationOn, MyLocation } from '@mui/icons-material';
import { useState } from 'react';

const SimpleMapComponent = ({ 
  center = [19.0760, 72.8777], 
  onLocationSelect = () => {},
  selectedPosition = null 
}) => {
  const [lat, setLat] = useState(center[0]);
  const [lng, setLng] = useState(center[1]);
  const [address, setAddress] = useState('');

  const handleLocationSelect = () => {
    const newPosition = [parseFloat(lat), parseFloat(lng)];
    onLocationSelect({ lat: newPosition[0], lng: newPosition[1] });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLat = position.coords.latitude;
          const newLng = position.coords.longitude;
          setLat(newLat);
          setLng(newLng);
          onLocationSelect({ lat: newLat, lng: newLng });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your current location. Please enter coordinates manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  return (
    <Card sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        📍 Location Selection
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Set the exact coordinates of your parking spot. You can use your current location or enter coordinates manually.
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Latitude"
            type="number"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            inputProps={{ step: 0.000001 }}
            helperText="e.g., 19.0760"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Longitude"
            type="number"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            inputProps={{ step: 0.000001 }}
            helperText="e.g., 72.8777"
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<MyLocation />}
          onClick={getCurrentLocation}
        >
          Use Current Location
        </Button>
        <Button
          variant="contained"
          onClick={handleLocationSelect}
        >
          Set Location
        </Button>
      </Box>

      {selectedPosition && (
        <Box sx={{ 
          p: 2, 
          bgcolor: 'success.light', 
          color: 'success.contrastText',
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <LocationOn />
          <Typography variant="body2">
            Location set: {selectedPosition[0].toFixed(6)}, {selectedPosition[1].toFixed(6)}
          </Typography>
        </Box>
      )}

      <Box sx={{ 
        height: 200, 
        bgcolor: 'grey.100', 
        borderRadius: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        mt: 2,
        border: '2px dashed',
        borderColor: 'grey.300'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <LocationOn sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Map Preview
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Coordinates: {lat}, {lng}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};

export default SimpleMapComponent;