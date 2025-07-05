import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import 'leaflet/dist/leaflet.css';
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
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Slider,
  Switch,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
  LinearProgress,
  Avatar,
  Rating,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MapWrapper from './components/MapWrapper';
import SimpleMapComponent from './components/SimpleMapComponent';
import {
  CloudUpload as CloudUploadIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Security as SecurityIcon,
  PhotoCamera as PhotoIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  DirectionsCar as CarIcon,
  AccessTime as TimeIcon,
  Star as StarIcon,
  TrendingUp as TrendingIcon,
  LocalParking as ParkingIcon,
} from '@mui/icons-material';
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
  borderRadius: 8,
  cursor: 'pointer',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
  },
});

const initialCenter = [19.0760, 72.8777]; // Mumbai coordinates

const currencies = [
  { value: 'INR', label: '₹', name: 'Indian Rupee' },
  { value: 'USD', label: '$', name: 'US Dollar' },
  { value: 'EUR', label: '€', name: 'Euro' },
  { value: 'GBP', label: '£', name: 'British Pound' },
];

const parkingTypes = [
  { value: 'street', label: 'Street Parking', icon: '🛣️' },
  { value: 'garage', label: 'Garage', icon: '🏢' },
  { value: 'lot', label: 'Parking Lot', icon: '🅿️' },
  { value: 'driveway', label: 'Driveway', icon: '🏠' },
  { value: 'underground', label: 'Underground', icon: '⛓️' },
  { value: 'rooftop', label: 'Rooftop', icon: '🏗️' },
];

const securityFeatures = [
  { value: 'cctv', label: 'CCTV Surveillance', icon: '📹' },
  { value: 'guard', label: 'Security Guard', icon: '👮' },
  { value: 'gated', label: 'Gated Access', icon: '🚪' },
  { value: 'lighting', label: 'Well Lit', icon: '💡' },
  { value: 'fenced', label: 'Fenced Area', icon: '🔒' },
  { value: 'patrol', label: 'Regular Patrol', icon: '🚔' },
];

const amenities = [
  { value: 'ev_charging', label: 'EV Charging', icon: '⚡' },
  { value: 'covered', label: 'Covered Parking', icon: '🏗️' },
  { value: 'accessible', label: 'Handicap Accessible', icon: '♿' },
  { value: 'bike_racks', label: 'Bike Racks', icon: '🚲' },
  { value: 'car_wash', label: 'Car Wash Nearby', icon: '🚿' },
  { value: 'restroom', label: 'Restroom Access', icon: '🚻' },
];

const steps = ['Basic Information', 'Location & Pricing', 'Features & Amenities', 'Photos & Details', 'Review & Submit'];

