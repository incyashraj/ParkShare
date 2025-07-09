import React, { useState, useEffect } from 'react';
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
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Modal,
  Backdrop,
  Fade,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Close as CloseIcon,
  Google as GoogleIcon,
  Apple as AppleIcon,
  LocalParking as ParkingIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Support as SupportIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { auth } from './firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail, fetchSignInMethodsForEmail } from 'firebase/auth';
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

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  
  // Forgot password states
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');
  
  // Provider detection
  const [emailProvider, setEmailProvider] = useState(null);
  
  const navigate = useNavigate();
  const { requestLocation, locationError } = useAuth();

  // Load saved email if remember me was checked
  useEffect(() => {
    const savedEmail = localStorage.getItem('parkShare_remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Check email provider when email changes
  useEffect(() => {
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

  // Email validation
  const validateEmail = (email) => {
    if (!email) {
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return false;
    }
    return true;
  };

  // Password validation
  const validatePassword = (password) => {
    if (!password) {
      return false;
    } else if (password.length < 6) {
      return false;
    }
    return true;
  };

  // Removed unused checkEmailProvider function

  const loginToBackend = async (uid) => {
    try {
      const response = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful for user:', data.username);
        
        // Save email if remember me is checked
        if (rememberMe) {
          localStorage.setItem('parkShare_remembered_email', email);
        } else {
          localStorage.removeItem('parkShare_remembered_email');
        }
        
        setSuccess(true);
        setError('');
        setOpenSnackbar(true);
        
        // Navigate to search page
        setTimeout(() => {
          navigate('/search');
        }, 1000);
      } else {
        throw new Error('Backend login failed');
      }
    } catch (error) {
      console.error('Backend login error:', error);
      throw new Error('Failed to authenticate with server');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    // Validate inputs
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) {
      setError('Please enter valid email and password (minimum 6 characters)');
      setOpenSnackbar(true);
      return;
    }
    
    try {
      console.log('Attempting Firebase authentication with:', { email });
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Firebase authentication successful:', userCredential.user.uid);
      
      // Login to backend
      await loginToBackend(userCredential.user.uid);
      requestLocation();
      setSuccess(true);
      setOpenSnackbar(true);
      setTimeout(() => {
        navigate('/search');
      }, 1000);
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      } else {
        errorMessage = error.message || 'Login failed. Please try again.';
      }
      
      setError(errorMessage);
      setSuccess(false);
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');
    setSuccess(false);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, provider);
      const userEmail = result.user.email;
      
      // Check if this email is registered with password only
      const signInMethods = await fetchSignInMethodsForEmail(auth, userEmail);
      console.log('Sign-in methods for Google email:', signInMethods);
      
      if (signInMethods.includes('password') && !signInMethods.includes('google.com')) {
        setError('This account was created with email and password. Please use email login.');
        setSuccess(false);
        setOpenSnackbar(true);
        setGoogleLoading(false);
        return;
      }
      
      // Try to login to backend first
      try {
        await loginToBackend(result.user.uid);
      } catch (loginError) {
        // If login fails, try to register
        const response = await fetch(`${API_BASE}/api/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: result.user.displayName || result.user.email.split('@')[0],
            email: result.user.email,
            password: '', // Google users don't need password
            uid: result.user.uid
          }),
        });
        
        if (response.ok) {
          // After registration, try login again
          await loginToBackend(result.user.uid);
        } else {
          throw new Error('Registration failed');
        }
      }
      requestLocation();
      setSuccess(true);
      setOpenSnackbar(true);
      setTimeout(() => {
        navigate('/search');
      }, 1000);
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError('Google sign-in failed. Please try again.');
      setSuccess(false);
      setOpenSnackbar(true);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleSignIn = () => {
    setError('Apple sign-in coming soon');
    setSuccess(false);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleDemoLogin = () => {
    setEmail('demo@parkshare.com');
    setPassword('demo123');
    setShowDemoModal(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    // Validate email format
    if (!forgotEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      setForgotError('Please enter a valid email address.');
      return;
    }
    
    setForgotLoading(true);
    setForgotSuccess('');
    setForgotError('');
    
    console.log('Attempting to send password reset email to:', forgotEmail);
    
    try {
      // Check if this email is registered with Google only
      const signInMethods = await fetchSignInMethodsForEmail(auth, forgotEmail);
      console.log('Sign-in methods for forgot password:', signInMethods);
      
      if (signInMethods.includes('google.com') && !signInMethods.includes('password')) {
        setForgotError('This account was created with Google. Password reset is not available for Google accounts. Please use Google Sign-In.');
        setForgotLoading(false);
        return;
      }
      await sendPasswordResetEmail(auth, forgotEmail);
      console.log('Password reset email sent successfully');
      setForgotSuccess('Password reset link sent! Check your email (including spam folder).');
    } catch (err) {
      console.error('Password reset error:', err);
      let errorMessage = 'Failed to send reset link.';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address. Please check the email or register first.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        errorMessage = err.message || 'Failed to send reset link.';
      }
      
      setForgotError(errorMessage);
    } finally {
      setForgotLoading(false);
    }
  };

  const features = [
    { icon: <ParkingIcon />, title: 'Smart Parking', description: 'Find and book parking spots instantly' },
    { icon: <SecurityIcon />, title: 'Secure Payments', description: 'Safe and encrypted payment processing' },
    { icon: <SpeedIcon />, title: 'Quick Booking', description: 'Book your spot in under 30 seconds' },
    { icon: <SupportIcon />, title: '24/7 Support', description: 'Round-the-clock customer assistance' },
  ];

  // Show location error if set
  useEffect(() => {
    if (locationError) {
      setError(locationError);
      setOpenSnackbar(true);
    }
  }, [locationError]);

  return (
    <StyledContainer maxWidth="lg">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', gap: 4 }}>
        {/* Login Form */}
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
              Welcome back! Sign in to access your parking dashboard
            </Typography>
          </Box>

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <StyledTextField
              fullWidth
              required
              id="login-email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
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
                      This account uses Google Sign-In
                    </Box>
                  </Alert>
                )}
                {emailProvider === 'password' && (
                  <Alert severity="info" sx={{ borderRadius: 2, fontSize: '0.875rem' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Lock sx={{ mr: 1, fontSize: 20 }} />
                      This account uses email and password
                    </Box>
                  </Alert>
                )}
                {emailProvider === 'both' && (
                  <Alert severity="success" sx={{ borderRadius: 2, fontSize: '0.875rem' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircleIcon sx={{ mr: 1, fontSize: 20 }} />
                      You can use either Google Sign-In or email/password
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
              id="login-password"
              autoComplete="current-password"
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

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    sx={{
                      color: '#FF385C',
                      '&.Mui-checked': {
                        color: '#FF385C',
                      },
                    }}
                  />
                }
                label="Remember me"
              />
              <Link 
                component="button" 
                variant="body2" 
                sx={{ 
                  color: emailProvider === 'google' ? '#ccc' : '#FF385C', 
                  textDecoration: 'none',
                  cursor: emailProvider === 'google' ? 'not-allowed' : 'pointer'
                }} 
                onClick={() => emailProvider !== 'google' && setForgotOpen(true)}
                disabled={emailProvider === 'google'}
              >
                {emailProvider === 'google' ? 'Use Google Sign-In' : 'Forgot password?'}
              </Link>
            </Box>

            <StyledButton
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || emailProvider === 'google'}
              sx={{ mb: 3, height: 48 }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : emailProvider === 'google' ? (
                'Use Google Sign-In'
              ) : (
                'Sign In'
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
                {googleLoading ? 'Signing in...' : emailProvider === 'password' ? 'Use Email Login' : 'Continue with Google'}
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

              {/* Demo Login */}
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Tooltip title="Try the app with demo credentials">
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => setShowDemoModal(true)}
                    sx={{ color: '#FF385C', textTransform: 'none' }}
                  >
                    Try Demo Mode
                  </Button>
                </Tooltip>
              </Box>
            </Box>

            {/* Sign Up Link */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link href="/register" sx={{ color: '#FF385C', textDecoration: 'none', fontWeight: 600 }}>
                  Sign Up
                </Link>
              </Typography>
            </Box>
          </Box>
        </StyledPaper>

        {/* Info Section */}
        <InfoSection>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, color: '#222' }}>
            Why Choose ParkShare?
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

      {/* Demo Modal */}
      <Modal
        open={showDemoModal}
        onClose={() => setShowDemoModal(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={showDemoModal}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Demo Mode
              </Typography>
              <IconButton onClick={() => setShowDemoModal(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Try ParkShare with demo credentials to explore all features without creating an account.
            </Typography>
            <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2, mb: 3 }}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                Demo Credentials:
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                Email: demo@parkshare.com<br />
                Password: demo123
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setShowDemoModal(false)}
                sx={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleDemoLogin}
                sx={{ flex: 1, backgroundColor: '#FF385C' }}
              >
                Use Demo
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>

      {/* Forgot Password Modal */}
      <Modal
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={forgotOpen}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Reset Password
              </Typography>
              <IconButton onClick={() => setForgotOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            
            {forgotSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {forgotSuccess}
              </Alert>
            )}
            
            {forgotError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {forgotError}
              </Alert>
            )}
            
            <form onSubmit={handleForgotPassword}>
              <TextField
                fullWidth
                required
                label="Email Address"
                type="email"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                error={forgotEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)}
                helperText={forgotEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail) ? 'Please enter a valid email address' : ''}
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setForgotOpen(false)}
                  sx={{ flex: 1 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={forgotLoading}
                  sx={{ flex: 1, backgroundColor: '#FF385C' }}
                >
                  {forgotLoading ? <CircularProgress size={20} /> : 'Send Reset Link'}
                </Button>
              </Box>
            </form>
          </Box>
        </Fade>
      </Modal>

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
          {success ? 'Login successful! Redirecting...' : error}
        </Alert>
      </Snackbar>
    </StyledContainer>
  );
}

export default Login;