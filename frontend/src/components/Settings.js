import { auth } from '../firebase';
import { Container, Typography, Box, Paper, Grid, Switch, TextField, Button, List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction, Divider, Alert, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Snackbar } from '@mui/material';
import { Notifications as NotificationsIcon, Security as SecurityIcon, CreditCard as CreditCardIcon, Lock as LockIcon, Edit as EditIcon, Add as AddIcon, Delete as DeleteIcon, Email as EmailIcon, Phone as PhoneIcon } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

function Settings() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    booking: true,
    marketing: false,
  });

  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: 'card', last4: '4242', default: true },
    { id: 2, type: 'card', last4: '1234', default: false }
  ]);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [newPaymentInput, setNewPaymentInput] = useState('');
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (openDialog) {
      if (dialogType === 'email') setEmailInput(user?.email || '');
      if (dialogType === 'phone') setPhoneInput(user?.phoneNumber || '');
      if (dialogType === 'password') {
        setPasswordInput('');
        setConfirmPasswordInput('');
      }
      if (dialogType === 'payment') setNewPaymentInput('');
    }
  }, [openDialog, dialogType, user]);

  const handleNotificationChange = (type) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleDeletePaymentMethod = (id) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== id));
    setSuccess('Payment method removed successfully');
    setOpenSnackbar(true);
  };

  const handleSetDefaultPayment = (id) => {
    setPaymentMethods(prev => prev.map(method => ({
      ...method,
      default: method.id === id
    })));
    setSuccess('Default payment method updated');
    setOpenSnackbar(true);
  };

  const handleOpenDialog = (type) => {
    setDialogType(type);
    setOpenDialog(true);
  };

  const handleSaveChanges = async () => {
    setError(null);
    setSuccess('');
    try {
      if (dialogType === 'email') {
        if (!emailInput || !emailInput.includes('@')) throw new Error('Enter a valid email');
        await user.updateEmail(emailInput);
        setSuccess('Email updated successfully');
      } else if (dialogType === 'phone') {
        if (!phoneInput) throw new Error('Enter a valid phone number');
        // Firebase phone update requires verification; here we just update local user object for demo
        setUser(prev => ({ ...prev, phoneNumber: phoneInput }));
        setSuccess('Phone number updated successfully');
      } else if (dialogType === 'password') {
        if (!passwordInput || passwordInput.length < 6) throw new Error('Password must be at least 6 characters');
        if (passwordInput !== confirmPasswordInput) throw new Error('Passwords do not match');
        await user.updatePassword(passwordInput);
        setSuccess('Password updated successfully');
      } else if (dialogType === 'payment') {
        if (!newPaymentInput || newPaymentInput.length < 4) throw new Error('Enter last 4 digits of card');
        setPaymentMethods(prev => [
          ...prev,
          { id: Date.now(), type: 'card', last4: newPaymentInput, default: false }
        ]);
        setSuccess('Payment method added');
      } else if (dialogType === '2fa') {
        setTwoFAEnabled(val => !val);
        setSuccess(twoFAEnabled ? '2FA disabled' : '2FA enabled');
      }
      setOpenDialog(false);
      setOpenSnackbar(true);
    } catch (err) {
      setError(err.message);
      setOpenSnackbar(true);
    }
  };

  return (
    <Container maxWidth="md">
      <Box py={4}>
        <Typography variant="h4" gutterBottom color="primary">
          Settings
        </Typography>

        <Grid container spacing={4}>
          {/* Account Settings */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Account Settings
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={user?.email || 'Not set'}
                  />
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => handleOpenDialog('email')}>
                      <EditIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Phone Number"
                    secondary={user?.phoneNumber || 'Not set'}
                  />
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => handleOpenDialog('phone')}>
                      <EditIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {/* Notification Preferences */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Notification Preferences
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email Notifications"
                    secondary="Receive booking updates via email"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notifications.email}
                      onChange={() => handleNotificationChange('email')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <NotificationsIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Push Notifications"
                    secondary="Receive updates on your device"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notifications.push}
                      onChange={() => handleNotificationChange('push')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <NotificationsIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Marketing Communications"
                    secondary="Receive offers and updates"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={notifications.marketing}
                      onChange={() => handleNotificationChange('marketing')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {/* Payment Methods */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Payment Methods
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('payment')}
                  variant="outlined"
                >
                  Add New
                </Button>
              </Box>
              <List>
                {paymentMethods.map((method) => (
                  <ListItem key={method.id}>
                    <ListItemIcon>
                      <CreditCardIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={`**** **** **** ${method.last4}`}
                      secondary={method.default ? 'Default' : ''}
                    />
                    <ListItemSecondaryAction>
                      {!method.default && (
                        <Button
                          size="small"
                          onClick={() => handleSetDefaultPayment(method.id)}
                        >
                          Set Default
                        </Button>
                      )}
                      <IconButton 
                        onClick={() => handleDeletePaymentMethod(method.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Security Settings */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Security Settings
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <LockIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Change Password"
                    secondary="Update your password regularly"
                  />
                  <ListItemSecondaryAction>
                    <Button
                      onClick={() => handleOpenDialog('password')}
                      startIcon={<EditIcon />}
                    >
                      Update
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Two-Factor Authentication"
                    secondary="Add an extra layer of security"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={false}
                      onChange={() => handleOpenDialog('2fa')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>

        {/* Dialogs */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>
            {dialogType === 'email' && 'Update Email'}
            {dialogType === 'phone' && 'Update Phone Number'}
            {dialogType === 'password' && 'Change Password'}
            {dialogType === 'payment' && 'Add Payment Method'}
            {dialogType === '2fa' && 'Setup Two-Factor Authentication'}
          </DialogTitle>
          <DialogContent>
            {dialogType === 'email' && (
              <TextField
                autoFocus
                margin="dense"
                label="New Email"
                type="email"
                fullWidth
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
              />
            )}
            {dialogType === 'phone' && (
              <TextField
                autoFocus
                margin="dense"
                label="Phone Number"
                type="tel"
                fullWidth
                value={phoneInput}
                onChange={e => setPhoneInput(e.target.value)}
              />
            )}
            {dialogType === 'password' && (
              <>
                <TextField
                  autoFocus
                  margin="dense"
                  label="New Password"
                  type="password"
                  fullWidth
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                />
                <TextField
                  margin="dense"
                  label="Confirm Password"
                  type="password"
                  fullWidth
                  value={confirmPasswordInput}
                  onChange={e => setConfirmPasswordInput(e.target.value)}
                />
              </>
            )}
            {dialogType === 'payment' && (
              <TextField
                autoFocus
                margin="dense"
                label="Card Last 4 Digits"
                type="text"
                fullWidth
                value={newPaymentInput}
                onChange={e => setNewPaymentInput(e.target.value.replace(/\D/g, '').slice(0,4))}
                helperText="For demo only. Enter last 4 digits."
              />
            )}
            {dialogType === '2fa' && (
              <Box>
                <Typography gutterBottom>
                  Two-Factor Authentication is currently <b>{twoFAEnabled ? 'ENABLED' : 'DISABLED'}</b>.
                </Typography>
                <Button
                  variant={twoFAEnabled ? 'outlined' : 'contained'}
                  color={twoFAEnabled ? 'error' : 'primary'}
                  onClick={() => setTwoFAEnabled(val => !val)}
                >
                  {twoFAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                </Button>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            {dialogType !== '2fa' && (
              <Button onClick={handleSaveChanges} variant="contained" color="primary">
                Save Changes
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Success/Error Messages */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
        >
          <Alert
            onClose={() => setOpenSnackbar(false)}
            severity={error ? 'error' : 'success'}
          >
            {error || success}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}

export default Settings;