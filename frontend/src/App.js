import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Footer from './components/Footer';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  CssBaseline,
  CircularProgress,
  Menu,
  MenuItem,
  IconButton,
  Avatar,
  Divider,
} from '@mui/material';
import {
  AccountCircle,
  Dashboard as DashboardIcon,
  Search,
  Add,
  BookOnline,
  Favorite,
  Analytics,
  Settings as SettingsIcon,
  MoreVert,
  VerifiedUser,
} from '@mui/icons-material';
import Login from './Login';
import Register from './Register';
import HomePage from './HomePage';
import ParkingSpotList from './ParkingSpotList';
import ParkingSpotForm from './ParkingSpotForm';
import ParkingSpotDetail from './components/ParkingSpotDetail';
import HostVerification from './components/HostVerification';
import Profile from './components/Profile';
import BookingManagement from './components/BookingManagement';
import Settings from './components/Settings';
import NotificationCenter from './components/NotificationCenter';
import AdvancedSearch from './components/AdvancedSearch';
import ReviewsAndRatings from './components/ReviewsAndRatings';
import FavoritesManager from './components/FavoritesManager';
import ParkingAnalytics from './components/ParkingAnalytics';
import Dashboard from './components/Dashboard';
import TestBooking from './TestBooking';
import DesignSystemDemo from './components/DesignSystemDemo';
import { RealtimeProvider } from './contexts/RealtimeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';
import './styles/global.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FF385C', // Airbnb Red
      light: '#FF5A5F',
      dark: '#E31C5F',
    },
    secondary: {
      main: '#00A699', // Airbnb Success Green
      light: '#00D1C1',
      dark: '#008489',
    },
    error: {
      main: '#FF5A5F', // Airbnb Error Red
      light: '#FF8A8F',
      dark: '#E31C5F',
    },
    warning: {
      main: '#FFB400', // Airbnb Warning Yellow
      light: '#FFC233',
      dark: '#E6A200',
    },
    info: {
      main: '#007A87', // Airbnb Info Blue
      light: '#0099A8',
      dark: '#005F6B',
    },
    success: {
      main: '#00A699', // Airbnb Success Green
      light: '#00D1C1',
      dark: '#008489',
    },
    background: {
      default: '#FFFFFF', // Airbnb White
      paper: '#FFFFFF',
    },
    text: {
      primary: '#222222', // Airbnb Black
      secondary: '#717171', // Airbnb Gray Dark
    },
    divider: '#DDDDDD', // Airbnb Gray
  },
  typography: {
    fontFamily: '"Circular", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontWeight: 600,
      fontSize: '40px',
      lineHeight: 1.2,
      color: '#222222',
    },
    h2: {
      fontWeight: 600,
      fontSize: '34px',
      lineHeight: 1.2,
      color: '#222222',
    },
    h3: {
      fontWeight: 600,
      fontSize: '30px',
      lineHeight: 1.2,
      color: '#222222',
    },
    h4: {
      fontWeight: 600,
      fontSize: '26px',
      lineHeight: 1.2,
      color: '#222222',
    },
    h5: {
      fontWeight: 500,
      fontSize: '22px',
      lineHeight: 1.2,
      color: '#222222',
    },
    h6: {
      fontWeight: 500,
      fontSize: '20px',
      lineHeight: 1.2,
      color: '#222222',
    },
    body1: {
      fontSize: '16px',
      lineHeight: 1.4,
      color: '#222222',
    },
    body2: {
      fontSize: '14px',
      lineHeight: 1.4,
      color: '#717171',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      fontSize: '16px',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 20px',
          fontWeight: 500,
          textTransform: 'none',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.2s ease',
          border: '1px solid transparent',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
          },
          '&:active': {
            transform: 'translateY(0)',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
          },
        },
        contained: {
          background: '#FF385C',
          '&:hover': {
            background: '#E31C5F',
          },
        },
        outlined: {
          borderColor: '#DDDDDD',
          backgroundColor: '#FFFFFF',
          '&:hover': {
            borderColor: '#FF385C',
            backgroundColor: 'rgba(255, 56, 92, 0.05)',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: '1px solid #DDDDDD',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.2s ease',
          backgroundColor: '#FFFFFF',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: '1px solid #DDDDDD',
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#FFFFFF',
            border: '1px solid #DDDDDD',
            transition: 'all 0.15s ease',
            '&:hover': {
              borderColor: '#B0B0B0',
            },
            '&.Mui-focused': {
              borderColor: '#FF385C',
              boxShadow: '0 0 0 2px rgba(255, 56, 92, 0.1)',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#717171',
            '&.Mui-focused': {
              color: '#FF385C',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontWeight: 500,
          fontSize: '14px',
          height: '24px',
        },
        outlined: {
          borderColor: '#DDDDDD',
          backgroundColor: '#FFFFFF',
          '&:hover': {
            borderColor: '#FF385C',
            backgroundColor: 'rgba(255, 56, 92, 0.05)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid #DDDDDD',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 24,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          border: '1px solid #DDDDDD',
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          '& .MuiAlert-root': {
            borderRadius: 12,
            fontWeight: 500,
            fontSize: '16px',
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          border: '1px solid #DDDDDD',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '16px',
          padding: '12px 16px',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'all 0.15s ease',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FF385C',
        },
      },
    },
  },
});

