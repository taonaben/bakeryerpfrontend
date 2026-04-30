import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from './features/dashboard/views/Dashboard';
import InventoryDashboard from './features/inventory/views/InventoryDashboard';
import StockMovementsPage from './features/inventory/views/StockMovementsPage';
import StockBalancesPage from './features/inventory/views/StockBalancesPage';
import BatchesPage from './features/inventory/views/BatchesPage';
import BatchDetailPage from './features/inventory/views/batches/BatchDetailPage';
import StockMovementDetailPage from './features/inventory/views/stock_movements/StockMovementDetailPage';
import ProductsPage from './features/inventory/views/products/ProductsPage';
import CreateProductPage from './features/inventory/views/products/CreateProductPage';
import ProductDetailPage from './features/inventory/views/products/ProductDetailPage';
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
import SupplierProductsPage from './features/procurement/views/supplier_products/SupplierProductsPage';
import SupplierProductDetailPage from './features/procurement/views/supplier_products/SupplierProductDetailPage';
import FormulationPage from './features/formulation/views/formulationPage';
import FormulaDetailPage from './features/formulation/views/FormulaDetailPage';
import FormulaCreatePage from './features/formulation/views/FormulaCreatePage';
import EditFormulaPage from './features/formulation/views/EditFormulaPage';

// Finance views
import FinanceDashboard from './features/finance/views/FinanceDashboard';
import InvoicesPage from './features/finance/views/InvoicesPage';
import PriceListsPage from './features/finance/views/PriceListsPage';
import CostingPage from './features/finance/views/CostingPage';
import FinanceSuppliersPage from './features/finance/views/SuppliersPage';

// Production views
import ProductionDashboard from './features/production/views/ProductionDashboard';
import PlannedOrdersPage from './features/production/views/planning/planned-orders/plannedOrdersPage';
import PlannedOrdersCalendarPage from './features/production/views/planning/calender/plannedOrdersCalender';
import ProductionOrdersPage from './features/production/views/production/orders/productionOrdersPage';
import CreateProductionOrderPage from './features/production/views/production/orders/CreateProductionOrderPage';
import ProductionOrderDetailPage from './features/production/views/production/orders/ProductionOrderDetailPage';
import CreatePlannedOrderPage from './features/production/views/planning/planned-orders/CreatePlannedOrderPage';
import ReworkPage from './features/production/views/production/rework/reworkPage';
import CreateReworkOrderPage from './features/production/views/production/rework/CreateReworkOrderPage';
import ReworkOrderDetailPage from './features/production/views/production/rework/ReworkOrderDetailPage';
import ProductionReportsPage from './features/production/views/reports/reports';
import ProductionBatchListPage from './features/production/views/production/batches/ProductionBatchListPage';
import ProductionBatchDetailPage from './features/production/views/production/batches/ProductionBatchDetailPage';

// Costing views
import CostingDashboard from './features/costing/views/dashboard/CostingDashboard';
import CostingEntriesPage from './features/costing/views/costing_entries/CostingEntriesPage';
import CostingEntryDetailPage from './features/costing/views/costing_entries/CostingEntryDetailPage';
import StandardCostsPage from './features/costing/views/standard_cost/StandardCostsPage';
import StandardCostDetailPage from './features/costing/views/standard_cost/StandardCostDetailPage';
import OverheadRatesPage from './features/costing/views/overhead_rates/OverheadRatesPage';
import ProductCostingPage from './features/costing/views/product_costing/ProductCostingPage';
import PricingRulesPage from './features/costing/views/pricing_rules/PricingRulesPage';
import VarianceAnalysisPage from './features/costing/views/variance_analysis/VarianceAnalysisPage';
import CostingReportsPage from './features/costing/views/costing_reports/CostingReportsPage';
import CogsPostingPage from './features/costing/views/cogs/CogsPostingPage';

