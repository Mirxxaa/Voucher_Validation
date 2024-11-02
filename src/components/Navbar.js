// src/components/Navbar.js
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

const correctPassword = "admin@786";

const Navbar = () => {
  const [password, setPassword] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [requestedPath, setRequestedPath] = useState(""); // Track which path is requested
  const navigate = useNavigate();
  const location = useLocation(); // Get current location

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === correctPassword) {
      setShowPasswordInput(false);
      navigate(requestedPath); // Navigate to the requested path
      setPassword("");
    } else {
      alert("Incorrect password. Please try again.");
    }
  };

  const isActive = (path) => location.pathname === path; // Check if the current path is active

  const handleDashboardClick = () => {
    setRequestedPath("/dashboard"); // Set the requested path
    setShowPasswordInput(true); // Show the password input
  };

  return (
    <nav>
      <ul className="navbar">
        <li className="navbar-item">
          <button
            className={`navbar-button ${
              isActive("/dashboard") ? "active" : ""
            }`}
            onClick={handleDashboardClick} // Handle dashboard click
          >
            <b>Voucher Dashboard</b>
          </button>
        </li>
        <li className="navbar-item">
          <Link
            to="/validation"
            className={`navbar-link ${isActive("/validation") ? "active" : ""}`}
          >
            Voucher Validation
          </Link>
        </li>
      </ul>
      {showPasswordInput && (
        <form onSubmit={handlePasswordSubmit} className="password-form">
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Enter Password"
            className="password-input"
          />
          <button type="submit" className="password-submit">
            Submit
          </button>
        </form>
      )}
    </nav>
  );
};

export default Navbar;
