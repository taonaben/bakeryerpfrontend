import React from 'react';
import { Search, Filter, Plus, CheckCircle } from 'lucide-react';
import Button from '../../../components/ui/Button';

const InventoryToolbar = ({
    activeTab,
    searchTerm,
    onSearchChange,
    onOpenMovementModal,
    onQualityAudit
}) => (
    <div className="inventory-toolbar">
        <div className="search-container">
            <Search size={18} className="search-icon" />
            <input
                type="text"
                className="search-input"
                placeholder={`Search ${activeTab === 'batches' ? 'batch number' : activeTab === 'balances' ? 'product ID' : 'reference'}...`}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
            />
        </div>
        <div className="toolbar-actions" style={{ display: 'flex', gap: '10px' }}>
            <Button variant="outline">
                <Filter size={18} /> Filters
            </Button>
            {activeTab === 'movements' && (
                <Button onClick={onOpenMovementModal}>
                    <Plus size={18} /> Log Movement
                </Button>
            )}
            {activeTab === 'batches' && (
                <Button onClick={onQualityAudit}>
                    <CheckCircle size={18} /> Quality Audit
                </Button>
            )}
        </div>
    </div>
);

export default InventoryToolbar;
