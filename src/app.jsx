import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from './pages/auth/LoginPage';
import Dashboard from './pages/dashboard/Dashboard'; 
// IMPORT the new Inventory Page
import InventoryPage from './pages/inventory/InventoryPage';

/**
 * Main Application Component
 * Handles Global State for Authentication, Session Persistence, and Navigation
 */
function App() {
  // Global state to store the authenticated user's profile
  const [currentUser, setCurrentUser] = useState(null);
  
  // NAVIGATION STATE: Tracks which module is currently visible
  // Options: 'dashboard', 'inventory', 'production', etc.
  const [currentView, setCurrentView] = useState('dashboard');

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
   */
  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('erp_user', JSON.stringify(userData));
    // Always start at the dashboard after a fresh login
    setCurrentView('dashboard');
  };

  /**
   * Action: Handle Logout
   */
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('dashboard'); // Reset view for next session
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

  /**
   * SECURE AREA
   * This logic toggles between the Dashboard and the specific Modules.
   * We pass 'setCurrentView' to the Dashboard so its cards can navigate.
   * We pass a 'back' trigger to Inventory so the user can return to the Dashboard.
   */
  return (
    <div className="App">
      {currentView === 'dashboard' ? (
        <Dashboard 
          user={currentUser} 
          onLogout={handleLogout} 
          onNavigate={setCurrentView} // Dashboard can now change the view
        />
      ) : currentView === 'inventory' ? (
        <InventoryPage 
          onBack={() => setCurrentView('dashboard')} // Allows user to return
        />
      ) : (
        /* Fallback if a view isn't built yet */
        <div style={{padding: '20px'}}>
           <h2>Module Under Development</h2>
           <button onClick={() => setCurrentView('dashboard')}>Return to Dashboard</button>
        </div>
      )}
    </div>
  );
}

export default App;