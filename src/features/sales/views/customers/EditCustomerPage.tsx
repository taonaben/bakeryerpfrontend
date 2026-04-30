import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Save } from 'lucide-react';
import { useCustomersStore } from '../../stores/customersStore';
import type { UpdateCustomerDTO } from '../../types/customers_models';
import '../../styles/sales.css';

type FieldErrors = Partial<Record<
  'name' | 'phone' | 'email' | 'address' | 'paymentTerms' | 'creditLimit',
  string
>>;

const EditCustomerPage: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();

  const {
    detailMap,
    fetchById,
    patch,
    isLoading,
    isSubmitting,
    error,
    clearError,
  } = useCustomersStore();

  const customer = customerId ? detailMap[customerId] : null;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!customerId || customerId === 'new') {
      navigate('/sales/customers', { replace: true });
      return;
    }

    fetchById(customerId, !detailMap[customerId]);
  }, [customerId, detailMap, fetchById, navigate]);

  useEffect(() => {
    if (!customer) return;

    setName(customer.name ?? '');
    setPhone(customer.phone ?? '');
    setEmail(customer.email ?? '');
    setAddress(customer.address ?? '');
    setCompanyName(customer.company_name ?? '');
    setPaymentTerms(customer.payment_terms ?? '');
    setCreditLimit(customer.credit_limit ?? '');
    setTaxNumber(customer.tax_number ?? '');
    setIsActive(customer.is_active);
    setFieldErrors({});
  }, [customer]);

  const customerTypeLabel = useMemo(() => {
    if (!customer) return '';
    return customer.customer_type === 'retail' ? 'Retail' : 'Business';
  }, [customer]);

  const validate = (): boolean => {
    const errors: FieldErrors = {};

    if (!name.trim()) errors.name = 'Name is required';
    if (!phone.trim()) errors.phone = 'Phone is required';
    if (!email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Invalid email format';
    }
    if (!address.trim()) errors.address = 'Address is required';
    if (customer?.customer_type === 'business' && !paymentTerms.trim()) {
      errors.paymentTerms = 'Payment terms are required for business customers';
    }
    if (creditLimit.trim() && Number(creditLimit) < 0) {
      errors.creditLimit = 'Credit limit cannot be negative';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!customerId || !customer || !validate()) return;

    const dto: UpdateCustomerDTO = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      company_name: companyName.trim(),
      payment_terms: paymentTerms.trim(),
      credit_limit: creditLimit.trim() || null,
      tax_number: taxNumber.trim(),
      is_active: isActive,
    };

    try {
      const updated = await patch(customerId, dto);
      navigate(`/sales/customers/${updated.id}`);
    } catch (err) {
      console.error('Failed to update customer:', err);
    }
  };

  if (isLoading && !customer) {
    return (
      <div className="sales-page">
        <div className="loading-container">
          <div className="spinner" />
          <span>Loading customer...</span>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="sales-page">
        <div className="sales-content">
          <div className="create-customer-page">
            <div className="empty-state-card">
              <AlertCircle size={28} style={{ opacity: 0.4, marginBottom: 8 }} />
              <div>Customer not found</div>
              <button
                className="btn btn-outline"
                type="button"
                onClick={() => navigate('/sales/customers')}
                style={{ marginTop: 14 }}
              >
                Back to Customers
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sales-page">
      <div className="sales-sticky-stack">
        <div className="sales-page-header">
          <div className="sales-page-header__left">
            <button
              className="btn btn-outline"
              onClick={() => navigate(`/sales/customers/${customer.id}`)}
              type="button"
              style={{ marginBottom: 8 }}
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <h1>Edit Customer</h1>
            <p className="sales-page-header__breadcrumb">
              Sales / Customers / {customer.name} / Edit
            </p>
          </div>
        </div>
      </div>

      <div className="sales-content">
        <div className="create-customer-page">
          {error && (
            <div className="error-banner" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
              <button onClick={clearError} type="button">
                Dismiss
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="create-form">
            <div className="form-card">
              <h2 className="form-card__title">Customer Type</h2>
              <div className="customer-type-pills">
                <button
                  type="button"
                  className="customer-type-pill active"
                  disabled
                  title="Customer type cannot be changed here"
                >
                  {customerTypeLabel}
                </button>
              </div>
            </div>

            <div className="form-card">
              <h2 className="form-card__title">Basic Information</h2>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Name <span className="required">*</span>
                  </label>
                  <input
                    className={fieldErrors.name ? 'input-error' : ''}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Customer name"
                    disabled={isSubmitting}
                  />
                  {fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}
                </div>

                <div className="form-group">
                  <label>
                    Phone <span className="required">*</span>
                  </label>
                  <input
                    className={fieldErrors.phone ? 'input-error' : ''}
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+263 77 123 4567"
                    disabled={isSubmitting}
                  />
                  {fieldErrors.phone && <p className="field-error">{fieldErrors.phone}</p>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Email <span className="required">*</span>
                  </label>
                  <input
                    className={fieldErrors.email ? 'input-error' : ''}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@example.com"
                    disabled={isSubmitting}
                  />
                  {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
                </div>

                <div className="form-group">
                  <label>
                    Address <span className="required">*</span>
                  </label>
                  <input
                    className={fieldErrors.address ? 'input-error' : ''}
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street address, city"
                    disabled={isSubmitting}
                  />
                  {fieldErrors.address && <p className="field-error">{fieldErrors.address}</p>}
                </div>
              </div>
            </div>

            <div className="form-card">
              <h2 className="form-card__title">Account Details</h2>

              <div className="form-row">
                <div className="form-group">
                  <label>Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Company name"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label>
                    Payment Terms
                    {customer.customer_type === 'business' && <span className="required">*</span>}
                  </label>
                  <select
                    className={fieldErrors.paymentTerms ? 'input-error' : ''}
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    disabled={isSubmitting}
                  >
                    <option value="">Select payment terms</option>
                    <option value="cash">Cash</option>
                    <option value="net_30">Net 30</option>
                    <option value="net_60">Net 60</option>
                  </select>
                  {fieldErrors.paymentTerms && (
                    <p className="field-error">{fieldErrors.paymentTerms}</p>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Credit Limit</label>
                  <input
                    className={fieldErrors.creditLimit ? 'input-error' : ''}
                    type="number"
                    min="0"
                    step="0.01"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                    placeholder="0.00"
                    disabled={isSubmitting}
                  />
                  {fieldErrors.creditLimit && (
                    <p className="field-error">{fieldErrors.creditLimit}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Tax Number</label>
                  <input
                    type="text"
                    value={taxNumber}
                    onChange={(e) => setTaxNumber(e.target.value)}
                    placeholder="VAT/TIN number"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <label className="form-checkbox">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  disabled={isSubmitting}
                />
                <span>Customer is active</span>
              </label>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate(`/sales/customers/${customer.id}`)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                <Save size={16} />
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCustomerPage;
