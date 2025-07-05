import { Box, Card, Typography, Button, Alert, CircularProgress } from '@mui/material';
import { LocationOn, MyLocation, Refresh } from '@mui/icons-material';
import SimpleMapComponent from './SimpleMapComponent';
import { useState, useEffect } from 'react';

// Import MapComponent with error handling
let MapComponent = null;
try {
  const MapComponentModule = require('./MapComponent');
  MapComponent = MapComponentModule.default || MapComponentModule;
} catch (error) {
  console.warn('MapComponent failed to load:', error);
}

const MapWrapper = ({ 
  center = [19.0760, 72.8777], 
  onLocationSelect = () => {},
  selectedPosition = null,
  height = "300px"
}) => {
  const [mapError, setMapError] = useState(false);
  const [useSimpleMap, setUseSimpleMap] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if Leaflet and MapComponent are available
    const checkMapAvailability = () => {
      try {
        if (typeof window !== 'undefined' && window.L && MapComponent) {
          setMapError(false);
          setLoading(false);
        } else {
          // Wait a bit more for dynamic imports
          setTimeout(() => {
            if (typeof window !== 'undefined' && window.L && MapComponent) {
              setMapError(false);
            } else {
              setMapError(true);
            }
            setLoading(false);
          }, 2000);
        }
      } catch (error) {
        console.error('Map loading error:', error);
        setMapError(true);
        setLoading(false);
      }
    };

    checkMapAvailability();
  }, []);

  const retryMap = () => {
    setLoading(true);
    setMapError(false);
    setUseSimpleMap(false);
    
    // Reload the page to retry map loading
    window.location.reload();
  };

  if (loading) {
    return (
      <Card sx={{ p: 2, mb: 2 }}>
        <Box sx={{ 
          height, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          gap: 2
        }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Loading map...
          </Typography>
        </Box>
      </Card>
    );
  }

  if (mapError || useSimpleMap || !MapComponent) {
    return (
      <Card sx={{ p: 2, mb: 2 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Using simple location selection. You can enter coordinates manually or use your current location.
          </Typography>
        </Alert>
        
        <SimpleMapComponent
          center={center}
          onLocationSelect={onLocationSelect}
          selectedPosition={selectedPosition}
        />
        
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button
            size="small"
            startIcon={<Refresh />}
            onClick={retryMap}
          >
            Retry Interactive Map
          </Button>
        </Box>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        📍 Select Location on Map
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Click on the map to set your exact location. This helps users find your parking spot easily.
      </Typography>
      
      <Box sx={{ position: 'relative' }}>
        <MapComponent
          center={center}
          zoom={13}
          height={height}
          selectable={true}
          selectedPosition={selectedPosition}
          onLocationSelect={onLocationSelect}
        />
        
        <Box sx={{ 
          position: 'absolute', 
          top: 8, 
          right: 8, 
          zIndex: 1000 
        }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<MyLocation />}
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const newLat = position.coords.latitude;
                    const newLng = position.coords.longitude;
                    onLocationSelect({ lat: newLat, lng: newLng });
                  },
                  (error) => {
                    console.error('Error getting location:', error);
                    alert('Unable to get your current location. Please click on the map instead.');
                  }
                );
              } else {
                alert('Geolocation is not supported by this browser.');
              }
            }}
            sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(4px)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 1)',
              }
            }}
          >
            My Location
          </Button>
        </Box>
      </Box>
      
      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <LocationOn color="action" fontSize="small" />
        <Typography variant="caption" color="text.secondary">
          Selected: {selectedPosition ? `${selectedPosition[0].toFixed(6)}, ${selectedPosition[1].toFixed(6)}` : 'Click on map to select'}
        </Typography>
      </Box>
      
      <Box sx={{ mt: 1 }}>
        <Button
          size="small"
          variant="text"
          onClick={() => setUseSimpleMap(true)}
          sx={{ fontSize: '0.75rem' }}
        >
          Having trouble with the map? Use simple location input
        </Button>
      </Box>
    </Card>
  );
};

export default MapWrapper;