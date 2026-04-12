import React, { forwardRef } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './filters.css';

// Converts a JS Date → YYYY-MM-DD string, or '' for null
const toDateString = (date) => {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Parses a YYYY-MM-DD string → JS Date, or null for ''
const fromDateString = (str) => {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const CustomInput = forwardRef(({ value, onClick, placeholder }, ref) => (
  <button
    type="button"
    className="date-range-input"
    onClick={onClick}
    ref={ref}
    aria-label={placeholder}
  >
    {value || <span className="date-range-placeholder">{placeholder}</span>}
  </button>
));

CustomInput.displayName = 'CustomInput';

const DateRangePicker = ({ startDate, endDate, onChange, label, placeholder = 'Select date range' }) => {
  const start = fromDateString(startDate);
  const end = fromDateString(endDate);

  const handleChange = ([newStart, newEnd]) => {
    onChange(toDateString(newStart), toDateString(newEnd));
  };

  return (
    <div className="filter-field">
      {label && <span className="filter-label">{label}</span>}
      <ReactDatePicker
        selectsRange
        startDate={start}
        endDate={end}
        onChange={handleChange}
        customInput={<CustomInput placeholder={placeholder} />}
        dateFormat="yyyy-MM-dd"
        isClearable
        placeholderText={placeholder}
        popperPlacement="bottom-start"
        showPopperArrow={false}
      />
    </div>
  );
};

export default DateRangePicker;
