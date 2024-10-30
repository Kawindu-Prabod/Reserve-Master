import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper, List, ListItem, ListItemText, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import { format, isToday, isAfter } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const AllBookings = () => {
  const [lecturerBookings, setLecturerBookings] = useState([]);
  const [isLecturer, setIsLecturer] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email) {
      setUserEmail(email);
      setIsLecturer(email.endsWith('@fot.sjp.ac.lk'));
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch('http://localhost:5000/Booking');
      const bookings = await response.json();
      setLecturerBookings(bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleDeleteBooking = async (id) => {
    try {
      await fetch(`http://localhost:5000/Booking/${id}`, {
        method: 'DELETE',
      });
      setLecturerBookings(prevBookings => prevBookings.filter(booking => booking.id !== id));
      setOpenDialog(false);
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  const openConfirmationDialog = (id) => {
    setBookingToDelete(id);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setBookingToDelete(null);
  };

  const todayDate = format(new Date(), 'eeee, MMMM do, yyyy');

  // Filter bookings into today's and future bookings
  const todayBookings = lecturerBookings.filter(booking => isToday(new Date(booking.date)));
  const futureBookings = lecturerBookings.filter(booking => isAfter(new Date(booking.date), new Date()));

  return (
    <Container maxWidth="sm">
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
        <Typography component="h1" variant="h5" gutterBottom>
          Today's Time Table
        </Typography>
        <Typography component="p" variant="h6" color="textSecondary" gutterBottom>
          {todayDate}
        </Typography>

        <Paper elevation={3} sx={{ width: '100%', mt: 2, p: 2 }}>
          <List>
            {todayBookings.length === 0 ? (
              <Typography variant="body1" align="center">
                No bookings scheduled for today.
              </Typography>
            ) : (
              todayBookings.map((item) => {
                const hasExpired = new Date() > new Date(`${item.date}T${item.endTime}`);
                const bookingType = item["Type of booking"] === 'lecture' ? 'Lecture' : 
                                    item["Type of booking"] === 'lab' ? 'Lab Session' : 
                                    'Other';

                return (
                  <ListItem key={item.id} divider sx={{ bgcolor: hasExpired ? 'grey.200' : 'white' }}>
                    <ListItemText
                      primary={
                        <Typography variant="h6" sx={{ textDecoration: hasExpired ? 'line-through' : 'none', color: hasExpired ? 'grey' : 'inherit' }}>
                          <span style={{ color: 'red', fontWeight: 'bold' }}>{`${item.module}`}</span>
                          {` [${item.year}]`}<br />
                          <LocationOnIcon />{` ${item.location} `}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ textDecoration: hasExpired ? 'line-through' : 'none', color: hasExpired ? 'grey' : 'inherit' }}>
                          {`Time: ${format(new Date(`${item.date}T${item.startTime}`), 'hh:mm a')} - ${format(new Date(`${item.date}T${item.endTime}`), 'hh:mm a')} | Type: ${bookingType}`}
                          <br />{`• Lecture: ${item.lectureName}`}
                        </Typography>
                      }
                    />
                    {isLecturer && item.bookedEmail === userEmail && (
                      <IconButton 
                        edge="end" 
                        aria-label="delete" 
                        onClick={() => openConfirmationDialog(item.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </ListItem>
                );
              })
            )}
          </List>
        </Paper>

        <Typography component="h1" variant="h5" gutterBottom sx={{ mt: 4 }}>
          Future Time Table
        </Typography>

        <Paper elevation={3} sx={{ width: '100%', mt: 2, p: 2 }}>
          <List>
            {futureBookings.length === 0 ? (
              <Typography variant="body1" align="center">
                No future bookings scheduled.
              </Typography>
            ) : (
              futureBookings.map((item) => {
                const hasExpired = new Date() > new Date(`${item.date}T${item.endTime}`);
                const bookingType = item["Type of booking"] === 'lecture' ? 'Lecture' : 
                                    item["Type of booking"] === 'lab' ? 'Lab Session' : 
                                    'Other';

                return (
                  <ListItem key={item.id} divider sx={{ bgcolor: hasExpired ? 'grey.200' : 'white' }}>
                    <ListItemText
                      primary={
                        <Typography variant="h6" sx={{ textDecoration: hasExpired ? 'line-through' : 'none', color: hasExpired ? 'grey' : 'inherit' }}>
                          <span style={{ color: 'red', fontWeight: 'bold' }}>{`${item.module}`}</span>
                          {` [${item.year}]`}<br />
                          <LocationOnIcon />{` ${item.location} `}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ textDecoration: hasExpired ? 'line-through' : 'none', color: hasExpired ? 'grey' : 'inherit' }}>
                          {`Time: ${format(new Date(`${item.date}T${item.startTime}`), 'hh:mm a')} - ${format(new Date(`${item.date}T${item.endTime}`), 'hh:mm a')} | Type: ${bookingType}`}
                          <br />{`• Lecture: ${item.lectureName}`}
                        </Typography>
                      }
                    />
                    {isLecturer && item.bookedEmail === userEmail && (
                      <IconButton 
                        edge="end" 
                        aria-label="delete" 
                        onClick={() => openConfirmationDialog(item.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </ListItem>
                );
              })
            )}
          </List>
        </Paper>

        {/* Confirmation Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleDialogClose}
        >
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this booking?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} color="primary">
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (bookingToDelete) {
                  handleDeleteBooking(bookingToDelete);
                }
              }} 
              color="secondary"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default AllBookings;
