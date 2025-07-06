import React, { useState, useEffect } from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import { FiberManualRecord } from '@mui/icons-material';
import { useRealtime } from '../contexts/RealtimeContext';
import { useAuth } from '../contexts/AuthContext';

const UserStatusIndicator = ({ userId, username, size = 'small', showTooltip = true }) => {
  const [presence, setPresence] = useState({ status: 'offline', lastSeen: null, lastActivity: null });
  const [isLoading, setIsLoading] = useState(true);
  const { socket } = useRealtime();
  const { currentUser } = useAuth();
  
  // Hide own status
  const isOwnUser = currentUser?.uid === userId;

  useEffect(() => {
    // Fetch initial presence status
    const fetchPresence = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/users/${userId}/presence`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('userUid') || 'anonymous'}`
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

    if (userId && !isOwnUser) {
      fetchPresence();
    } else {
      setIsLoading(false);
    }

    // Listen for real-time presence updates
    if (socket && !isOwnUser) {
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
  }, [userId, socket, isOwnUser]);

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

  // Don't show anything for own user or if loading
  if (isOwnUser || isLoading) {
    return null;
  }

  const statusColor = getStatusColor(presence.status);
  const statusText = getStatusText(presence.status);
  const dotSize = size === 'small' ? 6 : size === 'medium' ? 8 : 10;

  const statusDot = (
    <FiberManualRecord
      sx={{
        fontSize: dotSize,
        color: statusColor,
        filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.1))'
      }}
    />
  );

  if (showTooltip) {
    return (
      <Tooltip
        title={
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {username}
            </Typography>
            <Typography variant="caption">
              {statusText}
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
        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
          {statusDot}
        </Box>
      </Tooltip>
    );
  }

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
      {statusDot}
    </Box>
  );
};

export default UserStatusIndicator; 