function ParkingSpotForm() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

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
    // Basic Information
    title: '',
    description: '',
    parkingType: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    coordinates: initialCenter,
    
    // Pricing
    hourlyRate: '',
    currency: 'INR',
    dailyRate: '',
    weeklyRate: '',
    monthlyRate: '',
    
    // Availability
    available24h: true,
    maxDuration: '',
    advanceBooking: 24,
    
    // Features
    selectedSecurityFeatures: [],
    selectedAmenities: [],
    
    // Details
    vehicleTypes: ['car'],
    maxVehicleHeight: '',
    maxVehicleLength: '',
    
    // Photos & Terms
    images: [],
    terms: 'Standard parking terms and conditions apply. Users must follow parking rules and respect the property.',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [previewImages, setPreviewImages] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 0: // Basic Information
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.parkingType) newErrors.parkingType = 'Parking type is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        break;
        
      case 1: // Location & Pricing
        if (!formData.hourlyRate || formData.hourlyRate <= 0) newErrors.hourlyRate = 'Valid hourly rate is required';
        if (!formData.coordinates || formData.coordinates.length !== 2) newErrors.coordinates = 'Please select location on map';
        break;
        
      case 2: // Features & Amenities
        // Optional step, no validation required
        break;
        
      case 3: // Photos & Details
        // if (formData.images.length === 0) newErrors.images = 'At least one photo is required';
        if (!formData.terms.trim()) newErrors.terms = 'Terms and conditions are required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length + previewImages.length > 10) {
      setSnackbarMessage('Maximum 10 images allowed');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }
    
    const newPreviewImages = files.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviewImages]);
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.agreeToTerms) {
      setSnackbarMessage('Please agree to the terms and conditions');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    if (!currentUser) {
      setSnackbarMessage('Please log in to list a parking spot');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);
    
    try {
      // Prepare the data for the backend
      const spotData = {
        location: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`.trim(),
        coordinates: formData.coordinates,
        hourlyRate: `${formData.currency} ${formData.hourlyRate}`,
        maxDuration: formData.maxDuration || '24 hours',
        securityFeatures: formData.selectedSecurityFeatures,
        termsAndConditions: formData.terms,
        images: formData.images,
        title: formData.title,
        description: formData.description,
        parkingType: formData.parkingType,
        amenities: formData.selectedAmenities,
        available24h: formData.available24h,
        advanceBooking: formData.advanceBooking,
        vehicleTypes: formData.vehicleTypes,
        maxVehicleHeight: formData.maxVehicleHeight,
        maxVehicleLength: formData.maxVehicleLength,
        userId: currentUser.uid // This is required by the backend
      };

      console.log('Current user:', currentUser);
      console.log('Form data:', formData);
      console.log('Submitting parking spot data:', spotData);

      const response = await fetch('http://localhost:3001/parking-spots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(spotData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create parking spot');
      }

      const result = await response.json();
      console.log('Parking spot created successfully:', result);
      
      setSnackbarMessage('Parking spot listed successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Error creating parking spot:', error);
      setSnackbarMessage(`Failed to list parking spot: ${error.message}`);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Tell us about your parking spot
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Parking Spot Title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Downtown Premium Parking"
                error={!!errors.title}
                helperText={errors.title}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your parking spot, nearby landmarks, access instructions..."
                error={!!errors.description}
                helperText={errors.description}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!errors.parkingType}>
                <InputLabel>Parking Type</InputLabel>
                <Select
                  value={formData.parkingType}
                  onChange={(e) => setFormData(prev => ({ ...prev, parkingType: e.target.value }))}
                  label="Parking Type"
                >
                  {parkingTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{type.icon}</span>
                        {type.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="City"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                error={!!errors.city}
                helperText={errors.city}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Full Address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Street address, building name, etc."
                error={!!errors.address}
                helperText={errors.address}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State/Province"
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ZIP/Postal Code"
                value={formData.zipCode}
                onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
              />
            </Grid>
          </Grid>
        );
        
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Location & Pricing
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Set your location and pricing strategy
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <MapWrapper
                center={formData.coordinates}
                height="300px"
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
                      <FormControl sx={{ minWidth: 80 }}>
                        <Select
                          value={formData.currency}
                          onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                          size="small"
                        >
                          {currencies.map((currency) => (
                            <MenuItem key={currency.value} value={currency.value}>
                              {currency.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </InputAdornment>
                  ),
                }}
                value={formData.hourlyRate}
                onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                error={!!errors.hourlyRate}
                helperText={errors.hourlyRate}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Daily Rate (Optional)"
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">{currencies.find(c => c.value === formData.currency)?.label}</InputAdornment>,
                }}
                value={formData.dailyRate}
                onChange={(e) => setFormData(prev => ({ ...prev, dailyRate: e.target.value }))}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Weekly Rate (Optional)"
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">{currencies.find(c => c.value === formData.currency)?.label}</InputAdornment>,
                }}
                value={formData.weeklyRate}
                onChange={(e) => setFormData(prev => ({ ...prev, weeklyRate: e.target.value }))}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Monthly Rate (Optional)"
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">{currencies.find(c => c.value === formData.currency)?.label}</InputAdornment>,
                }}
                value={formData.monthlyRate}
                onChange={(e) => setFormData(prev => ({ ...prev, monthlyRate: e.target.value }))}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.available24h}
                    onChange={(e) => setFormData(prev => ({ ...prev, available24h: e.target.checked }))}
                  />
                }
                label="Available 24/7"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Maximum Duration (hours)"
                type="number"
                value={formData.maxDuration}
                onChange={(e) => setFormData(prev => ({ ...prev, maxDuration: e.target.value }))}
                helperText="Leave empty for no limit"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Advance Booking (hours)"
                type="number"
                value={formData.advanceBooking}
                onChange={(e) => setFormData(prev => ({ ...prev, advanceBooking: e.target.value }))}
                helperText="How far in advance can people book"
              />
            </Grid>
          </Grid>
        );
        
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Features & Amenities
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Select the features and amenities your parking spot offers
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                🔒 Security Features
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {securityFeatures.map((feature) => (
                  <Chip
                    key={feature.value}
                    label={`${feature.icon} ${feature.label}`}
                    onClick={() => {
                      const isSelected = formData.selectedSecurityFeatures.includes(feature.value);
                      setFormData(prev => ({
                        ...prev,
                        selectedSecurityFeatures: isSelected
                          ? prev.selectedSecurityFeatures.filter(f => f !== feature.value)
                          : [...prev.selectedSecurityFeatures, feature.value]
                      }));
                    }}
                    color={formData.selectedSecurityFeatures.includes(feature.value) ? 'primary' : 'default'}
                    variant={formData.selectedSecurityFeatures.includes(feature.value) ? 'filled' : 'outlined'}
                    clickable
                  />
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                🎯 Amenities
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {amenities.map((amenity) => (
                  <Chip
                    key={amenity.value}
                    label={`${amenity.icon} ${amenity.label}`}
                    onClick={() => {
                      const isSelected = formData.selectedAmenities.includes(amenity.value);
                      setFormData(prev => ({
                        ...prev,
                        selectedAmenities: isSelected
                          ? prev.selectedAmenities.filter(a => a !== amenity.value)
                          : [...prev.selectedAmenities, amenity.value]
                      }));
                    }}
                    color={formData.selectedAmenities.includes(amenity.value) ? 'primary' : 'default'}
                    variant={formData.selectedAmenities.includes(amenity.value) ? 'filled' : 'outlined'}
                    clickable
                  />
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                🚗 Vehicle Restrictions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Maximum Vehicle Height (ft)"
                    type="number"
                    value={formData.maxVehicleHeight}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxVehicleHeight: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Maximum Vehicle Length (ft)"
                    type="number"
                    value={formData.maxVehicleLength}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxVehicleLength: e.target.value }))}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        );
        
      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Photos & Details
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Add photos and final details
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Card sx={{ p: 3, textAlign: 'center', border: '2px dashed', borderColor: 'grey.300' }}>
                <PhotoIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Upload Photos
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Add clear photos of your parking spot. First photo will be the cover image.
                </Typography>
                <Button
                  component="label"
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                >
                  Choose Photos
                  <VisuallyHiddenInput
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </Button>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Up to 10 photos, max 5MB each
                </Typography>
              </Card>
            </Grid>
            
            {previewImages.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Preview ({previewImages.length}/10)
                </Typography>
                <Grid container spacing={2}>
                  {previewImages.map((image, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Box sx={{ position: 'relative' }}>
                        <ImagePreview src={image} alt={`Preview ${index + 1}`} />
                        <IconButton
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'rgba(0,0,0,0.5)',
                            color: 'white',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                          }}
                          onClick={() => removeImage(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                        {index === 0 && (
                          <Chip
                            label="Cover"
                            size="small"
                            color="primary"
                            sx={{ position: 'absolute', top: 8, left: 8 }}
                          />
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Terms and Conditions"
                multiline
                rows={4}
                value={formData.terms}
                onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                placeholder="Specify your terms, cancellation policy, access instructions..."
                error={!!errors.terms}
                helperText={errors.terms}
              />
            </Grid>
          </Grid>
        );
        
      case 4:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Review & Submit
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Review your parking spot details before listing
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Card sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom>
                  {formData.title || 'Untitled Parking Spot'}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {formData.description}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <LocationIcon color="action" />
                  <Typography variant="body2">
                    {formData.address}, {formData.city}, {formData.state} {formData.zipCode}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <MoneyIcon color="action" />
                  <Typography variant="h6" color="primary">
                    {currencies.find(c => c.value === formData.currency)?.label}{formData.hourlyRate}/hour
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.selectedSecurityFeatures.map(feature => {
                    const featureData = securityFeatures.find(f => f.value === feature);
                    return (
                      <Chip
                        key={feature}
                        label={`${featureData?.icon} ${featureData?.label}`}
                        size="small"
                        variant="outlined"
                      />
                    );
                  })}
                  {formData.selectedAmenities.map(amenity => {
                    const amenityData = amenities.find(a => a.value === amenity);
                    return (
                      <Chip
                        key={amenity}
                        label={`${amenityData?.icon} ${amenityData?.label}`}
                        size="small"
                        variant="outlined"
                      />
                    );
                  })}
                </Box>
              </Card>
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.agreeToTerms}
                    onChange={(e) => setFormData(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
                  />
                }
                label="I agree to the terms and conditions and confirm that I own or have permission to list this parking spot"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3, bgcolor: 'grey.50' }}>
                <Typography variant="h6" gutterBottom>
                  💡 Tips for Success
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <StarIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Add clear, well-lit photos" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TrendingIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Set competitive pricing" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TimeIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Respond quickly to inquiries" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Keep your spot clean and accessible" />
                  </ListItem>
                </List>
              </Card>
            </Grid>
          </Grid>
        );
        
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1" sx={{ color: '#1E3A8A', fontWeight: 'bold', mb: 2 }}>
            List Your Parking Spot
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Earn money by sharing your parking space with others
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {loading && (
          <Box sx={{ mb: 3 }}>
            <LinearProgress />
            <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
              Creating your listing...
            </Typography>
          </Box>
        )}

        <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Back
            </Button>
            
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading || !formData.agreeToTerms}
                  sx={{
                    backgroundColor: '#1E3A8A',
                    '&:hover': { backgroundColor: '#1E40AF' }
                  }}
                >
                  {loading ? 'Creating Listing...' : 'List Parking Spot'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{
                    backgroundColor: '#1E3A8A',
                    '&:hover': { backgroundColor: '#1E40AF' }
                  }}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>

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
    </Container>
  );
}

export default ParkingSpotForm;
