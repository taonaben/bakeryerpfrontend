import React from 'react';
import './filters.css';

const NumericRangeInput = ({ min, max, onMinChange, onMaxChange, label, unit }) => {
  return (
    <div className="filter-field">
      {label && <span className="filter-label">{label}{unit ? ` (${unit})` : ''}</span>}
      <div className="numeric-range">
        <input
          type="number"
          className="numeric-range-input"
          value={min}
          onChange={(e) => onMinChange(e.target.value)}
          placeholder="Min"
          min={0}
          aria-label={label ? `${label} minimum` : 'Minimum'}
        />
        <span className="numeric-range-sep">–</span>
        <input
          type="number"
          className="numeric-range-input"
          value={max}
          onChange={(e) => onMaxChange(e.target.value)}
          placeholder="Max"
          min={0}
          aria-label={label ? `${label} maximum` : 'Maximum'}
        />
      </div>
    </div>
  );
};

export default NumericRangeInput;
