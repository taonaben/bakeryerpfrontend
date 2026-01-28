import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './features/auth/views/LoginPage';
import Dashboard from './features/dashboard/views/Dashboard';
import InventoryPage from './features/inventory/views/InventoryPage';
import Layout from './shared/components/Layout';
import apiClient from './shared/services/api';
import type { User, Warehouse } from './shared/types/navigation';

/**
 * Main Application Component
 * 
 * Handles:
 * - Authentication state
 * - Warehouse context (global)
 * - Protected routing
 * - Layout wrapper for authenticated pages
 */
function App() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Global warehouse state
  const [activeWarehouse, setActiveWarehouse] = useState<Warehouse | null>(() => {
    const savedWarehouse = localStorage.getItem('active_warehouse');
    return savedWarehouse ? JSON.parse(savedWarehouse) : null;
  });

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  /**
   * SESSION PERSISTENCE
   * Restore user session from localStorage on mount
   */
  useEffect(() => {
    const savedUser = localStorage.getItem('erp_user');

    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user session:', error);
        localStorage.removeItem('erp_user');
      }
    }

    setIsInitializing(false);
  }, []);

  /**
   * FETCH WAREHOUSES
   * Load available warehouses when user logs in
   */
  useEffect(() => {
    if (!currentUser) return;

    const fetchWarehouses = async () => {
      try {
        const response = await apiClient.get('/warehouses');
        const data = response.data.results || response.data;
        setWarehouses(data);

        // Auto-select first warehouse if none selected
        if (!activeWarehouse && data.length > 0) {
          handleWarehouseChange(data[0]);
        }
      } catch (err) {
        console.error('Error loading warehouses:', err);
      }
    };

    fetchWarehouses();
  }, [currentUser]);

  /**
   * Handle successful login
   */
  const handleLoginSuccess = (userData: User) => {
    setCurrentUser(userData);
    localStorage.setItem('erp_user', JSON.stringify(userData));
  };

  /**
   * Handle warehouse change
   */
  const handleWarehouseChange = (warehouse: Warehouse) => {
    console.log('Global warehouse updated:', warehouse.name);
    setActiveWarehouse(warehouse);
    localStorage.setItem('active_warehouse', JSON.stringify(warehouse));
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    setCurrentUser(null);
    setActiveWarehouse(null);
    setWarehouses([]);
    localStorage.clear();
    console.log('User session terminated');
  };

  // Loading state
  if (isInitializing) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          color: '#566d7e',
          fontSize: '1.2rem',
          fontWeight: 600,
        }}
      >
        Initializing Bakery ERP...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Route - Login */}
        <Route
          path="/login"
          element={
            !currentUser ? (
              <LoginPage onLogin={handleLoginSuccess} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Protected Routes - Wrapped in Layout */}
        {currentUser ? (
          <Route
            path="/*"
            element={
              <Layout
                user={currentUser}
                activeWarehouse={activeWarehouse}
                warehouses={warehouses}
                onWarehouseChange={handleWarehouseChange}
                onLogout={handleLogout}
              >
                <Routes>
                  {/* Dashboard */}
                  <Route
                    path="/"
                    element={
                      <Dashboard 
                        user={currentUser} 
                        activeWarehouse={activeWarehouse} 
                      />
                    }
                  />

                  {/* Inventory */}
                  <Route
                    path="/inventory"
                    element={
                      <InventoryPage activeWarehouse={activeWarehouse} />
                    }
                  />

                  {/* Placeholder routes for other modules */}
                  <Route path="/procurement" element={<div style={{ padding: '30px' }}>Procurement Module (Coming Soon)</div>} />
                  <Route path="/production" element={<div style={{ padding: '30px' }}>Production Module (Coming Soon)</div>} />
                  <Route path="/sales" element={<div style={{ padding: '30px' }}>Sales Module (Coming Soon)</div>} />
                  <Route path="/reports" element={<div style={{ padding: '30px' }}>Reports Module (Coming Soon)</div>} />
                  <Route path="/settings" element={<div style={{ padding: '30px' }}>Settings (Coming Soon)</div>} />

                  {/* 404 - Redirect to dashboard */}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Layout>
            }
          />
        ) : (
          /* Redirect unauthenticated users to login */
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
