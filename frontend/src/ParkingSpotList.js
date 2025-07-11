import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
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
  Zoom,
  Tabs,
  Tab,
  IconButton,
  Switch,
  FormControlLabel,
  FormControl,
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
  Card,
  CardContent,
  CardMedia,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Breadcrumbs,
  Link,
  Checkbox,
} from '@mui/material';
import {
  Search as SearchIcon,
  Security as SecurityIcon,
  WifiTethering as LiveIcon,
  ViewList as ListIcon,
  Map as MapIcon,
  FilterList as FilterIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  ViewModule as GridIcon,
  Clear as ClearIcon,
  Add as AddIcon,
  MyLocation as MyLocationIcon,
  ExpandMore as ExpandMoreIcon,
  LocalParking as ParkingIcon,
  ElectricCar as ElectricIcon,
  Accessibility as AccessibilityIcon,
  LocalCarWash as CarWashIcon,
  DirectionsCar as CarIcon,
  DirectionsBike as BikeIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import MapComponent from './components/MapComponent';
import LoadingSpinner from './components/LoadingSpinner';
import ParkingSpotCard from './components/ParkingSpotCard';
import { useRealtime } from './contexts/RealtimeContext';
import { API_BASE } from './apiConfig';
import SimpleMapComponent from './components/SimpleMapComponent';

const initialCenter = [19.0760, 72.8777]; // Mumbai coordinates

const ParkingSpotList = () => {
  const navigate = useNavigate();
  const { joinSpotRoom, leaveSpotRoom, isConnected } = useRealtime();
  const [spots, setSpots] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(initialCenter);
  const [user, setUser] = useState(null);
  
  // Enhanced search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [maxPrice, setMaxPrice] = useState(200); // Dynamic maximum price
  const [priceRange, setPriceRange] = useState([0, 200]); // Will be updated based on maxPrice
  const [ratingFilter, setRatingFilter] = useState(0);
  const [distanceFilter, setDistanceFilter] = useState(10);
  const [availabilityFilter, setAvailabilityFilter] = useState('available');
  const [sortBy, setSortBy] = useState('distance');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [spotsPerPage] = useState(12);
  const [favorites, setFavorites] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);

  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [vehicleType, setVehicleType] = useState('all');
  const [parkingType, setParkingType] = useState('all');
  const [instantBooking, setInstantBooking] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showLocationError, setShowLocationError] = useState(false);
  const [locationErrorMessage, setLocationErrorMessage] = useState('');
  const [showManualLocation, setShowManualLocation] = useState(false);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }, []);

  // Calculate distances for all spots
  const calculateDistances = useCallback((spots, userLat, userLon) => {
    return spots.map(spot => {
      if (spot.coordinates && spot.coordinates.length === 2 && userLat && userLon) {
        const distance = calculateDistance(userLat, userLon, spot.coordinates[0], spot.coordinates[1]);
        return { ...spot, distance };
      }
      return { ...spot, distance: null };
    });
  }, [calculateDistance]);

  const sortOptions = [
    { value: 'distance', label: 'Distance', icon: LocationIcon },
    { value: 'price', label: 'Price', icon: MoneyIcon },
    { value: 'rating', label: 'Rating', icon: StarIcon },
    { value: 'availability', label: 'Availability', icon: ScheduleIcon },
    { value: 'popularity', label: 'Popularity', icon: TrendingIcon },
  ];

  const amenities = [
    { id: 'cctv', label: 'Security Camera', icon: SecurityIcon },
    { id: 'security_guard', label: 'Security Guard', icon: SecurityIcon },
    { id: 'fenced', label: 'Fenced Area', icon: SecurityIcon },
    { id: 'well_lit', label: 'Well Lit', icon: SecurityIcon },
    { id: 'covered', label: 'Covered Parking', icon: ParkingIcon },
    { id: 'ev_charging', label: 'EV Charging', icon: ElectricIcon },
    { id: 'accessible', label: 'Accessible', icon: AccessibilityIcon },
    { id: 'car_wash', label: 'Car Wash', icon: CarWashIcon },
    { id: 'valet_service', label: 'Valet Service', icon: ParkingIcon },
  ];

  const vehicleTypes = [
    { value: 'all', label: 'All Vehicles', icon: CarIcon },
    { value: 'car', label: 'Car', icon: CarIcon },
    { value: 'suv', label: 'SUV', icon: CarIcon },
    { value: 'bike', label: 'Bike', icon: BikeIcon },
    { value: 'truck', label: 'Truck', icon: CarIcon },
  ];

  const parkingTypes = [
    { value: 'all', label: 'All Types', icon: ParkingIcon },
    { value: 'street', label: 'Street Parking', icon: ParkingIcon },
    { value: 'lot', label: 'Parking Lot', icon: ParkingIcon },
    { value: 'covered_lot', label: 'Covered Lot', icon: ParkingIcon },
    { value: 'garage', label: 'Garage', icon: ParkingIcon },
    { value: 'underground', label: 'Underground', icon: ParkingIcon },
  ];

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
    queryParams.append('minRating', ratingFilter);
    
    // Add availability filter
    if (availabilityFilter === 'available') {
      queryParams.append('availability', 'available');
    }
    
    // Add search term
    if (searchTerm) {
      queryParams.append('location', searchTerm);
    }

    // Add amenities filter
    if (selectedAmenities.length > 0) {
      queryParams.append('amenities', selectedAmenities.join(','));
    }

    try {
      const response = await fetch(`${API_BASE}/api/parking-spots/search?${queryParams.toString()}`);
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

        // Calculate maximum price from all spots
        const prices = transformedSpots.map(spot => 
          parseFloat(spot.hourlyRate?.replace(/[^0-9.]/g, '') || '0')
        );
        const calculatedMaxPrice = Math.max(...prices, 200); // Ensure minimum of 200
        console.log('Detected maximum price:', calculatedMaxPrice, 'from prices:', prices);
        setMaxPrice(calculatedMaxPrice);
        
        // Update price range if current max is less than calculated max
        if (priceRange[1] < calculatedMaxPrice) {
          console.log('Updating price range from', priceRange[1], 'to', calculatedMaxPrice);
          setPriceRange([0, calculatedMaxPrice]);
        }

        // If geolocation is available, update user location and calculate distances
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              setUserLocation([latitude, longitude]);
              
              // Calculate distances for all spots
              const spotsWithDistances = calculateDistances(transformedSpots, latitude, longitude);
              setSpots(spotsWithDistances);
            },
            (error) => {
              console.error('Error getting location:', error);
              setSnackbarMessage('Could not get your location. Using default location.');
              setSnackbarSeverity('error');
              setOpenSnackbar(true);
            }
          );
        }
      } else {
        console.error('Invalid data format received:', data);
        setSnackbarMessage('Failed to load parking spots');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error('Error fetching parking spots:', error);
      setSnackbarMessage('Failed to fetch parking spots');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  }, [priceRange, ratingFilter, searchTerm, availabilityFilter, selectedAmenities, calculateDistances]);

  useEffect(() => {
    fetchParkingSpots();
  }, [fetchParkingSpots]);

  // Update price range when maxPrice changes
  useEffect(() => {
    if (priceRange[1] < maxPrice) {
      setPriceRange([0, maxPrice]);
    }
  }, [maxPrice, priceRange]);

  // Recalculate distances when user location changes
  useEffect(() => {
    if (userLocation && spots.length > 0) {
      const [latitude, longitude] = userLocation;
      const spotsWithDistances = calculateDistances(spots, latitude, longitude);
      setSpots(spotsWithDistances);
    }
  }, [userLocation, spots, calculateDistances]);

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

  // Apply sorting with availability priority
  const sortSpots = useCallback((spotsToSort) => {
    console.log('Sorting spots by:', sortBy, 'Total spots:', spotsToSort.length);
    
    // Helper function to check if a spot is available
    const isSpotAvailable = (spot) => {
      return Boolean(spot.available) || 
             Boolean(spot.available24h) || 
             spot.status === 'available' ||
             spot.status === 'Available' ||
             (spot.available !== false && spot.available24h !== false);
    };
    
    // First, separate available and occupied spots
    const availableSpots = spotsToSort.filter(spot => isSpotAvailable(spot));
    const occupiedSpots = spotsToSort.filter(spot => !isSpotAvailable(spot));
    
    // Sort each group according to the selected criteria
    const sortByCriteria = (spots) => {
      switch (sortBy) {
        case 'price':
          return [...spots].sort((a, b) => {
            const priceA = parseFloat(a.hourlyRate?.replace(/[^0-9.]/g, '') || '0');
            const priceB = parseFloat(b.hourlyRate?.replace(/[^0-9.]/g, '') || '0');
            return priceA - priceB;
          });
        case 'rating':
          return [...spots].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        case 'availability':
          // For availability sorting, we already have them separated, so just return as is
          return [...spots];
        case 'popularity':
          return [...spots].sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        case 'distance':
        default:
          return [...spots].sort((a, b) => (a.distance || 0) - (b.distance || 0));
      }
    };
    
    // Sort available and occupied spots separately
    const sortedAvailableSpots = sortByCriteria(availableSpots);
    const sortedOccupiedSpots = sortByCriteria(occupiedSpots);
    
    // Always return available spots first, then occupied spots
    return [...sortedAvailableSpots, ...sortedOccupiedSpots];
  }, [sortBy]);

  // Enhanced geolocation logic
  const requestUserLocation = () => {
    // Check if we've already tried to get location in this session
    const locationErrorShown = sessionStorage.getItem('locationErrorShown');
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setShowLocationError(false);
          setLocationErrorMessage('');
          // Clear the error flag since we succeeded
          sessionStorage.removeItem('locationErrorShown');
        },
        (error) => {
          console.error('Error getting location:', error);
          // Only show error if we haven't shown it before in this session
          if (!locationErrorShown) {
            setShowLocationError(true);
            setLocationErrorMessage('Could not get your location. Using default location.');
            sessionStorage.setItem('locationErrorShown', 'true');
          }
        }
      );
    } else {
      // Only show error if we haven't shown it before in this session
      if (!locationErrorShown) {
        setShowLocationError(true);
        setLocationErrorMessage('Geolocation is not supported by your browser.');
        sessionStorage.setItem('locationErrorShown', 'true');
      }
    }
  };

  const handleLocationClick = () => {
    // Check if we're already requesting location
    const isRequestingLocation = sessionStorage.getItem('isRequestingLocation');
    if (isRequestingLocation) {
      setSnackbarMessage('Location request already in progress...');
      setSnackbarSeverity('info');
      setOpenSnackbar(true);
      return;
    }

    if (navigator.geolocation) {
      // Set flag to prevent duplicate requests
      sessionStorage.setItem('isRequestingLocation', 'true');
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setSnackbarMessage('Location updated successfully!');
          setSnackbarSeverity('success');
          setOpenSnackbar(true);
          // Clear the flag
          sessionStorage.removeItem('isRequestingLocation');
        },
        (error) => {
          setSnackbarMessage('Could not get your location');
          setSnackbarSeverity('error');
          setOpenSnackbar(true);
          // Clear the flag
          sessionStorage.removeItem('isRequestingLocation');
        }
      );
    } else {
      setSnackbarMessage('Geolocation is not supported by your browser');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleToggleFavorite = (spotId) => {
    const spot = spots.find(s => s.id === spotId);
    if (!spot) return;

    setFavorites(prev => {
      const isFavorite = prev.some(fav => fav.id === spotId);
      
      if (isFavorite) {
        // Remove from favorites
        const updated = prev.filter(fav => fav.id !== spotId);
        localStorage.setItem('favorites', JSON.stringify(updated));
        setSnackbarMessage('Removed from favorites!');
        setSnackbarSeverity('info');
        setOpenSnackbar(true);
        return updated;
      } else {
        // Add to favorites
        const favoriteSpot = {
          id: spot.id,
          title: spot.title || spot.location,
          location: spot.location,
          hourlyRate: spot.hourlyRate,
          rating: spot.rating || 0,
          reviewCount: spot.reviewCount || 0,
          images: spot.images || [],
          available: spot.available,
          available24h: spot.available24h,
          distance: spot.distance,
          favoritedAt: new Date().toISOString()
        };
        
        const updated = [...prev, favoriteSpot];
        localStorage.setItem('favorites', JSON.stringify(updated));
        setSnackbarMessage('Added to favorites!');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
        return updated;
      }
    });
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
  };

  const handleFilterClick = () => {
    setShowFilters(!showFilters);
  };

  const getCurrentSpots = () => {
    const { availableSpots, occupiedSpots } = getOrganizedSpots();
    
    // If availability filter is set to 'available', only show available spots
    if (availabilityFilter === 'available') {
      // Sort available spots according to the selected sort criteria
      const sortedAvailableSpots = sortSpots(availableSpots);
      const startIndex = (currentPage - 1) * spotsPerPage;
      const endIndex = startIndex + spotsPerPage;
      return sortedAvailableSpots.slice(startIndex, endIndex);
    }
    
    // Otherwise, show all spots with available ones first (already handled by sortSpots)
    const allSpots = [...availableSpots, ...occupiedSpots];
    // Sort all spots according to the selected sort criteria (available first)
    const sortedAllSpots = sortSpots(allSpots);
    const startIndex = (currentPage - 1) * spotsPerPage;
    const endIndex = startIndex + spotsPerPage;
    return sortedAllSpots.slice(startIndex, endIndex);
  };

  const getTotalSpotsCount = () => {
    const { availableSpots, occupiedSpots } = getOrganizedSpots();
    
    // If availability filter is set to 'available', only count available spots
    if (availabilityFilter === 'available') {
      return availableSpots.length;
    }
    
    // Otherwise, count all spots
    return availableSpots.length + occupiedSpots.length;
  };

  // Get filtered spots without availability filtering
  const getFilteredSpotsWithoutAvailability = useCallback(() => {
    let filtered = [...spots];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(spot =>
        spot.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spot.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply price filter
    filtered = filtered.filter(spot => {
      const price = parseFloat(spot.hourlyRate?.replace(/[^0-9.]/g, '') || '0');
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Apply rating filter
    if (ratingFilter > 0) {
      filtered = filtered.filter(spot => (spot.rating || 0) >= ratingFilter);
    }

    // Apply amenities filter
    if (selectedAmenities.length > 0) {
      filtered = filtered.filter(spot =>
        selectedAmenities.every(amenity => 
          spot.amenities?.includes(amenity) || spot.securityFeatures?.includes(amenity)
        )
      );
    }

    // Apply vehicle type filter
    if (vehicleType !== 'all') {
      filtered = filtered.filter(spot =>
        spot.vehicleTypes?.includes(vehicleType)
      );
    }

    // Apply parking type filter
    if (parkingType !== 'all') {
      filtered = filtered.filter(spot => {
        const spotParkingType = spot.parkingType || 'lot';
        return spotParkingType === parkingType;
      });
    }

    // Apply instant booking filter
    if (instantBooking) {
      filtered = filtered.filter(spot => {
        // Use the same logic as getOrganizedSpots
        return Boolean(spot.available) || 
               Boolean(spot.available24h) || 
               spot.status === 'available' ||
               spot.status === 'Available' ||
               (spot.available !== false && spot.available24h !== false);
      });
    }

    return filtered;
  }, [spots, searchTerm, priceRange, ratingFilter, selectedAmenities, vehicleType, parkingType, instantBooking]);

  // Separate available and occupied spots for better organization
  const getOrganizedSpots = () => {
    const allSpots = getFilteredSpotsWithoutAvailability();
    
    // Helper function to check if a spot is available
    const isSpotAvailable = (spot) => {
      // Check multiple availability indicators
      return Boolean(spot.available) || 
             Boolean(spot.available24h) || 
             spot.status === 'available' ||
             spot.status === 'Available' ||
             (spot.available !== false && spot.available24h !== false);
    };
    
    const availableSpots = allSpots.filter(spot => isSpotAvailable(spot));
    const occupiedSpots = allSpots.filter(spot => !isSpotAvailable(spot));
    
    console.log('Organized spots:', {
      total: allSpots.length,
      available: availableSpots.length,
      occupied: occupiedSpots.length,
      availabilityFilter,
      availableSpots: availableSpots.map(s => ({ id: s.id, title: s.title, available: s.available, available24h: s.available24h, status: s.status })),
      occupiedSpots: occupiedSpots.map(s => ({ id: s.id, title: s.title, available: s.available, available24h: s.available24h, status: s.status }))
    });
    
    return { availableSpots, occupiedSpots };
  };

  const handleFavorite = (spotId, isFavorite) => {
    const spot = spots.find(s => s.id === spotId);
    if (!spot) return;

    setFavorites(prev => {
      if (isFavorite) {
        // Add to favorites
        const favoriteSpot = {
          id: spot.id,
          title: spot.title || spot.location,
          location: spot.location,
          hourlyRate: spot.hourlyRate,
          rating: spot.rating || 0,
          reviewCount: spot.reviewCount || 0,
          images: spot.images || [],
          available: spot.available,
          available24h: spot.available24h,
          distance: spot.distance,
          favoritedAt: new Date().toISOString()
        };
        
        // Check if already in favorites
        const exists = prev.some(fav => fav.id === spotId);
        if (exists) {
          return prev;
        }
        
        const updated = [...prev, favoriteSpot];
        localStorage.setItem('favorites', JSON.stringify(updated));
        return updated;
      } else {
        // Remove from favorites
        const updated = prev.filter(fav => fav.id !== spotId);
        localStorage.setItem('favorites', JSON.stringify(updated));
        return updated;
      }
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPriceRange([0, maxPrice]); // Use dynamic maximum price
    setRatingFilter(0);
    setDistanceFilter(10);
    setAvailabilityFilter('available');
    setSortBy('distance');
    setSelectedAmenities([]);
    setVehicleType('all');
    setParkingType('all');
    setInstantBooking(false);
    setCurrentPage(1);
  };

  const saveSearch = () => {
    const searchConfig = {
      id: Date.now(),
      name: `Search ${savedSearches.length + 1}`,
      searchTerm,
      priceRange,
      ratingFilter,
      distanceFilter,
      availabilityFilter,
      selectedAmenities,
      vehicleType,
      parkingType,
      instantBooking,
      timestamp: new Date().toISOString()
    };
    
    setSavedSearches(prev => {
      // Check if this exact search already exists
      const exists = prev.find(search => 
        search.searchTerm === searchTerm &&
        JSON.stringify(search.priceRange) === JSON.stringify(priceRange) &&
        search.ratingFilter === ratingFilter &&
        search.distanceFilter === distanceFilter &&
        search.availabilityFilter === availabilityFilter &&
        JSON.stringify(search.selectedAmenities) === JSON.stringify(selectedAmenities) &&
        search.vehicleType === vehicleType &&
        search.parkingType === parkingType &&
        search.instantBooking === instantBooking
      );
      
      if (exists) {
        setSnackbarMessage('This search is already saved!');
        setSnackbarSeverity('info');
        setOpenSnackbar(true);
        return prev;
      }
      
      const updated = [...prev, searchConfig];
      // Save to localStorage
      localStorage.setItem('savedSearches', JSON.stringify(updated));
      setSnackbarMessage('Search saved successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      return updated;
    });
  };

  const loadSearch = (savedSearch) => {
    setSearchTerm(savedSearch.searchTerm);
    setPriceRange(savedSearch.priceRange);
    setRatingFilter(savedSearch.ratingFilter);
    setDistanceFilter(savedSearch.distanceFilter);
    setAvailabilityFilter(savedSearch.availabilityFilter);
    setSelectedAmenities(savedSearch.selectedAmenities);
    setVehicleType(savedSearch.vehicleType);
    setParkingType(savedSearch.parkingType);
    setInstantBooking(savedSearch.instantBooking);
    setShowSavedSearches(false);
    setCurrentPage(1);
  };

  const removeSavedSearch = (searchId) => {
    setSavedSearches(prev => {
      const updated = prev.filter(search => search.id !== searchId);
      localStorage.setItem('savedSearches', JSON.stringify(updated));
      setSnackbarMessage('Search removed successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      return updated;
    });
  };

  const handleAmenityToggle = (amenityId) => {
    setSelectedAmenities(prev =>
      prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  // Remove favorite
  const handleRemoveFavorite = (spotId) => {
    setFavorites(prev => {
      const updated = prev.filter(fav => fav.id !== spotId);
      localStorage.setItem('favorites', JSON.stringify(updated));
      setSnackbarMessage('Removed from favorites!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      return updated;
    });
  };

  // Load favorites from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('favorites');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Remove duplicates by ID
        const uniqueFavorites = parsed.filter((favorite, index, self) => 
          index === self.findIndex(f => f.id === favorite.id)
        );
        setFavorites(uniqueFavorites);
        // Update localStorage with deduplicated data
        if (uniqueFavorites.length !== parsed.length) {
          localStorage.setItem('favorites', JSON.stringify(uniqueFavorites));
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    }
  }, []);

  // Load saved searches from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('savedSearches');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Remove duplicates by ID
        const uniqueSearches = parsed.filter((search, index, self) => 
          index === self.findIndex(s => s.id === search.id)
        );
        setSavedSearches(uniqueSearches);
        // Update localStorage with deduplicated data
        if (uniqueSearches.length !== parsed.length) {
          localStorage.setItem('savedSearches', JSON.stringify(uniqueSearches));
        }
      } catch (error) {
        console.error('Error loading saved searches:', error);
      }
    }
  }, []);

  const handleSpotAvailabilityChange = (spotId, available) => {
    setSpots(prevSpots =>
      prevSpots.map(spot =>
        spot.id === spotId ? { ...spot, available } : spot
      )
    );
  };

  // Manual location selection handler
  const handleManualLocationSelect = ({ lat, lng }) => {
    setUserLocation([lat, lng]);
    setShowManualLocation(false);
    setShowLocationError(false);
    setLocationErrorMessage('');
    setSnackbarMessage('Location set manually!');
    setSnackbarSeverity('info');
    setOpenSnackbar(true);
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
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/" underline="hover">
          Home
        </Link>
        <Typography color="text.primary">Search Parking</Typography>
      </Breadcrumbs>

      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
              Find Your Perfect Parking Spot
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Discover convenient parking options near you
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Chip
              icon={<LiveIcon />}
              label={isConnected ? 'Live Updates' : 'Offline'}
              color={isConnected ? 'success' : 'error'}
              size="small"
            />
            <Button
              variant="outlined"
              startIcon={<BookmarkIcon />}
              onClick={() => setShowSavedSearches(true)}
            >
              Saved Searches
            </Button>
            <Button
              variant="outlined"
              startIcon={<FavoriteIcon />}
              onClick={() => setShowFavorites(true)}
              sx={{ minWidth: 'auto' }}
            >
              Favorites ({favorites.length})
            </Button>
            <Button
              variant="contained"
              startIcon={<FilterIcon />}
              onClick={handleFilterClick}
            >
              Filters
            </Button>
          </Box>
        </Box>

        {/* Main Search Bar */}
        <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder="Search by location, landmark, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleLocationClick} size="small">
                      <MyLocationIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1 }}
            />
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={saveSearch}
              disabled={!searchTerm && priceRange[0] === 0 && priceRange[1] === 50}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
            >
              Clear
            </Button>
          </Box>
        </Paper>

        {/* Quick Filters */}
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {getTotalSpotsCount()} spots found
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
              <FormControlLabel
                control={
                  <Switch
                    checked={instantBooking}
                    onChange={(e) => setInstantBooking(e.target.checked)}
                    size="small"
                  />
                }
                label="Instant booking"
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Sort by:
              </Typography>
              <ToggleButtonGroup
                value={sortBy}
                exclusive
                onChange={(e, newValue) => newValue && handleSortChange(newValue)}
                size="small"
              >
                {sortOptions.map((option) => (
                  <ToggleButton key={option.value} value={option.value}>
                    <option.icon sx={{ mr: 0.5, fontSize: 16 }} />
                    {option.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Grid container spacing={4}>
        {/* Enhanced Filters Section */}
        <Grid item xs={12} md={3}>
          <Fade in timeout={500}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, position: 'sticky', top: 20 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ color: '#1E3A8A', fontWeight: 600 }}>
                  Filters
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  <ExpandMoreIcon 
                    sx={{ 
                      transform: showAdvancedFilters ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s'
                    }} 
                  />
                </IconButton>
              </Box>

              {/* Price Range */}
              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom fontWeight="medium">
                  Price Range (₹/hour)
                </Typography>
                <Slider
                  value={priceRange}
                  onChange={(e, newValue) => setPriceRange(newValue)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={maxPrice}
                  sx={{ color: 'primary.main' }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">₹{priceRange[0]}</Typography>
                  <Typography variant="body2">₹{priceRange[1]}</Typography>
                </Box>
              </Box>

              {/* Rating Filter */}
              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom fontWeight="medium">
                  Minimum Rating
                </Typography>
                <Rating
                  value={ratingFilter}
                  onChange={(e, newValue) => setRatingFilter(newValue)}
                  size="large"
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {ratingFilter}+ stars
                </Typography>
              </Box>

              {/* Distance Filter */}
              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom fontWeight="medium">
                  Distance (km)
                </Typography>
                <Slider
                  value={distanceFilter}
                  onChange={(e, newValue) => setDistanceFilter(newValue)}
                  valueLabelDisplay="auto"
                  min={0.1}
                  max={20}
                  sx={{ color: 'primary.main' }}
                />
                <Typography variant="body2" textAlign="center">
                  {distanceFilter.toFixed(1)} km
                </Typography>
              </Box>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <Fade in timeout={300}>
                  <Box>
                    {/* Vehicle Type */}
                    <Box sx={{ mb: 3 }}>
                      <Typography gutterBottom fontWeight="medium">
                        Vehicle Type
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Select
                          value={vehicleType}
                          onChange={(e) => setVehicleType(e.target.value)}
                        >
                          {vehicleTypes.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <type.icon fontSize="small" />
                                {type.label}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>

                    {/* Parking Type */}
                    <Box sx={{ mb: 3 }}>
                      <Typography gutterBottom fontWeight="medium">
                        Parking Type
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Select
                          value={parkingType}
                          onChange={(e) => setParkingType(e.target.value)}
                        >
                          {parkingTypes.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <type.icon fontSize="small" />
                                {type.label}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>

                    {/* Amenities */}
                    <Box sx={{ mb: 3 }}>
                      <Typography gutterBottom fontWeight="medium">
                        Amenities
                      </Typography>
                      <List dense>
                        {amenities.map((amenity) => (
                          <ListItem key={amenity.id} dense>
                            <ListItemIcon>
                              <Checkbox
                                checked={selectedAmenities.includes(amenity.id)}
                                onChange={() => handleAmenityToggle(amenity.id)}
                                size="small"
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <amenity.icon fontSize="small" />
                                  {amenity.label}
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Box>
                </Fade>
              )}
            </Paper>
          </Fade>
        </Grid>

        {/* Results Section */}
        <Grid item xs={12} md={9}>
          {/* View Mode Toggle */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              {viewMode === 'map' ? 'Map View' : 'List View'}
            </Typography>
            <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <Tabs value={viewMode} onChange={(e, newValue) => setViewMode(newValue)} size="small">
                <Tab 
                  value="grid" 
                  icon={<GridIcon />} 
                  label="Grid" 
                  sx={{ minHeight: 40 }}
                />
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

          {/* Results Content */}
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
                    markers={getFilteredSpotsWithoutAvailability().map(spot => ({
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
                      const spot = getFilteredSpotsWithoutAvailability().find(s => 
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
          ) : viewMode === 'list' ? (
            // List View
            <Box>
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Skeleton variant="rectangular" width={120} height={80} />
                        <Box sx={{ flex: 1 }}>
                          <Skeleton variant="text" height={24} />
                          <Skeleton variant="text" height={20} />
                          <Skeleton variant="text" height={20} />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))
              ) : getTotalSpotsCount() === 0 ? (
                <Box sx={{ textAlign: 'center', p: 6 }}>
                  <InfoIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h5" color="text.secondary" gutterBottom>
                    No parking spots found
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Try adjusting your filters or search criteria
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<RefreshIcon />}
                    onClick={clearFilters}
                  >
                    Clear All Filters
                  </Button>
                </Box>
              ) : (
                getCurrentSpots().map((spot, index) => (
                  <Card key={spot.id || index} sx={{ mb: 2, cursor: 'pointer' }} onClick={() => navigate(`/spot/${spot.id}`)}>
                    <CardContent>
                      <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                        <Box sx={{ width: 120, height: 80, borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                          <img 
                            src={spot.images?.[0] || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=120&h=80&fit=crop'} 
                            alt={spot.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="h6" fontWeight="bold" sx={{ color: 'primary.main' }}>
                              {spot.title}
                            </Typography>
                            <Chip 
                              label={spot.available ? 'Available' : 'Occupied'} 
                              color={spot.available ? 'success' : 'error'}
                              size="small"
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {spot.location}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Rating value={spot.rating || 0} readOnly size="small" />
                            <Typography variant="body2" color="text.secondary">
                              ({spot.reviewCount || 0} reviews)
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Typography variant="h6" fontWeight="bold" color="primary">
                              ₹{spot.hourlyRate}/hour
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {spot.distance ? `${spot.distance.toFixed(1)} km away` : 'Distance unavailable'}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(spot.id);
                            }}
                            color={favorites.some(fav => fav.id === spot.id) ? 'primary' : 'default'}
                          >
                            {favorites.some(fav => fav.id === spot.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                          </IconButton>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/spot/${spot.id}`);
                            }}
                            sx={{ 
                              bgcolor: '#22C55E',
                              '&:hover': { bgcolor: '#16A34A' }
                            }}
                          >
                            View Details
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))
              )}
            </Box>
          ) : (
            <Grid container spacing={3}>
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <Grid item xs={12} sm={6} lg={4} key={index}>
                    <Card>
                      <Skeleton variant="rectangular" height={200} />
                      <CardContent>
                        <Skeleton variant="text" height={24} />
                        <Skeleton variant="text" height={20} />
                        <Skeleton variant="text" height={20} />
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : getTotalSpotsCount() === 0 ? (
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', p: 6 }}>
                    <InfoIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h5" color="text.secondary" gutterBottom>
                      No parking spots found
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                      Try adjusting your filters or search criteria
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<RefreshIcon />}
                      onClick={clearFilters}
                    >
                      Clear All Filters
                    </Button>
                  </Box>
                </Grid>
              ) : (
                getCurrentSpots().map((spot, index) => (
                  <Grid item xs={12} sm={6} lg={4} key={spot.id || index}>
                    <ParkingSpotCard
                      spot={spot}
                      onFavorite={handleFavorite}
                      user={user}
                      isFavorite={favorites.some(fav => fav.id === spot.id)}
                      onToggleFavorite={() => handleToggleFavorite(spot.id)}
                      onBook={async (bookingData) => {
                        // Handle booking success
                        setSnackbarMessage('Booking successful!');
                        setSnackbarSeverity('success');
                        setOpenSnackbar(true);
                      }}
                      onAvailabilityChange={(available) => handleSpotAvailabilityChange(spot.id, available)}
                    />
                  </Grid>
                ))
              )}
            </Grid>
          )}
        </Grid>
      </Grid>

      {/* Pagination */}
      {getTotalSpotsCount() > spotsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={Math.ceil(getTotalSpotsCount() / spotsPerPage)}
            page={currentPage}
            onChange={(e, page) => setCurrentPage(page)}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Saved Searches Dialog */}
      <Dialog
        open={showSavedSearches}
        onClose={() => setShowSavedSearches(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BookmarkIcon />
            Saved Searches
          </Box>
        </DialogTitle>
        <DialogContent>
          {savedSearches.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <BookmarkBorderIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No saved searches
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Save your favorite search criteria for quick access
              </Typography>
            </Box>
          ) : (
            <List>
              {savedSearches.map((search) => (
                <ListItem key={search.id} divider>
                  <ListItemText
                    primary={search.name}
                    secondary={`${search.searchTerm || 'Any location'} • ₹${search.priceRange[0]}-${search.priceRange[1]}/hour`}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => loadSearch(search)}
                    >
                      Load
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => removeSavedSearch(search.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          {savedSearches.length > 0 && (
            <Button 
              onClick={() => {
                setSavedSearches([]);
                localStorage.removeItem('savedSearches');
                setSnackbarMessage('All saved searches cleared!');
                setSnackbarSeverity('success');
                setOpenSnackbar(true);
              }}
              color="error"
            >
              Clear All
            </Button>
          )}
          <Button onClick={() => setShowSavedSearches(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Favorites Dialog */}
      <Dialog
        open={showFavorites}
        onClose={() => setShowFavorites(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FavoriteIcon />
            Favorites ({favorites.length})
          </Box>
        </DialogTitle>
        <DialogContent>
          {favorites.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <FavoriteBorderIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No favorites yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click the heart icon on parking spots to add them to your favorites
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {favorites.map((favoriteSpot) => (
                <Grid item xs={12} sm={6} key={favoriteSpot.id}>
                  <Card sx={{ height: '100%' }}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={favoriteSpot.images?.[0] || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=140&fit=crop'}
                      alt={favoriteSpot.title}
                    />
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {favoriteSpot.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {favoriteSpot.location}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" color="primary">
                          ₹{favoriteSpot.hourlyRate}/hour
                        </Typography>
                        <Rating value={favoriteSpot.rating || 0} readOnly size="small" />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => navigate(`/spot/${favoriteSpot.id}`)}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleRemoveFavorite(favoriteSpot.id)}
                        >
                          Remove
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          {favorites.length > 0 && (
            <Button 
              onClick={() => {
                setFavorites([]);
                localStorage.removeItem('favorites');
                setSnackbarMessage('All favorites cleared!');
                setSnackbarSeverity('success');
                setOpenSnackbar(true);
              }}
              color="error"
            >
              Clear All
            </Button>
          )}
          <Button onClick={() => setShowFavorites(false)}>Close</Button>
        </DialogActions>
      </Dialog>

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

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => navigate('/list')}
      >
        <AddIcon />
      </Fab>

      {/* Manual Location Modal */}
      {showManualLocation && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: 8, padding: 24, minWidth: 350, maxWidth: 400 }}>
            <Typography variant="h6" gutterBottom>Select Your Location</Typography>
            <SimpleMapComponent
              center={userLocation}
              onLocationSelect={handleManualLocationSelect}
              selectedPosition={userLocation}
            />
            <Button fullWidth variant="outlined" sx={{ mt: 2 }} onClick={() => setShowManualLocation(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Location Error Snackbar */}
      <Snackbar
        open={showLocationError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={() => setShowLocationError(false)}
        autoHideDuration={null}
      >
        <Alert
          severity="info"
          sx={{ minWidth: 350, alignItems: 'center' }}
          action={
            <>
              <Button color="primary" size="small" onClick={requestUserLocation}>
                Retry
              </Button>
              <Button color="secondary" size="small" onClick={() => { setShowManualLocation(true); setShowLocationError(false); }}>
                Set Manually
              </Button>
            </>
          }
        >
          {locationErrorMessage || 'Could not get your location. Using default location.'}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ParkingSpotList;