import React, { useMemo, useState } from 'react';

const MovementLedgerTable = ({ movements = [] }) => {
    const rowIds = useMemo(
        () => movements.map((m, index) => m?.id || m?.reference_number || index),
        [movements]
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

    const getBatchNumbers = (movement) => {
        if (Array.isArray(movement?.batches_detail) && movement.batches_detail.length > 0) {
            return movement.batches_detail
                .map((detail) => detail?.batch?.batch_number)
                .filter(Boolean);
        }
        if (movement?.batch) return [movement.batch];
        return [];
    };

    const getChipColorClass = (value) => {
        if (!value) return 'batch-chip--neutral';
        let hash = 0;
        for (let i = 0; i < value.length; i += 1) {
            hash = (hash * 31 + value.charCodeAt(i)) % 7;
        }
        const palette = [
            'batch-chip--blue',
            'batch-chip--green',
            'batch-chip--amber',
            'batch-chip--purple',
            'batch-chip--rose',
            'batch-chip--teal',
            'batch-chip--slate'
        ];
        return palette[hash] || 'batch-chip--neutral';
    };

    const getProductName = (movement) => {
        return (
            movement?.product?.name ||
            movement?.product_name ||
            movement?.product?.product_name ||
            movement?.product?.title ||
            '---'
        );
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
                                aria-label="Select all movements"
                            />
                        </th>
                        <th>Batches Used</th><th>Product</th><th>Ref num</th><th>Type</th><th>Quantity</th><th>Date</th><th>Notes</th>
                    </tr>
                </thead>
                <tbody>
                    {movements.map((m, index) => {
                        const rowId = m?.id || m?.reference_number || index;
                        return (
                            <tr key={rowId}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(rowId)}
                                        onChange={() => toggleRow(rowId)}
                                        aria-label={`Select movement ${m?.reference_number || rowId}`}
                                    />
                                </td>
                                <td>
                                    <div className="batch-chips" title="Batches used">
                                        {getBatchNumbers(m).length > 0 ? (
                                            getBatchNumbers(m).map((batchNumber, chipIndex) => (
                                                <button
                                                    key={`${rowId}-batch-${chipIndex}`}
                                                    type="button"
                                                    className={`batch-chip ${getChipColorClass(batchNumber)}`}
                                                    aria-label={`Batch ${batchNumber}`}
                                                >
                                                    {batchNumber}
                                                </button>
                                            ))
                                        ) : (
                                            <span className="text-muted">---</span>
                                        )}
                                    </div>
                                </td>
                                <td>{getProductName(m)}</td>
                                <td><code className="batch-tag">{m.reference_number || '---'}</code></td>
                                <td><span className={`badge ${m.movement_type?.toLowerCase()}`}>{m.movement_type}</span></td>
                                <td style={{ fontWeight: '700', color: m.total_quantity <= 0 ? '#ef4444' : '#10b981' }}>{m.total_quantity}</td>
                                <td>{new Date(m.created_at).toLocaleDateString()}</td>
                                <td className="text-muted">{m.notes || '---'}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default MovementLedgerTable;
