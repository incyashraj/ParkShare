import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  Paper,
  Snackbar
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useRealtime } from '../contexts/RealtimeContext';
import { 
  Support as SupportIcon,
  Add as AddIcon,
  Message as MessageIcon,
  PriorityHigh as PriorityHighIcon,
  Schedule as ScheduleIcon,
  NewReleases as NewUpdateIcon
} from '@mui/icons-material';
import { API_BASE } from '../apiConfig';

const SupportPanel = () => {
  const { currentUser } = useAuth();
  const { socket } = useRealtime();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [notification, setNotification] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  
  // New ticket form
  const [newTicket, setNewTicket] = useState({
    subject: '',
    message: '',
    category: 'general',
    priority: 'medium'
  });

  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (currentUser) {
      loadTickets();
    }
  }, [currentUser]);

  // Real-time WebSocket event listeners
  useEffect(() => {
    if (!socket) return;

    // Listen for new support ticket messages
    socket.on('support-ticket-updated', (notification) => {
      console.log('Support ticket updated:', notification);
      setNotification({
        message: `New message in ticket: ${notification.ticketSubject}`,
        severity: 'info'
      });
      
      // Update tickets with new update flag if message is from admin
      if (notification.sender?.role === 'admin') {
        setTickets(prevTickets => 
          prevTickets.map(ticket => 
            ticket.id === notification.ticketId 
              ? { ...ticket, hasNewUpdate: true, updatedAt: notification.timestamp }
              : ticket
          )
        );
      } else {
        loadTickets(); // Refresh tickets to get latest messages
      }
    });

    // Listen for ticket status updates
    socket.on('ticket-status-updated', (notification) => {
      console.log('Ticket status updated:', notification);
      setNotification({
        message: `Ticket "${notification.ticketSubject}" status changed to ${notification.newStatus}`,
        severity: 'info'
      });
      
      // Update ticket with new update flag for status changes
      setTickets(prevTickets => 
        prevTickets.map(ticket => 
          ticket.id === notification.ticketId 
            ? { ...ticket, hasNewUpdate: true, updatedAt: notification.timestamp }
            : ticket
        )
      );
    });

    // Listen for new messages in specific ticket room
    socket.on('ticket-message-added', (data) => {
      console.log('New message in ticket room:', data);
      if (selectedTicket && data.ticketId === selectedTicket.id) {
        // Update the selected ticket with new message
        setSelectedTicket(data.ticket);
      }
      loadTickets();
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
      loadTickets();
    });

    return () => {
      socket.off('support-ticket-updated');
      socket.off('ticket-status-updated');
      socket.off('ticket-message-added');
      socket.off('ticket-user-typing');
      socket.off('ticket-updated');
    };
  }, [socket, selectedTicket]);

  // Join ticket room when viewing a ticket
  useEffect(() => {
    if (socket && selectedTicket) {
      socket.emit('join-ticket-room', selectedTicket.id);
      
      return () => {
        socket.emit('leave-ticket-room', selectedTicket.id);
      };
    }
  }, [socket, selectedTicket]);

  // Handle typing indicators
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

  const loadTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/support/tickets`, {
        headers: {
          Authorization: `Bearer ${currentUser.uid}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets || []);
      } else {
        setError('Failed to load tickets');
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
      setError('Error loading tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/support/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.uid}`
        },
        body: JSON.stringify(newTicket)
      });

      if (response.ok) {
        setCreateDialog(false);
        setNewTicket({ subject: '', message: '', category: 'general', priority: 'medium' });
        loadTickets();
        setError(null);
        setNotification({
          message: 'Support ticket created successfully!',
          severity: 'success'
        });
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create ticket');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      setError('Error creating ticket');
    }
  };

  const handleViewTicket = async (ticket) => {
    setSelectedTicket(ticket);
    setViewDialog(true);
    
    // Mark ticket as read if it has new updates
    if (ticket.hasNewUpdate) {
      try {
        await fetch(`${API_BASE}/api/support/tickets/${ticket.id}/read`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentUser.uid}`
          }
        });
        
        // Update the ticket in the local state
        setTickets(prevTickets => 
          prevTickets.map(t => 
            t.id === ticket.id ? { ...t, hasNewUpdate: false } : t
          )
        );
      } catch (error) {
        console.error('Error marking ticket as read:', error);
      }
    }
  };

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
        loadTickets();
      } else {
        setError('Failed to send message');
      }
    } catch (error) {
      setError('Error sending message');
    } finally {
      setSendingMessage(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'error';
      case 'in_progress': return 'warning';
      case 'resolved': return 'success';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  if (!currentUser) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Please log in to access support.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SupportIcon sx={{ mr: 2, fontSize: 32 }} />
        <Typography variant="h4" component="h1">
          Support Center
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          My Support Tickets ({tickets.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialog(true)}
        >
          Create New Ticket
        </Button>
      </Box>

      {loading ? (
        <Typography>Loading tickets...</Typography>
      ) : tickets.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No support tickets yet
          </Typography>
          <Typography color="textSecondary">
            Create your first support ticket to get help with any issues.
          </Typography>
        </Paper>
      ) : (
        <List>
          {tickets.map((ticket) => (
            <Card key={ticket.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h6">
                        {ticket.subject}
                      </Typography>
                      {ticket.hasNewUpdate && (
                        <Chip
                          icon={<NewUpdateIcon />}
                          label="New Update"
                          color="error"
                          size="small"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      {ticket.messages?.[0]?.message?.substring(0, 100)}...
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Chip 
                        label={ticket.status} 
                        color={getStatusColor(ticket.status)}
                        size="small"
                      />
                      <Chip 
                        label={ticket.priority} 
                        color={getPriorityColor(ticket.priority)}
                        size="small"
                      />
                      <Chip 
                        label={ticket.category} 
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      Created: {formatDate(ticket.createdAt)}
                      {ticket.updatedAt !== ticket.createdAt && 
                        ` • Updated: ${formatDate(ticket.updatedAt)}`
                      }
                      {ticket.messages && 
                        ` • ${ticket.messages.length} message${ticket.messages.length !== 1 ? 's' : ''}`
                      }
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<MessageIcon />}
                    onClick={() => handleViewTicket(ticket)}
                  >
                    View
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </List>
      )}

      {/* Create Ticket Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Support Ticket</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Subject"
            value={newTicket.subject}
            onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              value={newTicket.category}
              onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
              label="Category"
            >
              <MenuItem value="general">General</MenuItem>
              <MenuItem value="technical">Technical</MenuItem>
              <MenuItem value="billing">Billing</MenuItem>
              <MenuItem value="booking">Booking</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Priority</InputLabel>
            <Select
              value={newTicket.priority}
              onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
              label="Priority"
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Message"
            value={newTicket.message}
            onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
            margin="normal"
            multiline
            rows={4}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateTicket} 
            variant="contained"
            disabled={!newTicket.subject || !newTicket.message}
          >
            Create Ticket
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Ticket Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedTicket?.subject}
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
              
              {(selectedTicket.status === 'open' || selectedTicket.status === 'in_progress') && (
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
              )}
              
              {(selectedTicket.status === 'closed' || selectedTicket.status === 'resolved') && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  This ticket is {selectedTicket.status}. No new messages can be added.
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
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

      {/* Notification Snackbar */}
      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification?.severity || 'info'}
          sx={{ width: '100%' }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SupportPanel; 