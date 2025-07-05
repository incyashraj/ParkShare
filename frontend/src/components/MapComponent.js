import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Box, Paper } from '@mui/material';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';

// Fix for default marker icon issue in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Component to handle map clicks
function LocationMarker({ position, onLocationSelect }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng);
    },
  });

  return position ? (
    <Marker position={position}>
      <Popup>Selected Location</Popup>
    </Marker>
  ) : null;
}

function MapComponent({ 
  center = [19.0760, 72.8777], // Default to Mumbai coordinates
  zoom = 13,
  height = "400px",
  markers = [],
  selectable = false,
  onLocationSelect = () => {},
  selectedPosition = null,
  onMarkerClick = () => {}
}) {
  return (
    <Box sx={{ height, width: '100%', mb: 2 }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', borderRadius: '8px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Render provided markers */}
        {markers.map((marker, index) => (
          <Marker 
            key={index} 
            position={marker.position}
            eventHandlers={{
              click: () => onMarkerClick(marker)
            }}
          >
            <Popup>
              <Paper sx={{ p: 1, minWidth: '200px' }}>
                {marker.popup || 'Marker Location'}
              </Paper>
            </Popup>
          </Marker>
        ))}

        {/* Render selectable marker if enabled */}
        {selectable && (
          <LocationMarker 
            position={selectedPosition}
            onLocationSelect={onLocationSelect}
          />
        )}
      </MapContainer>
    </Box>
  );
}

export default MapComponent;