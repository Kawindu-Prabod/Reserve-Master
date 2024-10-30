import React, { useState } from "react";
import "./header.css";
import { nav } from "../../data/Data";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const [navList, setNavList] = useState(false);
  const location = useLocation();
  
  const emailSaved = localStorage.getItem("userEmail");
  const isLecturer = emailSaved ? emailSaved.endsWith('@fot.sjp.ac.lk') : false;
  const isLoggedIn = !!emailSaved; // Check if user is logged in

  const renderNavItems = () => {
    // Define visible nav items based on the current page and user role
    switch (location.pathname) {
      case "/":
      case "/login":
      case "/register":
        return nav.filter(item => ["home", "gallery", "about"].includes(item.text.toLowerCase()));

      case "/today":
      case "/All":  // Handle both /All and /all
      case "/gallery":
        if (isLoggedIn) {
          return isLecturer
            ? nav.filter(item => ["home", "today", "all", "booking", "gallery", "about"].includes(item.text.toLowerCase()))
            : nav.filter(item => ["home", "today", "all", "gallery", "about"].includes(item.text.toLowerCase()));
        } else {
          return nav.filter(item => ["home", "gallery", "about"].includes(item.text.toLowerCase())); // Anonymous users
        }

      case "/about":
        if (isLoggedIn) {
          return isLecturer
            ? nav.filter(item => ["home", "today", "all", "booking", "gallery", "about"].includes(item.text.toLowerCase()))
            : nav.filter(item => ["home", "today", "all", "gallery", "about"].includes(item.text.toLowerCase()));
        } else {
          return nav.filter(item => ["home", "gallery", "about"].includes(item.text.toLowerCase())); // Anonymous users
        }

      case "/booking":
        return isLecturer
          ? nav.filter(item => ["home", "today", "all", "booking", "gallery", "about"].includes(item.text.toLowerCase()))
          : []; // Students should not see this page

      default:
        return []; // Default case: no nav items shown
    }
  };

  return (
    <>
      <header>
        <div className='container flex'>
          <div className='logo'>
            <img src='./images/logo.png' alt='' />
          </div>
          <div className='nav'>
            <ul className={navList ? "small" : "flex"}>
              {renderNavItems().map((item, index) => (
                <li key={index}>
                  <Link to={item.path}>{item.text}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className='toggle'>
            <button onClick={() => setNavList(!navList)}>
              {navList ? <i className='fa fa-times'></i> : <i className='fa fa-bars'></i>}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
