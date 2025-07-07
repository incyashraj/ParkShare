import { auth } from '../firebase';
import { 
  Container, Typography, Box, Paper, Grid, Switch, TextField, Button, List, ListItem, 
  ListItemIcon, ListItemText, ListItemSecondaryAction, Divider, Alert, Dialog, 
  DialogTitle, DialogContent, DialogActions, IconButton, Snackbar, Chip, 
  FormControl, InputLabel, Select, MenuItem, Slider, Accordion, AccordionSummary, 
  AccordionDetails, Tabs, Tab, Card, CardContent, Avatar, Badge, Tooltip,
  AlertTitle, LinearProgress, ListItemButton, Collapse
} from '@mui/material';
import { 
  Notifications as NotificationsIcon, Security as SecurityIcon, CreditCard as CreditCardIcon, 
  Lock as LockIcon, Edit as EditIcon, Add as AddIcon, Delete as DeleteIcon, Email as EmailIcon, 
  Phone as PhoneIcon, Language as LanguageIcon, Accessibility as AccessibilityIcon,
  Privacy as PrivacyIcon, Storage as StorageIcon, LocationOn as LocationIcon,
  Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon, 
  ExpandMore as ExpandMoreIcon, Person as PersonIcon, Settings as SettingsIcon,
  Download as DownloadIcon, DeleteForever as DeleteForeverIcon, 
  VerifiedUser as VerifiedUserIcon, Block as BlockIcon, History as HistoryIcon,
  LocalParking as ParkingIcon, DirectionsCar as CarIcon, Payment as PaymentIcon,
  NotificationsActive as NotificationsActiveIcon, NotificationsOff as NotificationsOffIcon,
  Brightness4 as DarkModeIcon, Brightness7 as LightModeIcon, 
  VolumeUp as VolumeIcon, Speed as SpeedIcon, Map as MapIcon,
  TextFields as TextFieldsIcon
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

function Settings() {
  // User state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState('');

  // Form inputs
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [newPaymentInput, setNewPaymentInput] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

  // Settings states
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    booking: true,
    marketing: false,
    reminders: true,
    promotions: false,
    security: true,
    support: true
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    locationSharing: true,
    activityStatus: true,
    dataAnalytics: true,
    thirdPartySharing: false
  });

  const [accessibility, setAccessibility] = useState({
    theme: 'light',
    fontSize: 'medium',
    highContrast: false,
    reduceMotion: false,
    screenReader: false
  });

  const [parkingPreferences, setParkingPreferences] = useState({
    defaultRadius: 5,
    preferredTypes: ['street', 'garage'],
    maxPrice: 50,
    electricCharging: false,
    disabledAccess: false,
    autoBook: false
  });

  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: 'card', last4: '4242', default: true, brand: 'Visa' },
    { id: 2, type: 'card', last4: '1234', default: false, brand: 'Mastercard' }
  ]);

  const [security, setSecurity] = useState({
    twoFAEnabled: false,
    biometricAuth: false,
    sessionTimeout: 30,
    loginNotifications: true,
    suspiciousActivityAlerts: true
  });

  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [currency, setCurrency] = useState('INR');

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
        setCurrentPassword('');
      }
      if (dialogType === 'payment') setNewPaymentInput('');
    }
  }, [openDialog, dialogType, user]);

  const handleNotificationChange = (type) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
    setSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} notifications ${!notifications[type] ? 'enabled' : 'disabled'}`);
    setOpenSnackbar(true);
  };

  const handlePrivacyChange = (type) => {
    setPrivacy(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
    setSuccess(`Privacy setting updated`);
    setOpenSnackbar(true);
  };

  const handleAccessibilityChange = (type, value) => {
    setAccessibility(prev => ({
      ...prev,
      [type]: value
    }));
    setSuccess(`Accessibility setting updated`);
    setOpenSnackbar(true);
  };

  const handleParkingPreferenceChange = (type, value) => {
    setParkingPreferences(prev => ({
      ...prev,
      [type]: value
    }));
    setSuccess(`Parking preference updated`);
    setOpenSnackbar(true);
  };

  const handleSecurityChange = (type) => {
    setSecurity(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
    setSuccess(`Security setting updated`);
    setOpenSnackbar(true);
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

  const handleConfirmAction = (action) => {
    setConfirmAction(action);
    setConfirmDialog(true);
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
        setUser(prev => ({ ...prev, phoneNumber: phoneInput }));
        setSuccess('Phone number updated successfully');
      } else if (dialogType === 'password') {
        if (!currentPassword) throw new Error('Current password is required');
        if (!passwordInput || passwordInput.length < 6) throw new Error('Password must be at least 6 characters');
        if (passwordInput !== confirmPasswordInput) throw new Error('Passwords do not match');
        await user.updatePassword(passwordInput);
        setSuccess('Password updated successfully');
      } else if (dialogType === 'payment') {
        if (!newPaymentInput || newPaymentInput.length < 4) throw new Error('Enter last 4 digits of card');
        setPaymentMethods(prev => [
          ...prev,
          { id: Date.now(), type: 'card', last4: newPaymentInput, default: false, brand: 'Card' }
        ]);
        setSuccess('Payment method added');
      }
      setOpenDialog(false);
      setOpenSnackbar(true);
    } catch (err) {
      setError(err.message);
      setOpenSnackbar(true);
    }
  };

  const handleDataExport = () => {
    // Simulate data export
    setSuccess('Data export started. You will receive an email when ready.');
    setOpenSnackbar(true);
  };

  const handleAccountDeletion = () => {
    setConfirmDialog(false);
    setSuccess('Account deletion request submitted. You will receive a confirmation email.');
    setOpenSnackbar(true);
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    setSuccess('Language updated successfully');
    setOpenSnackbar(true);
  };

  const handleCurrencyChange = (newCurrency) => {
    setCurrency(newCurrency);
    setSuccess('Currency updated successfully');
    setOpenSnackbar(true);
  };

  const handleTimezoneChange = (newTimezone) => {
    setTimezone(newTimezone);
    setSuccess('Timezone updated successfully');
    setOpenSnackbar(true);
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box py={4}>
          <LinearProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading settings...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Box display="flex" alignItems="center" mb={3}>
          <SettingsIcon sx={{ mr: 2, fontSize: 32 }} color="primary" />
          <Typography variant="h4" color="primary">
            Settings
          </Typography>
        </Box>

        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
          <Tab label="Account" />
          <Tab label="Notifications" />
          <Tab label="Privacy & Security" />
          <Tab label="Parking Preferences" />
          <Tab label="Payment" />
          <Tab label="Accessibility" />
          <Tab label="Data & Storage" />
        </Tabs>

        {/* Account Settings */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Profile Information
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Display Name"
                      secondary={user?.displayName || 'Not set'}
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => handleOpenDialog('name')}>
                        <EditIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
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

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Regional Settings
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <LanguageIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Language"
                      secondary="English"
                    />
                    <ListItemSecondaryAction>
                      <FormControl size="small">
                        <Select
                          value={language}
                          onChange={(e) => handleLanguageChange(e.target.value)}
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value="en">English</MenuItem>
                          <MenuItem value="hi">Hindi</MenuItem>
                          <MenuItem value="mr">Marathi</MenuItem>
                          <MenuItem value="gu">Gujarati</MenuItem>
                        </Select>
                      </FormControl>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PaymentIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Currency"
                      secondary="Indian Rupee"
                    />
                    <ListItemSecondaryAction>
                      <FormControl size="small">
                        <Select
                          value={currency}
                          onChange={(e) => handleCurrencyChange(e.target.value)}
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value="INR">₹ INR</MenuItem>
                          <MenuItem value="USD">$ USD</MenuItem>
                          <MenuItem value="EUR">€ EUR</MenuItem>
                        </Select>
                      </FormControl>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <LocationIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Timezone"
                      secondary="Asia/Kolkata"
                    />
                    <ListItemSecondaryAction>
                      <FormControl size="small">
                        <Select
                          value={timezone}
                          onChange={(e) => handleTimezoneChange(e.target.value)}
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value="Asia/Kolkata">IST (UTC+5:30)</MenuItem>
                          <MenuItem value="Asia/Dubai">GST (UTC+4)</MenuItem>
                          <MenuItem value="America/New_York">EST (UTC-5)</MenuItem>
                        </Select>
                      </FormControl>
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Notification Settings */}
        {activeTab === 1 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Notification Preferences
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <NotificationsActiveIcon />
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
                  <ListItem>
                    <ListItemIcon>
                      <CarIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Booking Updates"
                      secondary="Get notified about booking status changes"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={notifications.booking}
                        onChange={() => handleNotificationChange('booking')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <NotificationsIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Reminders"
                      secondary="Get parking reminders and alerts"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={notifications.reminders}
                        onChange={() => handleNotificationChange('reminders')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <SecurityIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Security Alerts"
                      secondary="Get notified about account security"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={notifications.security}
                        onChange={() => handleNotificationChange('security')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <NotificationsIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Support Updates"
                      secondary="Receive updates on support tickets"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={notifications.support}
                        onChange={() => handleNotificationChange('support')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <NotificationsIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Marketing Communications"
                      secondary="Receive offers and promotions"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={notifications.marketing}
                        onChange={() => handleNotificationChange('marketing')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <NotificationsIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Promotional Offers"
                      secondary="Get notified about special deals"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={notifications.promotions}
                        onChange={() => handleNotificationChange('promotions')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Privacy & Security */}
        {activeTab === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Privacy Settings
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <VisibilityIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Profile Visibility"
                      secondary="Control who can see your profile"
                    />
                    <ListItemSecondaryAction>
                      <FormControl size="small">
                        <Select
                          value={privacy.profileVisibility}
                          onChange={(e) => setPrivacy(prev => ({ ...prev, profileVisibility: e.target.value }))}
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value="public">Public</MenuItem>
                          <MenuItem value="friends">Friends Only</MenuItem>
                          <MenuItem value="private">Private</MenuItem>
                        </Select>
                      </FormControl>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <LocationIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Location Sharing"
                      secondary="Share your location for better parking suggestions"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={privacy.locationSharing}
                        onChange={() => handlePrivacyChange('locationSharing')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Activity Status"
                      secondary="Show when you're online"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={privacy.activityStatus}
                        onChange={() => handlePrivacyChange('activityStatus')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <StorageIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Data Analytics"
                      secondary="Help improve our service with usage data"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={privacy.dataAnalytics}
                        onChange={() => handlePrivacyChange('dataAnalytics')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
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
                        size="small"
                      >
                        Update
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
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
                        checked={security.twoFAEnabled}
                        onChange={() => handleSecurityChange('twoFAEnabled')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <VerifiedUserIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Biometric Authentication"
                      secondary="Use fingerprint or face ID"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={security.biometricAuth}
                        onChange={() => handleSecurityChange('biometricAuth')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <NotificationsIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Login Notifications"
                      secondary="Get notified of new login attempts"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={security.loginNotifications}
                        onChange={() => handleSecurityChange('loginNotifications')}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Parking Preferences */}
        {activeTab === 3 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Parking Preferences
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Search Radius (km)
                </Typography>
                <Slider
                  value={parkingPreferences.defaultRadius}
                  onChange={(e, value) => handleParkingPreferenceChange('defaultRadius', value)}
                  min={1}
                  max={20}
                  marks={[
                    { value: 1, label: '1km' },
                    { value: 10, label: '10km' },
                    { value: 20, label: '20km' }
                  ]}
                  valueLabelDisplay="auto"
                />
                
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                  Maximum Price (₹/hour)
                </Typography>
                <Slider
                  value={parkingPreferences.maxPrice}
                  onChange={(e, value) => handleParkingPreferenceChange('maxPrice', value)}
                  min={10}
                  max={200}
                  marks={[
                    { value: 10, label: '₹10' },
                    { value: 100, label: '₹100' },
                    { value: 200, label: '₹200' }
                  ]}
                  valueLabelDisplay="auto"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <ParkingIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Auto-Book Available Spots"
                      secondary="Automatically book spots when available"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={parkingPreferences.autoBook}
                        onChange={() => handleParkingPreferenceChange('autoBook', !parkingPreferences.autoBook)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CarIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Electric Vehicle Charging"
                      secondary="Prefer spots with EV charging"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={parkingPreferences.electricCharging}
                        onChange={() => handleParkingPreferenceChange('electricCharging', !parkingPreferences.electricCharging)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AccessibilityIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Disabled Access"
                      secondary="Prefer accessible parking spots"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={parkingPreferences.disabledAccess}
                        onChange={() => handleParkingPreferenceChange('disabledAccess', !parkingPreferences.disabledAccess)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Payment Settings */}
        {activeTab === 4 && (
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
                    primary={`${method.brand} **** **** **** ${method.last4}`}
                    secondary={method.default ? 'Default' : ''}
                  />
                  <ListItemSecondaryAction>
                    {!method.default && (
                      <Button
                        size="small"
                        onClick={() => handleSetDefaultPayment(method.id)}
                        sx={{ mr: 1 }}
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
        )}

        {/* Accessibility Settings */}
        {activeTab === 5 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Accessibility Settings
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      {accessibility.theme === 'dark' ? <DarkModeIcon /> : <LightModeIcon />}
                    </ListItemIcon>
                    <ListItemText
                      primary="Theme"
                      secondary="Choose your preferred theme"
                    />
                    <ListItemSecondaryAction>
                      <FormControl size="small">
                        <Select
                          value={accessibility.theme}
                          onChange={(e) => handleAccessibilityChange('theme', e.target.value)}
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value="light">Light</MenuItem>
                          <MenuItem value="dark">Dark</MenuItem>
                          <MenuItem value="auto">Auto</MenuItem>
                        </Select>
                      </FormControl>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TextFieldsIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Font Size"
                      secondary="Adjust text size for better readability"
                    />
                    <ListItemSecondaryAction>
                      <FormControl size="small">
                        <Select
                          value={accessibility.fontSize}
                          onChange={(e) => handleAccessibilityChange('fontSize', e.target.value)}
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value="small">Small</MenuItem>
                          <MenuItem value="medium">Medium</MenuItem>
                          <MenuItem value="large">Large</MenuItem>
                          <MenuItem value="extra-large">Extra Large</MenuItem>
                        </Select>
                      </FormControl>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <AccessibilityIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="High Contrast"
                      secondary="Increase contrast for better visibility"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={accessibility.highContrast}
                        onChange={() => handleAccessibilityChange('highContrast', !accessibility.highContrast)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <SpeedIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Reduce Motion"
                      secondary="Minimize animations and transitions"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={accessibility.reduceMotion}
                        onChange={() => handleAccessibilityChange('reduceMotion', !accessibility.reduceMotion)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <VolumeIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Screen Reader Support"
                      secondary="Enable screen reader compatibility"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={accessibility.screenReader}
                        onChange={() => handleAccessibilityChange('screenReader', !accessibility.screenReader)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Data & Storage */}
        {activeTab === 6 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Data Management
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <DownloadIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Export My Data"
                      secondary="Download a copy of your data"
                    />
                    <ListItemSecondaryAction>
                      <Button
                        onClick={handleDataExport}
                        variant="outlined"
                        size="small"
                      >
                        Export
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <HistoryIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Clear Search History"
                      secondary="Remove all saved searches"
                    />
                    <ListItemSecondaryAction>
                      <Button
                        onClick={() => handleConfirmAction('clearHistory')}
                        variant="outlined"
                        size="small"
                        color="warning"
                      >
                        Clear
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <StorageIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Clear Cache"
                      secondary="Free up storage space"
                    />
                    <ListItemSecondaryAction>
                      <Button
                        onClick={() => handleConfirmAction('clearCache')}
                        variant="outlined"
                        size="small"
                        color="warning"
                      >
                        Clear
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom color="error">
                  Danger Zone
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <BlockIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Deactivate Account"
                      secondary="Temporarily disable your account"
                    />
                    <ListItemSecondaryAction>
                      <Button
                        onClick={() => handleConfirmAction('deactivate')}
                        variant="outlined"
                        size="small"
                        color="warning"
                      >
                        Deactivate
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <DeleteForeverIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Delete Account"
                      secondary="Permanently delete your account and data"
                    />
                    <ListItemSecondaryAction>
                      <Button
                        onClick={() => handleConfirmAction('delete')}
                        variant="outlined"
                        size="small"
                        color="error"
                      >
                        Delete
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Dialogs */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {dialogType === 'email' && 'Update Email'}
            {dialogType === 'phone' && 'Update Phone Number'}
            {dialogType === 'password' && 'Change Password'}
            {dialogType === 'payment' && 'Add Payment Method'}
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
                  label="Current Password"
                  type="password"
                  fullWidth
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                />
                <TextField
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
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveChanges} variant="contained" color="primary">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
          <DialogTitle>Confirm Action</DialogTitle>
          <DialogContent>
            <Typography>
              {confirmAction === 'clearHistory' && 'Are you sure you want to clear your search history? This action cannot be undone.'}
              {confirmAction === 'clearCache' && 'Are you sure you want to clear the app cache? This will free up storage space.'}
              {confirmAction === 'deactivate' && 'Are you sure you want to deactivate your account? You can reactivate it later by logging in.'}
              {confirmAction === 'delete' && 'Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be lost.'}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialog(false)}>Cancel</Button>
            <Button 
              onClick={() => {
                if (confirmAction === 'delete') {
                  handleAccountDeletion();
                } else {
                  setSuccess('Action completed successfully');
                  setOpenSnackbar(true);
                  setConfirmDialog(false);
                }
              }} 
              variant="contained" 
              color={confirmAction === 'delete' ? 'error' : 'primary'}
            >
              Confirm
            </Button>
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