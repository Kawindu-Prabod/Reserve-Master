import React from "react";
import Heading from "../../common/Heading";
import "./hero.css";
import { Box, Button } from "@mui/material";
import { useHistory } from "react-router-dom"; // Import useNavigate hook

const Hero = () => {
  const history = useHistory(); // Initialize the navigate function

  const handleLoginClick = () => {
    history.push("/login"); // Redirect to login page
  };

  const handleLoginClick2 = () => {
    history.push("/register"); // Redirect to login page
  };

  return (
    <>
      <section className="hero">
        <div className="container">
          <Heading
            title="Welcome to  Reserve Master "
            subtitle="Scheduling for Laboratory Sessions"
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              gap: 2,
              marginTop: 3,
            }}
          >
            <Button variant="contained" onClick={handleLoginClick}>
              Login
            </Button>
            <Button variant="contained" onClick={handleLoginClick2}>
              Register
            </Button>
          </Box>
        </div>
      </section>
    </>
  );
};

export default Hero;
