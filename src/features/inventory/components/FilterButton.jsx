import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import Button from '../../../components/ui/Button';
import './FilterButton.css';

const FilterButton = ({
    isOpen = false,
    onToggle
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
            aria-label="Toggle filters"
        >
            <Filter size={18} /> Filters
        </Button>
    );
};

export default FilterButton;
