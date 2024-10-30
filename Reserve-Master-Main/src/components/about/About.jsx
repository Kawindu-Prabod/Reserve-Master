import React from 'react';
import { Box, Container, Typography, Card, CardContent, CardMedia, Grid, Button } from '@mui/material';

const About = () => {
  // Team data (this can be dynamically loaded as well)
  const teamLeader = {
    indexNo: 'ICT21926',
    focusArea: 'Networking Technology',
    image: "../images/customer/Kavindu.jpg", // Replace with actual image path or URL
  };

  const teamMembers = [
    {
      indexNo: 'ICT21927',
      focusArea: 'Software Technology',
      image: "../images/customer/Sivananthini.jpg", // Replace with actual image path or URL
    },
    {
      indexNo: 'ICT21951',
      focusArea: 'Networking Technology',
      image: "../images/customer/Desharanjana.jpg", // Replace with actual image path or URL
    },
  ];

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Typography component="h1" variant="h4" align="center" gutterBottom>
        Happy to Introduce Our Team
      </Typography>

      {/* Team Leader Section */}
      <Typography component="h2" variant="h5" color="dark blue" gutterBottom>
        Team Leader
      </Typography>
      <Card sx={{ display: 'flex', mb: 4 }}>
        <CardMedia
          component="img"
          sx={{ width: 150 }}
          image={teamLeader.image}
          alt="Team Leader"
        />
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <CardContent>
            <Typography component="h6" variant="subtitle1">
              Index No: {teamLeader.indexNo}
            </Typography>
            <Typography component="p" variant="body2" color="textSecondary">
              Focus Area: {teamLeader.focusArea}
            </Typography>
          </CardContent>
        </Box>
      </Card>

      {/* Team Members Section */}
      <Typography component="h2" variant="h5" color="dark green" gutterBottom>
        Team Members
      </Typography>
      <Grid container spacing={4}>
        {teamMembers.map((member, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Card sx={{ display: 'flex' }}>
              <CardMedia
                component="img"
                sx={{ width: 150 }}
                image={member.image}
                alt={`Member ${index + 1}`}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <CardContent>
                  <Typography component="h6" variant="subtitle1">
                    Index No: {member.indexNo}
                  </Typography>
                  <Typography component="p" variant="body2" color="textSecondary">
                    Focus Area: {member.focusArea}
                  </Typography>
                </CardContent>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Additional Section: Mission Statement */}
      <Box sx={{ mt: 8 }}>
        <Typography component="h2" variant="h5" align="center" gutterBottom>
          Our Mission
        </Typography>
        <Typography component="p" variant="body1" align="center" color="textSecondary" paragraph>
          We are a passionate team focused on delivering innovative software solutions
          that meet the highest standards of quality and efficiency.
        </Typography>
      </Box>

      {/* Contact Section */}
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button variant="contained" color="primary">
          Contact Us
        </Button>
      </Box>
    </Container>
  );
};

export default About;
