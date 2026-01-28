import React from 'react';

const MovementLedgerTable = ({ movements = [] }) => (
    <table className="inventory-table">
        <thead>
            <tr><th>Date</th><th>Reference</th><th>Batch</th><th>Type</th><th>Quantity</th><th>Notes</th></tr>
        </thead>
        <tbody>
            {movements.map((m, index) => (
                <tr key={m?.id || m?.reference_number || index}>
                    <td>{new Date(m.created_at).toLocaleDateString()}</td>
                    <td style={{ fontWeight: '600' }}>{m.reference_number}</td>
                    <td><code className="batch-tag">{m.batch}</code></td>
                    <td><span className={`badge ${m.movement_type?.toLowerCase()}`}>{m.movement_type}</span></td>
                    <td style={{ fontWeight: '700', color: m.quantity < 0 ? '#ef4444' : '#10b981' }}>{m.quantity}</td>
                    <td className="text-muted">{m.notes || '---'}</td>
                </tr>
            ))}
        </tbody>
    </table>
);

export default MovementLedgerTable;
