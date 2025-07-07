import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Divider,
  Link,
  Alert,
  Snackbar,
  IconButton,
  InputAdornment,
  CircularProgress,
  // Removed unused imports: Modal, Backdrop, Fade, Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Email,
  Lock,
  Person,
  Visibility,
  VisibilityOff,
  // Removed unused CloseIcon
  Google as GoogleIcon,
  Apple as AppleIcon,
  LocalParking as ParkingIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Support as SupportIcon
} from '@mui/icons-material';
import { auth } from './firebase';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile, fetchSignInMethodsForEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from './apiConfig';
import { useAuth } from './contexts/AuthContext';

// Styled Components
const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  background: '#fff',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: 450,
  width: '100%',
  borderRadius: 18,
  boxShadow: '0 4px 24px rgba(34,34,34,0.10)',
  background: '#fff',
  border: '1px solid #f2f2f2',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    '&:hover fieldset': {
      borderColor: '#FF385C',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#FF385C',
    },
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '1rem',
  padding: theme.spacing(1.5),
  '&.MuiButton-contained': {
    backgroundColor: '#FF385C',
    '&:hover': {
      backgroundColor: '#E31C5F',
    },
  },
  '&.MuiButton-outlined': {
    borderColor: '#FF385C',
    color: '#FF385C',
    '&:hover': {
      borderColor: '#E31C5F',
      backgroundColor: 'rgba(255, 56, 92, 0.04)',
    },
  },
}));

const InfoSection = styled(Box)(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.up('md')]: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: theme.spacing(4),
    maxWidth: 400,
    marginLeft: theme.spacing(4),
  },
}));

const FeatureCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: 12,
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
}));

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailProvider, setEmailProvider] = useState(null);
  
  const navigate = useNavigate();
  const { requestLocation, locationError } = useAuth();

  // Check email provider when email changes
  React.useEffect(() => {
    const checkProvider = async () => {
      if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        try {
          const methods = await fetchSignInMethodsForEmail(auth, email);
          if (methods.includes('google.com') && methods.includes('password')) {
            setEmailProvider('both');
          } else if (methods.includes('google.com')) {
            setEmailProvider('google');
          } else if (methods.includes('password')) {
            setEmailProvider('password');
          } else {
            setEmailProvider(null);
          }
        } catch (error) {
          console.log('Error checking email provider:', error);
          setEmailProvider(null);
        }
      } else {
        setEmailProvider(null);
      }
    };

    const timeoutId = setTimeout(checkProvider, 500);
    return () => clearTimeout(timeoutId);
  }, [email]);

  const validateForm = () => {
    if (!username.trim()) {
      setError('Username is required');
      return false;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (emailProvider === 'password') {
      setError('An account with this email already exists. Please sign in instead.');
      return false;
    }
    return true;
  };

  const registerToBackend = async (uid, username, email) => {
    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username, 
          email, 
          password: '', // We don't store passwords in our backend
          uid 
        }),
      });
      
      if (response.ok) {
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Backend registration error:', error);
      throw error;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      setOpenSnackbar(true);
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess(false);
    setMessage('');
    
    try {
      // Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with username
      await updateProfile(userCredential.user, {
        displayName: username
      });
      
      // Register in our backend
      await registerToBackend(userCredential.user.uid, username, email);
      
      // After successful registration
      requestLocation();
      setMessage('Registration successful! Redirecting to search page...');
      setOpenSnackbar(true);
      
      setTimeout(() => {
        navigate('/search');
      }, 1500);
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      } else {
        errorMessage = error.message || 'Registration failed. Please try again.';
      }
      
      setError(errorMessage);
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    setSuccess(false);
    setMessage('');
    
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, provider);
      const userEmail = result.user.email;
      
      // Check if this email is already registered
      const signInMethods = await fetchSignInMethodsForEmail(auth, userEmail);
      console.log('Sign-in methods for Google email:', signInMethods);
      
      if (signInMethods.includes('password') && !signInMethods.includes('google.com')) {
        setError('This email is already registered with a password. Please sign in with email and password.');
        setOpenSnackbar(true);
        setGoogleLoading(false);
        return;
      }
      
      // Register in our backend
      await registerToBackend(
        result.user.uid,
        result.user.displayName || result.user.email.split('@')[0],
        result.user.email
      );
      
      // After successful Google registration
      requestLocation();
      setSuccess(true);
      setMessage('Google sign-in successful! Redirecting to search page...');
      setOpenSnackbar(true);
      
      setTimeout(() => {
        navigate('/search');
      }, 1500);
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError('Google sign-in failed. Please try again.');
      setOpenSnackbar(true);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleSignIn = () => {
    setError('Apple sign-in coming soon');
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const features = [
    { icon: <ParkingIcon />, title: 'Smart Parking', description: 'Find and book parking spots instantly' },
    { icon: <SecurityIcon />, title: 'Secure Payments', description: 'Safe and encrypted payment processing' },
    { icon: <SpeedIcon />, title: 'Quick Booking', description: 'Book your spot in under 30 seconds' },
    { icon: <SupportIcon />, title: '24/7 Support', description: 'Round-the-clock customer assistance' },
  ];

  // Show location error if set
  React.useEffect(() => {
    if (locationError) {
      setError(locationError);
      setOpenSnackbar(true);
    }
  }, [locationError]);

  return (
    <StyledContainer maxWidth="lg">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', gap: 4 }}>
        {/* Register Form */}
        <StyledPaper elevation={3}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <ParkingIcon sx={{ fontSize: 40, color: '#FF385C', mr: 1 }} />
              <Typography variant="h4" fontWeight="bold" sx={{ color: '#FF385C' }}>
                ParkShare
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Create your account to start parking smarter
            </Typography>
          </Box>

          {/* Register Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <StyledTextField
              fullWidth
              required
              id="register-username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            <StyledTextField
              fullWidth
              required
              id="register-email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            {/* Provider indicator */}
            {emailProvider && (
              <Box sx={{ mb: 2 }}>
                {emailProvider === 'google' && (
                  <Alert severity="info" sx={{ borderRadius: 2, fontSize: '0.875rem' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <GoogleIcon sx={{ mr: 1, fontSize: 20 }} />
                      This email is registered with Google. Please use Google Sign-In.
                    </Box>
                  </Alert>
                )}
                {emailProvider === 'password' && (
                  <Alert severity="warning" sx={{ borderRadius: 2, fontSize: '0.875rem' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Lock sx={{ mr: 1, fontSize: 20 }} />
                      An account with this email already exists. Please sign in instead.
                    </Box>
                  </Alert>
                )}
                {emailProvider === 'both' && (
                  <Alert severity="info" sx={{ borderRadius: 2, fontSize: '0.875rem' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <GoogleIcon sx={{ mr: 1, fontSize: 20 }} />
                      This email is already registered. Please sign in instead.
                    </Box>
                  </Alert>
                )}
              </Box>
            )}
            
            <StyledTextField
              fullWidth
              required
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="register-password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <StyledTextField
              fullWidth
              required
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              id="register-confirm-password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <StyledButton
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || emailProvider === 'password' || emailProvider === 'both'}
              sx={{ mb: 3, height: 48 }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : emailProvider === 'password' || emailProvider === 'both' ? (
                'Account Already Exists'
              ) : (
                'Create Account'
              )}
            </StyledButton>

            {/* Social Login */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Divider sx={{ flex: 1 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mx: 2 }}>
                  OR
                </Typography>
                <Divider sx={{ flex: 1 }} />
              </Box>

              <StyledButton
                variant="outlined"
                fullWidth
                startIcon={googleLoading ? <CircularProgress size={20} /> : <GoogleIcon />}
                onClick={handleGoogleSignIn}
                disabled={googleLoading || emailProvider === 'password'}
                sx={{ mb: 2, height: 48 }}
              >
                {googleLoading ? 'Signing up...' : emailProvider === 'password' ? 'Account Exists' : 'Continue with Google'}
              </StyledButton>

              <StyledButton
                variant="outlined"
                fullWidth
                startIcon={<AppleIcon />}
                onClick={handleAppleSignIn}
                sx={{ mb: 2, height: 48 }}
              >
                Continue with Apple
              </StyledButton>
            </Box>

            {/* Sign In Link */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link href="/login" sx={{ color: '#FF385C', textDecoration: 'none', fontWeight: 600 }}>
                  Sign In
                </Link>
              </Typography>
            </Box>
          </Box>
        </StyledPaper>

        {/* Info Section */}
        <InfoSection>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, color: '#222' }}>
            Join ParkShare Today!
          </Typography>
          {features.map((feature, index) => (
            <FeatureCard key={feature.title}>
              <Box sx={{ color: '#FF385C', mr: 2 }}>
                {feature.icon}
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#222', mb: 0.5 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  {feature.description}
                </Typography>
              </Box>
            </FeatureCard>
          ))}
        </InfoSection>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={success ? "success" : "error"}
          sx={{ width: '100%' }}
        >
          {success ? message : error}
        </Alert>
      </Snackbar>
    </StyledContainer>
  );
}

export default Register;