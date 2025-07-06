import { Box, Container, Grid, Typography, Link, Divider, IconButton, Stack, Button, Chip } from '@mui/material';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  LinkedIn, 
  Language, 
  CurrencyRupee, 
  LocalParking,
  Security,
  Support,
  Email,
  Phone,
  LocationOn,
  ArrowUpward
} from '@mui/icons-material';

import './Footer.css';

function Footer() {
  const footerSections = {
    product: {
      title: 'Product',
      links: [
        { text: 'How it Works', href: '/how-it-works' },
        { text: 'Safety & Security', href: '/safety' },
        { text: 'Host Guidelines', href: '/host-guidelines' },
        { text: 'Pricing', href: '/pricing' }
      ]
    },
    support: {
      title: 'Support',
      links: [
        { text: 'Help Center', href: '/help' },
        { text: 'Contact Us', href: '/contact' },
        { text: 'Safety Guidelines', href: '/safety-guidelines' },
        { text: 'Report Issue', href: '/report' }
      ]
    },
    legal: {
      title: 'Legal',
      links: [
        { text: 'Terms of Service', href: '/terms' },
        { text: 'Privacy Policy', href: '/privacy' },
        { text: 'Cookie Policy', href: '/cookies' },
        { text: 'GDPR', href: '/gdpr' }
      ]
    },
    company: {
      title: 'Company',
      links: [
        { text: 'About ParkShare', href: '/about' },
        { text: 'Careers', href: '/careers' },
        { text: 'Press', href: '/press' },
        { text: 'Blog', href: '/blog' }
      ]
    }
  };

  const socialLinks = [
    { Icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { Icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { Icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { Icon: LinkedIn, href: 'https://linkedin.com', label: 'LinkedIn' }
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#f8fafc',
        py: 6,
        mt: 'auto',
        borderTop: '1px solid',
        borderColor: 'divider',
        position: 'relative'
      }}
    >
      <Container maxWidth="lg">
        {/* Main Footer Content */}
        <Grid container spacing={4}>
          {/* Company Info Section */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h5"
                color="primary.main"
                fontWeight={700}
                gutterBottom
                sx={{ mb: 2 }}
              >
                ParkShare
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3, lineHeight: 1.6 }}
              >
                The smart way to find and share parking spaces. Connect with trusted hosts and park with confidence.
              </Typography>
              
              {/* Trust Indicators */}
              <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                <Chip 
                  icon={<Security />} 
                  label="Secure" 
                  size="small" 
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
                <Chip 
                  icon={<Support />} 
                  label="24/7 Support" 
                  size="small" 
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
                <Chip 
                  icon={<LocalParking />} 
                  label="Verified" 
                  size="small" 
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              </Stack>

              {/* Contact Info */}
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    support@parkshare.com
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    +91 1800-PARKSHARE
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Mumbai, Maharashtra, India
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Grid>

          {/* Footer Links Sections */}
          {Object.entries(footerSections).map(([key, section]) => (
            <Grid item xs={12} sm={6} md={2} key={key}>
              <Typography
                variant="subtitle1"
                color="text.primary"
                gutterBottom
                fontWeight={600}
                sx={{ mb: 2 }}
              >
                {section.title}
              </Typography>
              <Stack spacing={1.5}>
                {section.links.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    variant="body2"
                    color="text.secondary"
                    underline="hover"
                    sx={{ 
                      color: 'text.secondary',
                      transition: 'color 0.2s ease-in-out',
                      '&:hover': {
                        color: 'primary.main',
                      }
                    }}
                  >
                    {link.text}
                  </Link>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Bottom Section */}
        <Box sx={{ py: 2 }}>
          <Grid container spacing={3} alignItems="center">
            {/* Copyright and Language/Currency */}
            <Grid item xs={12} md={6}>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={{ xs: 1, sm: 2 }} 
                alignItems={{ xs: 'center', sm: 'flex-start' }}
                flexWrap="wrap"
              >
                <Typography variant="body2" color="text.secondary">
                  © {new Date().getFullYear()} ParkShare. All rights reserved.
                </Typography>
                
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button
                    startIcon={<Language />}
                    size="small"
                    sx={{ 
                      color: 'text.secondary',
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.04)',
                      }
                    }}
                  >
                    English (IN)
                  </Button>
                  <Button
                    startIcon={<CurrencyRupee />}
                    size="small"
                    sx={{ 
                      color: 'text.secondary',
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.04)',
                      }
                    }}
                  >
                    INR
                  </Button>
                </Stack>
              </Stack>
            </Grid>

            {/* Social Links and Back to Top */}
            <Grid item xs={12} md={6}>
              <Stack
                direction="row"
                spacing={2}
                justifyContent={{ xs: 'center', md: 'flex-end' }}
                alignItems="center"
              >
                {/* Social Links */}
                <Stack direction="row" spacing={1}>
                  {socialLinks.map(({ Icon, href, label }, index) => (
                    <IconButton
                      key={index}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="small"
                      aria-label={label}
                      sx={{ 
                        color: 'text.secondary',
                        backgroundColor: 'rgba(0,0,0,0.04)',
                        '&:hover': {
                          backgroundColor: 'primary.main',
                          color: 'white',
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      <Icon fontSize="small" />
                    </IconButton>
                  ))}
                </Stack>

                {/* Back to Top Button */}
                <Button
                  onClick={scrollToTop}
                  startIcon={<ArrowUpward />}
                  size="small"
                  sx={{ 
                    color: 'text.secondary',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.04)',
                    }
                  }}
                >
                  Back to top
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {/* Trust Message */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ 
              display: 'block',
              maxWidth: 600,
              mx: 'auto',
              lineHeight: 1.5
            }}
          >
            ParkShare is committed to providing safe, reliable, and convenient parking solutions. 
            Every transaction is protected by our secure payment system and comprehensive insurance coverage.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;