// Sales views
import SalesOrdersPage from './features/sales/views/sales_orders/SalesOrdersPage';
import DeliveriesPage from './features/sales/views/deliveries/DeliveriesPage';
import SalesInvoicesPage from './features/sales/views/invoices/InvoicesPage';
import PaymentsPage from './features/sales/views/payments/PaymentsPage';
import CustomersPage from './features/sales/views/customers/CustomersPage';
import PriceAgreementsPage from './features/sales/views/price_agreements/PriceAgreementsPage';
import DebtorManagementPage from './features/sales/views/debtor_management/DebtorManagementPage';

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
                  <Route
                    path="/inventory/products"
                    element={
                      <ProductsPage />
                    }
                  />
                  <Route path="/inventory/products/new" element={<CreateProductPage />} />
                  <Route path="/inventory/products/:productId" element={<ProductDetailPage />} />

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
                  <Route path="/procurement/supplier-products/:productId" element={<SupplierProductDetailPage />} />
                  <Route path="/procurement/supplier-products" element={<SupplierProductsPage />} />

                  {/* Formulation Module */}
                  <Route path="/formulation" element={<FormulationPage />} />
                  <Route path="/formulation/new" element={<FormulaCreatePage />} />
                  <Route path="/formulation/:id/edit" element={<EditFormulaPage />} />
                  <Route path="/formulation/:formulaId" element={<FormulaDetailPage />} />

                  {/* Finance Module */}
                  <Route path="/finance" element={<FinanceDashboard />} />
                  <Route path="/finance/invoices" element={<InvoicesPage />} />
                  <Route path="/finance/price-lists" element={<PriceListsPage />} />
                  <Route path="/finance/costing" element={<CostingPage />} />
                  <Route path="/finance/suppliers" element={<FinanceSuppliersPage />} />

                  {/* Production Module */}
                  <Route path="/production" element={<ProductionDashboard />} />
                  <Route path="/production/planned-orders" element={<PlannedOrdersPage activeWarehouse={activeWarehouse} />} />
                  <Route path="/production/planned-orders/new" element={<CreatePlannedOrderPage activeWarehouse={activeWarehouse} />} />
                  <Route path="/production/calendar" element={<PlannedOrdersCalendarPage />} />
                  <Route path="/production/orders/new" element={<CreateProductionOrderPage activeWarehouse={activeWarehouse} />} />
                  <Route path="/production/orders/:orderId/batches/:batchId" element={<ProductionBatchDetailPage />} />
                  <Route path="/production/orders/:orderId/batches" element={<ProductionBatchListPage activeWarehouse={activeWarehouse} />} />
                  <Route path="/production/orders/:orderId" element={<ProductionOrderDetailPage />} />
                  <Route path="/production/orders" element={<ProductionOrdersPage activeWarehouse={activeWarehouse} />} />
                  <Route path="/production/rework/new" element={<CreateReworkOrderPage activeWarehouse={activeWarehouse} />} />
                  <Route path="/production/rework/:orderId" element={<ReworkOrderDetailPage />} />
                  <Route path="/production/rework" element={<ReworkPage activeWarehouse={activeWarehouse} />} />
                  <Route path="/production/batches" element={<ProductionBatchListPage activeWarehouse={activeWarehouse} />} />
                  <Route path="/production/reports" element={<ProductionReportsPage />} />

                  {/* Costing Module */}
                  <Route path="/costing" element={<CostingDashboard />} />
                  <Route path="/costing/entries" element={<CostingEntriesPage />} />
                  <Route path="/costing/entries/:entryId" element={<CostingEntryDetailPage />} />
                  <Route path="/costing/standard-costs" element={<StandardCostsPage />} />
                  <Route path="/costing/standard-costs/:costId" element={<StandardCostDetailPage />} />
                  <Route path="/costing/overhead-rates" element={<OverheadRatesPage />} />
                  <Route path="/costing/product-costing" element={<ProductCostingPage />} />
                  <Route path="/costing/pricing-rules" element={<PricingRulesPage />} />
                  <Route path="/costing/variance-analysis" element={<VarianceAnalysisPage />} />
                  <Route path="/costing/reports" element={<CostingReportsPage />} />
                  <Route path="/costing/cogs-posting" element={<CogsPostingPage />} />

                  {/* Sales Module */}
                  <Route path="/sales" element={<SalesOrdersPage />} />
                  <Route path="/sales/orders" element={<SalesOrdersPage />} />
                  <Route path="/sales/deliveries" element={<DeliveriesPage />} />
                  <Route path="/sales/invoices" element={<SalesInvoicesPage />} />
                  <Route path="/sales/payments" element={<PaymentsPage />} />
                  <Route path="/sales/customers" element={<CustomersPage />} />
                  <Route path="/sales/price-agreements" element={<PriceAgreementsPage />} />
                  <Route path="/sales/reports" element={<div style={{ padding: '30px' }}>Sales Reports (Coming Soon)</div>} />
                  <Route path="/sales/debtors" element={<DebtorManagementPage />} />
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
