import React from 'react';
import { Box, Container, Typography, Button, Grid } from '@mui/material';
import { Search as SearchIcon, LocationOn as LocationIcon, DirectionsCar as CarIcon } from '@mui/icons-material';
import './HeroSection.css';

function HeroSection() {
  return (
    <Box className="airbnb-hero-section">
      {/* Background with overlay */}
      <Box 
        className="airbnb-hero-background"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'linear-gradient(135deg, rgba(255, 56, 92, 0.9) 0%, rgba(0, 166, 153, 0.8) 100%)',
          zIndex: 1,
        }}
      />
      
      {/* Content */}
      <Container className="airbnb-container" sx={{ position: 'relative', zIndex: 2 }}>
        <Box className="airbnb-hero-content airbnb-text-center">
          {/* Main Heading */}
          <Typography 
            variant="h1" 
            className="airbnb-hero-title airbnb-text-inverse airbnb-mb-4"
            sx={{
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem', lg: '5rem' },
              fontWeight: 700,
              lineHeight: 1.1,
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            Find Your Perfect
            <br />
            <span style={{ color: '#FFB400' }}>Parking Spot</span>
          </Typography>

          {/* Subtitle */}
          <Typography 
            variant="h4" 
            className="airbnb-hero-subtitle airbnb-text-inverse airbnb-mb-5"
            sx={{
              fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
              fontWeight: 400,
              opacity: 0.95,
              maxWidth: '800px',
              margin: '0 auto',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
            }}
          >
            Discover thousands of parking spots across the city. 
            <br />
            Book instantly, save money, and park with confidence.
          </Typography>

          {/* Hero Stats */}
          <Grid container spacing={4} className="airbnb-hero-stats airbnb-mb-5">
            <Grid item xs={12} sm={4}>
              <Box className="airbnb-text-center">
                <Typography 
                  variant="h3" 
                  className="airbnb-text-inverse airbnb-font-bold"
                  sx={{ fontSize: { xs: '2rem', sm: '2.5rem' } }}
                >
                  10,000+
                </Typography>
                <Typography 
                  variant="body1" 
                  className="airbnb-text-inverse"
                  sx={{ opacity: 0.9, fontSize: { xs: '0.9rem', sm: '1rem' } }}
                >
                  Parking Spots
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box className="airbnb-text-center">
                <Typography 
                  variant="h3" 
                  className="airbnb-text-inverse airbnb-font-bold"
                  sx={{ fontSize: { xs: '2rem', sm: '2.5rem' } }}
                >
                  50,000+
                </Typography>
                <Typography 
                  variant="body1" 
                  className="airbnb-text-inverse"
                  sx={{ opacity: 0.9, fontSize: { xs: '0.9rem', sm: '1rem' } }}
                >
                  Happy Users
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box className="airbnb-text-center">
                <Typography 
                  variant="h3" 
                  className="airbnb-text-inverse airbnb-font-bold"
                  sx={{ fontSize: { xs: '2rem', sm: '2.5rem' } }}
                >
                  4.8★
                </Typography>
                <Typography 
                  variant="body1" 
                  className="airbnb-text-inverse"
                  sx={{ opacity: 0.9, fontSize: { xs: '0.9rem', sm: '1rem' } }}
                >
                  Average Rating
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* CTA Buttons */}
          <Box className="airbnb-hero-cta airbnb-flex airbnb-justify-center airbnb-gap-3">
            <Button
              variant="contained"
              size="large"
              className="airbnb-btn-primary airbnb-btn-lg"
              startIcon={<SearchIcon />}
              sx={{
                backgroundColor: 'white',
                color: '#FF385C',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Find Parking
            </Button>
            <Button
              variant="outlined"
              size="large"
              className="airbnb-btn-lg"
              startIcon={<CarIcon />}
              sx={{
                borderColor: 'white',
                color: 'white',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              List Your Spot
            </Button>
          </Box>

          {/* Trust Indicators */}
          <Box className="airbnb-hero-trust airbnb-mt-5">
            <Typography 
              variant="body2" 
              className="airbnb-text-inverse"
              sx={{ 
                opacity: 0.8, 
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              <LocationIcon sx={{ fontSize: 16 }} />
              Trusted by drivers in 50+ cities worldwide
            </Typography>
          </Box>
        </Box>
      </Container>

      {/* Decorative Elements */}
      <Box 
        className="airbnb-hero-decoration"
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '100px',
          background: 'linear-gradient(to top, rgba(255, 255, 255, 0.1) 0%, transparent 100%)',
          zIndex: 1,
        }}
      />
    </Box>
  );
}

export default HeroSection;