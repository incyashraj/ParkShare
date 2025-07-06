import React, { useState, useEffect, useContext } from 'react';
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
  Badge,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  AdminPanelSettings,
  Support,
  People,
  Dashboard,
  Close,
  Reply,
  Delete,
  Assignment,
  CheckCircle,
  Warning,
  Error,
  Info,
  Refresh,
  FilterList,
  Search
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const AdminPanel = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [responseDialog, setResponseDialog] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (currentUser) {
      loadAdminData();
    }
  }, [currentUser]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      // Load tickets
      const ticketsResponse = await fetch('/api/support/tickets', {
        headers: {
          'Authorization': `Bearer ${currentUser.uid}`
        }
      });
      const ticketsData = await ticketsResponse.json();
      setTickets(ticketsData.tickets || []);

      // Load users
      const usersResponse = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${currentUser.uid}`
        }
      });
      const usersData = await usersResponse.json();
      setUsers(usersData.users || []);

      // Calculate stats
      const stats = {
        totalTickets: ticketsData.tickets?.length || 0,
        openTickets: ticketsData.tickets?.filter(t => t.status === 'open').length || 0,
        resolvedTickets: ticketsData.tickets?.filter(t => t.status === 'resolved').length || 0,
        totalUsers: usersData.users?.length || 0,
        activeUsers: usersData.users?.filter(u => u.lastSeen && new Date(u.lastSeen) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length || 0
      };
      setStats(stats);
    } catch (error) {
      console.error('Error loading admin data:', error);
      setSnackbar({ open: true, message: 'Failed to load admin data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleRespondToTicket = async () => {
    if (!selectedTicket || !responseText.trim()) return;

    try {
      const response = await fetch(`/api/support/tickets/${selectedTicket.id}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.uid}`
        },
        body: JSON.stringify({ message: responseText })
      });

      if (response.ok) {
        setSnackbar({ open: true, message: 'Response sent successfully', severity: 'success' });
        setResponseDialog(false);
        setResponseText('');
        setSelectedTicket(null);
        loadAdminData(); // Refresh data
      } else {
        throw new Error('Failed to send response');
      }
    } catch (error) {
      console.error('Error responding to ticket:', error);
      setSnackbar({ open: true, message: 'Failed to send response', severity: 'error' });
    }
  };

  const handleUpdateTicketStatus = async (ticketId, status) => {
    try {
      const response = await fetch(`/api/support/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.uid}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        setSnackbar({ open: true, message: 'Ticket status updated', severity: 'success' });
        loadAdminData(); // Refresh data
      } else {
        throw new Error('Failed to update ticket status');
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
      setSnackbar({ open: true, message: 'Failed to update ticket status', severity: 'error' });
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;

    try {
      const response = await fetch(`/api/support/tickets/${ticketId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentUser.uid}`
        }
      });

      if (response.ok) {
        setSnackbar({ open: true, message: 'Ticket deleted successfully', severity: 'success' });
        loadAdminData(); // Refresh data
      } else {
        throw new Error('Failed to delete ticket');
      }
    } catch (error) {
      console.error('Error deleting ticket:', error);
      setSnackbar({ open: true, message: 'Failed to delete ticket', severity: 'error' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'warning';
      case 'in_progress': return 'info';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <Warning />;
      case 'in_progress': return <Info />;
      case 'resolved': return <CheckCircle />;
      case 'closed': return <Close />;
      default: return <Info />;
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user.username.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const DashboardTab = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        Admin Dashboard
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Tickets
              </Typography>
              <Typography variant="h4">
                {stats.totalTickets}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Open Tickets
              </Typography>
              <Typography variant="h4" color="warning.main">
                {stats.openTickets}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Resolved Tickets
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.resolvedTickets}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h4">
                {stats.totalUsers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom>
        Recent Activity
      </Typography>
      
      <Paper sx={{ p: 2 }}>
        <List>
          {tickets.slice(0, 5).map((ticket) => (
            <ListItem key={ticket.id} divider>
              <ListItemText
                primary={ticket.subject}
                secondary={`By ${ticket.user.username} - ${new Date(ticket.createdAt).toLocaleDateString()}`}
              />
              <ListItemSecondaryAction>
                <Chip
                  label={ticket.status}
                  color={getStatusColor(ticket.status)}
                  size="small"
                />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );

  const TicketsTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Support Tickets
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadAdminData}
        >
          Refresh
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          placeholder="Search tickets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{ minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            label="Status"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell>{ticket.id}</TableCell>
                <TableCell>{ticket.subject}</TableCell>
                <TableCell>{ticket.user.username}</TableCell>
                <TableCell>
                  <Chip
                    icon={getStatusIcon(ticket.status)}
                    label={ticket.status}
                    color={getStatusColor(ticket.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setResponseDialog(true);
                    }}
                  >
                    <Reply />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleUpdateTicketStatus(ticket.id, 'resolved')}
                  >
                    <CheckCircle />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteTicket(ticket.id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const UsersTab = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        User Management
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.uid}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.fullName || user.username}</TableCell>
                <TableCell>
                  <Chip
                    label={user.isAdmin ? 'Admin' : 'User'}
                    color={user.isAdmin ? 'primary' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button size="small" variant="outlined">
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  if (!currentUser) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          You must be logged in to access the admin panel.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <AdminPanelSettings sx={{ mr: 2, fontSize: 40 }} color="primary" />
          <Typography variant="h4">
            Admin Panel
          </Typography>
        </Box>

        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab icon={<Dashboard />} label="Dashboard" />
          <Tab icon={<Support />} label="Support Tickets" />
          <Tab icon={<People />} label="Users" />
        </Tabs>

        <Divider sx={{ mb: 3 }} />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography>Loading...</Typography>
          </Box>
        ) : (
          <Box>
            {activeTab === 0 && <DashboardTab />}
            {activeTab === 1 && <TicketsTab />}
            {activeTab === 2 && <UsersTab />}
          </Box>
        )}
      </Paper>

      {/* Response Dialog */}
      <Dialog open={responseDialog} onClose={() => setResponseDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Respond to Ticket: {selectedTicket?.subject}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Original Message:
            </Typography>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography>{selectedTicket?.message}</Typography>
            </Paper>
          </Box>
          
          {selectedTicket?.responses?.map((response) => (
            <Box key={response.id} sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {response.user.username} ({new Date(response.createdAt).toLocaleString()}):
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography>{response.message}</Typography>
              </Paper>
            </Box>
          ))}
          
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your Response"
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResponseDialog(false)}>Cancel</Button>
          <Button onClick={handleRespondToTicket} variant="contained">
            Send Response
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminPanel; 