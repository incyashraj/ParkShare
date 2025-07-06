import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Grid, Card, CardContent, Button, TextField, InputAdornment, Chip, Avatar, Rating, Paper } from '@mui/material';
import { Search as SearchIcon, LocationOn as LocationIcon, AttachMoney as MoneyIcon, Star as StarIcon, Security as SecurityIcon, Speed as SpeedIcon, EmojiNature as EmojiNatureIcon, LocalParking as ParkingIcon, Person as PersonIcon, Add } from '@mui/icons-material';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import HeroSection from './components/HeroSection';
import './styles/animations.css';

function HomePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
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

  const features = [
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: '#FF385C' }} />,
      title: 'Secure Parking',
      description: 'All parking spots are verified and secure with 24/7 monitoring.'
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: '#00A699' }} />,
      title: 'Instant Booking',
      description: 'Book parking spots instantly with our streamlined process.'
    },
    {
      icon: <MoneyIcon sx={{ fontSize: 40, color: '#FFB400' }} />,
      title: 'Best Prices',
      description: 'Find the best parking rates in your area with price comparison.'
    },
    {
      icon: <EmojiNatureIcon sx={{ fontSize: 40, color: '#007A87' }} />,
      title: 'Eco-Friendly',
      description: 'Reduce carbon footprint by sharing parking spaces efficiently.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Frequent Traveler',
      content: 'ParkShare has made finding parking so much easier. I love the convenience!',
      rating: 5,
      avatar: 'SJ'
    },
    {
      name: 'Mike Chen',
      role: 'Business Owner',
      content: 'As a business owner, I can easily rent out my parking space when not in use.',
      rating: 5,
      avatar: 'MC'
    },
    {
      name: 'Emily Davis',
      role: 'Student',
      content: 'Affordable parking near campus. Perfect for my budget!',
      rating: 4,
      avatar: 'ED'
    }
  ];

  if (loading) {
    return (
      <Box className="airbnb-app-container">
        <Container className="airbnb-container">
          <Box className="airbnb-flex airbnb-justify-center airbnb-items-center" style={{ minHeight: '60vh' }}>
            <Typography variant="h4" className="airbnb-text-secondary">Loading...</Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box className="airbnb-app-container">
      {/* Hero Section */}
      <HeroSection />

      {/* Search Section */}
      <Container className="airbnb-container airbnb-mt-5">
        <Paper className="airbnb-search-bar airbnb-p-4 airbnb-mb-5">
          <Typography variant="h3" className="airbnb-text-center airbnb-mb-4">
            Find Your Perfect Parking Spot
          </Typography>
          <Grid container spacing={2} className="airbnb-items-center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Where are you going?"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                className="airbnb-form-input"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search for parking spots..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                className="airbnb-form-input"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSearch}
                className="airbnb-btn-primary airbnb-btn-lg"
                startIcon={<SearchIcon />}
              >
                Search Spots
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Features Section */}
      <Container className="airbnb-container airbnb-mb-5">
        <Typography variant="h2" className="airbnb-text-center airbnb-mb-5">
          Why Choose ParkShare?
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card className="airbnb-card airbnb-card-elevated">
                <CardContent className="airbnb-text-center airbnb-p-4">
                  <Box className="airbnb-mb-3">
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" className="airbnb-mb-2 airbnb-font-semibold">
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" className="airbnb-text-secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Stats Section */}
      <Box className="airbnb-bg-secondary airbnb-py-5 airbnb-mb-5">
        <Container className="airbnb-container">
          <Grid container spacing={4} className="airbnb-text-center">
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h3" className="airbnb-text-red airbnb-font-bold airbnb-mb-2">
                10,000+
              </Typography>
              <Typography variant="body1" className="airbnb-text-secondary">
                Parking Spots Available
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h3" className="airbnb-text-success airbnb-font-bold airbnb-mb-2">
                50,000+
              </Typography>
              <Typography variant="body1" className="airbnb-text-secondary">
                Happy Users
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h3" className="airbnb-text-warning airbnb-font-bold airbnb-mb-2">
                100,000+
              </Typography>
              <Typography variant="body1" className="airbnb-text-secondary">
                Successful Bookings
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h3" className="airbnb-text-primary airbnb-font-bold airbnb-mb-2">
                4.8★
              </Typography>
              <Typography variant="body1" className="airbnb-text-secondary">
                Average Rating
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Container className="airbnb-container airbnb-mb-5">
        <Typography variant="h2" className="airbnb-text-center airbnb-mb-5">
          What Our Users Say
        </Typography>
        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card className="airbnb-card airbnb-card-elevated">
                <CardContent className="airbnb-p-4">
                  <Box className="airbnb-flex airbnb-items-center airbnb-mb-3">
                    <Avatar className="airbnb-mr-3" sx={{ bgcolor: '#FF385C' }}>
                      {testimonial.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" className="airbnb-font-semibold">
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" className="airbnb-text-secondary">
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>
                  <Rating value={testimonial.rating} readOnly className="airbnb-rating-stars airbnb-mb-3" />
                  <Typography variant="body2" className="airbnb-text-secondary">
                    "{testimonial.content}"
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box className="airbnb-bg-red airbnb-py-5 airbnb-mb-5">
        <Container className="airbnb-container">
          <Box className="airbnb-text-center">
            <Typography variant="h2" className="airbnb-text-inverse airbnb-mb-3">
              Ready to Start Sharing?
            </Typography>
            <Typography variant="body1" className="airbnb-text-inverse airbnb-mb-4" style={{ opacity: 0.9 }}>
              Join thousands of users who are already earning money by sharing their parking spaces
            </Typography>
            <Box className="airbnb-flex airbnb-justify-center airbnb-gap-3">
              <Button
                variant="contained"
                size="large"
                className="airbnb-btn-lg"
                sx={{
                  backgroundColor: 'white',
                  color: '#FF385C',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                }}
                startIcon={<Add />}
                onClick={() => navigate('/list')}
              >
                List Your Spot
              </Button>
              <Button
                variant="outlined"
                size="large"
                className="airbnb-btn-lg"
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
                startIcon={<SearchIcon />}
                onClick={() => navigate('/search')}
              >
                Find Parking
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Footer CTA */}
      <Container className="airbnb-container airbnb-mb-5">
        <Card className="airbnb-card airbnb-card-elevated">
          <CardContent className="airbnb-text-center airbnb-p-5">
            <Typography variant="h3" className="airbnb-mb-3">
              Get Started Today
            </Typography>
            <Typography variant="body1" className="airbnb-text-secondary airbnb-mb-4">
              Download our app or start using the web platform to find and share parking spots
            </Typography>
            <Box className="airbnb-flex airbnb-justify-center airbnb-gap-3">
              <Button
                variant="contained"
                className="airbnb-btn-primary"
                onClick={() => navigate('/register')}
              >
                Sign Up Free
              </Button>
              <Button
                variant="outlined"
                className="airbnb-btn-secondary"
                onClick={() => navigate('/login')}
              >
                Log In
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default HomePage;