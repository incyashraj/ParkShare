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
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

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
  const [displayNameInput, setDisplayNameInput] = useState('');

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

  // Add a loading state for settings fetch
  const [settingsLoading, setSettingsLoading] = useState(true);

  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(null);

  // Add error/success state for profile updates
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const { t } = useTranslation();

  // Fetch backend profile info
  const fetchProfile = async (uid) => {
    try {
      const res = await axios.get(`http://localhost:3001/api/users/${uid}/profile`, {
        headers: { Authorization: `Bearer ${uid}` }
      });
      setProfile(res.data.profile);
    } catch (e) {
      console.error('Failed to fetch profile:', e);
      setProfile(null);
    }
  };

  // Fetch all settings from backend
  const fetchSettings = async (uid) => {
    setSettingsLoading(true);
    try {
      const res = await axios.get(`http://localhost:3001/users/${uid}/settings`);
      setSettings(res.data);
    } catch (e) {
      setSettings(null);
    }
    setSettingsLoading(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setUser(user);
      setLoading(false);
      if (user) {
        fetchProfile(user.uid);
        fetchSettings(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (openDialog) {
      if (dialogType === 'email') setEmailInput(profile?.email || '');
      if (dialogType === 'phone') setPhoneInput(profile?.phone || '');
      if (dialogType === 'displayName') setDisplayNameInput(profile?.fullName || '');
      if (dialogType === 'password') {
        setPasswordInput('');
        setConfirmPasswordInput('');
        setCurrentPassword('');
      }
      if (dialogType === 'payment') setNewPaymentInput('');
    }
  }, [openDialog, dialogType, profile]);

  // Re-fetch profile/settings after dialog closes (after update)
  useEffect(() => {
    if (!openDialog && user) {
      fetchProfile(user.uid);
      fetchSettings(user.uid);
    }
  }, [openDialog, user]);

  // Save handlers for each settings group
  const saveSettings = async (group, data) => {
    if (!user) return;
    let url = '';
    switch (group) {
      case 'privacy': url = `/users/${user.uid}/settings/privacy`; break;
      case 'security': url = `/users/${user.uid}/settings/security`; break;
      case 'parking': url = `/users/${user.uid}/settings/parking-preferences`; break;
      case 'accessibility': url = `/users/${user.uid}/settings/accessibility`; break;
      case 'regional': url = `/users/${user.uid}/settings/regional`; break;
      case 'notifications': url = `/users/${user.uid}/settings/notifications`; break;
      default: return;
    }
    try {
      await axios.put(`http://localhost:3001${url}`, data);
      setSuccess('Settings updated successfully');
      await fetchSettings(user.uid);
      await fetchProfile(user.uid);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update settings');
    }
    setOpenSnackbar(true);
  };

  // Account info update handler
  const handleSaveChanges = async () => {
    setProfileError('');
    setProfileSuccess('');
    try {
      if (dialogType === 'email') {
        if (!emailInput || !emailInput.includes('@')) throw new Error('Enter a valid email');
        await axios.put(`http://localhost:3001/api/users/${user.uid}/profile`, { email: emailInput });
        setProfileSuccess('Email updated successfully');
      } else if (dialogType === 'phone') {
        if (!phoneInput) throw new Error('Enter a valid phone number');
        await axios.put(`http://localhost:3001/api/users/${user.uid}/profile`, { phone: phoneInput });
        setProfileSuccess('Phone number updated successfully');
      } else if (dialogType === 'displayName') {
        if (!displayNameInput) throw new Error('Enter a valid name');
        await axios.put(`http://localhost:3001/api/users/${user.uid}/profile`, { displayName: displayNameInput });
        setProfileSuccess('Display name updated successfully');
      } else if (dialogType === 'password') {
        if (!currentPassword) throw new Error('Current password is required');
        if (!passwordInput || passwordInput.length < 6) throw new Error('Password must be at least 6 characters');
        if (passwordInput !== confirmPasswordInput) throw new Error('Passwords do not match');
        await user.updatePassword(passwordInput);
      } else if (dialogType === 'payment') {
        if (!newPaymentInput || newPaymentInput.length < 4) throw new Error('Enter last 4 digits of card');
        // Payment method logic here (implement backend sync if needed)
      }
      // Always re-fetch profile after update
      await fetchProfile(user.uid);
      setOpenDialog(false);
    } catch (e) {
      setProfileError(e.response?.data?.message || e.message || 'Failed to update profile');
    }
    setOpenSnackbar(true);
  };

  // All handleXChange functions now update backend and re-fetch settings
  const handleNotificationChange = (type) => {
    const updated = { ...settings?.notifications, [type]: !settings?.notifications?.[type] };
    saveSettings('notifications', updated);
  };
  const handlePrivacyChange = (type) => {
    const updated = { ...settings?.privacySettings, [type]: !settings?.privacySettings?.[type] };
    saveSettings('privacy', updated);
  };
  const handleAccessibilityChange = (type, value) => {
    const updated = { ...settings?.accessibilitySettings, [type]: value };
    saveSettings('accessibility', updated);
  };
  const handleParkingPreferenceChange = (type, value) => {
    const updated = { ...settings?.parkingPreferences, [type]: value };
    saveSettings('parking', updated);
  };
  const handleSecurityChange = (type) => {
    const updated = { ...settings?.securitySettings, [type]: !settings?.securitySettings?.[type] };
    saveSettings('security', updated);
  };
  const handleLanguageChange = (newLanguage) => {
    i18n.changeLanguage(newLanguage);
    saveSettings('regional', { ...settings?.regionalSettings, language: newLanguage });
  };
  const handleCurrencyChange = (newCurrency) => {
    saveSettings('regional', { ...settings?.regionalSettings, currency: newCurrency });
  };
  const handleTimezoneChange = (newTimezone) => {
    saveSettings('regional', { ...settings?.regionalSettings, timezone: newTimezone });
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

  if (loading || settingsLoading) {
    return (
      <Container maxWidth="md">
        <Box py={4}>
          <LinearProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading settings...</Typography>
        </Box>
      </Container>
    );
  }

  console.log('Profile object:', profile);

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Box display="flex" alignItems="center" mb={3}>
          <SettingsIcon sx={{ mr: 2, fontSize: 32 }} color="primary" />
          <Typography variant="h4" color="primary">
            {t('Settings')}
          </Typography>
        </Box>

        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
          <Tab label={t('Account')} />
          <Tab label={t('Notifications')} />
          <Tab label={t('Privacy & Security')} />
          <Tab label={t('Parking Preferences')} />
          <Tab label={t('Payment')} />
          <Tab label={t('Accessibility')} />
          <Tab label={t('Data & Storage')} />
        </Tabs>

        {/* Account Settings */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {t('Profile Information')}
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={t('Display Name')}
                      secondary={profile?.fullName || t('Not set')}
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => handleOpenDialog('displayName')}>
                        <EditIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={t('Email')}
                      secondary={profile?.email || t('Not set')}
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
                      primary={t('Phone Number')}
                      secondary={profile?.phone || t('Not set')}
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => handleOpenDialog('phone')}>
                        <EditIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
                {/* Display error/success messages for profile updates */}
                {profileError && <Alert severity="error">{profileError}</Alert>}
                {profileSuccess && <Alert severity="success">{profileSuccess}</Alert>}
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {t('Regional Settings')}
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <LanguageIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={t('Language')}
                      secondary={settings?.regionalSettings?.language ? t(settings.regionalSettings.language === 'en' ? 'English' : settings.regionalSettings.language === 'hi' ? 'Hindi' : settings.regionalSettings.language === 'mr' ? 'Marathi' : settings.regionalSettings.language === 'gu' ? 'Gujarati' : settings.regionalSettings.language) : t('Not set')}
                    />
                    <ListItemSecondaryAction>
                      <FormControl size="small">
                        <Select
                          value={settings?.regionalSettings?.language || ''}
                          onChange={(e) => handleLanguageChange(e.target.value)}
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value="en">{t('English')}</MenuItem>
                          <MenuItem value="hi">{t('Hindi')}</MenuItem>
                          <MenuItem value="mr">{t('Marathi')}</MenuItem>
                          <MenuItem value="gu">{t('Gujarati')}</MenuItem>
                          <MenuItem value="es">{t('Spanish')}</MenuItem>
                          <MenuItem value="fr">{t('French')}</MenuItem>
                          <MenuItem value="zh">{t('Chinese')}</MenuItem>
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
                      secondary={settings?.regionalSettings?.currency === 'INR' ? 'Indian Rupee' : settings?.regionalSettings?.currency === 'USD' ? 'US Dollar' : settings?.regionalSettings?.currency === 'EUR' ? 'Euro' : settings?.regionalSettings?.currency || 'Not set'}
                    />
                    <ListItemSecondaryAction>
                      <FormControl size="small">
                        <Select
                          value={settings?.regionalSettings?.currency || ''}
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
                      secondary={settings?.regionalSettings?.timezone || 'Not set'}
                    />
                    <ListItemSecondaryAction>
                      <FormControl size="small">
                        <Select
                          value={settings?.regionalSettings?.timezone || ''}
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
                      primary={t('Email Notifications')}
                      secondary={t('Receive booking updates via email')}
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
                      primary={t('Push Notifications')}
                      secondary={t('Receive updates on your device')}
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
                      primary={t('Booking Updates')}
                      secondary={t('Get notified about booking status changes')}
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
                      primary={t('Reminders')}
                      secondary={t('Get parking reminders and alerts')}
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
                      primary={t('Security Alerts')}
                      secondary={t('Get notified about account security')}
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
                      primary={t('Support Updates')}
                      secondary={t('Receive updates on support tickets')}
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
                      primary={t('Marketing Communications')}
                      secondary={t('Receive offers and promotions')}
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
                      primary={t('Promotional Offers')}
                      secondary={t('Get notified about special deals')}
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
                      primary={t('Profile Visibility')}
                      secondary={t('Control who can see your profile')}
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
                      primary={t('Location Sharing')}
                      secondary={t('Share your location for better parking suggestions')}
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
                      primary={t('Activity Status')}
                      secondary={t('Show when you\'re online')}
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
                      primary={t('Data Analytics')}
                      secondary={t('Help improve our service with usage data')}
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
                      primary={t('Change Password')}
                      secondary={t('Update your password regularly')}
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
                      primary={t('Two-Factor Authentication')}
                      secondary={t('Add an extra layer of security')}
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
                      primary={t('Biometric Authentication')}
                      secondary={t('Use fingerprint or face ID')}
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
                      primary={t('Login Notifications')}
                      secondary={t('Get notified of new login attempts')}
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
                      primary={t('Auto-Book Available Spots')}
                      secondary={t('Automatically book spots when available')}
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
                      primary={t('Electric Vehicle Charging')}
                      secondary={t('Prefer spots with EV charging')}
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
                      primary={t('Disabled Access')}
                      secondary={t('Prefer accessible parking spots')}
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
                    secondary={method.default ? t('Default') : ''}
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
                      primary={t('Theme')}
                      secondary={t('Choose your preferred theme')}
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
                      primary={t('Font Size')}
                      secondary={t('Adjust text size for better readability')}
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
                      primary={t('High Contrast')}
                      secondary={t('Increase contrast for better visibility')}
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
                      primary={t('Reduce Motion')}
                      secondary={t('Minimize animations and transitions')}
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
                      primary={t('Screen Reader Support')}
                      secondary={t('Enable screen reader compatibility')}
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
                      primary={t('Export My Data')}
                      secondary={t('Download a copy of your data')}
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
                      primary={t('Clear Search History')}
                      secondary={t('Remove all saved searches')}
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
                      primary={t('Clear Cache')}
                      secondary={t('Free up storage space')}
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
                      primary={t('Deactivate Account')}
                      secondary={t('Temporarily disable your account')}
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
                      primary={t('Delete Account')}
                      secondary={t('Permanently delete your account and data')}
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
            {dialogType === 'email' && t('Update Email')}
            {dialogType === 'phone' && t('Update Phone Number')}
            {dialogType === 'password' && t('Change Password')}
            {dialogType === 'payment' && t('Add Payment Method')}
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
                helperText={t('For demo only. Enter last 4 digits.')}
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
          <DialogTitle>{t('Confirm Action')}</DialogTitle>
          <DialogContent>
            <Typography>
              {confirmAction === 'clearHistory' && t('Are you sure you want to clear your search history? This action cannot be undone.')}
              {confirmAction === 'clearCache' && t('Are you sure you want to clear the app cache? This will free up storage space.')}
              {confirmAction === 'deactivate' && t('Are you sure you want to deactivate your account? You can reactivate it later by logging in.')}
              {confirmAction === 'delete' && t('Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be lost.')}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialog(false)}>Cancel</Button>
            <Button 
              onClick={() => {
                if (confirmAction === 'delete') {
                  handleAccountDeletion();
                } else {
                  setSuccess(t('Action completed successfully'));
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