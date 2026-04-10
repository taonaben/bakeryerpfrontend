import React, { useState } from 'react';
import SearchBar from './SearchBar';
import FilterButton from './FilterButton';
import ActionButtons from './ActionButtons';
import './InventoryToolbar.css';

const InventoryToolbar = ({
    activeTab,
    searchTerm,
    onSearchChange,
    onOpenMovementModal,
    onQualityAudit,
    onFilterToggle
}) => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const handleFilterToggle = (newState) => {
        setIsFilterOpen(newState);
        onFilterToggle?.(newState);
    };

    // Map tab to search placeholder
    const searchPlaceholders = {
        batches: 'Search batch number...',
        balances: 'Search product ID...',
        movements: 'Search reference...'
    };

    const placeholder = searchPlaceholders[activeTab] || 'Search...';

    return (
        <div className="inventory-toolbar">
            <SearchBar
                searchTerm={searchTerm}
                onSearchChange={onSearchChange}
                placeholder={placeholder}
            />
            <div className="toolbar-controls">
                <FilterButton
                    isOpen={isFilterOpen}
                    onToggle={handleFilterToggle}
                />
                <ActionButtons
                    activeTab={activeTab}
                    onOpenMovementModal={onOpenMovementModal}
                    onQualityAudit={onQualityAudit}
                />
            </div>
        </div>
    );
};

export default InventoryToolbar;
