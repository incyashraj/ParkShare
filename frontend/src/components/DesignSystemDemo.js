import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Chip,
  Avatar,
  Badge,
  IconButton,
  Paper,
  Divider,
  Switch,
  Slider,
  LinearProgress,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Tabs,
  Tab,
  Rating,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Fab,
} from '@mui/material';
import {
  Home,
  Search,
  Person,
  Settings,
  Notifications,
  Favorite,
  Star,
  Add,
  Remove,
  PlayArrow,
  DirectionsCar,
  LocationOn,
  AccessTime,
  AttachMoney,
  Brightness4,
  VolumeUp,
  VolumeDown,
  Pause,
  Stop,
  ExpandMore,
  Check,
  Close,
  Info,
  Warning,
  Error,
  Success,
  Bookmark,
  BookmarkBorder,
  Share,
  Phone,
  Email,
  CalendarToday,
  Cancel,
  Speed,
  WifiTethering,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';

function DesignSystemDemo() {
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [rating, setRating] = useState(4);
  const [sliderValue, setSliderValue] = useState(50);
  const [switchChecked, setSwitchChecked] = useState(false);
  const [radioValue, setRadioValue] = useState('option1');
  const [selectValue, setSelectValue] = useState('');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDialogOpen = () => setDialogOpen(true);
  const handleDialogClose = () => setDialogOpen(false);
  const handleSnackbarOpen = () => setSnackbarOpen(true);
  const handleSnackbarClose = () => setSnackbarOpen(false);

  return (
    <Box className="airbnb-app-container">
      <Box className="airbnb-container airbnb-p-5">
        {/* Header */}
        <Box className="airbnb-mb-5">
          <Typography variant="h1" className="airbnb-text-center airbnb-mb-2">
            Airbnb Design System
          </Typography>
          <Typography variant="body1" className="airbnb-text-center airbnb-text-secondary">
            Modern, clean, and user-friendly design inspired by Airbnb's interface
          </Typography>
        </Box>

        {/* Color Palette */}
        <Card className="airbnb-card airbnb-mb-5">
          <CardContent>
            <Typography variant="h2" className="airbnb-mb-4">Color Palette</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" className="airbnb-mb-3">Primary Colors</Typography>
                <Box className="airbnb-grid airbnb-grid-cols-2 airbnb-gap-3">
                  <Box className="airbnb-bg-red airbnb-p-4 airbnb-rounded-lg airbnb-text-center">
                    <Typography variant="body2" className="airbnb-text-inverse">Airbnb Red</Typography>
                    <Typography variant="caption" className="airbnb-text-inverse">#FF385C</Typography>
                  </Box>
                  <Box className="airbnb-bg-success airbnb-p-4 airbnb-rounded-lg airbnb-text-center">
                    <Typography variant="body2" className="airbnb-text-inverse">Success Green</Typography>
                    <Typography variant="caption" className="airbnb-text-inverse">#00A699</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" className="airbnb-mb-3">Neutral Colors</Typography>
                <Box className="airbnb-grid airbnb-grid-cols-2 airbnb-gap-3">
                  <Box className="airbnb-bg-primary airbnb-p-4 airbnb-rounded-lg airbnb-text-center">
                    <Typography variant="body2">Airbnb Black</Typography>
                    <Typography variant="caption">#222222</Typography>
                  </Box>
                  <Box className="airbnb-bg-secondary airbnb-p-4 airbnb-rounded-lg airbnb-text-center">
                    <Typography variant="body2">Light Gray</Typography>
                    <Typography variant="caption">#F7F7F7</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Typography */}
        <Card className="airbnb-card airbnb-mb-5">
          <CardContent>
            <Typography variant="h2" className="airbnb-mb-4">Typography</Typography>
            <Box className="airbnb-flex airbnb-flex-col airbnb-gap-3">
              <Typography variant="h1">Heading 1 - Airbnb Style</Typography>
              <Typography variant="h2">Heading 2 - Clean & Modern</Typography>
              <Typography variant="h3">Heading 3 - Professional</Typography>
              <Typography variant="h4">Heading 4 - Balanced</Typography>
              <Typography variant="h5">Heading 5 - Subtle</Typography>
              <Typography variant="h6">Heading 6 - Minimal</Typography>
              <Typography variant="body1">
                Body 1 - This is the main body text used throughout the application. 
                It provides excellent readability and maintains the clean aesthetic.
              </Typography>
              <Typography variant="body2" className="airbnb-text-secondary">
                Body 2 - Secondary text for supporting information and descriptions.
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Buttons */}
        <Card className="airbnb-card airbnb-mb-5">
          <CardContent>
            <Typography variant="h2" className="airbnb-mb-4">Buttons</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" className="airbnb-mb-3">Button Variants</Typography>
                <Box className="airbnb-flex airbnb-flex-col airbnb-gap-3">
                  <Button variant="contained" className="airbnb-btn-primary">
                    Primary Button
                  </Button>
                  <Button variant="outlined" className="airbnb-btn-secondary">
                    Secondary Button
                  </Button>
                  <Button variant="text" className="airbnb-btn-ghost">
                    Text Button
                  </Button>
                  <Button variant="contained" className="airbnb-btn-success">
                    Success Button
                  </Button>
                  <Button variant="contained" className="airbnb-btn-danger">
                    Danger Button
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" className="airbnb-mb-3">Button Sizes</Typography>
                <Box className="airbnb-flex airbnb-flex-col airbnb-gap-3">
                  <Button variant="contained" size="small" className="airbnb-btn-sm">
                    Small Button
                  </Button>
                  <Button variant="contained" size="medium">
                    Medium Button
                  </Button>
                  <Button variant="contained" size="large" className="airbnb-btn-lg">
                    Large Button
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Form Elements */}
        <Card className="airbnb-card airbnb-mb-5">
          <CardContent>
            <Typography variant="h2" className="airbnb-mb-4">Form Elements</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" className="airbnb-mb-3">Input Fields</Typography>
                <Box className="airbnb-flex airbnb-flex-col airbnb-gap-3">
                  <TextField
                    label="Standard Input"
                    variant="outlined"
                    fullWidth
                    className="airbnb-form-input"
                  />
                  <TextField
                    label="Focused Input"
                    variant="outlined"
                    fullWidth
                    focused
                    className="airbnb-form-input"
                  />
                  <TextField
                    label="Disabled Input"
                    variant="outlined"
                    fullWidth
                    disabled
                    className="airbnb-form-input"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" className="airbnb-mb-3">Select & Checkboxes</Typography>
                <Box className="airbnb-flex airbnb-flex-col airbnb-gap-3">
                  <FormControl fullWidth>
                    <InputLabel>Select Option</InputLabel>
                    <Select
                      value={selectValue}
                      label="Select Option"
                      onChange={(e) => setSelectValue(e.target.value)}
                    >
                      <MenuItem value="option1">Option 1</MenuItem>
                      <MenuItem value="option2">Option 2</MenuItem>
                      <MenuItem value="option3">Option 3</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControlLabel
                    control={<Checkbox />}
                    label="Checkbox Option"
                  />
                  <RadioGroup
                    value={radioValue}
                    onChange={(e) => setRadioValue(e.target.value)}
                  >
                    <FormControlLabel value="option1" control={<Radio />} label="Radio Option 1" />
                    <FormControlLabel value="option2" control={<Radio />} label="Radio Option 2" />
                  </RadioGroup>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Cards & Layout */}
        <Card className="airbnb-card airbnb-mb-5">
          <CardContent>
            <Typography variant="h2" className="airbnb-mb-4">Cards & Layout</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card className="airbnb-card airbnb-parking-spot-card">
                  <CardContent>
                    <Typography variant="h6" className="airbnb-mb-2">Parking Spot Card</Typography>
                    <Typography variant="body2" className="airbnb-text-secondary airbnb-mb-3">
                      Modern card design for parking spots
                    </Typography>
                    <Box className="airbnb-flex airbnb-justify-between airbnb-items-center">
                      <Chip label="Available" className="airbnb-status-available" />
                      <Typography variant="h6" className="airbnb-price-display">
                        $15/hr
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card className="airbnb-card airbnb-card-elevated">
                  <CardContent>
                    <Typography variant="h6" className="airbnb-mb-2">Elevated Card</Typography>
                    <Typography variant="body2" className="airbnb-text-secondary">
                      Card with enhanced shadow and hover effects
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper className="airbnb-p-4 airbnb-rounded-xl airbnb-bg-secondary">
                  <Typography variant="h6" className="airbnb-mb-2">Paper Component</Typography>
                  <Typography variant="body2" className="airbnb-text-secondary">
                    Simple paper component for content areas
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Interactive Components */}
        <Card className="airbnb-card airbnb-mb-5">
          <CardContent>
            <Typography variant="h2" className="airbnb-mb-4">Interactive Components</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" className="airbnb-mb-3">Sliders & Progress</Typography>
                <Box className="airbnb-flex airbnb-flex-col airbnb-gap-3">
                  <Box>
                    <Typography variant="body2" className="airbnb-mb-1">Slider</Typography>
                    <Slider
                      value={sliderValue}
                      onChange={(e, newValue) => setSliderValue(newValue)}
                      className="airbnb-mb-2"
                    />
                    <Typography variant="caption">{sliderValue}%</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" className="airbnb-mb-1">Linear Progress</Typography>
                    <LinearProgress variant="determinate" value={75} />
                  </Box>
                  <Box className="airbnb-flex airbnb-items-center airbnb-gap-3">
                    <Typography variant="body2">Circular Progress</Typography>
                    <CircularProgress size={24} />
                    <CircularProgress size={32} variant="determinate" value={60} />
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" className="airbnb-mb-3">Switches & Ratings</Typography>
                <Box className="airbnb-flex airbnb-flex-col airbnb-gap-3">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={switchChecked}
                        onChange={(e) => setSwitchChecked(e.target.checked)}
                      />
                    }
                    label="Toggle Switch"
                  />
                  <Box>
                    <Typography variant="body2" className="airbnb-mb-1">Rating</Typography>
                    <Rating
                      value={rating}
                      onChange={(e, newValue) => setRating(newValue)}
                      className="airbnb-rating-stars"
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Navigation & Tabs */}
        <Card className="airbnb-card airbnb-mb-5">
          <CardContent>
            <Typography variant="h2" className="airbnb-mb-4">Navigation & Tabs</Typography>
            <Box className="airbnb-mb-4">
              <Tabs value={tabValue} onChange={handleTabChange} className="airbnb-mb-3">
                <Tab label="Overview" />
                <Tab label="Details" />
                <Tab label="Settings" />
              </Tabs>
              <Box className="airbnb-p-3 airbnb-bg-secondary airbnb-rounded-lg">
                {tabValue === 0 && (
                  <Typography variant="body2">Overview content goes here</Typography>
                )}
                {tabValue === 1 && (
                  <Typography variant="body2">Details content goes here</Typography>
                )}
                {tabValue === 2 && (
                  <Typography variant="body2">Settings content goes here</Typography>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Icons & Avatars */}
        <Card className="airbnb-card airbnb-mb-5">
          <CardContent>
            <Typography variant="h2" className="airbnb-mb-4">Icons & Avatars</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" className="airbnb-mb-3">Navigation Icons</Typography>
                <Box className="airbnb-flex airbnb-flex-wrap airbnb-gap-2">
                  <IconButton><Home /></IconButton>
                  <IconButton><Search /></IconButton>
                  <IconButton><Person /></IconButton>
                  <IconButton><Settings /></IconButton>
                  <IconButton><Notifications /></IconButton>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" className="airbnb-mb-3">Action Icons</Typography>
                <Box className="airbnb-flex airbnb-flex-wrap airbnb-gap-2">
                  <IconButton><Favorite /></IconButton>
                  <IconButton><Star /></IconButton>
                  <IconButton><Add /></IconButton>
                  <IconButton><Remove /></IconButton>
                  <IconButton><PlayArrow /></IconButton>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" className="airbnb-mb-3">Parking Icons</Typography>
                <Box className="airbnb-flex airbnb-flex-wrap airbnb-gap-2">
                  <IconButton><DirectionsCar /></IconButton>
                  <IconButton><LocationOn /></IconButton>
                  <IconButton><AccessTime /></IconButton>
                  <IconButton><AttachMoney /></IconButton>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" className="airbnb-mb-3">Avatars & Badges</Typography>
                <Box className="airbnb-flex airbnb-flex-wrap airbnb-gap-3 airbnb-items-center">
                  <Badge badgeContent={4} color="primary">
                    <Avatar>U</Avatar>
                  </Badge>
                  <Badge badgeContent={99} color="error">
                    <Avatar>J</Avatar>
                  </Badge>
                  <Badge badgeContent="New" color="success">
                    <Avatar>M</Avatar>
                  </Badge>
                  <Avatar>P</Avatar>
                  <Avatar>K</Avatar>
                  <Avatar>L</Avatar>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Status Indicators */}
        <Card className="airbnb-card airbnb-mb-5">
          <CardContent>
            <Typography variant="h2" className="airbnb-mb-4">Status Indicators</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" className="airbnb-mb-3">Status Chips</Typography>
                <Box className="airbnb-flex airbnb-flex-wrap airbnb-gap-2">
                  <Chip label="Available" className="airbnb-status-available" />
                  <Chip label="Unavailable" className="airbnb-status-unavailable" />
                  <Chip label="Verified" color="success" />
                  <Chip label="Premium" color="warning" />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" className="airbnb-mb-3">Live Status</Typography>
                <Box className="airbnb-flex airbnb-flex-wrap airbnb-gap-2">
                  <Chip label="Live" className="airbnb-live-status" />
                  <Chip label="Online" color="success" />
                  <Chip label="Offline" color="default" />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Alerts & Notifications */}
        <Card className="airbnb-card airbnb-mb-5">
          <CardContent>
            <Typography variant="h2" className="airbnb-mb-4">Alerts & Notifications</Typography>
            <Box className="airbnb-flex airbnb-flex-col airbnb-gap-3">
              <Alert severity="success" onClose={() => {}}>
                Success alert - Your booking has been confirmed!
              </Alert>
              <Alert severity="info" onClose={() => {}}>
                Info alert - New parking spots available in your area.
              </Alert>
              <Alert severity="warning" onClose={() => {}}>
                Warning alert - Please complete your profile verification.
              </Alert>
              <Alert severity="error" onClose={() => {}}>
                Error alert - Unable to process payment. Please try again.
              </Alert>
            </Box>
          </CardContent>
        </Card>

        {/* Modals & Dialogs */}
        <Card className="airbnb-card airbnb-mb-5">
          <CardContent>
            <Typography variant="h2" className="airbnb-mb-4">Modals & Dialogs</Typography>
            <Box className="airbnb-flex airbnb-gap-3">
              <Button variant="contained" onClick={handleDialogOpen}>
                Open Dialog
              </Button>
              <Button variant="outlined" onClick={handleSnackbarOpen}>
                Show Snackbar
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            backgroundColor: '#FF385C',
            '&:hover': {
              backgroundColor: '#E31C5F',
            },
          }}
        >
          <Add />
        </Fab>

        {/* Footer */}
        <Box className="airbnb-text-center airbnb-mt-5">
          <Typography variant="body2" className="airbnb-text-secondary">
            Airbnb Design System v3.0 - Modern, Clean & User-Friendly
          </Typography>
        </Box>
      </Box>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Airbnb Style Dialog</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            This is an example of an Airbnb-style dialog with clean design and proper spacing.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} className="airbnb-btn-ghost">
            Cancel
          </Button>
          <Button onClick={handleDialogClose} variant="contained" className="airbnb-btn-primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message="This is an Airbnb-style notification"
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={handleSnackbarClose}
          >
            <Close fontSize="small" />
          </IconButton>
        }
      />
    </Box>
  );
}

export default DesignSystemDemo; 