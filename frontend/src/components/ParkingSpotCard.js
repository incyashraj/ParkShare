import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Rating,
  Chip,
  IconButton,
  Fade,
  Grow,
  Zoom,
  Tooltip,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  AccessTime as TimeIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { useRealtime } from '../contexts/RealtimeContext';

const ParkingSpotCard = ({ spot, onBook, index, isFavorite: propIsFavorite, onToggleFavorite }) => {
  const { isConnected } = useRealtime();
  const [isFavorite, setIsFavorite] = useState(propIsFavorite || false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleFavoriteToggle = (e) => {
    e.stopPropagation();
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    if (onToggleFavorite) {
      onToggleFavorite();
    }
  };

  const getAvailabilityColor = () => {
    if (spot.isOwner) return 'default';
    if (!spot.canBook) return 'error';
    return 'success';
  };

  const getAvailabilityText = () => {
    if (spot.isOwner) return 'Your Spot';
    if (!spot.canBook) return 'Not Available';
    return 'Book Now';
  };

  return (
    <Grow in timeout={600 + index * 100}>
      <Card
        sx={{
          height: '100%',
          borderRadius: 3,
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          position: 'relative',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #1E3A8A, #3B82F6)',
            zIndex: 1,
          },
        }}
        onClick={() => onBook(spot)}
      >
        {/* Real-time connection indicator */}
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 2,
            display: 'flex',
            gap: 1,
          }}
        >
          <Tooltip title={isConnected ? 'Live Updates' : 'Offline'}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: isConnected ? '#10B981' : '#EF4444',
                animation: isConnected ? 'pulse 2s infinite' : 'none',
              }}
            />
          </Tooltip>
          
          <IconButton
            size="small"
            onClick={handleFavoriteToggle}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,1)',
                transform: 'scale(1.1)',
              },
            }}
          >
            {isFavorite ? (
              <FavoriteIcon sx={{ color: '#EF4444', fontSize: 18 }} />
            ) : (
              <FavoriteBorderIcon sx={{ color: '#6B7280', fontSize: 18 }} />
            )}
          </IconButton>
        </Box>

        {/* Image with loading animation */}
        <Box sx={{ position: 'relative', height: 200 }}>
          <CardMedia
            component="img"
            height="200"
            image={spot.images?.[0] || 'https://via.placeholder.com/400x200?text=No+Image'}
            alt={spot.location}
            onLoad={handleImageLoad}
            sx={{
              transition: 'all 0.3s ease',
              filter: imageLoaded ? 'none' : 'blur(10px)',
            }}
          />
          {!imageLoaded && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f3f4f6',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Loading...
              </Typography>
            </Box>
          )}
        </Box>

        <CardContent sx={{ p: 3 }}>
          {/* Location and Owner */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: '#1e293b',
                lineHeight: 1.3,
                mb: 1,
              }}
            >
              {spot.location}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Listed by {spot.ownerName}
              </Typography>
            </Box>
          </Box>

          {/* Price and Rating */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MoneyIcon sx={{ fontSize: 20, color: '#10B981' }} />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: '#10B981',
                  fontSize: '1.5rem',
                }}
              >
                {spot.hourlyRate}/hour
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Rating
                value={spot.rating || 0}
                readOnly
                size="small"
                sx={{
                  '& .MuiRating-iconFilled': {
                    color: '#F59E0B',
                  },
                }}
              />
              <Typography variant="body2" color="text.secondary">
                ({spot.rating || 0})
              </Typography>
            </Box>
          </Box>

          {/* Security Features */}
          {spot.securityFeatures && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Security Features:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {spot.securityFeatures.split(',').map((feature, i) => (
                  <Chip
                    key={i}
                    icon={<SecurityIcon />}
                    label={feature.trim()}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: '0.7rem',
                      borderColor: '#1E3A8A',
                      color: '#1E3A8A',
                      '& .MuiChip-icon': {
                        fontSize: 14,
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Duration and Action */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Max: {spot.maxDuration} hours
              </Typography>
            </Box>
            
            <Zoom in timeout={300}>
              <Button
                variant="contained"
                onClick={(e) => {
                  e.stopPropagation();
                  onBook(spot);
                }}
                disabled={spot.isOwner || !spot.canBook}
                sx={{
                  backgroundColor: getAvailabilityColor() === 'success' ? '#1E3A8A' : '#6B7280',
                  borderRadius: '25px',
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: getAvailabilityColor() === 'success' ? '#1E40AF' : '#6B7280',
                    transform: 'scale(1.05)',
                  },
                  '&:disabled': {
                    backgroundColor: '#E5E7EB',
                    color: '#9CA3AF',
                  },
                }}
              >
                {getAvailabilityText()}
              </Button>
            </Zoom>
          </Box>
        </CardContent>
      </Card>
    </Grow>
  );
};

export default ParkingSpotCard; 