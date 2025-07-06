import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  Tooltip,
  Badge,
  Card,
  CardContent,
  Grid,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Support as SupportIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  PriorityHigh as PriorityHighIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const SupportPanel = () => {
  const { currentUser } = useAuth();
  const theme = useTheme();
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [actionDialog, setActionDialog] = useState({ open: false, report: null, action: '' });
  const [responseText, setResponseText] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    urgent: 0
  });

  useEffect(() => {
    if (currentUser?.uid) {
      loadReports();
      loadStats();
    }
  }, [currentUser?.uid]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/support/reports', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.uid}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/support/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.uid}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || { total: 0, pending: 0, resolved: 0, urgent: 0 });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleAction = (report, action) => {
    setActionDialog({ open: true, report, action });
    setResponseText('');
  };

  const handleSubmitAction = async () => {
    if (!actionDialog.report || !responseText.trim()) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/support/reports/${actionDialog.report.id}/${actionDialog.action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.uid}`
        },
        body: JSON.stringify({
          response: responseText,
          action: actionDialog.action
        })
      });
      
      if (response.ok) {
        setActionDialog({ open: false, report: null, action: '' });
        setResponseText('');
        loadReports();
        loadStats();
      }
    } catch (error) {
      console.error('Error updating report:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'resolved': return 'success';
      case 'urgent': return 'error';
      default: return 'default';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <PriorityHighIcon sx={{ color: 'error.main' }} />;
      case 'medium': return <WarningIcon sx={{ color: 'warning.main' }} />;
      case 'low': return <CheckCircleIcon sx={{ color: 'success.main' }} />;
      default: return null;
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: 'primary.main', mb: 2 }}>
          <SupportIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Support Panel
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage user reports and support requests
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">{stats.total}</Typography>
                  <Typography variant="body2">Total Reports</Typography>
                </Box>
                <SupportIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">{stats.pending}</Typography>
                  <Typography variant="body2">Pending</Typography>
                </Box>
                <ScheduleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">{stats.resolved}</Typography>
                  <Typography variant="body2">Resolved</Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'error.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">{stats.urgent}</Typography>
                  <Typography variant="body2">Urgent</Typography>
                </Box>
                <PriorityHighIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Reports Table */}
      <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={600}>User Reports</Typography>
          <Button
            startIcon={<RefreshIcon />}
            onClick={loadReports}
            disabled={loading}
            variant="outlined"
          >
            Refresh
          </Button>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#fafafa' }}>
                <TableCell>User</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon sx={{ color: 'text.secondary' }} />
                      <Typography variant="body2" fontWeight={500}>
                        {report.reportedUser?.username || 'Unknown User'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{report.reason}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {report.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={report.status} 
                      color={getStatusColor(report.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getPriorityIcon(report.priority)}
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {report.priority}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{formatDate(report.createdAt)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          onClick={() => setSelectedReport(report)}
                        >
                          <EmailIcon />
                        </IconButton>
                      </Tooltip>
                      {report.status === 'pending' && (
                        <>
                          <Tooltip title="Mark as Resolved">
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => handleAction(report, 'resolve')}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Mark as Urgent">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleAction(report, 'urgent')}
                            >
                              <PriorityHighIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Report Details Dialog */}
      <Dialog 
        open={!!selectedReport} 
        onClose={() => setSelectedReport(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedReport && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">Report Details</Typography>
                <IconButton onClick={() => setSelectedReport(null)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Reported User</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedReport.reportedUser?.username || 'Unknown User'}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Reason</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedReport.reason}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedReport.description}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={selectedReport.status} 
                    color={getStatusColor(selectedReport.status)}
                    sx={{ mb: 2 }}
                  />
                  
                  <Typography variant="subtitle2" color="text.secondary">Priority</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    {getPriorityIcon(selectedReport.priority)}
                    <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                      {selectedReport.priority}
                    </Typography>
                  </Box>
                  
                  <Typography variant="subtitle2" color="text.secondary">Reported On</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {formatDate(selectedReport.createdAt)}
                  </Typography>
                  
                  {selectedReport.response && (
                    <>
                      <Typography variant="subtitle2" color="text.secondary">Response</Typography>
                      <Typography variant="body1">
                        {selectedReport.response}
                      </Typography>
                    </>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedReport(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Action Dialog */}
      <Dialog 
        open={actionDialog.open} 
        onClose={() => setActionDialog({ open: false, report: null, action: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {actionDialog.action === 'resolve' ? 'Resolve Report' : 'Mark as Urgent'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Response/Notes"
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            sx={{ mt: 2 }}
            placeholder="Add any notes or response to the user..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, report: null, action: '' })}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitAction}
            variant="contained"
            color={actionDialog.action === 'resolve' ? 'success' : 'error'}
          >
            {actionDialog.action === 'resolve' ? 'Resolve' : 'Mark Urgent'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SupportPanel; 