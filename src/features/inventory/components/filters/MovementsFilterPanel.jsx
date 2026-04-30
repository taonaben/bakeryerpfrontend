import React, { useState, useEffect } from 'react';
import { useMovementFilters } from '../../hooks/useMovementFilters';
import useDebounce from '../../hooks/useDebounce';
import ChipToggleGroup from './ChipToggleGroup';
import NumericRangeInput from './NumericRangeInput';
import DateRangePicker from './DateRangePicker';
import './filters.css';

const MOVEMENT_TYPE_OPTIONS = [
  { label: 'In', value: 'IN' },
  { label: 'Out', value: 'OUT' },
  { label: 'Adjustment', value: 'ADJUSTMENT' },
  { label: 'Return', value: 'RETURN' },
];

const MovementsFilterPanel = () => {
  const { filters, setFilter, setFilters } = useMovementFilters();

  const [notes, setNotes] = useState(filters.notes__icontains);
  const debouncedNotes = useDebounce(notes, 350);

  useEffect(() => {
    setFilter('notes__icontains', debouncedNotes);
  }, [debouncedNotes]);

  useEffect(() => {
    setNotes(filters.notes__icontains);
  }, [filters.notes__icontains]);

  return (
    <div className="filter-panel">
      {/* Movement type chips */}
      <div className="filter-section">
        <span className="filter-section-title">Movement type</span>
        <ChipToggleGroup
          options={MOVEMENT_TYPE_OPTIONS}
          selected={filters.movement_type}
          onChange={(values) => setFilter('movement_type', values)}
        />
      </div>

      {/* Notes text filter */}
      <div className="filter-section">
        <span className="filter-section-title">Notes</span>
        <div className="filter-field">
          <input
            type="text"
            className="filter-text-input"
            placeholder="Search notes…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      {/* Total quantity range */}
      <div className="filter-section">
        <span className="filter-section-title">Total quantity</span>
        <NumericRangeInput
          min={filters.total_quantity__gte}
          max={filters.total_quantity__lte}
          onMinChange={(v) => setFilter('total_quantity__gte', v)}
          onMaxChange={(v) => setFilter('total_quantity__lte', v)}
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

export default MovementsFilterPanel;
