import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Rating,
  TextField,
  Button,
  Avatar,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import {
  Star as StarIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

const ReviewsAndRatings = ({ spotId, reviews = [], onAddReview, onUpdateReview, onDeleteReview, user }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: '',
    cleanliness: 5,
    security: 5,
    accessibility: 5,
    value: 5,
  });

  const handleOpenDialog = (review = null) => {
    if (review) {
      setEditingReview(review);
      setReviewForm({
        rating: review.rating,
        comment: review.comment,
        cleanliness: review.cleanliness || 5,
        security: review.security || 5,
        accessibility: review.accessibility || 5,
        value: review.value || 5,
      });
    } else {
      setEditingReview(null);
      setReviewForm({
        rating: 0,
        comment: '',
        cleanliness: 5,
        security: 5,
        accessibility: 5,
        value: 5,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingReview(null);
    setReviewForm({
      rating: 0,
      comment: '',
      cleanliness: 5,
      security: 5,
      accessibility: 5,
      value: 5,
    });
  };

  const handleSubmitReview = () => {
    if (reviewForm.rating === 0) {
      alert('Please select a rating');
      return;
    }

    const reviewData = {
      ...reviewForm,
      spotId,
      userId: user?.uid,
      userName: user?.displayName || user?.email,
      userPhoto: user?.photoURL,
      timestamp: new Date().toISOString(),
    };

    if (editingReview) {
      onUpdateReview(editingReview.id, reviewData);
    } else {
      onAddReview(reviewData);
    }
    handleCloseDialog();
  };

  const handleLikeReview = (reviewId) => {
    // Implement like functionality
    console.log('Liked review:', reviewId);
  };

  const handleDislikeReview = (reviewId) => {
    // Implement dislike functionality
    console.log('Disliked review:', reviewId);
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  return (
    <Box>
      {/* Overall Rating Summary */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {averageRating.toFixed(1)}
            </Typography>
            <Rating value={averageRating} readOnly precision={0.1} size="large" />
            <Typography variant="body2" color="text.secondary">
              Based on {reviews.length} reviews
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            disabled={!user}
          >
            Write Review
          </Button>
        </Box>

        {/* Rating Distribution */}
        <Grid container spacing={2}>
          {[5, 4, 3, 2, 1].map((rating) => (
            <Grid item xs={12} sm={6} md={2.4} key={rating}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">{rating} stars</Typography>
                <Box sx={{ flex: 1, bgcolor: 'grey.200', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                  <Box
                    sx={{
                      bgcolor: 'primary.main',
                      height: '100%',
                      width: `${(ratingDistribution[rating] / reviews.length) * 100}%`,
                    }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {ratingDistribution[rating]}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Reviews List */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Recent Reviews
        </Typography>
        {reviews.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No reviews yet. Be the first to review this parking spot!
            </Typography>
          </Paper>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={review.userPhoto} alt={review.userName}>
                      {review.userName?.[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {review.userName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {(() => {
                          try {
                            const reviewDate = new Date(review.timestamp);
                            if (isNaN(reviewDate.getTime())) {
                              return 'Date not available';
                            }
                            return format(reviewDate, 'MMM dd, yyyy');
                          } catch (error) {
                            return 'Date not available';
                          }
                        })()}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating value={review.rating} readOnly size="small" />
                    {user?.uid === review.userId && (
                      <>
                        <IconButton size="small" onClick={() => handleOpenDialog(review)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => onDeleteReview(review.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </Box>
                </Box>

                <Typography variant="body1" sx={{ mb: 2 }}>
                  {review.comment}
                </Typography>

                {/* Detailed Ratings */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  {review.cleanliness && (
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">
                        Cleanliness
                      </Typography>
                      <Rating value={review.cleanliness} readOnly size="small" />
                    </Grid>
                  )}
                  {review.security && (
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">
                        Security
                      </Typography>
                      <Rating value={review.security} readOnly size="small" />
                    </Grid>
                  )}
                  {review.accessibility && (
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">
                        Accessibility
                      </Typography>
                      <Rating value={review.accessibility} readOnly size="small" />
                    </Grid>
                  )}
                  {review.value && (
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">
                        Value
                      </Typography>
                      <Rating value={review.value} readOnly size="small" />
                    </Grid>
                  )}
                </Grid>

                {/* Review Actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton size="small" onClick={() => handleLikeReview(review.id)}>
                    <ThumbUpIcon fontSize="small" />
                  </IconButton>
                  <Typography variant="body2" color="text.secondary">
                    {review.likes || 0}
                  </Typography>
                  <IconButton size="small" onClick={() => handleDislikeReview(review.id)}>
                    <ThumbDownIcon fontSize="small" />
                  </IconButton>
                  <Typography variant="body2" color="text.secondary">
                    {review.dislikes || 0}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))
        )}
      </Box>

      {/* Review Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingReview ? 'Edit Review' : 'Write a Review'}
          <IconButton
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>Overall Rating *</Typography>
            <Rating
              value={reviewForm.rating}
              onChange={(e, newValue) => setReviewForm(prev => ({ ...prev, rating: newValue }))}
              size="large"
            />
          </Box>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your Review"
            placeholder="Share your experience with this parking spot..."
            value={reviewForm.comment}
            onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
            sx={{ mb: 3 }}
          />

          <Typography gutterBottom>Detailed Ratings</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" gutterBottom>Cleanliness</Typography>
              <Rating
                value={reviewForm.cleanliness}
                onChange={(e, newValue) => setReviewForm(prev => ({ ...prev, cleanliness: newValue }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" gutterBottom>Security</Typography>
              <Rating
                value={reviewForm.security}
                onChange={(e, newValue) => setReviewForm(prev => ({ ...prev, security: newValue }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" gutterBottom>Accessibility</Typography>
              <Rating
                value={reviewForm.accessibility}
                onChange={(e, newValue) => setReviewForm(prev => ({ ...prev, accessibility: newValue }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" gutterBottom>Value for Money</Typography>
              <Rating
                value={reviewForm.value}
                onChange={(e, newValue) => setReviewForm(prev => ({ ...prev, value: newValue }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmitReview} variant="contained">
            {editingReview ? 'Update Review' : 'Submit Review'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReviewsAndRatings; 