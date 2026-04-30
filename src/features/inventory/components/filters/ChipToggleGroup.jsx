import React from 'react';
import './filters.css';

const ChipToggleGroup = ({ options, selected, onChange, label }) => {
  const handleToggle = (value) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="filter-field">
      {label && <span className="filter-label">{label}</span>}
      <div className="chip-group">
        {options.map(({ label: optLabel, value }) => (
          <button
            key={value}
            type="button"
            className={`chip ${selected.includes(value) ? 'chip--active' : ''}`}
            onClick={() => handleToggle(value)}
            aria-pressed={selected.includes(value)}
          >
            {optLabel}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChipToggleGroup;
