import React, { useState, useEffect } from 'react';
import { useStockFilters } from '../../hooks/useStockFilters';
import useDebounce from '../../hooks/useDebounce';
import ChipToggleGroup from './ChipToggleGroup';
import NumericRangeInput from './NumericRangeInput';
import DateRangePicker from './DateRangePicker';
import './filters.css';

const STATUS_OPTIONS = [
  { label: 'Empty', value: 'EMPTY' },
  { label: 'Almost out', value: 'ALMOST_OUT' },
  { label: 'Good', value: 'GOOD' },
  { label: 'Full', value: 'FULL' },
];

const StockFilterPanel = () => {
  const { filters, setFilter, setFilters } = useStockFilters();

  const [productSku, setProductSku] = useState(filters.product__sku__icontains);
  const debouncedProductSku = useDebounce(productSku, 350);

  useEffect(() => {
    setFilter('product__sku__icontains', debouncedProductSku);
  }, [debouncedProductSku]);

  useEffect(() => {
    setProductSku(filters.product__sku__icontains);
  }, [filters.product__sku__icontains]);

  return (
    <div className="filter-panel">
      {/* SKU text filter */}
      <div className="filter-section">
        <span className="filter-section-title">Search fields</span>
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

      {/* Status chips */}
      <div className="filter-section">
        <span className="filter-section-title">Status</span>
        <ChipToggleGroup
          options={STATUS_OPTIONS}
          selected={filters.status}
          onChange={(values) => setFilter('status', values)}
        />
      </div>

      {/* Quantity range */}
      <div className="filter-section">
        <span className="filter-section-title">Quantity on hand</span>
        <NumericRangeInput
          min={filters.quantity_on_hand__gte}
          max={filters.quantity_on_hand__lte}
          onMinChange={(v) => setFilter('quantity_on_hand__gte', v)}
          onMaxChange={(v) => setFilter('quantity_on_hand__lte', v)}
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

      {/* Last updated range */}
      <div className="filter-section">
        <span className="filter-section-title">Last updated</span>
        <DateRangePicker
          startDate={filters.last_updated_start}
          endDate={filters.last_updated_end}
          onChange={(start, end) =>
            setFilters({ last_updated_start: start, last_updated_end: end })
          }
          placeholder="Select last updated range"
        />
      </div>
    </div>
  );
};

export default StockFilterPanel;
