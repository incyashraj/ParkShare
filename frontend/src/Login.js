import { Box, TextField, Button, Typography, Container, Paper, Divider, Link, Alert, Snackbar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { auth } from './firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import AppleIcon from '@mui/icons-material/Apple';
import GoogleIcon from '@mui/icons-material/Google';
import { useState } from 'react';
import { API_BASE } from './apiConfig';

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(8),
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const SocialButton = styled(Button)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  width: '100%',
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1),
}));

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the intended destination from location state, or default to home
  const from = location.state?.from || '/';

  const loginToBackend = async (uid) => {
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid }),
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }
      
      setSuccess(true);
      setMessage('Login successful! Redirecting...');
      setOpenSnackbar(true);
      
      setTimeout(() => {
        navigate(from);
      }, 1500);
    } catch (error) {
      setError('Failed to authenticate with server');
      setSuccess(false);
      setOpenSnackbar(true);
      throw error;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess(false);
    
    try {
      console.log('Attempting Firebase authentication with:', { email });
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Firebase authentication successful:', userCredential.user.uid);
      
      try {
        await loginToBackend(userCredential.user.uid);
      } catch (backendError) {
        console.error('Backend login failed:', backendError);
        // If backend login fails, try to register the user first
        try {
          console.log('Attempting to register user in backend...');
          const registerResponse = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: userCredential.user.displayName || userCredential.user.email.split('@')[0],
              email: userCredential.user.email,
              password: '',
              uid: userCredential.user.uid
            }),
          });
          
          if (registerResponse.ok) {
            console.log('User registered in backend, trying login again...');
            await loginToBackend(userCredential.user.uid);
          } else {
            const errorData = await registerResponse.json();
            throw new Error(errorData.message || 'Registration failed');
          }
        } catch (registerError) {
          console.error('Registration failed:', registerError);
          setError('Authentication failed. Please try again or contact support.');
          setSuccess(false);
          setOpenSnackbar(true);
        }
      }
    } catch (error) {
      console.error('Firebase authentication error:', error);
      let errorMessage = 'Invalid email or password';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please register first.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setError(errorMessage);
      setSuccess(false);
      setOpenSnackbar(true);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      const result = await signInWithPopup(auth, provider);
      
      try {
        // First try to login
        await loginToBackend(result.user.uid);
      } catch (loginError) {
        // If login fails, try to register
        const response = await fetch(`${API_BASE}/register`, {
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
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError('Google sign-in failed. Please try again.');
      setSuccess(false);
      setOpenSnackbar(true);
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

  return (
    <Container component="main" maxWidth="sm">
      <StyledPaper elevation={3}>
        <Typography component="h1" variant="h4" sx={{ mb: 4, color: '#1E3A8A' }}>
          ParkShare
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="login-email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="login-password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ 
              mt: 3, 
              mb: 2, 
              backgroundColor: '#1E3A8A',
              '&:hover': {
                backgroundColor: '#1E40AF'
              }
            }}
          >
            Sign In
          </Button>
          
          <Box sx={{ mt: 2, mb: 2 }}>
            <Divider>
              <Typography variant="body2" color="textSecondary">
                OR
              </Typography>
            </Divider>
          </Box>

          <SocialButton
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
          >
            Continue with Google
          </SocialButton>

          <SocialButton
            variant="outlined"
            startIcon={<AppleIcon />}
            onClick={handleAppleSignIn}
          >
            Continue with Apple
          </SocialButton>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link href="/register" variant="body2" sx={{ color: '#1E3A8A' }}>
              {"Don't have an account? Sign Up"}
            </Link>
          </Box>
          
          {/* Debug section - remove in production */}
          <Box sx={{ mt: 3, p: 2, border: '1px solid #ccc', borderRadius: 1, bgcolor: '#f5f5f5' }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Debug Information:
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={async () => {
                try {
                  const response = await fetch(`${API_BASE}/health`);
                  const data = await response.json();
                  console.log('Backend health check:', data);
                  alert(`Backend Status: ${data.status}\nUsers: ${data.usersCount}`);
                } catch (error) {
                  console.error('Backend health check failed:', error);
                  alert('Backend connection failed: ' + error.message);
                }
              }}
              sx={{ mr: 1 }}
            >
              Test Backend
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                console.log('Firebase auth state:', auth.currentUser);
                alert(`Firebase User: ${auth.currentUser ? auth.currentUser.email : 'None'}`);
              }}
            >
              Test Firebase
            </Button>
          </Box>
        </Box>
      </StyledPaper>

      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar}
          severity={success ? "success" : "error"}
          sx={{ width: '100%' }}
        >
          {success ? message : error}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Login;