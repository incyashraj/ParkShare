import { auth } from '../firebase';
import { Container, Typography, Box, Tabs, Tab, Paper, Grid, Card, CardContent, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, CircularProgress, Alert, Chip, TextField } from '@mui/material';
import { Download as DownloadIcon, Edit as EditIcon, Cancel as CancelIcon, AccessTime as AccessTimeIcon, CalendarToday, CheckCircle } from '@mui/icons-material';
import { format } from 'date-fns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ReceiptDownload from './ReceiptDownload';
import { useState, useEffect } from 'react';

function TabPanel({ children, value, index }) {
  return (
    <Box hidden={value !== index} sx={{ py: 3 }}>
      {value === index && children}
    </Box>
  );
}

function BookingManagement() {
  const [value, setValue] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [openModifyDialog, setOpenModifyDialog] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [newStartTime, setNewStartTime] = useState(null);
  const [newEndTime, setNewEndTime] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`http://localhost:3001/users/${user.uid}/bookings`);
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleModifyBooking = (booking) => {
    setSelectedBooking(booking);
    setNewStartTime(new Date(booking.startTime));
    setNewEndTime(new Date(booking.endTime));
    setOpenModifyDialog(true);
  };

  const handleCancelBooking = (booking) => {
    setBookingToCancel(booking);
    setOpenCancelDialog(true);
  };

  const confirmCancelBooking = async () => {
    try {
      const response = await fetch(`http://localhost:3001/bookings/${bookingToCancel.id}/cancel`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      setOpenCancelDialog(false);
      setBookingToCancel(null);
      setSuccessMessage('Booking cancelled successfully!');
      fetchBookings(); // Refresh bookings
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveModification = async () => {
    try {
      // Validate dates
      if (!newStartTime || !newEndTime) {
        setError('Please select both start and end times');
        return;
      }

      if (newEndTime <= newStartTime) {
        setError('End time must be after start time');
        return;
      }

      // Check if the new time is in the future
      if (newStartTime <= new Date()) {
        setError('Start time must be in the future');
        return;
      }

      const response = await fetch(`http://localhost:3001/bookings/${selectedBooking.id}/modify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startTime: newStartTime.toISOString(),
          endTime: newEndTime.toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to modify booking');
      }

      const result = await response.json();
      setOpenModifyDialog(false);
      setError(null);
      setSuccessMessage('Booking modified successfully!');
      fetchBookings(); // Refresh bookings
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
      
      console.log('Booking modified successfully:', result);
    } catch (err) {
      setError(err.message);
    }
  };

  const downloadReceipt = (booking) => {
    // Generate and download receipt (implement actual PDF generation)
    console.log('Downloading receipt for booking:', booking.id);
  };

  const filterBookings = (type) => {
    const now = new Date();
    switch (type) {
      case 'active':
        // Active bookings: Currently ongoing (started but not ended)
        return bookings.filter(booking => {
          try {
            const startTime = new Date(booking.startTime);
            const endTime = new Date(booking.endTime);
            return !isNaN(startTime.getTime()) && !isNaN(endTime.getTime()) &&
                   startTime <= now && endTime >= now;
          } catch (error) {
            console.error('Error filtering active bookings:', error);
            return false;
          }
        });
      case 'upcoming':
        // Upcoming bookings: Future bookings that haven't started yet
        return bookings.filter(booking => {
          try {
            const startTime = new Date(booking.startTime);
            return !isNaN(startTime.getTime()) && startTime > now;
          } catch (error) {
            console.error('Error filtering upcoming bookings:', error);
            return false;
          }
        });
      case 'past':
        // Past bookings: Completed bookings
        return bookings.filter(booking => {
          try {
            const endTime = new Date(booking.endTime);
            return !isNaN(endTime.getTime()) && endTime < now;
          } catch (error) {
            console.error('Error filtering past bookings:', error);
            return false;
          }
        });
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" gutterBottom color="primary">
          Booking Management
        </Typography>
        
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        <Paper sx={{ mt: 3 }}>
          <Tabs
            value={value}
            onChange={(e, newValue) => setValue(newValue)}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon fontSize="small" />
                  <Box>
                    <Typography variant="body2">Currently Active</Typography>
                    <Typography variant="caption" color="text.secondary">Ongoing bookings</Typography>
                  </Box>
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday fontSize="small" />
                  <Box>
                    <Typography variant="body2">Upcoming</Typography>
                    <Typography variant="caption" color="text.secondary">Future reservations</Typography>
                  </Box>
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle fontSize="small" />
                  <Box>
                    <Typography variant="body2">Completed</Typography>
                    <Typography variant="caption" color="text.secondary">Past bookings</Typography>
                  </Box>
                </Box>
              } 
            />
          </Tabs>

          <TabPanel value={value} index={0}>
            <BookingsList 
              bookings={filterBookings('active')} 
              onModify={handleModifyBooking}
              onCancel={handleCancelBooking}
              onDownload={downloadReceipt}
              type="active"
            />
          </TabPanel>

          <TabPanel value={value} index={1}>
            <BookingsList 
              bookings={filterBookings('upcoming')} 
              onModify={handleModifyBooking}
              onCancel={handleCancelBooking}
              onDownload={downloadReceipt}
              type="upcoming"
            />
          </TabPanel>

          <TabPanel value={value} index={2}>
            <BookingsList 
              bookings={filterBookings('past')} 
              onModify={handleModifyBooking}
              onCancel={handleCancelBooking}
              onDownload={downloadReceipt}
              type="past"
            />
          </TabPanel>
        </Paper>

        <Dialog open={openModifyDialog} onClose={() => setOpenModifyDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Modify Booking</DialogTitle>
          <DialogContent>
            <Box py={2}>
              {selectedBooking && (
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Modifying booking for: <strong>{selectedBooking.spotDetails?.location || selectedBooking.spotLocation}</strong>
                </Typography>
              )}
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <DateTimePicker
                      label="New Start Time"
                      value={newStartTime}
                      onChange={setNewStartTime}
                      renderInput={(props) => <TextField {...props} fullWidth />}
                      minDateTime={new Date()}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DateTimePicker
                      label="New End Time"
                      value={newEndTime}
                      onChange={setNewEndTime}
                      renderInput={(props) => <TextField {...props} fullWidth />}
                      minDateTime={newStartTime || new Date()}
                    />
                  </Grid>
                </Grid>
              </LocalizationProvider>
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setOpenModifyDialog(false);
              setError(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveModification} variant="contained" color="primary">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Cancel Confirmation Dialog */}
        <Dialog open={openCancelDialog} onClose={() => setOpenCancelDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Cancel Booking</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to cancel your booking for{' '}
              <strong>{bookingToCancel?.spotDetails?.location || bookingToCancel?.spotLocation}</strong>?
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCancelDialog(false)}>
              Keep Booking
            </Button>
            <Button onClick={confirmCancelBooking} variant="contained" color="error">
              Cancel Booking
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}

function BookingsList({ bookings, onModify, onCancel, onDownload, type }) {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);

  const handleDownloadClick = (booking) => {
    setSelectedBooking(booking);
    setReceiptDialogOpen(true);
  };

  if (!bookings.length) {
    return (
      <Typography color="textSecondary" align="center">
        No {type} bookings found
      </Typography>
    );
  }

  return (
    <>
      <Grid container spacing={3}>
        {bookings.map((booking) => (
          <Grid item xs={12} key={booking.id}>
            <Card>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6">
                      {booking.spotDetails?.location || booking.spotLocation || 'Unknown Location'}
                    </Typography>
                    <Box display="flex" alignItems="center" mt={1}>
                      <AccessTimeIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                      <Typography variant="body2" color="textSecondary">
                        {(() => {
                          try {
                            const startTime = new Date(booking.startTime);
                            const endTime = new Date(booking.endTime);
                            if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
                              return 'Invalid date';
                            }
                            return `${format(startTime, 'PPp')} - ${format(endTime, 'PPp')}`;
                          } catch (error) {
                            console.error('Error formatting booking dates:', error);
                            return 'Invalid date';
                          }
                        })()}
                      </Typography>
                    </Box>
                    <Chip
                      label={booking.status || 'confirmed'}
                      color={booking.status === 'confirmed' ? 'success' : 'default'}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" justifyContent="flex-end" gap={1} alignItems="center">
                      <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
                        ${booking.totalPrice || 'N/A'}
                      </Typography>
                      {type !== 'past' && (
                        <>
                          <Button
                            startIcon={<EditIcon />}
                            onClick={() => onModify(booking)}
                            variant="outlined"
                            size="small"
                            color="primary"
                          >
                            Edit
                          </Button>
                          <IconButton onClick={() => onCancel(booking)} color="error" size="small">
                            <CancelIcon />
                          </IconButton>
                        </>
                      )}
                      <IconButton onClick={() => handleDownloadClick(booking)} size="small">
                        <DownloadIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Receipt Download Dialog */}
      <Dialog 
        open={receiptDialogOpen} 
        onClose={() => setReceiptDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Download Receipt</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <ReceiptDownload 
              booking={selectedBooking}
              spot={selectedBooking.spotDetails}
              user={auth.currentUser}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReceiptDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default BookingManagement;