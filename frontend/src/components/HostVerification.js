import { Box, Card, CardContent, Typography, TextField, Button, Stepper, Step, StepLabel, Alert, CircularProgress, Chip, Divider, Paper, Grid, IconButton, InputAdornment, Menu, MenuItem, Container } from '@mui/material';
import { Email, Phone, VerifiedUser, CheckCircle, Send, Visibility, VisibilityOff, Refresh } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

const steps = ['Email Verification', 'Mobile Verification', 'Verification Complete'];

const HostVerification = () => {
  const { currentUser } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [mobileCode, setMobileCode] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);
  const [isVerifiedHost, setIsVerifiedHost] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showEmailCode, setShowEmailCode] = useState(false);
  const [showMobileCode, setShowMobileCode] = useState(false);
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [mobileCodeSent, setMobileCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Load verification status on component mount
  useEffect(() => {
    if (currentUser?.uid) {
      loadVerificationStatus();
    }
  }, [currentUser]);

  // Set email from current user
  useEffect(() => {
    if (currentUser?.email) {
      setEmail(currentUser.email);
    }
  }, [currentUser]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const loadVerificationStatus = async () => {
    if (!currentUser?.uid) return;

    setLoadingStatus(true);
    try {
      const response = await fetch(`http://localhost:3001/users/${currentUser.uid}/verification`);
      if (response.ok) {
        const data = await response.json();
        setEmailVerified(data.emailVerified);
        setMobileVerified(data.mobileVerified);
        setIsVerifiedHost(data.isVerifiedHost);
        
        // Set active step based on verification status
        if (data.isVerifiedHost) {
          setActiveStep(2);
        } else if (data.emailVerified) {
          setActiveStep(1);
        } else {
          setActiveStep(0);
        }
      }
    } catch (error) {
      console.error('Error loading verification status:', error);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleSendEmailCode = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/verify/send-email-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          userId: currentUser?.uid
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setEmailCodeSent(true);
        setSuccess(`Verification code sent to ${email}! Check your email.`);
        setCountdown(60); // 60 second cooldown
        setTimeout(() => setSuccess(''), 5000);
        
        // Show the code in console for testing (remove in production)
        console.log('Email verification code:', data.code);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to send verification code');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!emailCode) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/verify/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code: emailCode,
          userId: currentUser?.uid
        }),
      });

      if (response.ok) {
        setEmailVerified(true);
        setSuccess('Email verified successfully! Moving to mobile verification...');
        setActiveStep(1);
        setTimeout(() => setSuccess(''), 3000);
        // Reload verification status
        setTimeout(loadVerificationStatus, 1000);
      } else {
        const data = await response.json();
        setError(data.message || 'Invalid verification code');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMobileCode = async () => {
    if (!mobile) {
      setError('Please enter your mobile number');
      return;
    }

    // Basic mobile number validation
    const mobileRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
    if (!mobileRegex.test(mobile)) {
      setError('Please enter a valid mobile number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/verify/send-mobile-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobile,
          userId: currentUser?.uid
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMobileCodeSent(true);
        setSuccess(`Verification code sent to ${mobile}! Check your SMS.`);
        setCountdown(60); // 60 second cooldown
        setTimeout(() => setSuccess(''), 5000);
        
        // Show the code in console for testing (remove in production)
        console.log('Mobile verification code:', data.code);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to send verification code');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMobile = async () => {
    if (!mobileCode) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/verify/mobile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobile,
          code: mobileCode,
          userId: currentUser?.uid
        }),
      });

      if (response.ok) {
        setMobileVerified(true);
        setIsVerifiedHost(true);
        setSuccess('Mobile number verified successfully! You are now a verified host!');
        setActiveStep(2);
        setTimeout(() => setSuccess(''), 5000);
        // Reload verification status
        setTimeout(loadVerificationStatus, 1000);
      } else {
        const data = await response.json();
        setError(data.message || 'Invalid verification code');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    if (loadingStatus) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Box>
      );
    }

    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Verify Your Email Address
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              We'll send a verification code to your email address to verify your identity.
            </Typography>
            
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={emailVerified}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />

            {emailCodeSent && !emailVerified && (
              <TextField
                fullWidth
                label="Verification Code"
                value={emailCode}
                onChange={(e) => setEmailCode(e.target.value)}
                sx={{ mb: 2 }}
                placeholder="Enter 6-digit code"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowEmailCode(!showEmailCode)}
                        edge="end"
                      >
                        {showEmailCode ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                type={showEmailCode ? 'text' : 'password'}
              />
            )}

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              {!emailCodeSent ? (
                <Button
                  variant="contained"
                  onClick={handleSendEmailCode}
                  disabled={loading || !email}
                  startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                >
                  Send Verification Code
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleVerifyEmail}
                  disabled={loading || !emailCode}
                  startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
                >
                  Verify Email
                </Button>
              )}
              
              {emailCodeSent && (
                <Button
                  variant="outlined"
                  onClick={handleSendEmailCode}
                  disabled={loading || countdown > 0}
                  startIcon={<Refresh />}
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                </Button>
              )}
            </Box>

            {emailVerified && (
              <Alert severity="success" sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle />
                  Email verified successfully!
                </Box>
              </Alert>
            )}
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Verify Your Mobile Number
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              We'll send a verification code to your mobile number to complete the verification process.
            </Typography>
            
            <TextField
              fullWidth
              label="Mobile Number"
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              disabled={mobileVerified}
              placeholder="+91 98765 43210"
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="action" />
                  </InputAdornment>
                ),
              }}
            />

            {mobileCodeSent && !mobileVerified && (
              <TextField
                fullWidth
                label="Verification Code"
                value={mobileCode}
                onChange={(e) => setMobileCode(e.target.value)}
                sx={{ mb: 2 }}
                placeholder="Enter 6-digit code"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowMobileCode(!showMobileCode)}
                        edge="end"
                      >
                        {showMobileCode ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                type={showMobileCode ? 'text' : 'password'}
              />
            )}

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              {!mobileCodeSent ? (
                <Button
                  variant="contained"
                  onClick={handleSendMobileCode}
                  disabled={loading || !mobile}
                  startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                >
                  Send Verification Code
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleVerifyMobile}
                  disabled={loading || !mobileCode}
                  startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
                >
                  Verify Mobile
                </Button>
              )}
              
              {mobileCodeSent && (
                <Button
                  variant="outlined"
                  onClick={handleSendMobileCode}
                  disabled={loading || countdown > 0}
                  startIcon={<Refresh />}
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                </Button>
              )}
            </Box>

            {mobileVerified && (
              <Alert severity="success" sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle />
                  Mobile number verified successfully!
                </Box>
              </Alert>
            )}
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <VerifiedUser sx={{ fontSize: 80, color: 'success.main' }} />
            </Box>
            <Typography variant="h5" gutterBottom>
              Verification Complete!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Congratulations! You are now a verified host on ParkShare. Your listings will be marked with a verified badge.
            </Typography>
            
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'success.light' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle color="success" />
                    <Typography variant="body2">
                      Email: {email}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle color="success" />
                    <Typography variant="body2">
                      Mobile: {mobile}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            <Chip
              label="Verified Host"
              color="success"
              icon={<VerifiedUser />}
              sx={{ fontSize: '1.1rem', py: 1 }}
            />
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Host Verification
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Complete verification to become a verified host and build trust with renters
            </Typography>
          </Box>

          {/* Current Status Display */}
          {!loadingStatus && (
            <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Current Status</Typography>
                <Button
                  size="small"
                  startIcon={<Refresh />}
                  onClick={loadVerificationStatus}
                  disabled={loadingStatus}
                >
                  Refresh
                </Button>
              </Box>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Email color={emailVerified ? 'success' : 'action'} />
                    <Typography variant="body2">
                      Email: {emailVerified ? 'Verified' : 'Not Verified'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Phone color={mobileVerified ? 'success' : 'action'} />
                    <Typography variant="body2">
                      Mobile: {mobileVerified ? 'Verified' : 'Not Verified'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VerifiedUser color={isVerifiedHost ? 'success' : 'action'} />
                    <Typography variant="body2">
                      Host Status: {isVerifiedHost ? 'Verified' : 'Not Verified'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          )}

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          {renderStepContent(activeStep)}

          {/* Additional Info */}
          {!isVerifiedHost && (
            <Paper sx={{ p: 2, mt: 3, bgcolor: 'info.light' }}>
              <Typography variant="body2" color="info.contrastText">
                <strong>Why verify?</strong> Verified hosts get priority in search results, 
                earn trust badges, and can access premium features. The verification process 
                helps ensure a safe and reliable parking experience for all users.
              </Typography>
            </Paper>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default HostVerification;