import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

/** @typedef {import('../../types/models').StockMovement} StockMovement */

/**
 * @param {{
 *   movements?: StockMovement[];
 *   currentPage?: number;
 *   totalPages?: number;
 *   onPageChange?: (page: number) => void;
 *   isLoading?: boolean;
 * }} props
 */
const MovementLedgerTable = ({ 
    movements = [],
    currentPage = 1,
    totalPages = 1,
    onPageChange,
    isLoading = false
}) => {
    const navigate = useNavigate();
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

    const getBatchID = (movement) => {
        if (Array.isArray(movement?.batches_detail) && movement.batches_detail.length > 0) {
            return movement.batches_detail.map((detail) => detail?.batch?.id).filter(Boolean);
        }
        if (movement?.batch_id) return [movement.batch_id];
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
                            <tr 
                                key={rowId}
                                onClick={() => {
                                    if (m?.id) {
                                        navigate(`/inventory/stock_movements/${m.id}`);
                                    }
                                }}
                                style={{ cursor: 'pointer' }}
                            >
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
                                        {Array.isArray(m?.batches_detail) && m.batches_detail.length > 0 ? (
                                            m.batches_detail.map((detail, chipIndex) => {
                                                const batchId = detail?.batch?.id;
                                                const batchNumber = detail?.batch?.batch_number;
                                                return batchId && batchNumber ? (
                                                    <Link
                                                        key={`${rowId}-batch-${chipIndex}`}
                                                        to={`/inventory/batch/${batchId}`}
                                                        className={`batch-chip ${getChipColorClass(batchNumber)}`}
                                                        title={`View details for batch ${batchNumber}`}
                                                    >
                                                        {batchNumber}
                                                    </Link>
                                                ) : null;
                                            })
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
            
            {/* Accessible Pagination Footer */}
            {totalPages > 1 && (
                <footer 
                    className="pagination-footer" 
                    aria-label="Table pagination"
                    role="contentinfo"
                >
                    <div className="pagination-container">
                        <button
                            onClick={() => onPageChange && onPageChange(currentPage - 1)}
                            disabled={currentPage === 1 || isLoading}
                            className="pagination-btn pagination-btn--prev"
                            aria-label={`Go to previous page (page ${currentPage - 1})`}
                            title="Previous page"
                        >
                            <ChevronLeft size={18} />
                            <span>Previous</span>
                        </button>

                        <div 
                            className="pagination-info" 
                            aria-live="polite" 
                            aria-atomic="true"
                        >
                            <span className="page-number">
                                Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                            </span>
                        </div>

                        <button
                            onClick={() => onPageChange && onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || isLoading}
                            className="pagination-btn pagination-btn--next"
                            aria-label={`Go to next page (page ${currentPage + 1})`}
                            title="Next page"
                        >
                            <span>Next</span>
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </footer>
            )}
        </div>
    );
};

export default MovementLedgerTable;
