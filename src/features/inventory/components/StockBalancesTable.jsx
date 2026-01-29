import React, { useMemo, useState } from 'react';
import { Clock } from 'lucide-react';

const StockBalancesTable = ({ balances = [] }) => {
    const rowIds = useMemo(
        () => balances.map((b, index) => b.id || b.product || index),
        [balances]
    );
    const [selectedIds, setSelectedIds] = useState(new Set());

    const allSelected = rowIds.length > 0 && rowIds.every((id) => selectedIds.has(id));

    const toggleAll = () => {
        if (allSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(rowIds));
        }
    };

    const toggleRow = (id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    return (
        <div className="table-container">
            <table className="inventory-table">
                <thead>
                    <tr>
                        <th>
                            <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={toggleAll}
                                aria-label="Select all stock balances"
                            />
                        </th>
                        <th>Product ID</th><th>Quantity On Hand</th><th>Status</th><th>Last Updated</th>
                    </tr>
                </thead>
                <tbody>
                    {balances.map((b, index) => {
                        const rowId = b.id || b.product || index;
                        return (
                            <tr key={rowId}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(rowId)}
                                        onChange={() => toggleRow(rowId)}
                                        aria-label={`Select balance ${b.product || rowId}`}
                                    />
                                </td>
                                <td style={{ fontWeight: '600', fontSize: '0.85rem', fontFamily: 'monospace' }}>{b.product}</td>
                                <td style={{ fontWeight: '700', fontSize: '1.1rem' }}>{parseFloat(b.quantity_on_hand).toLocaleString()}</td>
                                <td><span className={`badge ${b.status?.toLowerCase()}`}>{b.status}</span></td>
                                <td className="text-muted" style={{ fontSize: '0.85rem' }}>
                                    <Clock size={12} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                                    {new Date(b.last_updated).toLocaleDateString()}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default StockBalancesTable;
