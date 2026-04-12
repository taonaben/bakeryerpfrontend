import React, { useState, useEffect } from 'react';
import { useBatchFilters } from '../../hooks/useBatchFilters';
import useDebounce from '../../hooks/useDebounce';
import DateRangePicker from './DateRangePicker';
import './filters.css';

const BatchesFilterPanel = () => {
  const { filters, setFilter, setFilters } = useBatchFilters();

  // Local state for text inputs — debounced before writing to store
  const [batchNumber, setBatchNumber] = useState(filters.batch_number__icontains);
  const [productSku, setProductSku] = useState(filters.product__sku__icontains);

  const debouncedBatchNumber = useDebounce(batchNumber, 350);
  const debouncedProductSku = useDebounce(productSku, 350);

  useEffect(() => {
    setFilter('batch_number__icontains', debouncedBatchNumber);
  }, [debouncedBatchNumber]);

  useEffect(() => {
    setFilter('product__sku__icontains', debouncedProductSku);
  }, [debouncedProductSku]);

  // Sync if store is cleared externally
  useEffect(() => {
    setBatchNumber(filters.batch_number__icontains);
  }, [filters.batch_number__icontains]);

  useEffect(() => {
    setProductSku(filters.product__sku__icontains);
  }, [filters.product__sku__icontains]);

  return (
    <div className="filter-panel">
      {/* Text filters */}
      <div className="filter-section">
        <span className="filter-section-title">Search fields</span>
        <div className="filter-field">
          <span className="filter-label">Batch number</span>
          <input
            type="text"
            className="filter-text-input"
            placeholder="e.g. BATCH-001"
            value={batchNumber}
            onChange={(e) => setBatchNumber(e.target.value)}
          />
        </div>
        <div className="filter-field">
          <span className="filter-label">Product SKU</span>
          <input
            type="text"
            className="filter-text-input"
            placeholder="e.g. SKU-123"
            value={productSku}
            onChange={(e) => setProductSku(e.target.value)}
          />
        </div>
      </div>

      {/* Manufacture date range */}
      <div className="filter-section">
        <span className="filter-section-title">Manufacture date</span>
        <DateRangePicker
          startDate={filters.manufacture_date_start}
          endDate={filters.manufacture_date_end}
          onChange={(start, end) =>
            setFilters({ manufacture_date_start: start, manufacture_date_end: end })
          }
          placeholder="Select manufacture date range"
        />
      </div>

      {/* Expiry date range */}
      <div className="filter-section">
        <span className="filter-section-title">Expiry date</span>
        <DateRangePicker
          startDate={filters.expiry_date_start}
          endDate={filters.expiry_date_end}
          onChange={(start, end) =>
            setFilters({ expiry_date_start: start, expiry_date_end: end })
          }
          placeholder="Select expiry date range"
        />
      </div>

      {/* Created at range */}
      <div className="filter-section">
        <span className="filter-section-title">Created</span>
        <DateRangePicker
          startDate={filters.created_at_start}
          endDate={filters.created_at_end}
          onChange={(start, end) =>
            setFilters({ created_at_start: start, created_at_end: end })
          }
          placeholder="Select created date range"
        />
      </div>
    </div>
  );
};

export default BatchesFilterPanel;