function AppContent() {
  const { currentUser } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  console.log('AppContent rendered, currentUser:', currentUser);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <ThemeProvider theme={theme} className="airbnb-app-container">
      <React.Suspense fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      }>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <CssBaseline />
          <Router>
            <Box sx={{ flexGrow: 1 }} className="airbnb-app-container">
              <AppBar position="static" className="airbnb-app-header">
                <Container maxWidth="xl">
                  <Toolbar disableGutters>
                    <Typography
                      variant="h6"
                      component={Link}
                      to="/"
                      sx={{
                        color: 'primary.main',
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        flexGrow: 1,
                        fontSize: '24px',
                      }}
                    >
                      ParkShare
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      {!currentUser && (
                        <>
                          <Button
                            component={Link}
                            to="/"
                            className="airbnb-nav-link"
                            sx={{ color: 'primary.main' }}
                          >
                            Home
                          </Button>
                          <Button
                            component={Link}
                            to="/login"
                            className="airbnb-nav-link"
                            sx={{ color: 'primary.main' }}
                          >
                            Login
                          </Button>
                          <Button
                            component={Link}
                            to="/register"
                            variant="contained"
                            className="airbnb-btn-primary"
                            sx={{
                              color: 'white',
                              '&:hover': {
                                backgroundColor: 'primary.dark',
                              },
                            }}
                          >
                            Register
                          </Button>
                        </>
                      )}
                      {currentUser && (
                        <>
                          {/* Primary Navigation */}
                          <Button
                            component={Link}
                            to="/"
                            startIcon={<DashboardIcon />}
                            className="airbnb-nav-link"
                            sx={{ color: 'primary.main' }}
                          >
                            Dashboard
                          </Button>
                          <Button
                            component={Link}
                            to="/search"
                            startIcon={<Search />}
                            className="airbnb-nav-link"
                            sx={{ color: 'primary.main' }}
                          >
                            Search
                          </Button>
                          <Button
                            component={Link}
                            to="/list"
                            variant="contained"
                            startIcon={<Add />}
                            className="airbnb-btn-primary"
                            sx={{
                              color: 'white',
                              '&:hover': {
                                backgroundColor: 'primary.dark',
                              },
                            }}
                          >
                            List Spot
                          </Button>
                          <Button
                            component={Link}
                            to="/bookings"
                            startIcon={<BookOnline />}
                            className="airbnb-nav-link"
                            sx={{ color: 'primary.main' }}
                          >
                            Bookings
                          </Button>
                          
                          {/* Notification Center */}
                          <NotificationCenter />
                          
                          {/* More Options Menu */}
                          <IconButton
                            onClick={handleMenuClick}
                            sx={{ color: 'primary.main' }}
                          >
                            <MoreVert />
                          </IconButton>
                          
                          {/* User Avatar */}
                          <IconButton
                            component={Link}
                            to="/profile"
                            sx={{ color: 'primary.main' }}
                          >
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                              <AccountCircle />
                            </Avatar>
                          </IconButton>
                          
                          {/* More Options Dropdown */}
                          <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            PaperProps={{
                              sx: {
                                mt: 1,
                                minWidth: 200,
                                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                                borderRadius: 2,
                              }
                            }}
                          >
                            <MenuItem 
                              component={Link} 
                              to="/advanced-search"
                              onClick={handleMenuClose}
                            >
                              <Search sx={{ mr: 2 }} />
                              Advanced Search
                            </MenuItem>
                            <MenuItem 
                              component={Link} 
                              to="/favorites"
                              onClick={handleMenuClose}
                            >
                              <Favorite sx={{ mr: 2 }} />
                              Favorites
                            </MenuItem>
                            <MenuItem 
                              component={Link} 
                              to="/analytics"
                              onClick={handleMenuClose}
                            >
                              <Analytics sx={{ mr: 2 }} />
                              Analytics
                            </MenuItem>
                            <MenuItem 
                              component={Link} 
                              to="/verify"
                              onClick={handleMenuClose}
                            >
                              <VerifiedUser sx={{ mr: 2 }} />
                              Verify Host
                            </MenuItem>
                            <Divider />
                            <MenuItem 
                              component={Link} 
                              to="/settings"
                              onClick={handleMenuClose}
                            >
                              <SettingsIcon sx={{ mr: 2 }} />
                              Settings
                            </MenuItem>
                          </Menu>
                        </>
                      )}
                    </Box>
                  </Toolbar>
                </Container>
              </AppBar>

              <Container component="main" className="airbnb-main-content" sx={{ mt: 2, pt: { xs: 8, md: 10 } }}>
                <Routes>
                  <Route
                    path="/"
                    element={
                      currentUser ? (
                        <Dashboard />
                      ) : (
                        <HomePage />
                      )
                    }
                  />
                  <Route path="/search" element={<ParkingSpotList />} />
                  <Route path="/advanced-search" element={<AdvancedSearch />} />
                  <Route path="/list" element={<ParkingSpotForm />} />
                  <Route path="/spot/:spotId" element={<ParkingSpotDetail />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/bookings" element={<BookingManagement />} />
                  <Route path="/verify" element={<HostVerification />} />
                  <Route path="/favorites" element={<FavoritesManager />} />
                  <Route path="/analytics" element={<ParkingAnalytics />} />
                  <Route path="/test-booking" element={<TestBooking />} />
                  <Route path="/design-demo" element={<DesignSystemDemo />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Routes>
              </Container>
              <Footer />
            </Box>
          </Router>
        </LocalizationProvider>
      </React.Suspense>
    </ThemeProvider>
  );
}

function App() {
  // Add error boundary
  React.useEffect(() => {
    const handleError = (error) => {
      console.error('Runtime error caught:', error);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  return (
    <RealtimeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </RealtimeProvider>
  );
}

export default App; 