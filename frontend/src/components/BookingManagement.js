import { auth } from '../firebase';
import { Container, Typography, Box, Tabs, Tab, Paper, Grid, Card, CardContent, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, CircularProgress, Alert, Chip, TextField } from '@mui/material';
import { Download as DownloadIcon, Edit as EditIcon, Cancel as CancelIcon, AccessTime as AccessTimeIcon } from '@mui/icons-material';
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
  const [openModifyDialog, setOpenModifyDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
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

  const handleCancelBooking = async (bookingId) => {
    try {
      const response = await fetch(`http://localhost:3001/bookings/${bookingId}/cancel`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      fetchBookings(); // Refresh bookings
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveModification = async () => {
    try {
      const response = await fetch(`http://localhost:3001/bookings/${selectedBooking.id}/modify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startTime: newStartTime,
          endTime: newEndTime
        })
      });

      if (!response.ok) {
        throw new Error('Failed to modify booking');
      }

      setOpenModifyDialog(false);
      fetchBookings(); // Refresh bookings
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

        <Paper sx={{ mt: 3 }}>
          <Tabs
            value={value}
            onChange={(e, newValue) => setValue(newValue)}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Active Bookings" />
            <Tab label="Upcoming Reservations" />
            <Tab label="Past Bookings" />
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
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <DateTimePicker
                      label="New Start Time"
                      value={newStartTime}
                      onChange={setNewStartTime}
                      renderInput={(props) => <TextField {...props} fullWidth />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DateTimePicker
                      label="New End Time"
                      value={newEndTime}
                      onChange={setNewEndTime}
                      renderInput={(props) => <TextField {...props} fullWidth />}
                    />
                  </Grid>
                </Grid>
              </LocalizationProvider>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenModifyDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveModification} variant="contained" color="primary">
              Save Changes
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
                    <Box display="flex" justifyContent="flex-end" gap={1}>
                      {type !== 'past' && (
                        <>
                          <IconButton onClick={() => onModify(booking)} color="primary">
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => onCancel(booking.id)} color="error">
                            <CancelIcon />
                          </IconButton>
                        </>
                      )}
                      <IconButton onClick={() => handleDownloadClick(booking)}>
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