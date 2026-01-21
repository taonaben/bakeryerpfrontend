import React, { useState, useEffect } from "react";
// 1. Updated imports to include Navigate for redirection and Router for navigation
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import LoginPage from './pages/auth/LoginPage';
import Dashboard from './pages/dashboard/Dashboard'; 
import InventoryPage from './pages/inventory/InventoryPage';

/**
 * Main Application Component
 * Handles Global State for Authentication and URL-based Routing
 */
function App() {
  // Global state to store the authenticated user's profile
  const [currentUser, setCurrentUser] = useState(null);
  
  // State to track if we are currently checking for a saved session
  const [isInitializing, setIsInitializing] = useState(true);

  /**
   * SESSION PERSISTENCE (useEffect)
   * Checks localStorage on startup so the user stays logged in after refresh.
   */
  useEffect(() => {
    const savedUser = localStorage.getItem('erp_user');
    
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to parse saved user session:", error);
        localStorage.removeItem('erp_user');
      }
    }
    
    // Finished checking storage, allow the UI to render
    setIsInitializing(false);
  }, []);

  /**
   * Action: Handle Successful Login
   */
  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('erp_user', JSON.stringify(userData));
    // Note: We no longer need setCurrentView('dashboard') here 
    // because the Router will handle the move.
  };

  /**
   * Action: Handle Logout
   */
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.clear(); 
    console.log("User session terminated.");
  };

  // Prevent "flicker" while checking for saved session in useEffect
  if (isInitializing) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#566d7e' }}>
        Initialising Bakery ERP...
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* --- PUBLIC ROUTE --- */}
          {/* If the user is NOT logged in, show LoginPage. If they ARE, redirect home (/) */}
          <Route 
            path="/login" 
            element={!currentUser ? <LoginPage onLogin={handleLoginSuccess} /> : <Navigate to="/" />} 
          />

          {/* --- PROTECTED ROUTES --- */}
          {/* We only allow access to these if currentUser is not null */}
          {currentUser ? (
            <>
              {/* Home path shows the Dashboard */}
              <Route path="/" element={
                <Dashboard user={currentUser} onLogout={handleLogout} />
              } />

              {/* Inventory path shows the Inventory Page */}
              <Route path="/inventory" element={
                <InventoryPage />
              } />

              {/* Redirect any other unknown logged-in paths back to Dashboard */}
              <Route path="*" element={<Navigate to="/" />} />
            </>
          ) : (
            /* If NOT logged in and trying to access any page, force to /login */
            <Route path="*" element={<Navigate to="/login" />} />
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;