import React from 'react';
import { Filter } from 'lucide-react';
import Button from '../../../components/ui/Button';
import './FilterButton.css';

const FilterButton = ({
    isOpen = false,
    onToggle,
    activeCount = 0,
}) => {
    const handleClick = () => {
        onToggle?.(!isOpen);
    };

    return (
        <Button
            variant="outline"
            onClick={handleClick}
            className={`filter-button ${isOpen ? 'active' : ''}`}
            aria-pressed={isOpen}
            aria-label={activeCount > 0 ? `Toggle filters (${activeCount} active)` : 'Toggle filters'}
        >
            <Filter size={18} />
            Filters
            {activeCount > 0 && (
                <span className="filter-button-badge" aria-hidden="true">
                    {activeCount}
                </span>
            )}
        </Button>
    );
};

export default FilterButton;
