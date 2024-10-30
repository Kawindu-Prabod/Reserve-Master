import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper, List, ListItem, ListItemText, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import { format, isToday } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import { useHistory } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const Today = () => {
  const history = useHistory();
  const [currentTime, setCurrentTime] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [lecturerBookings, setLecturerBookings] = useState([]);
  const [isLecturer, setIsLecturer] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email) {
      setUserEmail(email);
      setIsLecturer(email.endsWith('@fot.sjp.ac.lk'));
    }
  }, []);

  useEffect(() => {
    if (userEmail) {
      fetchBookings();
    }
  }, [userEmail]);

  const fetchBookings = async () => {
    try {
      const response = await fetch('http://localhost:5000/Booking');
      const bookings = await response.json();

      // Filter bookings based on today's date
      const todayBookings = bookings.filter(booking => 
        isToday(new Date(booking.date))
      );

      // Ensure only the logged-in lecturer's bookings are shown
      const filteredBookings = isLecturer
        ? todayBookings.filter(booking => booking.bookedEmail === userEmail)
        : todayBookings;

      filteredBookings.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
      setLecturerBookings(filteredBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date();
      setCurrentTime(format(now, 'hh:mm:ss a'));
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleDeleteBooking = async (id) => {
    try {
      await fetch(`http://localhost:5000/Booking/${id}`, {
        method: 'DELETE',
      });

      setLecturerBookings(prevBookings =>
        prevBookings.filter(booking => booking.id !== id)
      );
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

  const handleBookRoom = () => {
    history.push('/booking'); 
  };

  const handleViewAllBookings = () => {
    history.push('/All');
  };

  const todayDate = format(new Date(), 'eeee, MMMM do, yyyy');

  return (
    <Container maxWidth="sm">
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
        <Typography component="h1" variant="h5" gutterBottom>
          Today's Bookings
        </Typography>
        <Typography component="p" variant="h6" color="textSecondary" gutterBottom>
          {todayDate}
        </Typography>
        <Typography component="p" variant="h6" color="textSecondary">
          {currentTime}
        </Typography>

        {/* Book a Room Button - Only for Lecturers */}
        {isLecturer && (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleBookRoom} 
            sx={{ mt: 2 }}
          >
            Book a Lecture Hall
          </Button>
        )}

        {/* View All Bookings Button */}
        <Button 
          variant="contained" 
          color="success" 
          onClick={handleViewAllBookings} 
          sx={{ mt: 2 }}
        >
          View All Bookings
        </Button>

        <Paper elevation={3} sx={{ width: '100%', mt: 2, p: 2 }}>
          <List>
            {lecturerBookings.length === 0 ? (
              <Typography variant="body1" align="center">
                No bookings scheduled for today.
              </Typography>
            ) : (
              lecturerBookings.map((item) => {
                const hasExpired = new Date() > new Date(`${item.date}T${item.endTime}`);

                // Get the booking type from the database
                const bookingType = item["Type of booking"] === 'lecture' ? 'Lecture' : 
                                    item["Type of booking"] === 'lab' ? 'Lab Session' : 
                                    'Other';

                return (
                  <ListItem key={item.id} divider sx={{ bgcolor: hasExpired ? 'grey.200' : 'white' }}>
                    <ListItemText
                      primary={
                        <Typography variant="h6" sx={{ textDecoration: hasExpired ? 'line-through' : 'none', color: hasExpired ? 'grey' : 'inherit' }}>
                          <span style={{ color: 'red', fontWeight: 'bold' }}>{`${item.module}`}</span>
                          {` [${item.year}]`}<br/>
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
                    {isLecturer && (
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

export default Today;
