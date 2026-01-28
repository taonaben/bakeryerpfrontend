import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import LoginPage from './features/auth/views/LoginPage';
import Dashboard from './features/dashboard/views/Dashboard'; 
import InventoryPage from './features/inventory/views/InventoryPage';
import { ThemeProvider } from './contexts/ThemeContext';
import GlobalStyles from './components/GlobalStyles';

/**
 * Main Application Component
 * Handles Global State for Authentication, Multi-Warehouse context, and Routing.
 */
function App() {
  // --- AUTHENTICATION STATE ---
  const [currentUser, setCurrentUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // --- GLOBAL WAREHOUSE STATE ---
  // Initialized from localStorage so the system remembers which warehouse 
  // you were looking at even after a hard browser refresh.
  const [activeWarehouse, setActiveWarehouse] = useState(() => {
    const savedWarehouse = localStorage.getItem('active_warehouse');
    return savedWarehouse ? JSON.parse(savedWarehouse) : null;
  });

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
  };

  /**
   * Action: Global Warehouse Change
   * Updates state and persists the selection to localStorage.
   * This is the function that the Dashboard will call.
   */
  const handleWarehouseChange = (warehouse) => {
    console.log("Global state updating to warehouse:", warehouse.name);
    setActiveWarehouse(warehouse);
    localStorage.setItem('active_warehouse', JSON.stringify(warehouse));
  };

  /**
   * Action: Handle Logout
   * Wipes all session and warehouse data.
   */
  const handleLogout = () => {
    setCurrentUser(null);
    setActiveWarehouse(null);
    localStorage.clear(); 
    console.log("User session terminated.");
  };

  // Prevent "flicker" while checking for saved session
  if (isInitializing) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#566d7e' }}>
        Initializing Bakery ERP...
      </div>
    );
  }

  return (
    // <ThemeProvider>
    //   <GlobalStyles />
      <Router>
        <div className="App">
          <Routes>
            {/* --- PUBLIC ROUTE --- */}
            <Route 
              path="/login" 
              element={!currentUser ? <LoginPage onLogin={handleLoginSuccess} /> : <Navigate to="/" />} 
            />

            {/* --- PROTECTED ROUTES (Requires currentUser) --- */}
            {currentUser ? (
              <>
                {/* 
                    Dashboard: Receives activeWarehouse and the change handler. 
                    This fixes the "onWarehouseChange is not a function" error.
                */}
                <Route path="/" element={
                  <Dashboard 
                    user={currentUser} 
                    onLogout={handleLogout}
                    activeWarehouse={activeWarehouse}
                    onWarehouseChange={handleWarehouseChange} 
                  />
                } />

                {/* 
                    Inventory: Receives the activeWarehouse so it knows 
                    which movements/balances to fetch from the API.
                */}
                <Route path="/inventory" element={
                  <InventoryPage 
                    activeWarehouse={activeWarehouse} 
                  />
                } />

                {/* Redirect unknown paths back to Dashboard */}
                <Route path="*" element={<Navigate to="/" />} />
              </>
            ) : (
              /* If NOT logged in, force all paths to /login */
              <Route path="*" element={<Navigate to="/login" />} />
            )}
          </Routes>
        </div>
      </Router>
    // </ThemeProvider>
  );
}

export default App;