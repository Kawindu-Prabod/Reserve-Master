import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Container, FormHelperText } from '@mui/material';
import { useHistory } from 'react-router-dom'; // Use useHistory

const Register = () => {
  const history = useHistory(); // Initialize useHistory
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [code, setCode] = useState('');
  const [confirmationStep, setConfirmationStep] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [emailError, setEmailError] = useState('');
  const [codeError, setCodeError] = useState('');

  const handleEmailChange = (e) => {
    const emailValue = e.target.value;
    setEmail(emailValue);
    setEmailVerified(emailValue.endsWith('@fot.sjp.ac.lk'));
    setEmailError('');
  };

  const handleConfirmPasswordChange = (e) => {
    const confirmValue = e.target.value;
    setConfirmPassword(confirmValue);
    setPasswordsMatch(confirmValue === password);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const existingLecturer = await fetch(`http://localhost:5000/Lectures?email=${email}`);
    const existingStudent = await fetch(`http://localhost:5000/Students?email=${email}`);

    const lecturerData = await existingLecturer.json();
    const studentData = await existingStudent.json();

    if (lecturerData.length > 0 || studentData.length > 0) {
      setEmailError('This email is already registered. Please use a different email.');
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    
    alert(`Your confirmation code is: ${code}`);
    setConfirmationStep(true);
  };

  const handleCodeSubmit = async (event) => {
    event.preventDefault();
    setCodeError('');
    if (code === generatedCode) {
      const userDetails = { name, email, password };
      const targetTable = emailVerified ? 'Lectures' : 'Students';

      try {
        const response = await fetch(`http://localhost:5000/${targetTable}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userDetails),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        // Save user email to local storage
        localStorage.setItem('userEmail', email);
        
        // Alert the saved email
        // alert(`Email saved: ${email}`);
        
        alert('Registration successful!');
        history.push('/today'); // Use history.push to navigate to the Today page
        
      } catch (error) {
        console.error('Error saving data:', error);
        alert('Registration failed. Please try again.');
      }
    } else {
      setCodeError('Invalid code. Please try again.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
        <Typography component="h1" variant="h5">
          Register
        </Typography>

        {!confirmationStep ? (
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Name"
              name="name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Box sx={{ width: '100%', textAlign: 'right', mt: 0.5 }}>
              {emailError && (
                <FormHelperText sx={{ color: 'red' }}>
                  {emailError}
                </FormHelperText>
              )}
            </Box>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={email}
              onChange={handleEmailChange}
            />
            <Box sx={{ width: '100%', textAlign: 'left', mt: 0.5 }}>
              {emailVerified && (
                <FormHelperText sx={{ color: 'green' }}>
                  Verified as a lecturer
                </FormHelperText>
              )}
            </Box>
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
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
            />
            <Box sx={{ width: '100%', textAlign: 'left', mt: 0.5 }}>
              {!passwordsMatch && (
                <FormHelperText sx={{ color: 'red' }}>
                  Passwords do not match
                </FormHelperText>
              )}
            </Box>
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
              Confirm
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleCodeSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="code"
              label="Enter Confirmation Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <Box sx={{ width: '100%', minWidth: 300 }}>
              {codeError && (
                <FormHelperText sx={{ color: 'red', mt: 1 }}>
                  {codeError}
                </FormHelperText>
              )}
            </Box>
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
              Submit Code
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Register;
