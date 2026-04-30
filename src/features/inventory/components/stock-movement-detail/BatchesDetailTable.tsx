/**
 * Batches Detail Table
 * Displays all batches_detail from a specific stock movement in table format
 * Shows batch number (as clickable chips), product, quantity, and batch status
 */

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { StockMovementDetailResponse } from '../../types/stockMovementDetail';
import { getExpiryStatus } from '../../utils/getExpiryStatus';

interface BatchesDetailTableProps {
  movement: StockMovementDetailResponse;
}

const BatchesDetailTable: React.FC<BatchesDetailTableProps> = ({ movement }) => {
  const getChipColorClass = (value?: string): string => {
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
      'batch-chip--slate',
    ];
    return palette[hash] || 'batch-chip--neutral';
  };

  const getBatchStatus = (expiryStatus: string, reworkConsumed: boolean): string => {
    if (reworkConsumed) return 'REWORKED';
    if (expiryStatus === 'expired') return 'EXPIRED';
    if (expiryStatus === 'near') return 'NEAR EXPIRY';
    return 'ACTIVE';
  };

  const getBatchStatusBadgeClass = (expiryStatus: string, reworkConsumed: boolean): string => {
    if (reworkConsumed) return 'rework';
    if (expiryStatus === 'expired') return 'out';
    if (expiryStatus === 'near') return 'low';
    return 'in';
  };

  const batchRows = useMemo(() => {
    return movement.batches_detail.map((detail, index) => {
      const expiryStatus = getExpiryStatus(detail.batch.expiry_date);
      const batchStatus = getBatchStatus(expiryStatus, detail.batch.rework_consumed);
      const statusBadgeClass = getBatchStatusBadgeClass(expiryStatus, detail.batch.rework_consumed);

      return {
        index,
        id: detail.batch.id,
        batchNumber: detail.batch.batch_number,
        productName: detail.batch.product_name || detail.batch.product || '---',
        quantity: detail.quantity,
        movementQuantity: detail.quantity,
        batchStatus,
        statusBadgeClass,
        warehouseName: detail.batch.warehouse_name || detail.batch.warehouse || '---',
        manufactureDate: detail.batch.manufacture_date,
        expiryDate: detail.batch.expiry_date,
      };
    });
  }, [movement.batches_detail]);

  return (
    <div className="table-container">
      <div className="batches-section-header">
        <h3>Batches in This Movement</h3>
        <span className="badge-count">{batchRows.length} batch(es)</span>
      </div>

      {batchRows.length > 0 ? (
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Batch Number</th>
              <th>Product</th>
              <th>Movement Qty</th>
              <th>Manufacture Date</th>
              <th>Expiry Date</th>
              <th>Warehouse</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {batchRows.map((row) => (
              <tr
                key={`${row.id}-${row.index}`}
                onClick={() => {
                  // Navigate to batch detail page
                  window.location.href = `/inventory/batch/${row.id}`;
                }}
                style={{ cursor: 'pointer' }}
              >
                <td>
                  <Link
                    to={`/inventory/batch/${row.id}`}
                    className={`batch-chip ${getChipColorClass(row.batchNumber)}`}
                    title={`View details for batch ${row.batchNumber}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {row.batchNumber}
                  </Link>
                </td>
                <td style={{ fontWeight: '600', fontSize: '0.85rem' }}>{row.productName}</td>
                <td style={{ fontWeight: '700', color: row.movementQuantity < 0 ? '#ef4444' : '#10b981' }}>
                  {typeof row.movementQuantity === 'string'
                    ? parseFloat(row.movementQuantity).toLocaleString()
                    : row.movementQuantity.toLocaleString()}
                </td>
                <td>{new Date(row.manufactureDate).toLocaleDateString()}</td>
                <td>
                  <span className={`badge ${row.statusBadgeClass}`}>
                    {new Date(row.expiryDate).toLocaleDateString()}
                    {row.batchStatus === 'EXPIRED' && ' (EXPIRED)'}
                    {row.batchStatus === 'NEAR EXPIRY' && ' (NEAR)'}
                  </span>
                </td>
                <td className="text-muted">{row.warehouseName}</td>
                <td>
                  <span className={`badge ${row.statusBadgeClass}`}>{row.batchStatus}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          No batches in this movement
        </div>
      )}
    </div>
  );
};

export default BatchesDetailTable;
