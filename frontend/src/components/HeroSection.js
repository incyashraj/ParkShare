import { Box, Container, Typography, Button, Grid, Paper, useTheme, alpha, Fade, Slide, Grow } from '@mui/material';
import { LocalParking, Security, Assessment, Timer, TrendingUp, Star } from '@mui/icons-material';
import { Link } from 'react-router-dom';

import '../styles/animations.css';
import './HeroSection.css';

const FeatureCard = ({ icon: Icon, title, description, index }) => {
  const gradients = [
    'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
    'linear-gradient(135deg, #34D399 0%, #059669 100%)',
    'linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)',
    'linear-gradient(135deg, #F472B6 0%, #DB2777 100%)'
  ];

  return (
    <Grow in timeout={800 + index * 200}>
  <Paper
    elevation={0}
    className={`glass-effect animate-fadeInUp card-hover delay-${index + 2} feature-card`}
    sx={{
      p: 3,
      height: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(10px)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      position: 'relative',
      overflow: 'hidden',
          cursor: 'pointer',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '4px',
        background: gradients[index],
            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: 'translateX(-100%)',
      },
      '&:hover::before': {
        transform: 'translateX(0)',
      },
      '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
        backgroundColor: 'rgba(255, 255, 255, 1)',
            boxShadow: (theme) => `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
      },
    }}
  >
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
              width: 70,
              height: 70,
              borderRadius: '16px',
          background: gradients[index],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
              mb: 3,
          transform: 'rotate(-10deg)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: -2,
                left: -2,
                right: -2,
                bottom: -2,
                borderRadius: '18px',
                background: gradients[index],
                opacity: 0.3,
                zIndex: -1,
                transition: 'all 0.4s ease',
              },
          '&:hover': {
            transform: 'rotate(0deg) scale(1.1)',
                boxShadow: '0 0 30px rgba(0,0,0,0.2)',
                '&::after': {
                  transform: 'scale(1.2)',
                  opacity: 0.1,
                }
          }
        }}
      >
        <Icon 
          sx={{ 
                fontSize: 35,
            color: 'white',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
          }} 
        />
      </Box>
          <Typography 
            variant="h6" 
            gutterBottom 
            fontWeight="bold"
            sx={{
              background: 'linear-gradient(45deg, #1E3A8A, #3B82F6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '1.25rem',
            }}
          >
        {title}
      </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              lineHeight: 1.6,
              flex: 1,
            }}
          >
        {description}
      </Typography>
    </Box>
  </Paper>
    </Grow>
  );
};

function HeroSection() {
  const theme = useTheme();

  const features = [
    {
      icon: LocalParking,
      title: 'Premium Parking',
      description: 'Access exclusive parking spots in prime locations with guaranteed availability and premium amenities.'
    },
    {
      icon: Security,
      title: 'Secure & Safe',
      description: 'Advanced security features with 24/7 monitoring, secure payment processing, and verified hosts.'
    },
    {
      icon: Assessment,
      title: 'Smart Analytics',
      description: 'Real-time availability updates, dynamic pricing based on demand, and intelligent recommendations.'
    },
    {
      icon: Timer,
      title: 'Instant Booking',
      description: 'Quick and hassle-free booking process with immediate confirmation and instant access.'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Happy Users', icon: Star },
    { number: '5K+', label: 'Parking Spots', icon: LocalParking },
    { number: '99%', label: 'Satisfaction', icon: TrendingUp },
  ];

  return (
    <Box className="hero-container">
      <Box 
        className="hero-section"
        sx={{
          position: 'relative',
          color: 'white',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          background: 'transparent',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.light, 0.15)} 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, ${alpha(theme.palette.primary.light, 0.15)} 0%, transparent 50%),
              radial-gradient(circle at 60% 30%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 40%),
              radial-gradient(circle at 30% 70%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 40%)
            `,
            zIndex: 1,
          }
        }}
      >
        {/* Enhanced animated background elements */}
        <Box className="animated-bg" />
        {/* Fewer glowing dots for clarity */}
        <Box className="glowing-dots">
          {[...Array(15)].map((_, i) => (
            <Box
              key={i}
              className="glowing-dot"
              sx={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `pulseGlow ${3 + Math.random() * 3}s infinite ease-in-out`,
                animationDelay: `${Math.random() * 3}s`,
                width: `${Math.random() * 6 + 4}px`,
                height: `${Math.random() * 6 + 4}px`,
              }}
            />
          ))}
        </Box>
        {/* Fewer floating particles for clarity */}
        <Box className="particles">
          {[...Array(10)].map((_, i) => (
            <Box
              key={i}
              className="particle"
              sx={{
                position: 'absolute',
                width: Math.random() * 12 + 6,
                height: Math.random() * 12 + 6,
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '50%',
                animation: `float ${Math.random() * 4 + 3}s infinite ease-in-out`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                filter: 'blur(0.5px)',
              }}
            />
          ))}
        </Box>
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 3 }}>
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box className="hero-content" sx={{
                background: 'rgba(30, 58, 138, 0.7)',
                borderRadius: 4,
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                p: { xs: 3, md: 6 },
                mb: { xs: 4, md: 0 },
                mt: { xs: 6, md: 0 },
                maxWidth: { xs: '100%', md: 520 },
                minHeight: { xs: 'auto', md: '600px' },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}>
                {/* Tagline */}
                <Typography
                  variant="overline"
                  sx={{
                    color: '#FBBF24',
                    fontWeight: 800,
                    fontSize: { xs: '1rem', md: '1.2rem' },
                    letterSpacing: 2,
                    mb: 1,
                    display: 'block',
                  }}
                >
                  Park Smarter. Save Time. Stress Less.
                </Typography>
                <Fade in timeout={1000}>
                  <Typography
                    variant="h1"
                    className="animate-fadeInLeft"
                    sx={{
                      fontSize: { xs: '2.2rem', md: '3.5rem' },
                      fontWeight: 900,
                      mb: 2,
                    background: 'linear-gradient(45deg, #FFFFFF 30%, #E3F2FD 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                      letterSpacing: '-0.03em',
                      lineHeight: 1.1,
                      textShadow: '0 4px 8px rgba(0,0,0,0.12)',
                  }}
                >
                  Premium Parking Solutions
                </Typography>
                </Fade>
                <Slide direction="up" in timeout={1200}>
                <Typography
                  variant="h5"
                  className="animate-fadeInLeft delay-1"
                  sx={{
                    mb: 4,
                      color: '#F3F4F6',
                      lineHeight: 1.7,
                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                      fontWeight: 400,
                      textShadow: '0 2px 8px rgba(30,58,138,0.12)',
                  }}
                >
                    Find, book, and park with confidence. Discover premium spots, real-time availability, and instant booking—all in one place.
                </Typography>
                </Slide>
                <Slide direction="up" in timeout={1400}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }} className="animate-fadeInUp delay-2">
                  <Button
                    variant="contained"
                    size="large"
                    className="hover-scale"
                    component={Link}
                    to="/search"
                    sx={{
                        bgcolor: '#FBBF24',
                        color: '#1E3A8A',
                        px: 6,
                        py: 2.2,
                        borderRadius: '50px',
                        fontWeight: 800,
                        fontSize: '1.2rem',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 8px 25px rgba(251,191,36,0.15)',
                        '&:hover': {
                          bgcolor: '#F59E0B',
                          color: 'white',
                          transform: 'translateY(-3px) scale(1.07)',
                          boxShadow: '0 15px 35px rgba(251,191,36,0.22)',
                        },
                      }}
                    >
                      Find Parking Now
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      className="hover-scale"
                      sx={{
                        borderColor: '#FBBF24',
                        color: '#FBBF24',
                        borderWidth: 3,
                        px: 5,
                        py: 2,
                        borderRadius: '50px',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                          borderColor: '#F59E0B',
                          color: '#F59E0B',
                          bgcolor: 'rgba(251,191,36,0.08)',
                          transform: 'translateY(-3px) scale(1.05)',
                          boxShadow: '0 15px 35px rgba(251,191,36,0.12)',
                        },
                      }}
                    >
                      Learn More
                    </Button>
                  </Box>
                </Slide>
                {/* Stats Section */}
                <Slide direction="up" in timeout={1600}>
                  <Box sx={{ mt: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {stats.map((stat, index) => (
                      <Box key={index} sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <stat.icon sx={{ fontSize: 20, color: alpha('#fff', 0.8) }} />
                          <Typography variant="h4" sx={{ fontWeight: 800, color: 'white' }}>
                            {stat.number}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: alpha('#fff', 0.7), fontWeight: 500 }}>
                          {stat.label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Slide>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Fade in timeout={1500}>
                <Box className="hero-image animate-fadeInRight delay-1">
                  <Box
                    sx={{
                      position: 'relative',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(45deg, #1E3A8A, #2563EB, #3B82F6)',
                        zIndex: 1,
                      }
                    }}
                  >
                <img 
                  src="https://placehold.co/600x400/1E3A8A/FFFFFF?text=Smart+Parking" 
                  alt="Premium Parking"
                  className="animate-float"
                  style={{ 
                    maxWidth: '100%',
                    height: 'auto',
                    filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.2))',
                        borderRadius: '20px',
                        position: 'relative',
                        zIndex: 2,
                  }}
                />
              </Box>
                </Box>
              </Fade>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Enhanced Features Section */}
      <Container maxWidth="lg" sx={{ mt: 8, position: 'relative', zIndex: 3, pb: 10 }}>
        <Box sx={{ 
          textAlign: 'center', 
          mb: 6,
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 3,
          p: 4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}>
          <Fade in timeout={1800}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800, 
                color: '#1E3A8A',
                mb: 2,
                background: 'linear-gradient(45deg, #1E3A8A, #3B82F6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Why Choose ParkShare?
            </Typography>
          </Fade>
          <Fade in timeout={2000}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'text.secondary',
                maxWidth: 600,
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              Experience the future of parking with our innovative platform
            </Typography>
          </Fade>
        </Box>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <FeatureCard {...feature} index={index} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default HeroSection;