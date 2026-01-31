import React, { useEffect, useMemo, useState } from 'react';
import { Clock } from 'lucide-react';
import { useProductStore } from '../../../core/products/stores/productStore';

const StockBalancesTable = ({ balances = [] }) => {
    const rowIds = useMemo(
        () => balances.map((b, index) => b.id || b.product || index),
        [balances]
    );
    const [selectedIds, setSelectedIds] = useState(new Set());
    const productMap = useProductStore((state) => state.productMap);
    const fetchProduct = useProductStore((state) => state.fetchProduct);

    const missingProductIds = useMemo(() => {
        const productIds = Array.from(new Set(balances.map((b) => b.product).filter(Boolean)));
        return productIds.filter((id) => !productMap[id]);
    }, [balances, productMap]);

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

        let cancelled = false;
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
        return () => {
            cancelled = true;
        };
    }, [fetchProduct, missingProductIds]);

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
                        <th>Product ID</th><th>Quantity</th><th>Unit</th><th>Status</th><th>Last Updated</th>
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
                                <td style={{ fontWeight: '600', fontSize: '0.85rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <span>{productMap[b.product]?.name || b.product}</span>
                                       
                                    </div>
                                </td>

                                <td style={{   }}>{parseFloat(b.quantity_on_hand).toLocaleString()}</td>
                                <td style={{  textTransform: 'uppercase', color: 'var(--marble-blue)' }}>{productMap[b.product]?.unit_of_measure || '---'}</td>
                                <td><span className={`badge ${b.status?.toLowerCase()}`}>{b.status}</span></td>
                                <td className="text-muted" style={{}}>
                                   
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
