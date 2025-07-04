import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Grid,
  InputAdornment,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  Snackbar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MapComponent from './components/MapComponent';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const ImagePreview = styled('img')({
  width: '100%',
  height: 200,
  objectFit: 'cover',
  marginTop: 8,
  borderRadius: 4,
});

const initialCenter = [19.0760, 72.8777]; // Mumbai coordinates

const currencies = [
  { value: 'INR', label: '₹' },
  { value: 'USD', label: '$' },
  { value: 'EUR', label: '€' },
  { value: 'GBP', label: '£' },
];

function ParkingSpotForm() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user) {
        navigate('/login');
      }
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, [navigate]);
  const [formData, setFormData] = useState({
    location: '',
    coordinates: initialCenter,
    hourlyRate: '',
    currency: 'INR',
    maxDuration: '',
    securityFeatures: '',
    terms: '',
    images: [],
    agreeToTerms: false,
  });
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    
    const newPreviewImages = files.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviewImages]);
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.agreeToTerms) {
      setError('Please agree to the terms and conditions');
      setOpenSnackbar(true);
      return;
    }

    if (!currentUser) {
      setError('Please log in to list a parking spot');
      setOpenSnackbar(true);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/parking-spots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: formData.location,
          coordinates: formData.coordinates,
          hourlyRate: `${formData.currency}${formData.hourlyRate}`,
          maxDuration: formData.maxDuration,
          securityFeatures: formData.securityFeatures,
          termsAndConditions: formData.terms,
          userId: currentUser.uid,
          userName: currentUser.displayName || currentUser.email,
          available: true
        }),
      });

      if (response.ok) {
        navigate('/');
      } else {
        throw new Error('Failed to list parking spot');
      }
    } catch (error) {
      setError(error.message);
      setOpenSnackbar(true);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 4, color: '#1E3A8A', textAlign: 'center' }}>
          List Your Parking Spot
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Location Description"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., 123 Main St, Near Central Park"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Select Location on Map
              </Typography>
              <MapComponent
                center={formData.coordinates || initialCenter}
                zoom={13}
                height="400px"
                selectable={true}
                selectedPosition={formData.coordinates}
                onLocationSelect={(latlng) => {
                  setFormData(prev => ({
                    ...prev,
                    coordinates: [latlng.lat, latlng.lng]
                  }));
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Hourly Rate"
                type="number"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TextField
                        select
                        value={formData.currency}
                        onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                        sx={{ width: '70px' }}
                      >
                        {currencies.map((currency) => (
                          <MenuItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </InputAdornment>
                  ),
                }}
                value={formData.hourlyRate}
                onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Maximum Duration (hours)"
                type="number"
                value={formData.maxDuration}
                onChange={(e) => setFormData(prev => ({ ...prev, maxDuration: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Security Features"
                multiline
                rows={2}
                value={formData.securityFeatures}
                onChange={(e) => setFormData(prev => ({ ...prev, securityFeatures: e.target.value }))}
                placeholder="e.g., CCTV, Security Guard, Gated Parking"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Terms and Conditions"
                multiline
                rows={4}
                value={formData.terms}
                onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                sx={{ mt: 2 }}
              >
                Upload Images
                <VisuallyHiddenInput
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {previewImages.map((image, index) => (
                  <ImagePreview key={index} src={image} alt={`Preview ${index + 1}`} />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.agreeToTerms}
                    onChange={(e) => setFormData(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
                  />
                }
                label="I agree to the terms and conditions"
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  mb: 2,
                  backgroundColor: '#1E3A8A',
                  '&:hover': {
                    backgroundColor: '#1E40AF'
                  }
                }}
              >
                List Parking Spot
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

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
    </Container>
  );
}

export default ParkingSpotForm;
