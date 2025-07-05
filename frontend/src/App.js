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
import { RealtimeProvider } from './contexts/RealtimeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1E3A8A',
      light: '#2563EB',
      dark: '#1E40AF',
    },
    secondary: {
      main: '#0D9488',
      light: '#14B8A6',
      dark: '#0F766E',
    },
    background: {
      default: '#F3F4F6',
    },
  },
  typography: {
    fontFamily: 'Inter, Arial, sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
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
    <ThemeProvider theme={theme} className="app-container">
      <React.Suspense fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      }>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <CssBaseline />
          <Router>
            <Box sx={{ flexGrow: 1 }} className="app-container">
              <AppBar position="static" sx={{ backgroundColor: 'white', boxShadow: 1 }}>
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
                            sx={{ color: 'primary.main' }}
                          >
                            Home
                          </Button>
                          <Button
                            component={Link}
                            to="/login"
                            sx={{ color: 'primary.main' }}
                          >
                            Login
                          </Button>
                          <Button
                            component={Link}
                            to="/register"
                            variant="contained"
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
                            sx={{ color: 'primary.main' }}
                          >
                            Dashboard
                          </Button>
                          <Button
                            component={Link}
                            to="/search"
                            startIcon={<Search />}
                            sx={{ color: 'primary.main' }}
                          >
                            Search
                          </Button>
                          <Button
                            component={Link}
                            to="/list"
                            variant="contained"
                            startIcon={<Add />}
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

              <Container component="main" sx={{ mt: 2, pt: { xs: 8, md: 10 } }}>
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