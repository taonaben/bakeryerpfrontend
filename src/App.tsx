import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from './features/dashboard/views/Dashboard';
import InventoryDashboard from './features/inventory/views/InventoryDashboard';
import StockMovementsPage from './features/inventory/views/StockMovementsPage';
import StockBalancesPage from './features/inventory/views/StockBalancesPage';
import BatchesPage from './features/inventory/views/BatchesPage';
import BatchDetailPage from './features/inventory/views/batches/BatchDetailPage';
import StockMovementDetailPage from './features/inventory/views/stock_movements/StockMovementDetailPage';
import Layout from './shared/components/Layout';
import LoginPage from './features/auth/views/LoginPage';
import { warehouseService } from './core/warehouses/services/warehouseService';
import { Company } from './core/companies/types/models';
import { authService } from './features/auth/services/authService';
import { User } from './features/auth/types/models';
import { Warehouse } from './core/warehouses/types/models';

// Procurement views
import ProcurementDashboard from './features/procurement/views/dashboard/ProcurementDashboard';
import RequisitionsPage from './features/procurement/views/requisitions/RequisitionsPage';
import CreateRequisitionPage from './features/procurement/views/requisitions/CreateRequisitionPage';
import RequisitionDetailPage from './features/procurement/views/requisitions/RequisitionDetailPage';
import ConvertRequisitionPage from './features/procurement/views/requisitions/ConvertRequisitionPage';
import PurchaseOrdersPage from './features/procurement/views/purchase_orders/PurchaseOrdersPage';
import CreatePurchaseOrderPage from './features/procurement/views/purchase_orders/CreatePurchaseOrderPage';
import PurchaseDetailPage from './features/procurement/views/purchase_orders/PurchaseDetailPage';
import GoodsReceiptsPage from './features/procurement/views/good_receipts/GoodsReceiptsPage';
import CreateGoodsReceiptPage from './features/procurement/views/good_receipts/CreateGoodsReceiptPage';
import GoodsReceiptDetailPage from './features/procurement/views/good_receipts/GoodsReceiptDetailPage';
import SupplierInvoicesPage from './features/procurement/views/supplier_invoices/SupplierInvoicesPage';
import CreateSupplierInvoicePage from './features/procurement/views/supplier_invoices/CreateSupplierInvoicePage';
import SupplierInvoiceDetailPage from './features/procurement/views/supplier_invoices/SupplierInvoiceDetailPage';
import EditSupplierInvoicePage from './features/procurement/views/supplier_invoices/EditSupplierInvoicePage';
import ProcurementSuppliersPage from './features/procurement/views/suppliers/SuppliersPage';
import CreateSupplierPage from './features/procurement/views/suppliers/CreateSupplierPage';
import EditSupplierPage from './features/procurement/views/suppliers/EditSupplierPage';
import SupplierDetailPage from './features/procurement/views/suppliers/SupplierDetailPage';

