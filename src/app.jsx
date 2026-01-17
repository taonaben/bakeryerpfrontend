import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from './pages/auth/LoginPage';
import Dashboard from './pages/dashboard/Dashboard'; 

/**
 * Main Application Component
 * Handles Global State for Authentication and Session Persistence
 */
function App() {
  // Global state to store the authenticated user's profile
  const [currentUser, setCurrentUser] = useState(null);
  // State to track if we are currently checking for a saved session
  const [isInitializing, setIsInitializing] = useState(true);

  /**
   * SESSION PERSISTENCE (useEffect)
   * This runs once when the app starts. It checks if there is a 
   * saved user session in the browser's local storage.
   */
  useEffect(() => {
    const savedUser = localStorage.getItem('erp_user');
    
    if (savedUser) {
      try {
        // Parse the stringified JSON back into a JavaScript object
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to parse saved user session:", error);
        localStorage.removeItem('erp_user'); // Clean up corrupted data
      }
    }
    
    // Finished checking storage, allow the UI to render
    setIsInitializing(false);
  }, []);

  /**
   * Action: Handle Successful Login
   * Triggered by LoginPage.jsx after a successful API response
   */
  const handleLoginSuccess = (userData) => {
    // 1. Update the React State so the UI switches to Dashboard immediately
    setCurrentUser(userData);
    
    // 2. Persist the user profile so they stay logged in on refresh
    // Note: Tokens (access/refresh) are already saved inside LoginPage.jsx
    localStorage.setItem('erp_user', JSON.stringify(userData));
  };

  /**
   * Action: Handle Logout
   * Clears all session data and returns user to the login screen
   */
  const handleLogout = () => {
    // 1. Reset React State
    setCurrentUser(null);
    
    // 2. Wipe ALL local storage (User Profile + JWT Tokens)
    localStorage.clear(); 
    
    console.log("User session terminated.");
  };

  // Prevent "flicker" while checking for saved session in useEffect
  if (isInitializing) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#566d7e' }}>Loading System...</div>;
  }

  // AUTHENTICATION GATE
  // If no user is logged in, show the Login Page
  if (!currentUser) {
    return (
      <LoginPage 
        onLogin={handleLoginSuccess} 
      />
    );
  }

  // SECURE AREA
  // Once logged in, show the main ERP interface
  return (
    <div className="App">
      <Dashboard 
        user={currentUser} 
        onLogout={handleLogout} 
      />
    </div>
  );
}

export default App;