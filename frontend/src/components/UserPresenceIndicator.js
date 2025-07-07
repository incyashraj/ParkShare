import React, { useState, useEffect } from 'react';
import { Box, Chip, Tooltip, Avatar, Typography } from '@mui/material';
import { 
  FiberManualRecord, 
  AccessTime, 
  Person 
} from '@mui/icons-material';
import { useRealtime } from '../contexts/RealtimeContext';
import { useAuth } from '../contexts/AuthContext';

const UserPresenceIndicator = ({ userId, username, showDetails = false, size = 'small', hideOwnStatus = false }) => {
  const [presence, setPresence] = useState({ status: 'offline', lastSeen: null, lastActivity: null });
  const [isLoading, setIsLoading] = useState(true);
  const { socket } = useRealtime();
  const { currentUser } = useAuth();
  
  // Hide own status if hideOwnStatus is true
  const isOwnUser = currentUser?.uid === userId;

  useEffect(() => {
    // Fetch initial presence status
    const fetchPresence = async () => {
      try {
        const uid = currentUser?.uid || localStorage.getItem('userUid') || 'anonymous';
        const response = await fetch(`http://192.168.1.7:3001/api/users/${userId}/presence`, {
          headers: {
            'Authorization': `Bearer ${uid}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setPresence(data.presence);
        }
      } catch (error) {
        console.error('Error fetching user presence:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchPresence();
    }

    // Listen for real-time presence updates
    if (socket) {
      socket.on('user-presence-update', (data) => {
        if (data.userId === userId) {
          setPresence({
            status: data.status,
            lastSeen: data.lastSeen,
            lastActivity: data.lastActivity
          });
        }
      });

      return () => {
        socket.off('user-presence-update');
      };
    }
  }, [userId, socket]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return '#4CAF50'; // Green
      case 'away':
        return '#FF9800'; // Orange
      case 'offline':
        return '#9E9E9E'; // Grey
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'away':
        return 'Away';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return 'Never';
    
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ width: 24, height: 24 }}>
          <Person />
        </Avatar>
        <Typography variant="body2" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  // Hide own status if hideOwnStatus is true
  if (hideOwnStatus && isOwnUser) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar 
          sx={{ 
            width: size === 'small' ? 24 : 32, 
            height: size === 'small' ? 24 : 32,
            bgcolor: 'primary.main'
          }}
        >
          {username ? username.charAt(0).toUpperCase() : <Person />}
        </Avatar>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ position: 'relative' }}>
        <Avatar 
          sx={{ 
            width: size === 'small' ? 24 : 32, 
            height: size === 'small' ? 24 : 32,
            bgcolor: 'primary.main'
          }}
        >
          {username ? username.charAt(0).toUpperCase() : <Person />}
        </Avatar>
        <FiberManualRecord
          sx={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            fontSize: size === 'small' ? 12 : 16,
            color: getStatusColor(presence.status),
            filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.3))'
          }}
        />
      </Box>
      
      {showDetails && (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="body2" fontWeight="medium">
            {username}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {getStatusText(presence.status)}
            </Typography>
            {presence.status !== 'online' && (
              <>
                <AccessTime sx={{ fontSize: 12, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {formatLastSeen(presence.lastSeen)}
                </Typography>
              </>
            )}
          </Box>
          {presence.lastActivity && (
            <Typography variant="caption" color="text.secondary">
              {presence.lastActivity}
            </Typography>
          )}
        </Box>
      )}
      
      {!showDetails && (
        <Tooltip
          title={
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {username}
              </Typography>
              <Typography variant="caption">
                {getStatusText(presence.status)}
              </Typography>
              {presence.status !== 'online' && (
                <Typography variant="caption" display="block">
                  Last seen: {formatLastSeen(presence.lastSeen)}
                </Typography>
              )}
              {presence.lastActivity && (
                <Typography variant="caption" display="block">
                  {presence.lastActivity}
                </Typography>
              )}
            </Box>
          }
          arrow
        >
          <Chip
            label={getStatusText(presence.status)}
            size={size}
            sx={{
              bgcolor: getStatusColor(presence.status),
              color: 'white',
              fontWeight: 'medium',
              '& .MuiChip-label': {
                px: 1
              }
            }}
          />
        </Tooltip>
      )}
    </Box>
  );
};

export default UserPresenceIndicator; 