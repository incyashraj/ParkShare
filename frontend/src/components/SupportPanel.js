import React, { useState, useEffect } from 'react';
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
  Paper
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { 
  Support as SupportIcon,
  Add as AddIcon,
  Message as MessageIcon,
  PriorityHigh as PriorityHighIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

const SupportPanel = () => {
  const { currentUser } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  // New ticket form
  const [newTicket, setNewTicket] = useState({
    subject: '',
    message: '',
    category: 'general',
    priority: 'medium'
  });

  useEffect(() => {
    if (currentUser) {
      loadTickets();
    }
  }, [currentUser]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/support/tickets', {
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
      const response = await fetch('http://localhost:3001/api/support/tickets', {
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
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create ticket');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      setError('Error creating ticket');
    }
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setViewDialog(true);
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
          <MessageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No support tickets yet
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Create your first support ticket if you need help
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialog(true)}
          >
            Create Ticket
          </Button>
        </Paper>
      ) : (
        <List>
          {tickets.map((ticket) => (
            <Card key={ticket.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6" component="div">
                    {ticket.subject}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label={ticket.status.replace('_', ' ')}
                      color={getStatusColor(ticket.status)}
                      size="small"
                    />
                    <Chip
                      label={ticket.priority}
                      color={getPriorityColor(ticket.priority)}
                      size="small"
                      icon={<PriorityHighIcon />}
                    />
                  </Box>
                </Box>
                
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  {ticket.message.substring(0, 100)}...
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Created: {formatDate(ticket.createdAt)}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => handleViewTicket(ticket)}
                  >
                    View Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </List>
      )}

      {/* Create Ticket Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Support Ticket</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Subject"
            value={newTicket.subject}
            onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={newTicket.category}
              onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
              label="Category"
            >
              <MenuItem value="general">General</MenuItem>
              <MenuItem value="payment">Payment</MenuItem>
              <MenuItem value="booking">Booking</MenuItem>
              <MenuItem value="technical">Technical</MenuItem>
              <MenuItem value="account">Account</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
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
            multiline
            rows={4}
            value={newTicket.message}
            onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
            placeholder="Describe your issue in detail..."
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
        {selectedTicket && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{selectedTicket.subject}</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={selectedTicket.status.replace('_', ' ')}
                    color={getStatusColor(selectedTicket.status)}
                  />
                  <Chip
                    label={selectedTicket.priority}
                    color={getPriorityColor(selectedTicket.priority)}
                  />
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedTicket.message}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              {selectedTicket.responses && selectedTicket.responses.length > 0 ? (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>Responses</Typography>
                  {selectedTicket.responses.map((response, index) => (
                    <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2" color="primary">
                          {response.adminName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(response.createdAt)}
                        </Typography>
                      </Box>
                      <Typography variant="body2">
                        {response.message}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary">
                  No responses yet. We'll get back to you soon.
                </Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialog(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default SupportPanel; 