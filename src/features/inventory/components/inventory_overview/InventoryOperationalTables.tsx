import React from 'react';
import { Link } from 'react-router-dom';
import type { InventoryOverviewSummary, InventoryStockStatus } from '../../types/inventoryOverview';
import { quantityFormat, STOCK_STATUS_LABELS, statusClassName } from './inventoryOverviewUtils';

interface InventoryOperationalTablesProps {
  summary: InventoryOverviewSummary | null;
  isLoading: boolean;
}

const InventoryOperationalTables: React.FC<InventoryOperationalTablesProps> = ({
  summary,
  isLoading,
}) => (
  <section className="inventory-overview-section">
    <div className="inventory-overview-section__head">
      <div>
        <h2>Operational Tables</h2>
        <p>Low stock is the primary action list; reorder policy gaps are setup work.</p>
      </div>
    </div>

    <div className="inventory-overview-table-grid">
      <article className="inventory-overview-panel inventory-overview-table-card inventory-overview-table-card--wide">
        <h3>Top Low Stock Products</h3>
        <div className="inventory-overview-table-wrap">
          <table className="inventory-overview-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Warehouse</th>
                <th>Qty on Hand</th>
                <th>Status</th>
                <th>Min Stock</th>
                <th>Reorder Qty</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <SkeletonRows columns={7} rows={5} />
              ) : summary?.top_low_stock_products.length ? (
                summary.top_low_stock_products.map((product) => (
                  <tr
                    key={`${product.product_id}-${product.warehouse_id}`}
                    className={product.status === 'EMPTY' ? 'is-attention' : undefined}
                  >
                    <td data-label="Product">
                      <Link to={`/inventory/products/${product.product_id}`} className="inventory-overview-link">
                        {product.product_name}
                      </Link>
                    </td>
                    <td data-label="SKU">{product.sku || '-'}</td>
                    <td data-label="Warehouse">{product.warehouse_name || '-'}</td>
                    <td data-label="Qty on Hand">{quantityFormat(product.quantity_on_hand)}</td>
                    <td data-label="Status">
                      <StatusBadge status={product.status} />
                    </td>
                    <td data-label="Min Stock">{product.min_stock_level === null ? '-' : quantityFormat(product.min_stock_level)}</td>
                    <td data-label="Reorder Qty">{product.reorder_qty === null ? '-' : quantityFormat(product.reorder_qty)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="inventory-overview-empty-cell">
                    No low stock products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  </section>
);

const StatusBadge: React.FC<{ status: InventoryStockStatus }> = ({ status }) => (
  <span className={`inventory-overview-status-badge inventory-overview-status-badge--${statusClassName(status)}`}>
    {STOCK_STATUS_LABELS[status]}
  </span>
);

const SkeletonRows: React.FC<{ columns: number; rows: number }> = ({ columns, rows }) => (
  <>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <tr key={rowIndex}>
        <td colSpan={columns}>
          <span className="inventory-skeleton inventory-skeleton--row" />
        </td>
      </tr>
    ))}
  </>
);

export default InventoryOperationalTables;
