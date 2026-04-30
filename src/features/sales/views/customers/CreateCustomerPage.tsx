import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCustomersStore } from '../../stores/customersStore';
import type { CreateCustomerDTO } from '../../types/customers_models';
import type { CustomerType } from '../../types/shared';
import '../../styles/sales.css';

const CreateCustomerPage: React.FC = () => {
  const navigate = useNavigate();
  const { create, isSubmitting, error, clearError } = useCustomersStore();

  // Form state
  const [customerType, setCustomerType] = useState<CustomerType>('retail');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [taxNumber, setTaxNumber] = useState('');

  // Validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Validate form
  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim()) errors.name = 'Name is required';
    if (!phone.trim()) errors.phone = 'Phone is required';
    if (!email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Invalid email format';
    }
    if (!address.trim()) errors.address = 'Address is required';

    // Business customer validations
    if (customerType === 'business') {
      if (!paymentTerms.trim()) {
        errors.paymentTerms = 'Payment terms are required for business customers';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validate()) return;

    try {
      const dto: CreateCustomerDTO = {
        customer_type: customerType,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
      };

      // Add optional fields
      if (companyName.trim()) dto.company_name = companyName.trim();
      if (paymentTerms.trim()) dto.payment_terms = paymentTerms.trim();
      if (creditLimit.trim()) dto.credit_limit = creditLimit.trim();
      if (taxNumber.trim()) dto.tax_number = taxNumber.trim();

      const created = await create(dto);
      navigate(`/sales/customers/${created.id}`);
    } catch (err) {
      // Error is already set in store
      console.error('Failed to create customer:', err);
    }
  };

  return (
    <div className="sales-page">
      <div className="sales-sticky-stack">
        {/* Header */}
        <div className="sales-page-header">
          <div className="sales-page-header__left">
            <button
              className="btn btn-outline"
              onClick={() => navigate('/sales/customers')}
              type="button"
              style={{ marginBottom: 8 }}
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <h1>New Customer</h1>
            <p className="sales-page-header__breadcrumb">
              Sales / Customers / New
            </p>
          </div>
        </div>
      </div>

      <div className="sales-content">
        <div className="create-customer-page">
          {error && (
            <div className="error-banner">
              {error}
              <button onClick={clearError} type="button">
                Dismiss
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="create-form">
            {/* Customer Type Selector */}
            <div className="form-card">
              <h2 className="form-card__title">Customer Type</h2>
              <div className="customer-type-pills">
                <button
                  type="button"
                  className={`customer-type-pill ${customerType === 'retail' ? 'active' : ''}`}
                  onClick={() => setCustomerType('retail')}
                >
                  Retail
                </button>
                <button
                  type="button"
                  className={`customer-type-pill ${customerType === 'business' ? 'active' : ''}`}
                  onClick={() => setCustomerType('business')}
                >
                  Business
                </button>
              </div>
            </div>

            {/* Basic Information */}
            <div className="form-card">
              <h2 className="form-card__title">Basic Information</h2>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Customer name"
                  />
                  {fieldErrors.name && (
                    <p className="field-error">{fieldErrors.name}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    Phone <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+263 77 123 4567"
                  />
                  {fieldErrors.phone && (
                    <p className="field-error">{fieldErrors.phone}</p>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Email <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@example.com"
                  />
                  {fieldErrors.email && (
                    <p className="field-error">{fieldErrors.email}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    Address <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street address, city"
                  />
                  {fieldErrors.address && (
                    <p className="field-error">{fieldErrors.address}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Business Details (conditional) */}
            {customerType === 'business' && (
              <div className="form-card">
                <h2 className="form-card__title">Business Details</h2>

                <div className="form-row">
                  <div className="form-group">
                    <label>Company Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Company name"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Payment Terms <span className="required">*</span>
                    </label>
                    <select
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
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
                      type="number"
                      min="0"
                      step="0.01"
                      value={creditLimit}
                      onChange={(e) => setCreditLimit(e.target.value)}
                      placeholder="0.00"
                    />
                    <small style={{ color: '#64748b', fontSize: '0.8rem' }}>
                      Maximum outstanding balance allowed
                    </small>
                  </div>

                  <div className="form-group">
                    <label>Tax Number</label>
                    <input
                      type="text"
                      value={taxNumber}
                      onChange={(e) => setTaxNumber(e.target.value)}
                      placeholder="VAT/TIN number"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate('/sales/customers')}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating…' : 'Create Customer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCustomerPage;
