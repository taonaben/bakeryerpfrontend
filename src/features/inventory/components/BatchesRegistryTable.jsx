import React, { useEffect, useMemo, useState } from 'react';
import { getExpiryStatus } from '../utils/getExpiryStatus';
import { useProductStore } from '../../../core/products/stores/productStore';

const BatchesRegistryTable = ({ batches = [] }) => {
    const rowIds = useMemo(
        () => batches.map((b, index) => b.id || b.batch_number || index),
        [batches]
    );
    const [selectedIds, setSelectedIds] = useState(new Set());
    const productMap = useProductStore((state) => state.productMap);
    const fetchProduct = useProductStore((state) => state.fetchProduct);

    const missingProductIds = useMemo(() => {
        const productIds = Array.from(new Set(batches.map((b) => b.product).filter(Boolean)));
        return productIds.filter((id) => !productMap[id]);
    }, [batches, productMap]);

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

    useEffect(() => {
        if (missingProductIds.length === 0) return;

        const loadProducts = async () => {
            try {
                await Promise.all(
                    missingProductIds.map((id) => fetchProduct(id).catch(() => null))
                );
            } catch (error) {
                // Swallow errors to avoid breaking the table rendering
            }
        };

        loadProducts();
    }, [fetchProduct, missingProductIds]);

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
            'batch-chip--teal',
            'batch-chip--slate'
        ];
        return palette[hash] || 'batch-chip--neutral';
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
                        <th>Product</th>
                        <th>Quantity</th>
                         <th>Unit</th>
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
                                    <td>
                                        <button
                                            type="button"
                                            className={`batch-chip ${getChipColorClass(b.batch_number)}`}
                                            aria-label={`Batch ${b.batch_number}`}
                                        >
                                            {b.batch_number}
                                        </button>
                                    </td>
                                     <td style={{ fontWeight: '600', fontSize: '0.85rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <span>{productMap[b.product]?.name || b.product}</span>
                                       
                                    </div>
                                </td>
                                    <td style={{ fontWeight: '600' }}>{parseFloat(b.quantity).toLocaleString()}</td>
                                           <td style={{  textTransform: 'uppercase', color: 'var(--marble-blue)' }}>{productMap[b.product]?.unit_of_measure || '---'}</td>
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
