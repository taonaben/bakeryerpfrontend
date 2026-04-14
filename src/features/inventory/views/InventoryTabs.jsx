import React from 'react';
import { History, Database, Layers } from 'lucide-react';

const InventoryTabs = ({ activeTab, onChange }) => (
    <div className="inventory-tabs">
        <button
            className={`tab-btn ${activeTab === 'movements' ? 'active' : ''}`}
            onClick={() => onChange('movements')}
        >
            <History size={18} /> Movement Ledger
        </button>
        <button
            className={`tab-btn ${activeTab === 'balances' ? 'active' : ''}`}
            onClick={() => onChange('balances')}
        >
            <Database size={18} /> Stock Balances
        </button>
        <button
            className={`tab-btn ${activeTab === 'batches' ? 'active' : ''}`}
            onClick={() => onChange('batches')}
        >
            <Layers size={18} /> Batches Registry
        </button>
        
    </div>
);

export default InventoryTabs;
