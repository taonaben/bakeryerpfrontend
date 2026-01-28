import React from 'react';
import { Clock } from 'lucide-react';

const StockBalancesTable = ({ balances = [] }) => (
    <table className="inventory-table">
        <thead>
            <tr><th>Product ID</th><th>Quantity On Hand</th><th>Status</th><th>Last Updated</th></tr>
        </thead>
        <tbody>
            {balances.map((b, index) => (
                <tr key={b.id || b.product || index}>
                    <td style={{ fontWeight: '600', fontSize: '0.85rem', fontFamily: 'monospace' }}>{b.product}</td>
                    <td style={{ fontWeight: '700', fontSize: '1.1rem' }}>{parseFloat(b.quantity_on_hand).toLocaleString()}</td>
                    <td><span className={`badge ${b.status?.toLowerCase()}`}>{b.status}</span></td>
                    <td className="text-muted" style={{ fontSize: '0.85rem' }}>
                        <Clock size={12} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                        {new Date(b.last_updated).toLocaleDateString()}
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
);

export default StockBalancesTable;
