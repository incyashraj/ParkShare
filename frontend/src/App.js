import React, { useState, useCallback } from 'react';
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
  Badge,
} from '@mui/material';
import Login from './Login';
import Register from './Register';
import HomePage from './HomePage';
import ParkingSpotList from './ParkingSpotList';
import ParkingSpotForm from './ParkingSpotForm';
import Profile from './components/Profile';
import BookingManagement from './components/BookingManagement';
import Settings from './components/Settings';
import NotificationCenter from './components/NotificationCenter';
import AdvancedSearch from './components/AdvancedSearch';
import ReviewsAndRatings from './components/ReviewsAndRatings';
import FavoritesManager from './components/FavoritesManager';
import ParkingAnalytics from './components/ParkingAnalytics';
import Dashboard from './components/Dashboard';
import { RealtimeProvider } from './contexts/RealtimeContext';
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

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = useCallback(() => {
    setIsLoggedIn(true);
  }, []);

  return (
    <RealtimeProvider>
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
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Button
                        component={Link}
                        to="/"
                        sx={{ color: 'primary.main' }}
                      >
                        Home
                      </Button>
                      {!isLoggedIn && (
                        <>
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
                      {isLoggedIn && (
                        <>
                          <Button
                            component={Link}
                            to="/"
                            sx={{ color: 'primary.main' }}
                          >
                            Dashboard
                          </Button>
                          <Button
                            component={Link}
                            to="/search"
                            sx={{ color: 'primary.main' }}
                          >
                            Search
                          </Button>
                          <Button
                            component={Link}
                            to="/advanced-search"
                            sx={{ color: 'primary.main' }}
                          >
                            Advanced
                          </Button>
                          <Button
                            component={Link}
                            to="/list"
                            variant="contained"
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
                            sx={{ color: 'primary.main' }}
                          >
                            Bookings
                          </Button>
                          <Button
                            component={Link}
                            to="/favorites"
                            sx={{ color: 'primary.main' }}
                          >
                            Favorites
                          </Button>
                          <Button
                            component={Link}
                            to="/analytics"
                            sx={{ color: 'primary.main' }}
                          >
                            Analytics
                          </Button>
                          <Button
                            component={Link}
                            to="/profile"
                            sx={{ color: 'primary.main' }}
                          >
                            Profile
                          </Button>
                          <Button
                            component={Link}
                            to="/settings"
                            sx={{ color: 'primary.main' }}
                          >
                            Settings
                          </Button>
                          <NotificationCenter />
                        </>
                      )}
                    </Box>
                  </Toolbar>
                </Container>
              </AppBar>

            <Container component="main" sx={{ mt: 4 }}>
              <Routes>
                <Route
                  path="/"
                  element={
                    isLoggedIn ? (
                      <HomePage />
                    ) : (
                      <Box sx={{ textAlign: 'center', mt: 8 }}>
                        <Typography variant="h2" color="primary.main" gutterBottom>
                          ParkShare
                        </Typography>
                        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
                          Find and book parking spots near you
                        </Typography>
                        <Login onLogin={handleLogin} />
                      </Box>
                    )
                  }
                />
                <Route path="/search" element={<ParkingSpotList />} />
                <Route path="/advanced-search" element={<AdvancedSearch />} />
                <Route path="/list" element={<ParkingSpotForm />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/bookings" element={<BookingManagement />} />
                <Route path="/favorites" element={<FavoritesManager />} />
                <Route path="/analytics" element={<ParkingAnalytics />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/reviews/:spotId" element={<ReviewsAndRatings />} />
                <Route path="/dashboard" element={<Dashboard />} />
              </Routes>
            </Container>
            <Footer />
          </Box>
        </Router>
      </LocalizationProvider>
      </React.Suspense>
    </ThemeProvider>
    </RealtimeProvider>
  );
}

export default App;
