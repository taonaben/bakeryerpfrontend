import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import './filters.css';

// value is the raw field name (no prefix). ordering state includes '-' prefix for desc.
// e.g. value = 'expiry_date', ordering = '-expiry_date' means this field is active desc
const SortDropdown = ({ ordering, onChange, options, label = 'Sort by' }) => {
  const isDesc = ordering.startsWith('-');
  const activeField = isDesc ? ordering.slice(1) : ordering;

  const handleFieldChange = (e) => {
    const field = e.target.value;
    if (!field) {
      onChange('');
      return;
    }
    // Keep current direction when switching field
    onChange(isDesc ? `-${field}` : field);
  };

  const handleDirectionToggle = () => {
    if (!activeField) return;
    onChange(isDesc ? activeField : `-${activeField}`);
  };

  return (
    <div className="sort-dropdown-wrapper">
      <select
        className="sort-select"
        value={activeField}
        onChange={handleFieldChange}
        aria-label={label}
      >
        <option value="">Sort by…</option>
        {options.map(({ label: optLabel, value }) => (
          <option key={value} value={value}>
            {optLabel}
          </option>
        ))}
      </select>

      {activeField && (
        <button
          type="button"
          className="sort-direction-btn"
          onClick={handleDirectionToggle}
          aria-label={isDesc ? 'Switch to ascending' : 'Switch to descending'}
          title={isDesc ? 'Descending — click to switch' : 'Ascending — click to switch'}
        >
          {isDesc ? <ArrowDown size={15} /> : <ArrowUp size={15} />}
        </button>
      )}

      {!activeField && <ArrowUpDown size={15} className="sort-icon-idle" />}
    </div>
  );
};

export default SortDropdown;
