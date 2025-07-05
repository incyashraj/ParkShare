import React, { useState, useEffect } from 'react';
import './styles/animations.css';
import HeroSection from './components/HeroSection';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  TextField, 
  InputAdornment,
  Chip,
  Avatar,
  Rating,
  Paper
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  EmojiNature as EmojiNatureIcon,
  LocalParking as ParkingIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';

function HomePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSearch = () => {
    if (searchQuery || searchLocation) {
      navigate('/search', { 
        state: { 
          query: searchQuery, 
          location: searchLocation 
        } 
      });
    }
  };

  const featuredSpots = [
    {
      id: 1,
      title: 'Downtown Premium Parking',
      location: 'Mumbai, Maharashtra',
      price: 25,
      rating: 4.8,
      reviews: 127,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop',
      features: ['Covered', '24/7 Security', 'EV Charging']
    },
    {
      id: 2,
      title: 'Mall Parking Garage',
      location: 'Pune, Maharashtra',
      price: 15,
      rating: 4.6,
      reviews: 89,
      image: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=250&fit=crop',
      features: ['Covered', 'Shopping Nearby', 'Easy Access']
    },
    {
      id: 3,
      title: 'Airport Long-term Parking',
      location: 'Delhi, NCR',
      price: 35,
      rating: 4.9,
      reviews: 234,
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=250&fit=crop',
      features: ['Shuttle Service', '24/7 Security', 'Long-term']
    }
  ];

  const stats = [
    { number: '50K+', label: 'Happy Users', icon: PersonIcon, color: '#3B82F6' },
    { number: '25K+', label: 'Parking Spots', icon: ParkingIcon, color: '#10B981' },
    { number: '99%', label: 'Satisfaction', icon: StarIcon, color: '#F59E0B' },
    { number: '₹2M+', label: 'Saved by Users', icon: MoneyIcon, color: '#8B5CF6' }
  ];

  const benefits = [
    {
      icon: SpeedIcon,
      title: 'Quick & Easy',
      description: 'Find and book parking spots in seconds with our streamlined process'
    },
    {
      icon: SecurityIcon,
      title: 'Secure & Safe',
      description: 'All spots are verified and monitored for your safety'
    },
    {
      icon: MoneyIcon,
      title: 'Save Money',
      description: 'Compare prices and find the best deals in your area'
    },
    {
      icon: EmojiNatureIcon,
      title: 'Eco-Friendly',
      description: 'Reduce carbon footprint by sharing parking resources'
    }
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="loading-spinner"></div>
      </Box>
    );
  }

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* Hero Section */}
      <HeroSection />

      {/* Search Section */}
      <Container maxWidth="lg" sx={{ mt: -8, mb: 8, position: 'relative', zIndex: 10 }}>
        <Paper 
          elevation={8} 
          sx={{ 
            p: 4, 
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}
        >
          <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
            Find Your Perfect Parking Spot
          </Typography>
          <Typography variant="h6" textAlign="center" sx={{ mb: 4, opacity: 0.9 }}>
            Search thousands of parking spots across India
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                placeholder="Where are you going?"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255,255,255,0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255,255,255,0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'white',
                    },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'rgba(255,255,255,0.7)',
                    opacity: 1,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                placeholder="Search for specific features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255,255,255,0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255,255,255,0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'white',
                    },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'rgba(255,255,255,0.7)',
                    opacity: 1,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleSearch}
                sx={{
                  bgcolor: 'white',
                  color: '#667eea',
                  fontWeight: 'bold',
                  py: 1.5,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)',
                  }
                }}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Card sx={{ textAlign: 'center', p: 3, height: '100%' }}>
                <Avatar sx={{ bgcolor: stat.color, mx: 'auto', mb: 2, width: 56, height: 56 }}>
                  <stat.icon sx={{ fontSize: 28 }} />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {stat.number}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Spots */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography variant="h3" fontWeight="bold" textAlign="center" gutterBottom>
          Featured Parking Spots
        </Typography>
        <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
          Discover the most popular and highly-rated parking spots
        </Typography>
        
        <Grid container spacing={4}>
          {featuredSpots.map((spot) => (
            <Grid item xs={12} md={4} key={spot.id}>
              <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                <Box
                  sx={{
                    height: 200,
                    backgroundImage: `url(${spot.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                  }}
                />
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {spot.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {spot.location}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Rating value={spot.rating} precision={0.1} size="small" readOnly />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {spot.rating} ({spot.reviews} reviews)
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      ₹{spot.price}/hour
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => navigate(`/spot/${spot.id}`)}
                    >
                      View Details
                    </Button>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {spot.features.map((feature, index) => (
                      <Chip key={index} label={feature} size="small" variant="outlined" />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Benefits Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" fontWeight="bold" textAlign="center" gutterBottom>
            Why Choose ParkShare?
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
            Experience the future of parking with our innovative platform
          </Typography>
          
          <Grid container spacing={4}>
            {benefits.map((benefit, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ textAlign: 'center', p: 3, height: '100%' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2, width: 64, height: 64 }}>
                    <benefit.icon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {benefit.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {benefit.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Paper 
          sx={{ 
            p: 6, 
            textAlign: 'center',
            background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
            color: 'white'
          }}
        >
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Ready to Start Parking Smarter?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of users who are already saving time and money with ParkShare
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                bgcolor: '#FBBF24',
                color: '#1E3A8A',
                fontWeight: 'bold',
                px: 4,
                py: 1.5,
                '&:hover': {
                  bgcolor: '#F59E0B',
                }
              }}
            >
              Get Started Free
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/search')}
              sx={{
                borderColor: 'white',
                color: 'white',
                fontWeight: 'bold',
                px: 4,
                py: 1.5,
                '&:hover': {
                  borderColor: '#FBBF24',
                  color: '#FBBF24',
                }
              }}
            >
              Browse Spots
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default HomePage; 