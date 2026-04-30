
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, AlertCircle, Edit2, Phone, Mail, Building2,
  ShoppingCart, FileText, CreditCard, BarChart2, Tag, User,
} from 'lucide-react';
import Breadcrumb from '../../../../shared/components/Breadcrumb';
import type { BreadcrumbItem } from '../../../../shared/components/Breadcrumb';
import { useCustomersStore } from '../../stores/customersStore';
import { customersService } from '../../services/customersService';
import '../../../inventory/styles/batch-detail.css';
import '../../../procurement/styles/procurement.css';
import '../../styles/sales.css';

// ──────────────────────────────────────────────
// Tab definitions
// ──────────────────────────────────────────────
type TabId = 'overview' | 'orders' | 'invoices' | 'payments' | 'statement' | 'pricing';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',  label: 'Overview',   icon: <User size={15} /> },
  { id: 'orders',    label: 'Orders',     icon: <ShoppingCart size={15} /> },
  { id: 'invoices',  label: 'Invoices',   icon: <FileText size={15} /> },
  { id: 'payments',  label: 'Payments',   icon: <CreditCard size={15} /> },
  { id: 'statement', label: 'Statement',  icon: <BarChart2 size={15} /> },
  { id: 'pricing',   label: 'Pricing',    icon: <Tag size={15} /> },
];

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────
const CustomerDetailPage: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();

  // CRITICAL: Guard against static routes like "new" BEFORE any hooks
  // This prevents API calls to /sales/customers/new
  useEffect(() => {
    if (!customerId || customerId === 'new') {
      navigate('/sales/customers/new', { replace: true });
    }
  }, [customerId, navigate]);

  // Early return if customerId is invalid - prevents API calls
  if (!customerId || customerId === 'new') {
    return null;
  }

  const {
    detailMap,
    ordersMap,
    invoicesMap,
    paymentsMap,
    outstandingMap,
    pricingMap,
    isLoading,
    error,
    fetchById,
    fetchOrders,
    fetchInvoices,
    fetchPayments,
    fetchOutstanding,
    fetchPricingAgreements,
    deactivate,
    isSubmitting,
  } = useCustomersStore();

  const customer = customerId ? detailMap[customerId] : null;
  const orders = customerId ? (ordersMap[customerId] ?? []) : [];
  const invoices = customerId ? (invoicesMap[customerId] ?? []) : [];
  const payments = customerId ? (paymentsMap[customerId] ?? []) : [];
  const outstanding = customerId ? outstandingMap[customerId] : null;
  const pricingAgreements = customerId ? (pricingMap[customerId] ?? []) : [];

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [statementDateFrom, setStatementDateFrom] = useState('');
  const [statementDateTo, setStatementDateTo] = useState('');
  const [tabLoaded, setTabLoaded] = useState<Partial<Record<TabId, boolean>>>({});

  // Initial load
  useEffect(() => {
    fetchById(customerId, true);
    fetchOutstanding(customerId);
  }, [customerId, fetchById, fetchOutstanding]);

  // Lazy-load tab data on first visit
  useEffect(() => {
    if (!customerId || tabLoaded[activeTab]) return;
    setTabLoaded((prev) => ({ ...prev, [activeTab]: true }));

    switch (activeTab) {
      case 'orders':    fetchOrders(customerId);    break;
      case 'invoices':  fetchInvoices(customerId);  break;
      case 'payments':  fetchPayments(customerId);  break;
      case 'pricing':   fetchPricingAgreements(customerId); break;
      default: break;
    }
  }, [activeTab, customerId, tabLoaded, fetchOrders, fetchInvoices, fetchPayments, fetchPricingAgreements]);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Sales', href: '/sales' },
    { label: 'Customers', href: '/sales/customers' },
    ...(customer ? [{ label: customer.name, isActive: true } as BreadcrumbItem] : []),
  ];

  // ── Loading ──
  if (isLoading && !customer) {
    return (
      <div className="batch-detail-page">
        <div className="detail-header">
          <button onClick={() => navigate(-1)} className="back-button" aria-label="Go back">
            <ArrowLeft size={18} /> <span>Back</span>
          </button>
        </div>
        <div className="loading-skeleton">
          <div className="skeleton-sidebar" />
          <div className="skeleton-content" />
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error && !customer) {
    return (
      <div className="batch-detail-page">
        <div className="detail-header">
          <button onClick={() => navigate(-1)} className="back-button" aria-label="Go back">
            <ArrowLeft size={18} /> <span>Back</span>
          </button>
        </div>
        <div className="error-banner" role="alert">
          <AlertCircle size={20} />
          <div>
            <strong>Error</strong>
            <p>{error}</p>
          </div>
          <button onClick={() => customerId && fetchById(customerId, true)} className="btn btn-secondary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="batch-detail-page">
        <div className="detail-header">
          <button onClick={() => navigate(-1)} className="back-button" aria-label="Go back">
            <ArrowLeft size={18} /> <span>Back</span>
          </button>
        </div>
        <div className="empty-state">
          <h2>Customer Not Found</h2>
          <p>The customer you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="batch-detail-page">
      {/* Header */}
      <div className="detail-header">
        <button onClick={() => navigate(-1)} className="back-button" aria-label="Go back">
          <ArrowLeft size={18} /> <span>Back</span>
        </button>
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="detail-container">
        {/* ── Left Sidebar ── */}
        <aside className="side-panel">
          {/* Identity */}
          <div className="side-panel__header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="customer-avatar">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="side-panel__title">{customer.name}</div>
                <span className={`badge badge-${customer.customer_type}`} style={{ marginTop: 4 }}>
                  {customer.customer_type === 'retail' ? 'Retail' : 'Business'}
                </span>
              </div>
            </div>
          </div>

          {/* Contact info */}
          <div className="side-panel__metadata">
            <div className="metadata-item">
              <label>Status</label>
              <span className={`badge badge-${customer.is_active ? 'active' : 'inactive'}`}>
                {customer.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            {customer.company_name && (
              <div className="metadata-item">
                <label>Company</label>
                <div className="metadata-value" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Building2 size={13} color="#64748b" />
                  {customer.company_name}
                </div>
              </div>
            )}
            <div className="metadata-item">
              <label>Phone</label>
              <div className="metadata-value" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Phone size={13} color="#64748b" />
                {customer.phone}
              </div>
            </div>
            <div className="metadata-item">
              <label>Email</label>
              <div className="metadata-value" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Mail size={13} color="#64748b" />
                {customer.email}
              </div>
            </div>
            {customer.payment_terms && (
              <div className="metadata-item">
                <label>Payment Terms</label>
                <div className="metadata-value">{customer.payment_terms}</div>
              </div>
            )}
            <div className="metadata-item">
              <label>Member Since</label>
              <div className="metadata-value">
                {new Date(customer.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Outstanding balance */}
          {outstanding && (
            <div className="side-panel__metadata" style={{ borderTop: '1px solid #e5e7eb' }}>
              <div className="metadata-item">
                <label>Outstanding Balance</label>
                <div className={`metadata-value customer-balance ${outstanding.over_limit ? 'customer-balance--over' : ''}`}>
                  ${parseFloat(outstanding.outstanding_balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
              {outstanding.credit_limit && (
                <>
                  <div className="metadata-item">
                    <label>Credit Limit</label>
                    <div className="metadata-value">
                      ${parseFloat(outstanding.credit_limit).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  {outstanding.available_credit && (
                    <div className="metadata-item">
                      <label>Available Credit</label>
                      <div className="metadata-value" style={{ color: '#10b981', fontWeight: 600 }}>
                        ${parseFloat(outstanding.available_credit).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  )}
                  {outstanding.over_limit && (
                    <div className="customer-over-limit-banner">
                      <AlertCircle size={14} />
                      Over credit limit
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="side-panel__actions">
            <button
              className="btn btn-secondary btn-block"
              onClick={() => navigate(`/sales/customers/${customer.id}/edit`)}
            >
              <Edit2 size={15} />
              Edit Customer
            </button>
            <button
              className="btn btn-primary btn-block"
              onClick={() => navigate(`/sales/orders/new?customer=${customer.id}`)}
            >
              <ShoppingCart size={15} />
              New Order
            </button>
            {customer.is_active && (
              <button
                className="btn btn-danger btn-block"
                onClick={async () => {
                  if (confirm('Deactivate this customer?')) {
                    await deactivate(customer.id);
                    navigate('/sales/customers');
                  }
                }}
                disabled={isSubmitting}
              >
                Deactivate
              </button>
            )}
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="main-content">
          {/* Tab Bar */}
          <div className="customer-tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`customer-tab ${activeTab === tab.id ? 'customer-tab--active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Overview Tab ── */}
          {activeTab === 'overview' && (
            <div className="detail-section">
              <h2 className="section-title">Contact Details</h2>
              <div className="overview-grid">
                <div className="overview-item">
                  <span className="overview-label">Full Name</span>
                  <span className="overview-value">{customer.name}</span>
                </div>
                <div className="overview-item">
                  <span className="overview-label">Customer Type</span>
                  <span className="overview-value">
                    <span className={`badge badge-${customer.customer_type}`}>
                      {customer.customer_type === 'retail' ? 'Retail' : 'Business'}
                    </span>
                  </span>
                </div>
                <div className="overview-item">
                  <span className="overview-label">Phone</span>
                  <span className="overview-value">{customer.phone}</span>
                </div>
                <div className="overview-item">
                  <span className="overview-label">Email</span>
                  <span className="overview-value">{customer.email}</span>
                </div>
                {customer.company_name && (
                  <div className="overview-item">
                    <span className="overview-label">Company</span>
                    <span className="overview-value">{customer.company_name}</span>
                  </div>
                )}
                {customer.tax_number && (
                  <div className="overview-item">
                    <span className="overview-label">Tax Number</span>
                    <span className="overview-value">{customer.tax_number}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="overview-item full-width">
                    <span className="overview-label">Address</span>
                    <span className="overview-value">{customer.address}</span>
                  </div>
                )}
                {customer.payment_terms && (
                  <div className="overview-item">
                    <span className="overview-label">Payment Terms</span>
                    <span className="overview-value">{customer.payment_terms}</span>
                  </div>
                )}
                {customer.credit_limit && (
                  <div className="overview-item">
                    <span className="overview-label">Credit Limit</span>
                    <span className="overview-value">
                      ${parseFloat(customer.credit_limit).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Orders Tab ── */}
          {activeTab === 'orders' && (
            <div className="detail-section">
              <h2 className="section-title">Orders</h2>
              {orders.length === 0 ? (
                <div className="empty-state-card">
                  <ShoppingCart size={28} style={{ opacity: 0.4, marginBottom: 8 }} />
                  <div>No orders found for this customer</div>
                </div>
              ) : (
                <table className="sales-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Warehouse</th>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        onClick={() => navigate(`/sales/orders/${order.id}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td><span className="table-link">{order.order_number}</span></td>
                        <td>{order.warehouse_name}</td>
                        <td>
                          <span className={`badge badge-${order.order_type}`}>
                            {order.order_type === 'pos' ? 'POS' : 'B2B'}
                          </span>
                        </td>
                        <td>{new Date(order.order_date).toLocaleDateString()}</td>
                        <td className="table-amount">
                          ${parseFloat(order.total_amount).toFixed(2)}
                        </td>
                        <td>
                          <span className={`badge badge-${order.status}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── Invoices Tab ── */}
          {activeTab === 'invoices' && (
            <div className="detail-section">
              <h2 className="section-title">Invoices</h2>
              {invoices.length === 0 ? (
                <div className="empty-state-card">
                  <FileText size={28} style={{ opacity: 0.4, marginBottom: 8 }} />
                  <div>No invoices found for this customer</div>
                </div>
              ) : (
                <table className="sales-table">
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Type</th>
                      <th>Order #</th>
                      <th>Issued</th>
                      <th>Due</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr
                        key={inv.id}
                        onClick={() => navigate(`/sales/invoices/${inv.id}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td><span className="table-link">{inv.invoice_number}</span></td>
                        <td>{inv.invoice_type}</td>
                        <td>{inv.order_number}</td>
                        <td>{new Date(inv.issued_date).toLocaleDateString()}</td>
                        <td>{new Date(inv.due_date).toLocaleDateString()}</td>
                        <td className="table-amount">${parseFloat(inv.total_amount).toFixed(2)}</td>
                        <td>
                          <span className={`badge badge-${inv.status}`}>
                            {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── Payments Tab ── */}
          {activeTab === 'payments' && (
            <div className="detail-section">
              <h2 className="section-title">Payment History</h2>
              {payments.length === 0 ? (
                <div className="empty-state-card">
                  <CreditCard size={28} style={{ opacity: 0.4, marginBottom: 8 }} />
                  <div>No payments recorded for this customer</div>
                </div>
              ) : (
                <table className="sales-table">
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Date</th>
                      <th>Reference</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((pmt) => (
                      <tr key={pmt.id}>
                        <td><span className="table-link">{pmt.invoice_number}</span></td>
                        <td className="table-amount">${parseFloat(pmt.amount).toFixed(2)}</td>
                        <td>
                          <span className={`badge badge-method-${pmt.payment_method}`}>
                            {pmt.payment_method.replace('_', ' ')}
                          </span>
                        </td>
                        <td>{new Date(pmt.payment_date).toLocaleDateString()}</td>
                        <td>{pmt.reference || '—'}</td>
                        <td>{pmt.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── Statement Tab ── */}
          {activeTab === 'statement' && (
            <div className="detail-section">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 className="section-title" style={{ margin: 0 }}>Customer Statement</h2>
                <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FileText size={15} />
                  Print / Export
                </button>
              </div>

              {/* Date range selector */}
              <div className="statement-date-range">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>From</label>
                  <input
                    type="date"
                    value={statementDateFrom}
                    onChange={(e) => setStatementDateFrom(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>To</label>
                  <input
                    type="date"
                    value={statementDateTo}
                    onChange={(e) => setStatementDateTo(e.target.value)}
                  />
                </div>
                <button className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>
                  Generate
                </button>
              </div>

              {/* Statement header */}
              <div className="statement-header">
                <div>
                  <div className="statement-header__name">{customer.name}</div>
                  {customer.company_name && (
                    <div className="statement-header__company">{customer.company_name}</div>
                  )}
                  <div className="statement-header__contact">{customer.email} · {customer.phone}</div>
                </div>
                <div className="statement-header__balance">
                  <div className="statement-header__balance-label">Outstanding Balance</div>
                  <div className={`statement-header__balance-value ${outstanding?.over_limit ? 'statement-header__balance-value--over' : ''}`}>
                    ${outstanding ? parseFloat(outstanding.outstanding_balance).toFixed(2) : '0.00'}
                  </div>
                </div>
              </div>

              {/* Chronological transaction list */}
              <table className="sales-table statement-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Reference</th>
                    <th>Description</th>
                    <th>Debit</th>
                    <th>Credit</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Merge and sort orders + invoices + payments chronologically */}
                  {buildStatementRows(orders, invoices, payments).map((row, i) => (
                    <tr key={i} className={`statement-row statement-row--${row.type}`}>
                      <td>{row.date}</td>
                      <td>
                        <span className={`badge statement-badge--${row.type}`}>{row.typeLabel}</span>
                      </td>
                      <td><span className="table-link">{row.reference}</span></td>
                      <td>{row.description}</td>
                      <td className="table-amount">{row.debit ? `$${row.debit}` : '—'}</td>
                      <td className="table-amount" style={{ color: '#10b981' }}>
                        {row.credit ? `$${row.credit}` : '—'}
                      </td>
                      <td className="table-amount" style={{ fontWeight: 700 }}>
                        ${row.runningBalance}
                      </td>
                    </tr>
                  ))}
                  {buildStatementRows(orders, invoices, payments).length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#9ca3af' }}>
                        No transactions found. Select a date range and click Generate.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Pricing Tab ── */}
          {activeTab === 'pricing' && (
            <div className="detail-section">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 className="section-title" style={{ margin: 0 }}>Pricing Agreements</h2>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/sales/price-agreements')}
                >
                  <Tag size={15} />
                  Manage Agreements
                </button>
              </div>
              {pricingAgreements.length === 0 ? (
                <div className="empty-state-card">
                  <Tag size={28} style={{ opacity: 0.4, marginBottom: 8 }} />
                  <div>No pricing agreements for this customer</div>
                  <div style={{ fontSize: '0.82rem', color: '#9ca3af', marginTop: 4 }}>
                    Pricing agreements override the default product pricing rules
                  </div>
                </div>
              ) : (
                <table className="sales-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Unit Price</th>
                      <th>Min Qty</th>
                      <th>Valid From</th>
                      <th>Valid Until</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricingAgreements.map((ag) => (
                      <tr key={ag.id}>
                        <td>{ag.product_name}</td>
                        <td className="table-amount">${parseFloat(ag.unit_price).toFixed(2)}</td>
                        <td>{ag.min_order_quantity || '—'}</td>
                        <td>{new Date(ag.valid_from).toLocaleDateString()}</td>
                        <td>{ag.valid_until ? new Date(ag.valid_until).toLocaleDateString() : 'No expiry'}</td>
                        <td>
                          <span className={`badge badge-${ag.is_active ? 'active' : 'inactive'}`}>
                            {ag.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────
// Statement row builder
// ──────────────────────────────────────────────
interface StatementRow {
  date: string;
  type: 'order' | 'invoice' | 'payment';
  typeLabel: string;
  reference: string;
  description: string;
  debit: string | null;
  credit: string | null;
  runningBalance: string;
}

function buildStatementRows(orders: any[], invoices: any[], payments: any[]): StatementRow[] {
  const rows: StatementRow[] = [];
  let balance = 0;

  // Combine all events and sort by date
  const events: any[] = [
    ...invoices.map((inv) => ({
      date: inv.issued_date,
      type: 'invoice',
      data: inv,
    })),
    ...payments.map((pmt) => ({
      date: pmt.payment_date.split('T')[0],
      type: 'payment',
      data: pmt,
    })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  for (const event of events) {
    if (event.type === 'invoice') {
      const amount = parseFloat(event.data.total_amount);
      balance += amount;
      rows.push({
        date: new Date(event.data.issued_date).toLocaleDateString(),
        type: 'invoice',
        typeLabel: 'Invoice',
        reference: event.data.invoice_number,
        description: `Invoice for order ${event.data.order_number}`,
        debit: amount.toFixed(2),
        credit: null,
        runningBalance: balance.toFixed(2),
      });
    } else if (event.type === 'payment') {
      const amount = parseFloat(event.data.amount);
      balance -= amount;
      rows.push({
        date: new Date(event.data.payment_date).toLocaleDateString(),
        type: 'payment',
        typeLabel: 'Payment',
        reference: event.data.invoice_number,
        description: `${event.data.payment_method.replace('_', ' ')} payment`,
        debit: null,
        credit: amount.toFixed(2),
        runningBalance: balance.toFixed(2),
      });
    }
  }

  return rows;
}

export default CustomerDetailPage;
