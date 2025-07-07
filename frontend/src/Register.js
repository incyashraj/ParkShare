import { Box, TextField, Button, Typography, Container, Paper, Divider, Link, Alert, Snackbar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { auth } from './firebase';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
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

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: username
      });
      
      const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username, 
          email, 
          password,
          uid: userCredential.user.uid 
        }),
      });
      
      if (response.ok) {
        setSuccess(true);
        setMessage('Registration successful! Redirecting to login...');
        setOpenSnackbar(true);
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      setError(error.message);
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
      console.log('Google sign in initiated:', result.user.uid);
      // Register Google user in our backend
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
        setSuccess(true);
        setMessage('Google sign-in successful! Redirecting...');
        setOpenSnackbar(true);
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError('Google sign-in failed. Please try again.');
      setOpenSnackbar(true);
    }
  };

  const handleAppleSignIn = () => {
    setError('Apple sign-in coming soon');
    setOpenSnackbar(true);
  };

  return (
    <Container component="main" maxWidth="sm">
      <StyledPaper elevation={3}>
        <Typography component="h1" variant="h4" sx={{ mb: 4, color: '#1E3A8A' }}>
          Create Account
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="register-username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="register-email"
            label="Email Address"
            name="email"
            autoComplete="email"
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
            id="register-password"
            autoComplete="new-password"
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
            Sign Up
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
            <Link href="/login" variant="body2" sx={{ color: '#1E3A8A' }}>
              Already have an account? Sign In
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
              onClick={async () => {
                try {
                  const testEmail = 'test@example.com';
                  const testPassword = 'test123456';
                  const testUsername = 'testuser';
                  
                  console.log('Creating test account...');
                  const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
                  await updateProfile(userCredential.user, { displayName: testUsername });
                  
                  const response = await fetch(`${API_BASE}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      username: testUsername,
                      email: testEmail,
                      password: testPassword,
                      uid: userCredential.user.uid
                    }),
                  });
                  
                  if (response.ok) {
                    alert('Test account created successfully!\nEmail: test@example.com\nPassword: test123456');
                  } else {
                    throw new Error('Registration failed');
                  }
                } catch (error) {
                  console.error('Test account creation failed:', error);
                  alert('Test account creation failed: ' + error.message);
                }
              }}
            >
              Create Test Account
            </Button>
          </Box>
        </Box>
      </StyledPaper>

      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={success ? "success" : "error"}
          sx={{ width: '100%' }}
        >
          {success ? message : error}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Register;