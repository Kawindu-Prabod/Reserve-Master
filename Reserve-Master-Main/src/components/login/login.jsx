import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Container } from '@mui/material';
import { useHistory } from 'react-router-dom'; // Import useHistory for navigation

const Login = () => {
  const history = useHistory(); // Initialize useHistory
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // State for error messages

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      // Fetch users from the server
      const response = await fetch('http://localhost:5000/Lectures');
      const lectures = await response.json();

      // Fetch students from the server
      const responseStudents = await fetch('http://localhost:5000/Students');
      const students = await responseStudents.json();

      // Check for valid user (students and lecturers)
      const validUser = [...lectures, ...students].find(user => user.email === email && user.password === password);

      if (validUser) {
        // Navigate to /today on successful login
        alert('Login successful!');
        localStorage.setItem('userEmail', validUser.email);
        // alert(`Email saved: ${validUser.email}`);

        // Pass user email to /today
        history.push({
          pathname: '/today',
          state: { userEmail: validUser.email }, // Pass the email to the next page
        });
      } else {
        // Handle incorrect login
        setError('Invalid email or password');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Could not connect to the server. Please try again later.');
    }

    console.log('Email:', email);
    console.log('Password:', password);
  };

  return (
    <Container maxWidth="sm">
      <Box 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: 8
        }}
      >
        <Typography component="h1" variant="h5">
          Login
        </Typography>

        {/* Form Start */}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          {/* Email Input */}
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Password Input */}
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Error message above the button */}
          {error && (
            <Typography color="red" sx={{ mt: 2, width: '100%', textAlign: 'center' }}>
              {error}
            </Typography>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Login
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
