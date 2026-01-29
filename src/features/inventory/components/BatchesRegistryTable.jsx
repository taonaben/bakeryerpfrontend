import React, { useMemo, useState } from 'react';
import { getExpiryStatus } from '../utils/getExpiryStatus';

const BatchesRegistryTable = ({ batches = [] }) => {
    const rowIds = useMemo(
        () => batches.map((b, index) => b.id || b.batch_number || index),
        [batches]
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
                                aria-label="Select all batches"
                            />
                        </th>
                        <th>Batch Number</th>
                        <th>Product ID</th>
                        <th>Quantity</th>
                        <th>Manufactured</th>
                        <th>Expiry Date</th>
                    </tr>
                </thead>
                <tbody>
                    {batches.length > 0 ? (
                        batches.map((b, index) => {
                            const rowId = b.id || b.batch_number || index;
                            const expiryStatus = getExpiryStatus(b.expiry_date);
                            const productLabel = b?.product ? `${b.product.substring(0, 13)}...` : '---';
                            return (
                                <tr key={rowId}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(rowId)}
                                            onChange={() => toggleRow(rowId)}
                                            aria-label={`Select batch ${b.batch_number || rowId}`}
                                        />
                                    </td>
                                    <td style={{ fontWeight: '700', color: 'var(--marble-blue)' }}>{b.batch_number}</td>
                                    <td style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{productLabel}</td>
                                    <td style={{ fontWeight: '600' }}>{parseFloat(b.quantity).toLocaleString()}</td>
                                    <td>{new Date(b.manufacture_date).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`badge ${expiryStatus === 'expired' ? 'out' : expiryStatus === 'near' ? 'low' : 'in'}`}>
                                            {new Date(b.expiry_date).toLocaleDateString()}
                                            {expiryStatus === 'expired' && ' (EXPIRED)'}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>No batch records found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default BatchesRegistryTable;
