import React, { useState, useEffect } from 'react';
import { TextField, Button, MenuItem, Select, InputLabel, FormControl, Box, Typography, Container, Modal, Autocomplete, Radio, RadioGroup, FormControlLabel } from '@mui/material';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Close from '@mui/icons-material/Close';
import modulesData from './modules.json';
import { useHistory } from 'react-router-dom'; // Use useHistory

const Booking = () => {
  const history = useHistory(); // Initialize useHistory
  const [lectureName, setLectureName] = useState('');
  const [department, setDepartment] = useState('');
  const [module, setModule] = useState(null);
  const [year, setYear] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [room, setRoom] = useState('');
  const [equipment, setEquipment] = useState('');
  const [sessionType, setSessionType] = useState('lecture');
  const [openLoadingModal, setOpenLoadingModal] = useState(false);
  const [openResultModal, setOpenResultModal] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [modules, setModules] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [roomFacilities, setRoomFacilities] = useState({}); // State for room facilities

  useEffect(() => {
    const fetchLecturerName = async () => {
      const email = localStorage.getItem('userEmail');
      if (email) {
        try {
          const response = await fetch('http://localhost:5000/Lectures');
          const lecturers = await response.json();
          const lecturer = lecturers.find(lecturer => lecturer.email === email);
          if (lecturer) {
            setLectureName(lecturer.name);
            setDepartment(lecturer.department || '');
          }
        } catch (error) {
          console.error('Error fetching lecturers:', error);
        }
      }
    };

    fetchLecturerName();
  }, []);

  useEffect(() => {
    if (department) {
      setModules(modulesData[department] || []);
      setModule(null);
      setYear('');

      const roomData = modulesData["Lecture Halls"].map(entry => Object.values(entry)[0]);
      setRooms(roomData);
    }
  }, [department]);

  const handleModuleChange = (event, newValue) => {
    setModule(newValue);
    if (newValue) {
      setYear(newValue.year);
    } else {
      setYear('');
    }
  };

  const handleTodayClick = () => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
  };

  const handleRoomChange = (event, newValue) => {
    setRoom(newValue);
    if (newValue) {
      const selectedRoom = modulesData["Lecture Halls"].find(entry => entry.hallNo === newValue);
      if (selectedRoom) {
        setRoomFacilities(selectedRoom.facilities); // Set facilities based on selected room
      }
    } else {
      setRoomFacilities({}); // Reset if no room is selected
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!lectureName || !department || !module || !year || !date || !startTime || !endTime || (sessionType === 'lecture' && !room) || (sessionType === 'lab' && !equipment)) {
      alert("Please fill out all required fields.");
      return;
    }

    const bookedEmail = localStorage.getItem('userEmail');

    setOpenLoadingModal(true);

    setTimeout(async () => {
      try {
        const response = await fetch('http://localhost:5000/Booking');
        const bookings = await response.json();

        const conflictingBooking = bookings.find(booking =>
          booking.location === room &&
          booking.date === date &&
          ((startTime >= booking.startTime && startTime < booking.endTime) ||
            (endTime > booking.startTime && endTime <= booking.endTime))
        );

        if (conflictingBooking) {
          setResultMessage(`Sorry! This hall is already booked for this time until ${conflictingBooking.endTime}.`);
        } else {
          const newBooking = {
            id: Math.random().toString(36).substr(2, 9),
            lectureName,
            department,
            module: `${module.code} ${module.title}`, // Save full module name
            year,
            date,
            startTime,
            endTime,
            "Type of booking": sessionType,
            location: sessionType === 'lecture' ? room : equipment,
            bookedEmail
          };

          const saveResponse = await fetch('http://localhost:5000/Booking', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newBooking),
          });

          if (saveResponse.ok) {
            setResultMessage("This hall is booked successfully.");
          } else {
            setResultMessage('Failed to save booking. Please try again.');
          }
        }
      } catch (error) {
        console.error('Error submitting booking:', error);
        setResultMessage('An error occurred while submitting the booking. Please try again.');
      } finally {
        setOpenLoadingModal(false);
        setOpenResultModal(true);
      }
    }, 3000);
  };

  const handleCloseResultModal = () => {
    setOpenResultModal(false);
    if (resultMessage.includes("successfully")) {
      // Optionally navigate to another page
      // history.push('/all'); 
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8, width: '100%' }}>
        <Typography component="h1" variant="h5">
          Booking Form
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="lectureName"
            label="Lecture Name"
            value={lectureName}
            InputProps={{
              readOnly: true,
            }}
            variant="outlined"
          />

          <FormControl fullWidth required margin="normal">
            <InputLabel id="department-label">Department</InputLabel>
            <Select
              labelId="department-label"
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              variant="outlined"
            >
              <MenuItem value="Biosystems Technology">Department of Biosystems Technology</MenuItem>
              <MenuItem value="Department of Information and Communication Technology">Department of Information and Communication Technology</MenuItem>
              <MenuItem value="Department of Civil and Environmental Technology">Department of Civil and Environmental Technology</MenuItem>
              <MenuItem value="Department of Materials and Mechanical Technology">Department of Materials and Mechanical Technology</MenuItem>
              <MenuItem value="Department of Science for Technology">Department of Science for Technology</MenuItem>
            </Select>
          </FormControl>

          <Autocomplete
            options={modules}
            getOptionLabel={(option) => `${option.code} ${option.title}`}
            onChange={handleModuleChange}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Module" 
                variant="outlined"
                fullWidth
                required
              />
            )}
          />

          <TextField
            fullWidth
            required
            margin="normal"
            id="year"
            label="Year"
            value={year}
            InputProps={{
              readOnly: true,
            }}
            variant="outlined"
          />

          <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 1 }}>
            <TextField
              fullWidth
              required
              margin="normal"
              id="date"
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
            />
            <Button variant="contained" color="info" sx={{ ml: 2 }} onClick={handleTodayClick}>
              Today
            </Button>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, marginTop: 1 }}>
            <TextField
              fullWidth
              required
              margin="normal"
              id="startTime"
              label="Start Time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              fullWidth
              required
              margin="normal"
              id="endTime"
              label="End Time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>

          <FormControl component="fieldset" margin="normal">
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Type of Booking
            </Typography>
            <RadioGroup 
              row 
              value={sessionType} 
              onChange={(e) => {
                setSessionType(e.target.value);
                setRoom(''); // Reset room on session type change
                setRoomFacilities({}); // Reset facilities
              }}
              sx={{ display: 'flex', justifyContent: 'center' }}
            >
              <FormControlLabel value="lecture" control={<Radio size="medium" />} label="Lecture" />
              <FormControlLabel value="lab" control={<Radio size="medium" />} label="Lab Session" />
            </RadioGroup>
          </FormControl>

          {sessionType === 'lecture' && (
            <>
              <FormControl fullWidth required margin="normal">
                <Autocomplete
                  options={rooms}
                  getOptionLabel={(option) => option}
                  onChange={handleRoomChange}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Hall No" 
                      variant="outlined" 
                      fullWidth 
                      required 
                    />
                  )}
                />
              </FormControl>
              {/* Optionally display facilities */}
            </>
          )}

          {sessionType === 'lab' && (
            <FormControl fullWidth required margin="normal">
              <TextField
                id="labName"
                label="Lab Name"
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                variant="outlined"
                fullWidth
                required
              />
            </FormControl>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            CONFIRM BOOKING
          </Button>
        </Box>
      </Box>

      {/* Loading Modal */}
      <Modal
        open={openLoadingModal}
        aria-labelledby="loading-modal-title"
        aria-describedby="loading-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 300,
            bgcolor: 'background.paper',
            borderRadius: '8px',
            boxShadow: 24,
            p: 4,
            textAlign: 'center'
          }}
        >
          <Typography id="loading-modal-title" variant="h6" component="h2">
            Checking The Availability
          </Typography>
          <Typography id="loading-modal-description" sx={{ mt: 2 }}>
            Please wait...
          </Typography>
        </Box>
      </Modal>

      {/* Result Modal */}
      <Modal
        open={openResultModal}
        onClose={handleCloseResultModal}
        aria-labelledby="result-modal-title"
        aria-describedby="result-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            borderRadius: '8px',
            boxShadow: 24,
            p: 4,
            textAlign: 'center'
          }}
        >
          <Typography id="result-modal-title" variant="h6" component="h2">
            {room}
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {resultMessage.includes("successfully") ? (
              <CheckCircle color="success" sx={{ fontSize: 40, mb: 1 }} />
            ) : (
              <Close color="error" sx={{ fontSize: 40, mb: 1 }} />
            )}
            <Typography id="result-modal-description" sx={{ color: resultMessage.includes("successfully") ? 'green' : 'red' }}>
              {resultMessage}
            </Typography>
          </Box>
          <Button variant="contained" sx={{ mt: 3 }} onClick={handleCloseResultModal}>
            Close
          </Button>
        </Box>
      </Modal>
    </Container>
  );
};

export default Booking;
