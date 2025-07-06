import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Paper
} from '@mui/material';
import {
  Block as BlockIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  AccessTime as TimeIcon,
  LockOpen as UnblockIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const BlockedUsersManager = () => {
  const { currentUser } = useAuth();
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unblockingUser, setUnblockingUser] = useState(null);
  const [showUnblockDialog, setShowUnblockDialog] = useState(false);
  const [userToUnblock, setUserToUnblock] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (currentUser?.uid) {
      loadBlockedUsers();
    }
  }, [currentUser?.uid]);

  const loadBlockedUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/users/${currentUser.uid}/blocked`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.uid}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBlockedUsers(data.blockedUsers || []);
      } else {
        setError('Failed to load blocked users');
      }
    } catch (error) {
      console.error('Error loading blocked users:', error);
      setError('Failed to load blocked users');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockUser = async (user) => {
    setUserToUnblock(user);
    setShowUnblockDialog(true);
  };

  const confirmUnblockUser = async () => {
    if (!userToUnblock) return;

    try {
      setUnblockingUser(userToUnblock.uid);
      const response = await fetch(`http://localhost:3001/api/users/${userToUnblock.uid}/block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.uid}`
        },
        body: JSON.stringify({ blocked: false })
      });

      if (response.ok) {
        setBlockedUsers(prev => prev.filter(user => user.uid !== userToUnblock.uid));
        setSuccessMessage(`${userToUnblock.username} has been unblocked successfully`);
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setError('Failed to unblock user');
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
      setError('Failed to unblock user');
    } finally {
      setUnblockingUser(null);
      setShowUnblockDialog(false);
      setUserToUnblock(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <BlockIcon color="warning" />
        Blocked Users ({blockedUsers.length})
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {blockedUsers.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <BlockIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Blocked Users
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You haven't blocked any users yet. Blocked users won't be able to message you or see your profile.
          </Typography>
        </Paper>
      ) : (
        <Card>
          <CardContent sx={{ p: 0 }}>
            <List>
              {blockedUsers.map((user, index) => (
                <React.Fragment key={user.uid}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'warning.main' }}>
                        {getInitials(user.fullName || user.username)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">
                            {user.fullName || user.username}
                          </Typography>
                          <Chip 
                            label="Blocked" 
                            size="small" 
                            color="warning" 
                            variant="outlined"
                            icon={<BlockIcon />}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {user.email}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              Blocked on {formatDate(user.blockedAt)}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<UnblockIcon />}
                        onClick={() => handleUnblockUser(user)}
                        disabled={unblockingUser === user.uid}
                        color="success"
                      >
                        {unblockingUser === user.uid ? (
                          <CircularProgress size={16} />
                        ) : (
                          'Unblock'
                        )}
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < blockedUsers.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Unblock Confirmation Dialog */}
      <Dialog
        open={showUnblockDialog}
        onClose={() => setShowUnblockDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <UnblockIcon color="success" />
          Unblock User
        </DialogTitle>
        <DialogContent>
          {userToUnblock && (
            <Box>
              <Typography variant="body1" gutterBottom>
                Are you sure you want to unblock <strong>{userToUnblock.fullName || userToUnblock.username}</strong>?
              </Typography>
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Once unblocked, this user will be able to:
                </Typography>
                <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                  <li>Send you messages</li>
                  <li>View your profile</li>
                  <li>See your parking spots</li>
                  <li>Make bookings with you</li>
                </ul>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUnblockDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={confirmUnblockUser}
            variant="contained"
            color="success"
            startIcon={<UnblockIcon />}
            disabled={unblockingUser}
          >
            {unblockingUser ? <CircularProgress size={20} /> : 'Unblock User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BlockedUsersManager; 