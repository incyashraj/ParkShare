import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Avatar,
  Card,
  CardContent,
  Rating,
  useTheme,
  alpha
} from '@mui/material';
import { FormatQuote } from '@mui/icons-material';

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Regular Parker",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    rating: 5,
    text: "ParkShare has completely transformed how I park in the city. The premium spots are always clean and secure."
  },
  {
    name: "David Chen",
    role: "Business Owner",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    rating: 5,
    text: "As a business owner, providing convenient parking for my customers through ParkShare has boosted my business."
  },
  {
    name: "Emily Rodriguez",
    role: "Event Organizer",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    rating: 5,
    text: "The group booking feature is fantastic for events. It's made parking management so much easier."
  }
];

const partners = [
  { name: 'Tesla', logo: 'https://placehold.co/200x100/ffffff/000000?text=TESLA' },
  { name: 'BMW', logo: 'https://placehold.co/200x100/ffffff/000000?text=BMW' },
  { name: 'Mercedes', logo: 'https://placehold.co/200x100/ffffff/000000?text=MERCEDES' },
  { name: 'Hilton', logo: 'https://placehold.co/200x100/ffffff/000000?text=HILTON' },
  { name: 'Marriott', logo: 'https://placehold.co/200x100/ffffff/000000?text=MARRIOTT' }
];

function TestimonialsSection() {
  const theme = useTheme();

  return (
    <Box sx={{ py: 10, bgcolor: '#F8FAFC' }}>
      <Container maxWidth="lg">
        {/* Testimonials */}
        <Box sx={{ mb: 10 }}>
          <Typography
            variant="h2"
            align="center"
            gutterBottom
            sx={{
              fontWeight: 700,
              mb: 6,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            What Our Users Say
          </Typography>
          
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-10px)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ position: 'absolute', top: 20, right: 20, opacity: 0.1 }}>
                      <FormatQuote sx={{ fontSize: 60 }} />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar
                        src={testimonial.image}
                        sx={{ width: 60, height: 60, mr: 2 }}
                      />
                      <Box>
                        <Typography variant="h6">
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Box>
                    <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      "{testimonial.text}"
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Partners Section */}
        <Box>
          <Typography
            variant="h6"
            align="center"
            sx={{ 
              mb: 4, 
              color: 'text.secondary',
              fontWeight: 'medium',
              textTransform: 'uppercase',
              letterSpacing: 1
            }}
          >
            Trusted by Leading Brands
          </Typography>
          <Grid
            container
            spacing={4}
            alignItems="center"
            justifyContent="center"
            sx={{
              opacity: 0.7,
              filter: 'grayscale(100%)',
              transition: 'all 0.5s ease',
              py: 4,
              '&:hover': {
                opacity: 1,
                filter: 'grayscale(0%)',
              },
            }}
          >
            {partners.map((partner, index) => (
              <Grid item xs={6} sm={4} md={2} key={index}>
                <Box
                  component="img"
                  src={partner.logo}
                  alt={partner.name}
                  sx={{
                    width: '100%',
                    height: 'auto',
                    maxWidth: 120,
                    mx: 'auto',
                    display: 'block',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

export default TestimonialsSection;
