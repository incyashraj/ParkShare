import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  LinearProgress,
  Badge,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  ListItemIcon
} from '@mui/material';
import {
  AdminPanelSettings,
  Support,
  People,
  Dashboard,
  Delete,
  CheckCircle,
  Refresh,
  Visibility,
  LockOpen,
  AttachMoney,
  LocalParking,
  BookOnline,
  Person,
  Cancel,
  CheckCircleOutline,
  WarningAmber,
  ErrorOutline,
  InfoOutlined,
  Notifications,
  Security as SecurityIcon,
  Description as DocumentIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useRealtime } from '../contexts/RealtimeContext';
import UserPresenceIndicator from './UserPresenceIndicator';
import { API_BASE } from '../apiConfig';

const AdminPanel = () => {
  const { currentUser } = useAuth();
  const { socket } = useRealtime();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [newTicketNotifications, setNewTicketNotifications] = useState(0);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const typingTimeoutRef = useRef(null);

  // Dashboard data
  const [analytics, setAnalytics] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  
  // Support tickets data
  const [tickets, setTickets] = useState([]);
  const [ticketFilter, setTicketFilter] = useState('all');
  const [ticketSearch, setTicketSearch] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyDialog, setReplyDialog] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // Users data
  const [users, setUsers] = useState([]);
  const [userFilter, setUserFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailsDialog, setUserDetailsDialog] = useState(false);
  const [banDialog, setBanDialog] = useState(false);
  const [banReason, setBanReason] = useState('');
  
  // Spots data
  const [spots, setSpots] = useState([]);
  const [spotFilter, setSpotFilter] = useState('all');
  const [spotSearch, setSpotSearch] = useState('');
  
  // Bookings data
  const [bookings, setBookings] = useState([]);
  const [bookingFilter, setBookingFilter] = useState('all');
  const [bookingSearch, setBookingSearch] = useState('');
  
  // Host verification data
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [verificationReviewDialog, setVerificationReviewDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewStatus, setReviewStatus] = useState('approved');
  const [reviewingVerification, setReviewingVerification] = useState(false);

  const loadAdminData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if backend server is running with a simpler approach
      try {
        const healthCheck = await fetch(`${API_BASE}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!healthCheck.ok) {
          throw new Error(`Backend server responded with status: ${healthCheck.status}`);
        }
        
        console.log('Backend server is running');
      } catch (healthError) {
        console.error('Backend server health check failed:', healthError);
        setError('Cannot connect to backend server. Please ensure the server is running at ' + API_BASE);
        setLoading(false);
        return;
      }
      
      const headers = { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentUser.uid}` 
      };
      
      // Load all data in parallel with better error handling
      const promises = [
        fetch(`${API_BASE}/api/admin/analytics`, { headers }).catch(e => ({ ok: false, error: e })),
        fetch(`${API_BASE}/api/support/tickets`, { headers }).catch(e => ({ ok: false, error: e })),
        fetch(`${API_BASE}/api/users`, { headers }).catch(e => ({ ok: false, error: e })),
        fetch(`${API_BASE}/api/admin/spots`, { headers }).catch(e => ({ ok: false, error: e })),
        fetch(`${API_BASE}/api/admin/bookings`, { headers }).catch(e => ({ ok: false, error: e })),
        fetch(`${API_BASE}/api/admin/online-users`, { headers }).catch(e => ({ ok: false, error: e })),
        fetch(`${API_BASE}/api/host-verification/pending`, { headers }).catch(e => ({ ok: false, error: e }))
      ];

      const [analyticsRes, ticketsRes, usersRes, spotsRes, bookingsRes, onlineUsersRes, verificationsRes] = await Promise.all(promises);

      // Handle each response individually
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData.analytics);
      } else {
        console.error('Analytics response not ok:', analyticsRes.status, analyticsRes.statusText);
      }

      if (ticketsRes.ok) {
        const ticketsData = await ticketsRes.json();
        setTickets(ticketsData.tickets);
      } else {
        console.error('Tickets response not ok:', ticketsRes.status, ticketsRes.statusText);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users);
      } else {
        console.error('Users response not ok:', usersRes.status, usersRes.statusText);
      }

      if (spotsRes.ok) {
        const spotsData = await spotsRes.json();
        setSpots(spotsData.spots);
      } else {
        console.error('Spots response not ok:', spotsRes.status, spotsRes.statusText);
      }

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData.bookings);
      } else {
        console.error('Bookings response not ok:', bookingsRes.status, bookingsRes.statusText);
      }

      if (onlineUsersRes.ok) {
        const onlineUsersData = await onlineUsersRes.json();
        setOnlineUsers(onlineUsersData.onlineUsers);
      } else {
        console.error('Online users response not ok:', onlineUsersRes.status, onlineUsersRes.statusText);
      }

      if (verificationsRes.ok) {
        const verificationsData = await verificationsRes.json();
        setPendingVerifications(verificationsData.pendingVerifications);
      } else {
        console.error('Verifications response not ok:', verificationsRes.status, verificationsRes.statusText);
      }

    } catch (error) {
      console.error('Error loading admin data:', error);
      if (error.message.includes('Failed to fetch')) {
        setError('Cannot connect to backend server. Please ensure the server is running at ' + API_BASE);
      } else {
        setError(`Failed to load admin data: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Check if user is admin - improved logic
  useEffect(() => {
    if (!currentUser) {
      setError('Please log in to access admin panel.');
      return;
    }
    
    // Check for admin privileges - multiple ways to be admin
    const isAdminUser = currentUser.isAdmin || 
                       currentUser.email === 'incyashraj@gmail.com' ||
                       currentUser.uid === 'z5UJrnuM0NbNl91bD9T4U6zi6Pf2' || // Yashraj's UID
                       currentUser.email === 'yashrajpardeshi@gmail.com';
    
    if (!isAdminUser) {
      setError('Access denied. Admin privileges required.');
      return;
    }
    
    console.log('Admin access granted for user:', currentUser.username || currentUser.email);
    loadAdminData();
  }, [currentUser, loadAdminData]);

  // Real-time WebSocket event listeners for support tickets
  useEffect(() => {
    if (!socket) return;

    // Listen for new support tickets
    socket.on('new-support-ticket', (notification) => {
      console.log('New support ticket received:', notification);
      setNewTicketNotifications(prev => prev + 1);
      showSnackbar(`New support ticket: ${notification.ticketSubject}`, 'info');
      loadAdminData(); // Refresh tickets
    });

    // Listen for support ticket updates
    socket.on('support-ticket-updated', (notification) => {
      console.log('Support ticket updated:', notification);
      showSnackbar(`New message in ticket: ${notification.ticketSubject}`, 'info');
      loadAdminData(); // Refresh tickets
    });

    // Listen for ticket status updates
    socket.on('ticket-status-updated', (notification) => {
      console.log('Ticket status updated:', notification);
      showSnackbar(`Ticket "${notification.ticketSubject}" status changed to ${notification.newStatus}`, 'info');
      loadAdminData(); // Refresh tickets
    });

    // Listen for new messages in specific ticket room
    socket.on('ticket-message-added', (data) => {
      console.log('New message in ticket room:', data);
      if (selectedTicket && data.ticketId === selectedTicket.id) {
        // Update the selected ticket with new message
        setSelectedTicket(data.ticket);
      }
      loadAdminData(); // Refresh tickets
    });

    // Listen for typing indicators
    socket.on('ticket-user-typing', (data) => {
      if (selectedTicket && data.ticketId === selectedTicket.id) {
        if (data.typing) {
          setTypingUsers(prev => new Set(prev).add(data.senderId));
        } else {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.senderId);
            return newSet;
          });
        }
      }
    });

    // Listen for ticket updates
    socket.on('ticket-updated', (data) => {
      console.log('Ticket updated:', data);
      if (selectedTicket && data.ticketId === selectedTicket.id) {
        setSelectedTicket(data.ticket);
      }
      loadAdminData(); // Refresh tickets
    });

    return () => {
      socket.off('new-support-ticket');
      socket.off('support-ticket-updated');
      socket.off('ticket-status-updated');
      socket.off('ticket-message-added');
      socket.off('ticket-user-typing');
      socket.off('ticket-updated');
    };
  }, [socket, selectedTicket, loadAdminData]);

  // Join ticket room when viewing a ticket
  useEffect(() => {
    if (socket && selectedTicket) {
      socket.emit('join-ticket-room', selectedTicket.id);
      
      return () => {
        socket.emit('leave-ticket-room', selectedTicket.id);
      };
    }
  }, [socket, selectedTicket]);

  // Handle typing indicators for admin messages
  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
    
    if (socket && selectedTicket) {
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Emit typing start
      socket.emit('ticket-typing-start', {
        ticketId: selectedTicket.id,
        senderId: currentUser.uid
      });
      
      // Set timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('ticket-typing-stop', {
          ticketId: selectedTicket.id,
          senderId: currentUser.uid
        });
      }, 2000);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Clear notification badge when support tickets tab is clicked
    if (newValue === 1) { // Support tickets tab index
      setNewTicketNotifications(0);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Support ticket functions
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;
    setSendingMessage(true);
    try {
      const response = await fetch(`${API_BASE}/api/support/tickets/${selectedTicket.id}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.uid}`
        },
        body: JSON.stringify({ message: newMessage })
      });
      if (response.ok) {
        setNewMessage('');
        // Clear typing indicator
        if (socket) {
          socket.emit('ticket-typing-stop', {
            ticketId: selectedTicket.id,
            senderId: currentUser.uid
          });
        }
        // Clear typing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        loadAdminData();
      } else {
        showSnackbar('Failed to send message', 'error');
      }
    } catch (error) {
      showSnackbar('Error sending message', 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleUpdateTicketStatus = async (ticketId, status) => {
    try {
      const response = await fetch(`${API_BASE}/api/support/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.uid}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        showSnackbar(`Ticket ${status} successfully`);
        loadAdminData();
      } else {
        showSnackbar('Failed to update ticket', 'error');
      }
    } catch (error) {
      showSnackbar('Error updating ticket', 'error');
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/support/tickets/${ticketId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${currentUser.uid}` }
      });

      if (response.ok) {
        showSnackbar('Ticket deleted successfully');
        loadAdminData();
      } else {
        showSnackbar('Failed to delete ticket', 'error');
      }
    } catch (error) {
      showSnackbar('Error deleting ticket', 'error');
    }
  };

  // User management functions
  const handleUpdateUserRole = async (userId, isAdmin) => {
    try {
      const response = await fetch(`${API_BASE}/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.uid}`
        },
        body: JSON.stringify({ isAdmin })
      });

      if (response.ok) {
        showSnackbar(`User role updated successfully`);
        loadAdminData();
      } else {
        showSnackbar('Failed to update user role', 'error');
      }
    } catch (error) {
      showSnackbar('Error updating user role', 'error');
    }
  };

  const handleBanUser = async (userId, banned) => {
    try {
      const response = await fetch(`${API_BASE}/api/users/${userId}/ban`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.uid}`
        },
        body: JSON.stringify({ 
          banned, 
          reason: banned ? banReason : null 
        })
      });

      if (response.ok) {
        showSnackbar(`User ${banned ? 'banned' : 'unbanned'} successfully`);
        setBanDialog(false);
        setBanReason('');
        loadAdminData();
      } else {
        showSnackbar('Failed to update user status', 'error');
      }
    } catch (error) {
      showSnackbar('Error updating user status', 'error');
    }
  };

  const handleViewUserDetails = async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/api/users/${userId}/details`, {
        headers: { Authorization: `Bearer ${currentUser.uid}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedUser(data.user);
        setUserDetailsDialog(true);
      } else {
        showSnackbar('Failed to load user details', 'error');
      }
    } catch (error) {
      showSnackbar('Error loading user details', 'error');
    }
  };

  // Spot management functions
  const handleDeleteSpot = async (spotId) => {
    if (!window.confirm('Are you sure you want to delete this spot? This will cancel all bookings.')) return;

    try {
      const response = await fetch(`${API_BASE}/api/admin/spots/${spotId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${currentUser.uid}` }
      });

      if (response.ok) {
        const data = await response.json();
        showSnackbar(`Spot deleted successfully. ${data.cancelledBookings} bookings cancelled.`);
        loadAdminData();
      } else {
        showSnackbar('Failed to delete spot', 'error');
      }
    } catch (error) {
      showSnackbar('Error deleting spot', 'error');
    }
  };

  // Booking management functions
  const handleCancelBooking = async (bookingId, reason) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.uid}`
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        showSnackbar('Booking cancelled successfully');
        loadAdminData();
      } else {
        showSnackbar('Failed to cancel booking', 'error');
      }
    } catch (error) {
      showSnackbar('Error cancelling booking', 'error');
    }
  };

  // Filter functions
  const getFilteredTickets = () => {
    let filtered = tickets;
    
    if (ticketFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === ticketFilter);
    }
    
    if (ticketSearch) {
      filtered = filtered.filter(ticket => 
        ticket.subject.toLowerCase().includes(ticketSearch.toLowerCase()) ||
        (ticket.user?.username || ticket.user?.email || 'Unknown User').toLowerCase().includes(ticketSearch.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getFilteredUsers = () => {
    let filtered = users;
    
    if (userFilter === 'admin') {
      filtered = filtered.filter(user => user.isAdmin);
    } else if (userFilter === 'banned') {
      filtered = filtered.filter(user => user.banned);
    }
    
    if (userSearch) {
      filtered = filtered.filter(user => 
        (user.username || user.email || 'Unknown User').toLowerCase().includes(userSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearch.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getFilteredSpots = () => {
    let filtered = spots;
    
    if (spotFilter === 'active') {
      filtered = filtered.filter(spot => spot.available);
    } else if (spotFilter === 'inactive') {
      filtered = filtered.filter(spot => !spot.available);
    }
    
    if (spotSearch) {
      filtered = filtered.filter(spot => 
        spot.location.toLowerCase().includes(spotSearch.toLowerCase()) ||
        spot.title.toLowerCase().includes(spotSearch.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getFilteredBookings = () => {
    let filtered = bookings;
    
    if (bookingFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === bookingFilter);
    }
    
    if (bookingSearch) {
      filtered = filtered.filter(booking => 
        (booking.userDetails?.username || booking.userDetails?.email || 'Unknown User').toLowerCase().includes(bookingSearch.toLowerCase()) ||
        booking.spotDetails?.location.toLowerCase().includes(bookingSearch.toLowerCase())
      );
    }
    
    return filtered;
  };

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'error';
      case 'in_progress': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <ErrorOutline />;
      case 'in_progress': return <WarningAmber />;
      case 'resolved': return <CheckCircleOutline />;
      case 'closed': return <InfoOutlined />;
      default: return <InfoOutlined />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  // Host verification functions
  const handleReviewVerification = async () => {
    if (!selectedVerification) return;
    
    try {
      setReviewingVerification(true);
      
      const response = await fetch(`${API_BASE}/api/host-verification/review/${selectedVerification.uid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.uid}`
        },
        body: JSON.stringify({
          status: reviewStatus,
          notes: reviewNotes
        })
      });

      if (response.ok) {
        const result = await response.json();
        showSnackbar(`Verification ${reviewStatus} successfully`, 'success');
        setVerificationReviewDialog(false);
        setSelectedVerification(null);
        setReviewNotes('');
        setReviewStatus('approved');
        loadAdminData(); // Reload data
      } else {
        const error = await response.json();
        showSnackbar(error.message || 'Failed to review verification', 'error');
      }
    } catch (error) {
      console.error('Error reviewing verification:', error);
      showSnackbar('Failed to review verification', 'error');
    } finally {
      setReviewingVerification(false);
    }
  };

  const handleViewVerification = (verification) => {
    setSelectedVerification(verification);
    setVerificationReviewDialog(true);
  };

  const handleDownloadDocument = async (filename) => {
    try {
      const response = await fetch(`${API_BASE}/api/host-verification/document/${filename}`, {
        headers: {
          Authorization: `Bearer ${currentUser.uid}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        showSnackbar('Failed to download document', 'error');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      showSnackbar('Failed to download document', 'error');
    }
  };

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading admin panel...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          <AdminPanelSettings sx={{ mr: 2, verticalAlign: 'middle' }} />
          Admin Panel
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage users, support tickets, parking spots, and system analytics
        </Typography>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab icon={<Dashboard />} label="Dashboard" />
          <Tab 
          icon={
            <Badge badgeContent={newTicketNotifications} color="error">
              <Support />
            </Badge>
          } 
          label="Support Tickets" 
        />
          <Tab icon={<People />} label="User Management" />
          <Tab icon={<LocalParking />} label="Parking Spots" />
          <Tab icon={<BookOnline />} label="Bookings" />
          <Tab 
            icon={
              <Badge badgeContent={pendingVerifications.length} color="warning">
                <SecurityIcon />
              </Badge>
            } 
            label="Host Verification" 
          />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* Dashboard Tab */}
          {activeTab === 0 && analytics && (
            <Box>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <People sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                        <Box>
                          <Typography variant="h4">{analytics.overview.totalUsers}</Typography>
                          <Typography variant="body2" color="text.secondary">Total Users</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocalParking sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                        <Box>
                          <Typography variant="h4">{analytics.overview.totalSpots}</Typography>
                          <Typography variant="body2" color="text.secondary">Parking Spots</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <BookOnline sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                        <Box>
                          <Typography variant="h4">{analytics.overview.totalBookings}</Typography>
                          <Typography variant="body2" color="text.secondary">Total Bookings</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AttachMoney sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                        <Box>
                          <Typography variant="h4">${analytics.overview.totalRevenue}</Typography>
                          <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Online Users ({onlineUsers.length})</Typography>
                      <List>
                        {onlineUsers.slice(0, 8).map((user, index) => (
                          <ListItem key={user.uid}>
                            <UserPresenceIndicator 
                              userId={user.uid} 
                              username={user.username || user.email || 'Unknown User'} 
                              showDetails={true}
                              size="small"
                              hideOwnStatus={true}
                            />
                            <ListItemSecondaryAction>
                              <Chip 
                                label={user.status} 
                                color={user.status === 'online' ? 'success' : 'warning'}
                                size="small"
                              />
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                        {onlineUsers.length === 0 && (
                          <ListItem>
                            <ListItemText
                              primary="No users online"
                              secondary="Check back later"
                            />
                          </ListItem>
                        )}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Popular Spots</Typography>
                      <List>
                        {analytics.popularSpots.map((spot, index) => (
                          <ListItem key={index}>
                            <ListItemText
                              primary={spot.location}
                              secondary={`${spot.bookings} bookings`}
                            />
                            <Chip label={`#${index + 1}`} color="primary" size="small" />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Recent Activity</Typography>
                      <List>
                        {analytics.recentBookings.slice(0, 5).map((booking, index) => (
                          <ListItem key={index}>
                            <ListItemText
                              primary={`Booking by ${booking.userDetails?.username || 'Unknown'}`}
                              secondary={formatDate(booking.createdAt)}
                            />
                            <Chip 
                              label={booking.status} 
                              color={booking.status === 'completed' ? 'success' : 'default'}
                              size="small"
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Support Tickets Tab */}
          {activeTab === 1 && (
            <Box>
              <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Status Filter</InputLabel>
                  <Select
                    value={ticketFilter}
                    onChange={(e) => setTicketFilter(e.target.value)}
                    label="Status Filter"
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="open">Open</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="resolved">Resolved</MenuItem>
                    <MenuItem value="closed">Closed</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  placeholder="Search tickets..."
                  value={ticketSearch}
                  onChange={(e) => setTicketSearch(e.target.value)}
                  sx={{ minWidth: 200 }}
                />
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={loadAdminData}
                >
                  Refresh
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getFilteredTickets().map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell>{ticket.id}</TableCell>
                        <TableCell>{ticket.user?.username || ticket.user?.email || 'Unknown User'}</TableCell>
                        <TableCell>{ticket.subject}</TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(ticket.status)}
                            label={ticket.status}
                            color={getStatusColor(ticket.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                        <TableCell>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setReplyDialog(true);
                              }}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Mark Resolved">
                            <IconButton
                              size="small"
                              onClick={() => handleUpdateTicketStatus(ticket.id, 'resolved')}
                            >
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteTicket(ticket.id)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* User Management Tab */}
          {activeTab === 2 && (
            <Box>
              <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>User Filter</InputLabel>
                  <Select
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    label="User Filter"
                  >
                    <MenuItem value="all">All Users</MenuItem>
                    <MenuItem value="admin">Admins</MenuItem>
                    <MenuItem value="banned">Banned</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  sx={{ minWidth: 200 }}
                />
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={loadAdminData}
                >
                  Refresh
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Presence</TableCell>
                      <TableCell>Bookings</TableCell>
                      <TableCell>Spots</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getFilteredUsers().map((user) => (
                      <TableRow key={user.uid}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <UserPresenceIndicator 
                              userId={user.uid} 
                              username={user.username || user.email || 'Unknown User'} 
                              size="small"
                            />
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              {user.username || user.email || 'Unknown User'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.isAdmin ? 'Admin' : 'User'}
                            color={user.isAdmin ? 'primary' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <UserPresenceIndicator 
                            userId={user.uid} 
                            username={user.username || user.email || 'Unknown User'} 
                            size="small"
                            hideOwnStatus={true}
                          />
                        </TableCell>
                        <TableCell>{user.totalBookings}</TableCell>
                        <TableCell>{user.totalSpots}</TableCell>
                        <TableCell>
                          {user.banned ? (
                            <Chip label="Banned" color="error" size="small" />
                          ) : (
                            <Chip label="Active" color="success" size="small" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewUserDetails(user.uid)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={user.isAdmin ? 'Remove Admin' : 'Make Admin'}>
                            <IconButton
                              size="small"
                              onClick={() => handleUpdateUserRole(user.uid, !user.isAdmin)}
                            >
                              {user.isAdmin ? <Person /> : <AdminPanelSettings />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={user.banned ? 'Unban User' : 'Ban User'}>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedUser(user);
                                setBanDialog(true);
                              }}
                            >
                              <LockOpen />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Parking Spots Tab */}
          {activeTab === 3 && (
            <Box>
              <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Status Filter</InputLabel>
                  <Select
                    value={spotFilter}
                    onChange={(e) => setSpotFilter(e.target.value)}
                    label="Status Filter"
                  >
                    <MenuItem value="all">All Spots</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  placeholder="Search spots..."
                  value={spotSearch}
                  onChange={(e) => setSpotSearch(e.target.value)}
                  sx={{ minWidth: 200 }}
                />
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={loadAdminData}
                >
                  Refresh
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Location</TableCell>
                      <TableCell>Owner</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Bookings</TableCell>
                      <TableCell>Revenue</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getFilteredSpots().map((spot) => (
                      <TableRow key={spot.id}>
                        <TableCell>{spot.location}</TableCell>
                        <TableCell>{spot.ownerDetails?.username || 'Unknown'}</TableCell>
                        <TableCell>
                          <Chip
                            label={spot.available ? 'Available' : 'Unavailable'}
                            color={spot.available ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{spot.totalBookings}</TableCell>
                        <TableCell>${spot.revenue.toFixed(2)}</TableCell>
                        <TableCell>
                          <Tooltip title="Delete Spot">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteSpot(spot.id)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Host Verification Tab */}
          {activeTab === 5 && (
            <Box>
              <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                <Typography variant="h6">
                  Pending Host Verifications ({pendingVerifications.length})
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={loadAdminData}
                >
                  Refresh
                </Button>
              </Box>

              {pendingVerifications.length === 0 ? (
                <Alert severity="info">
                  No pending host verifications at this time.
                </Alert>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Documents</TableCell>
                        <TableCell>Submitted</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendingVerifications.map((verification) => (
                        <TableRow key={verification.uid}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {verification.username || verification.fullName || 'Unknown'}
                            </Typography>
                          </TableCell>
                          <TableCell>{verification.email}</TableCell>
                          <TableCell>
                            <Chip
                              label={verification.hostVerificationStatus}
                              color={
                                verification.hostVerificationStatus === 'documents_submitted' ? 'warning' :
                                verification.hostVerificationStatus === 'under_review' ? 'info' : 'default'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {verification.verificationDocuments?.length || 0} documents
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {verification.verificationSubmittedAt ? 
                              formatDate(verification.verificationSubmittedAt) : 'N/A'
                            }
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Review Verification">
                              <IconButton
                                size="small"
                                onClick={() => handleViewVerification(verification)}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {/* Bookings Tab */}
          {activeTab === 4 && (
            <Box>
              <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Status Filter</InputLabel>
                  <Select
                    value={bookingFilter}
                    onChange={(e) => setBookingFilter(e.target.value)}
                    label="Status Filter"
                  >
                    <MenuItem value="all">All Bookings</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="confirmed">Confirmed</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  placeholder="Search bookings..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  sx={{ minWidth: 200 }}
                />
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={loadAdminData}
                >
                  Refresh
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Spot</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getFilteredBookings().map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>{booking.userDetails?.username || 'Unknown'}</TableCell>
                        <TableCell>{booking.spotDetails?.location || 'Unknown'}</TableCell>
                        <TableCell>${booking.amount?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell>
                          <Chip
                            label={booking.status}
                            color={
                              booking.status === 'completed' ? 'success' :
                              booking.status === 'cancelled' ? 'error' :
                              booking.status === 'confirmed' ? 'primary' : 'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDate(booking.createdAt)}</TableCell>
                        <TableCell>
                          {booking.status !== 'cancelled' && (
                            <Tooltip title="Cancel Booking">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  const reason = prompt('Enter cancellation reason:');
                                  if (reason) {
                                    handleCancelBooking(booking.id, reason);
                                  }
                                }}
                              >
                                <Cancel />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Reply Dialog */}
      <Dialog open={replyDialog} onClose={() => setReplyDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Ticket Conversation: {selectedTicket?.subject}
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Chip 
              label={selectedTicket?.status} 
              color={getStatusColor(selectedTicket?.status)}
              size="small"
            />
            <Chip 
              label={selectedTicket?.priority} 
              color={getPriorityColor(selectedTicket?.priority)}
              size="small"
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedTicket && (
            <Box>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Created: {formatDate(selectedTicket.createdAt)}
                {selectedTicket.updatedAt !== selectedTicket.createdAt && 
                  ` • Last updated: ${formatDate(selectedTicket.updatedAt)}`
                }
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>Messages</Typography>
              
              <Box sx={{ maxHeight: 400, overflowY: 'auto', mb: 2 }}>
                {selectedTicket.messages?.map((msg, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: msg.senderRole === 'admin' ? 'flex-start' : 'flex-end',
                      mb: 1
                    }}>
                      <Paper sx={{ 
                        p: 2, 
                        maxWidth: '70%',
                        backgroundColor: msg.senderRole === 'admin' ? 'primary.light' : 'grey.100',
                        color: msg.senderRole === 'admin' ? 'white' : 'text.primary'
                      }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>{msg.senderName}</strong> ({msg.senderRole})
                        </Typography>
                        <Typography variant="body1">
                          {msg.message}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          {formatDate(msg.timestamp)}
                        </Typography>
                      </Paper>
                    </Box>
                  </Box>
                ))}
              </Box>
              
              {/* Typing indicator */}
              {typingUsers.size > 0 && (
                <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                  Someone is typing...
                </Typography>
              )}
              
              {(selectedTicket.status === 'open' || selectedTicket.status === 'in_progress') ? (
                <Box sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Add a message"
                    value={newMessage}
                    onChange={handleMessageChange}
                    multiline
                    rows={3}
                    disabled={sendingMessage}
                  />
                </Box>
              ) : (
                <Alert severity="info" sx={{ mt: 2 }}>
                  This ticket is {selectedTicket.status}. No new messages can be added.
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplyDialog(false)}>Close</Button>
          {(selectedTicket?.status === 'open' || selectedTicket?.status === 'in_progress') && (
            <Button 
              onClick={handleSendMessage} 
              variant="contained"
              disabled={!newMessage.trim() || sendingMessage}
            >
              {sendingMessage ? 'Sending...' : 'Send Message'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={userDetailsDialog} onClose={() => setUserDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          User Details: {selectedUser?.username}
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Basic Information</Typography>
                  <Typography><strong>Username:</strong> {selectedUser.username || selectedUser.email || 'Unknown User'}</Typography>
                  <Typography><strong>Email:</strong> {selectedUser.email}</Typography>
                  <Typography><strong>Full Name:</strong> {selectedUser.fullName}</Typography>
                  <Typography><strong>Role:</strong> {selectedUser.isAdmin ? 'Admin' : 'User'}</Typography>
                  <Typography><strong>Verified:</strong> {selectedUser.isVerified ? 'Yes' : 'No'}</Typography>
                  <Typography><strong>Created:</strong> {formatDate(selectedUser.createdAt)}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Statistics</Typography>
                  <Typography><strong>Total Bookings:</strong> {selectedUser.totalBookings}</Typography>
                  <Typography><strong>Total Spots:</strong> {selectedUser.totalSpots}</Typography>
                  <Typography><strong>Reports Filed:</strong> {selectedUser.totalReports}</Typography>
                  <Typography><strong>Reports Against:</strong> {selectedUser.reportsAgainst}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Ban User Dialog */}
      <Dialog open={banDialog} onClose={() => setBanDialog(false)}>
        <DialogTitle>
          {selectedUser?.banned ? 'Unban User' : 'Ban User'}: {selectedUser?.username}
        </DialogTitle>
        <DialogContent>
          {!selectedUser?.banned && (
            <TextField
              fullWidth
              multiline
              rows={3}
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Enter ban reason..."
              sx={{ mt: 1 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBanDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => handleBanUser(selectedUser?.uid, !selectedUser?.banned)}
            variant="contained"
            color={selectedUser?.banned ? 'success' : 'error'}
          >
            {selectedUser?.banned ? 'Unban' : 'Ban'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Host Verification Review Dialog */}
      <Dialog open={verificationReviewDialog} onClose={() => setVerificationReviewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Review Host Verification: {selectedVerification?.username || selectedVerification?.email}
        </DialogTitle>
        <DialogContent>
          {selectedVerification && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>User Information</Typography>
                  <Typography><strong>Name:</strong> {selectedVerification.username || selectedVerification.fullName || 'Unknown'}</Typography>
                  <Typography><strong>Email:</strong> {selectedVerification.email}</Typography>
                  <Typography><strong>Phone:</strong> {selectedVerification.phone || 'Not provided'}</Typography>
                  <Typography><strong>Submitted:</strong> {selectedVerification.verificationSubmittedAt ? formatDate(selectedVerification.verificationSubmittedAt) : 'N/A'}</Typography>
                  <Typography><strong>Status:</strong> {selectedVerification.hostVerificationStatus}</Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Verification Documents</Typography>
                  {selectedVerification.verificationDocuments && selectedVerification.verificationDocuments.length > 0 ? (
                    <List>
                      {selectedVerification.verificationDocuments.map((doc, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <DocumentIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={doc.documentType}
                            secondary={doc.filename}
                          />
                          <IconButton
                            size="small"
                            onClick={() => handleDownloadDocument(doc.filename)}
                          >
                            <Visibility />
                          </IconButton>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography color="textSecondary">No documents uploaded</Typography>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>Review Decision</Typography>
                  
                  <FormControl component="fieldset" sx={{ mb: 2 }}>
                    <FormLabel component="legend">Verification Status</FormLabel>
                    <FormGroup row>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={reviewStatus === 'approved'}
                            onChange={() => setReviewStatus('approved')}
                          />
                        }
                        label="Approve"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={reviewStatus === 'rejected'}
                            onChange={() => setReviewStatus('rejected')}
                          />
                        }
                        label="Reject"
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={reviewStatus === 'request_more_info'}
                            onChange={() => setReviewStatus('request_more_info')}
                          />
                        }
                        label="Request More Information"
                      />
                    </FormGroup>
                  </FormControl>

                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Review Notes"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Enter review notes, feedback, or reason for rejection..."
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerificationReviewDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleReviewVerification}
            variant="contained"
            disabled={reviewingVerification}
            color={reviewStatus === 'approved' ? 'success' : reviewStatus === 'rejected' ? 'error' : 'warning'}
          >
            {reviewingVerification ? 'Processing...' : `Submit ${reviewStatus}`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminPanel; 