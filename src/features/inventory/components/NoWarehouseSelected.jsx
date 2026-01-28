import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from '../../../components/ui/Button';

const NoWarehouseSelected = ({ onBack }) => (
    <div className="inventory-page" style={{ textAlign: 'center', padding: '100px' }}>
        <AlertTriangle size={48} color="#f59e0b" style={{ marginBottom: '20px' }} />
        <h2>No Warehouse Selected</h2>
        <Button onClick={onBack}>Go to Dashboard</Button>
    </div>
);

export default NoWarehouseSelected;