// Finance views
import FinanceDashboard from './features/finance/views/FinanceDashboard';
import InvoicesPage from './features/finance/views/InvoicesPage';
import PriceListsPage from './features/finance/views/PriceListsPage';
import CostingPage from './features/finance/views/CostingPage';
import FinanceSuppliersPage from './features/finance/views/SuppliersPage';

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
  const [currentUser, setCurrentUser] = useState<User| null>(null);
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
        const hasValidTokens = authService.isAuthenticated();
        if (!hasValidTokens) {
          console.warn('No valid auth tokens found. Clearing stored user.');
          localStorage.removeItem('erp_user');
          setIsInitializing(false);
          return;
        }

        const parsedUser = JSON.parse(savedUser) as Partial<User>;
        const hasRequiredFields =
          !!parsedUser.id &&
          !!parsedUser.emp_code &&
          !!parsedUser.username &&
          !!parsedUser.first_name &&
          !!parsedUser.last_name &&
          !!parsedUser.company;

        if (hasRequiredFields) {
          setCurrentUser(parsedUser as User);
          setIsInitializing(false);
          return;
        }

        // If stored user is incomplete, refresh from API
        authService
          .getCurrentUser()
          .then((freshUser) => {
            setCurrentUser(freshUser);
            localStorage.setItem('erp_user', JSON.stringify(freshUser));
          })
          .catch((error) => {
            console.warn('Failed to refresh user profile:', error);
            localStorage.removeItem('erp_user');
          })
          .finally(() => {
            setIsInitializing(false);
          });
        return;
      } catch (error) {
        console.error('Failed to parse saved user session:', error);
        localStorage.removeItem('erp_user');
      }
    }

    setIsInitializing(false);
  }, []);

  /**
   * FETCH WAREHOUSES
   * Load warehouses for the user's company when user logs in
   */
  useEffect(() => {
    if (!currentUser) return;

    const fetchCompanyWarehouses = async () => {
      try {
        // Use the company ID from the user object to fetch warehouses
        const company_id =
          (typeof currentUser.company === 'string' && currentUser.company) ||
          (typeof currentUser.company === 'object' ? currentUser.company : undefined);

        if (!company_id || typeof company_id !== 'string') {
          console.error('User has no company assigned');
          return;
        }

        const companyWarehouses = await warehouseService.getWarehousesByCompany(
          company_id
        );
        setWarehouses(companyWarehouses);

        // Auto-select first warehouse if none selected
        if (!activeWarehouse && companyWarehouses.length > 0) {
          handleWarehouseChange(companyWarehouses[0]);
        }
      } catch (err) {
        console.error('Error loading company warehouses:', err);
      }
    };

    fetchCompanyWarehouses();
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

                  {/* Inventory Module */}
                  <Route
                    path="/inventory"
                    element={
                      <InventoryDashboard activeWarehouse={activeWarehouse} />
                    }
                  />
                  <Route
                    path="/inventory/movements"
                    element={
                      <StockMovementsPage activeWarehouse={activeWarehouse} />
                    }
                  />
                  <Route
                    path="/inventory/balances"
                    element={
                      <StockBalancesPage activeWarehouse={activeWarehouse} />
                    }
                  />
                  <Route
                    path="/inventory/batches"
                    element={
                      <BatchesPage activeWarehouse={activeWarehouse} />
                    }
                  />

                  {/* Batch Detail */}
                  <Route
                    path="/inventory/batch/:batchId"
                    element={
                      activeWarehouse ? (
                        <BatchDetailPage />
                      ) : (
                        <div style={{ padding: '30px' }}>
                          <p>Please select a warehouse to view batch details.</p>
                        </div>
                      )
                    }
                  />

                  {/* Stock Movement Detail */}
                  <Route
                    path="/inventory/stock_movements/:movementId"
                    element={
                      activeWarehouse ? (
                        <StockMovementDetailPage />
                      ) : (
                        <div style={{ padding: '30px' }}>
                          <p>Please select a warehouse to view stock movement details.</p>
                        </div>
                      )
                    }
                  />

                  {/* Purchasing → Finance redirect */}
                  <Route path="/purchasing" element={<Navigate to="/finance" replace />} />

                  {/* Procurement Module */}
                  <Route path="/procurement" element={<ProcurementDashboard />} />
                  <Route path="/procurement/requisitions" element={<RequisitionsPage activeWarehouse={activeWarehouse} />} />
                  <Route path="/procurement/requisitions/new" element={<CreateRequisitionPage activeWarehouse={activeWarehouse} />} />
                  <Route path="/procurement/requisitions/:requisitionId/convert" element={<ConvertRequisitionPage />} />
                  <Route path="/procurement/requisitions/:requisitionId" element={<RequisitionDetailPage />} />
                  <Route path="/procurement/purchase-orders/new" element={<CreatePurchaseOrderPage activeWarehouse={activeWarehouse} />} />
                  <Route path="/procurement/purchase-orders/:orderId" element={<PurchaseDetailPage />} />
                  <Route path="/procurement/purchase-orders" element={<PurchaseOrdersPage activeWarehouse={activeWarehouse} />} />
                  <Route path="/procurement/goods-receipts" element={<GoodsReceiptsPage activeWarehouse={activeWarehouse} />} />
                  <Route path="/procurement/goods-receipts/new" element={<CreateGoodsReceiptPage activeWarehouse={activeWarehouse} />} />
                  <Route path="/procurement/goods-receipts/:id" element={<GoodsReceiptDetailPage />} />
                  <Route path="/procurement/invoices/new" element={<CreateSupplierInvoicePage activeWarehouse={activeWarehouse} />} />
                  <Route path="/procurement/invoices/:invoiceId/edit" element={<EditSupplierInvoicePage />} />
                  <Route path="/procurement/invoices/:invoiceId" element={<SupplierInvoiceDetailPage />} />
                  <Route path="/procurement/invoices" element={<SupplierInvoicesPage activeWarehouse={activeWarehouse} />} />
                  <Route path="/procurement/suppliers/new" element={<CreateSupplierPage />} />
                  <Route path="/procurement/suppliers/:supplierId/edit" element={<EditSupplierPage />} />
                  <Route path="/procurement/suppliers/:supplierId" element={<SupplierDetailPage />} />
                  <Route path="/procurement/suppliers" element={<ProcurementSuppliersPage />} />

                  {/* Finance Module */}
                  <Route path="/finance" element={<FinanceDashboard />} />
                  <Route path="/finance/invoices" element={<InvoicesPage />} />
                  <Route path="/finance/price-lists" element={<PriceListsPage />} />
                  <Route path="/finance/costing" element={<CostingPage />} />
                  <Route path="/finance/suppliers" element={<FinanceSuppliersPage />} />

                  {/* Placeholder routes for other modules */}
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
