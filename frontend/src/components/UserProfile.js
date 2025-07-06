import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Avatar,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  Rating,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Badge,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Message as MessageIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  VerifiedUser as VerifiedIcon,
  LocalParking as ParkingIcon,
  CalendarToday as CalendarIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Report as ReportIcon,
  Block as BlockIcon,
  Edit as EditIcon,
  Share as ShareIcon,
  BookOnline as BookOnlineIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Language as LanguageIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const UserProfile = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { currentUser } = useAuth();
  
  const [userProfile, setUserProfile] = useState(null);
  const [userSpots, setUserSpots] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (userId) {
      loadUserProfile();
      loadUserSpots();
      loadUserReviews();
    }
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/users/${userId}/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.uid}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.profile);
      } else {
        setError('Failed to load user profile');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const loadUserSpots = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/spots?hostId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.uid}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserSpots(data.spots || []);
      }
    } catch (error) {
      console.error('Error loading user spots:', error);
    }
  };

  const loadUserReviews = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/reviews?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.uid}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Error loading user reviews:', error);
    }
  };

  const handleSendMessage = () => {
    // Check if user is blocked
    if (userProfile.blocked) {
      setError('Cannot send message to blocked user. Unblock them in your profile to send messages.');
      return;
    }
    
    // Check if current user is blocked by this user
    if (currentUser?.blockedUsers && currentUser.blockedUsers.includes(userId)) {
      setError('Cannot send message - you have been blocked by this user.');
      return;
    }
    
    navigate(`/messages?recipient=${userId}&subject=Hello from ParkShare`);
  };

  const handleBlockUser = async () => {
    try {
      const isCurrentlyBlocked = userProfile.blocked;
      const response = await fetch(`http://localhost:3001/api/users/${userId}/block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.uid}`
        },
        body: JSON.stringify({ blocked: !isCurrentlyBlocked })
      });
      
      if (response.ok) {
        setUserProfile(prev => ({ ...prev, blocked: !isCurrentlyBlocked }));
        console.log(`User ${isCurrentlyBlocked ? 'unblocked' : 'blocked'} successfully`);
        
        // Show success message
        setSuccessMessage(`User ${isCurrentlyBlocked ? 'unblocked' : 'blocked'} successfully`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update block status');
      }
    } catch (error) {
      console.error('Error updating block status:', error);
      setError('Failed to update block status');
    }
  };

  const handleReportUser = async () => {
    if (!reportReason.trim()) return;
    
    setSubmitting(true);
    try {
      const response = await fetch(`http://localhost:3001/api/users/${userId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.uid}`
        },
        body: JSON.stringify({
          reason: reportReason,
          description: reportDescription
        })
      });
      
      if (response.ok) {
        setShowReportDialog(false);
        setReportReason('');
        setReportDescription('');
        console.log('User reported successfully');
      }
    } catch (error) {
      console.error('Error reporting user:', error);
      setError('Failed to report user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleShareProfile = () => {
    const profileUrl = `${window.location.origin}/user-profile/${userId}`;
    if (navigator.share) {
      navigator.share({
        title: `${userProfile?.username}'s Profile`,
        text: `Check out ${userProfile?.username}'s profile on ParkShare!`,
        url: profileUrl
      });
    } else {
      navigator.clipboard.writeText(profileUrl);
      // Show success message
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !userProfile) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'User not found'}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }

  const isOwnProfile = currentUser?.uid === userId;
  const averageRating = userReviews.length > 0 
    ? userReviews.reduce((sum, review) => sum + review.rating, 0) / userReviews.length 
    : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Success Message */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ color: 'primary.main' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight="bold" sx={{ flexGrow: 1 }}>
          {userProfile.username}'s Profile
        </Typography>
        {!isOwnProfile && (
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<ShareIcon />}
              onClick={handleShareProfile}
            >
              Share
            </Button>
            <Button
              variant="contained"
              startIcon={<MessageIcon />}
              onClick={handleSendMessage}
            >
              Message
            </Button>
          </Stack>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                userProfile.verified ? (
                  <VerifiedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                ) : null
              }
            >
              <Avatar
                src={userProfile.avatarUrl}
                sx={{ 
                  width: 120, 
                  height: 120, 
                  bgcolor: 'primary.main',
                  fontSize: '3rem',
                  mx: 'auto',
                  mb: 2
                }}
              >
                {userProfile.username?.[0]?.toUpperCase() || 'U'}
              </Avatar>
            </Badge>
            
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {userProfile.username}
            </Typography>
            
            {userProfile.verified && (
              <Chip
                icon={<VerifiedIcon />}
                label="Verified Host"
                color="primary"
                sx={{ mb: 2 }}
              />
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <Rating value={averageRating} readOnly precision={0.5} />
              <Typography variant="body2" sx={{ ml: 1 }}>
                ({userReviews.length} reviews)
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Member since {new Date(userProfile.createdAt).toLocaleDateString()}
            </Typography>
            
            {!isOwnProfile && (
              <Stack spacing={1}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<MessageIcon />}
                  onClick={handleSendMessage}
                >
                  Send Message
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<BlockIcon />}
                  onClick={handleBlockUser}
                  color={userProfile.blocked ? "success" : "warning"}
                >
                  {userProfile.blocked ? 'Unblock User' : 'Block User'}
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<ReportIcon />}
                  onClick={() => setShowReportDialog(true)}
                  color="warning"
                >
                  Report User
                </Button>
              </Stack>
            )}
          </Paper>
        </Grid>

        {/* Profile Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              About {userProfile.username}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {userProfile.email}
                  </Typography>
                </Box>
              </Grid>
              
              {userProfile.phone && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {userProfile.phone}
                    </Typography>
                  </Box>
                </Grid>
              )}
              
              {userProfile.location && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {userProfile.location}
                    </Typography>
                  </Box>
                </Grid>
              )}
              
              {userProfile.languages && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LanguageIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {userProfile.languages.join(', ')}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
            
            {userProfile.bio && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1">
                  {userProfile.bio}
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Parking Spots */}
          <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Parking Spots ({userSpots.length})
              </Typography>
              <Chip icon={<ParkingIcon />} label="Host" color="primary" />
            </Box>
            
            {userSpots.length === 0 ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No parking spots listed yet
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {userSpots.slice(0, 3).map((spot) => (
                  <Grid item xs={12} sm={6} md={4} key={spot._id}>
                    <Card sx={{ height: '100%' }}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={spot.images?.[0] || '/default-parking.jpg'}
                        alt={spot.title}
                      />
                      <CardContent>
                        <Typography variant="h6" noWrap>
                          {spot.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {spot.location}
                        </Typography>
                        <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                          ₹{spot.price}/hour
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          fullWidth
                          sx={{ mt: 1 }}
                          onClick={() => navigate(`/spot/${spot._id}`)}
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>

          {/* Reviews */}
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Reviews ({userReviews.length})
            </Typography>
            
            {userReviews.length === 0 ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No reviews yet
              </Typography>
            ) : (
              <List>
                {userReviews.slice(0, 5).map((review) => (
                  <ListItem key={review._id} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar src={review.reviewer?.avatarUrl}>
                        {review.reviewer?.username?.[0]?.toUpperCase() || 'U'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2">
                            {review.reviewer?.username || 'Anonymous'}
                          </Typography>
                          <Rating value={review.rating} readOnly size="small" />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {review.comment}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Report Dialog */}
      <Dialog
        open={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Report User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Reason"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              fullWidth
            >
              <option value="">Select a reason</option>
              <option value="Inappropriate behavior">Inappropriate behavior</option>
              <option value="Spam">Spam</option>
              <option value="Fake profile">Fake profile</option>
              <option value="Harassment">Harassment</option>
              <option value="Other">Other</option>
            </TextField>
            <TextField
              multiline
              rows={4}
              label="Description"
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Please provide details about the issue..."
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReportDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleReportUser}
            variant="contained"
            color="warning"
            disabled={!reportReason.trim() || submitting}
          >
            {submitting ? <CircularProgress size={20} /> : 'Report User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserProfile; 