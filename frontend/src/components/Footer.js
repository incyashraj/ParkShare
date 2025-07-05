import { Box, Container, Grid, Typography, Link, Divider, IconButton, Stack } from '@mui/material';
import { Facebook, Twitter, Instagram, LinkedIn, Language, CurrencyRupee,  } from '@mui/icons-material';

import './Footer.css';

function Footer() {
  const footerSections = {
    company: {
      title: 'Company',
      links: [
        { text: 'About Us', href: '/about' },
        { text: 'Contact', href: '/contact' },
        { text: 'Careers', href: '/careers' },
        { text: 'Blog', href: '/blog' }
      ]
    },
    support: {
      title: 'Support',
      links: [
        { text: 'Help Center', href: '/help' },
        { text: 'Safety Guidelines', href: '/safety' },
        { text: 'Terms of Service', href: '/terms' },
        { text: 'Privacy Policy', href: '/privacy' }
      ]
    },
    community: {
      title: 'Community',
      links: [
        { text: 'Host Parking Spots', href: '/host' },
        { text: 'Partner with Us', href: '/partner' },
        { text: 'Community Forum', href: '/forum' },
        { text: 'Business Program', href: '/business' }
      ]
    }
  };

  const socialLinks = [
    { Icon: Facebook, href: 'https://facebook.com' },
    { Icon: Twitter, href: 'https://twitter.com' },
    { Icon: Instagram, href: 'https://instagram.com' },
    { Icon: LinkedIn, href: 'https://linkedin.com' }
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'white',
        py: 4,
        mt: 'auto',
        borderTop: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          {Object.entries(footerSections).map(([key, section]) => (
            <Grid item xs={12} sm={6} md={4} key={key}>
              <Typography
                variant="subtitle1"
                color="text.primary"
                gutterBottom
                fontWeight="bold"
              >
                {section.title}
              </Typography>
              <Stack spacing={1}>
                {section.links.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    variant="body2"
                    color="text.secondary"
                    underline="hover"
                    sx={{ color: 'text.secondary' }}
                  >
                    {link.text}
                  </Link>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ py: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                <Typography variant="body2" color="text.secondary">
                  © {new Date().getFullYear()} ParkShare. All rights reserved.
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Language sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    English (IN)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CurrencyRupee sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    INR
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack
                direction="row"
                spacing={1}
                justifyContent={{ xs: 'center', md: 'flex-end' }}
              >
                {socialLinks.map(({ Icon, href }, index) => (
                  <IconButton
                    key={index}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    sx={{ color: 'text.secondary' }}
                  >
                    <Icon />
                  </IconButton>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            align="center"
            display="block"
          >
            ParkShare is committed to providing safe and reliable parking solutions.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;