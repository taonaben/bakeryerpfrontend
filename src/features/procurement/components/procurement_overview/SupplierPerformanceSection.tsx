import React, { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type {
  ProcurementSupplierPerformance,
  ProcurementSupplierPerformanceRow,
} from '../../types/procurement_overview_models';
import { pct, PROCUREMENT_CHART_COLORS } from './procurementOverviewUtils';

interface SupplierPerformanceSectionProps {
  supplierPerformance: ProcurementSupplierPerformance | null;
}

const SupplierPerformanceSection: React.FC<SupplierPerformanceSectionProps> = ({
  supplierPerformance,
}) => {
  const suppliers = supplierPerformance?.suppliers || [];
  const exceptionChartData = useMemo(
    () =>
      [...suppliers]
        .sort((a, b) => b.total_exception_lines - a.total_exception_lines)
        .slice(0, 8)
        .map((supplier) => ({
          name: trimName(supplier.supplier_name),
          exceptions: supplier.total_exception_lines,
        })),
    [suppliers],
  );

  const onTimeChartData = useMemo(
    () =>
      [...suppliers]
        .filter((supplier) => supplier.on_time_delivery_rate !== null)
        .sort((a, b) => (b.on_time_delivery_rate || 0) - (a.on_time_delivery_rate || 0))
        .slice(0, 8)
        .map((supplier) => ({
          name: trimName(supplier.supplier_name),
          rate: supplier.on_time_delivery_rate || 0,
        })),
    [suppliers],
  );

  return (
    <section className="procurement-overview-section">
      <div className="procurement-overview-section__head">
        <div>
          <h2>Supplier Performance</h2>
          <p>Table-first supplier scorecard with exception and delivery support charts.</p>
        </div>
      </div>

      <div className="procurement-overview-supplier-grid">
        <article className="procurement-overview-panel procurement-overview-supplier-table-card">
          <h3>Supplier Scorecard</h3>
          <div className="procurement-overview-table-wrap">
            <table className="procurement-overview-table">
              <thead>
                <tr>
                  <th>Supplier</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>GRNs</th>
                  <th>Rejected</th>
                  <th>On-time %</th>
                  <th>Avg Lead</th>
                  <th>Price Var.</th>
                  <th>Qty Var.</th>
                  <th>Unmatched</th>
                  <th>Exceptions</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="procurement-overview-empty-cell">
                      No supplier performance data returned.
                    </td>
                  </tr>
                ) : (
                  suppliers.map((supplier) => (
                    <tr
                      key={supplier.supplier_id}
                      className={supplier.total_exception_lines > 0 ? 'is-attention' : ''}
                    >
                      <td>{supplier.supplier_name}</td>
                      <td>{supplier.rating ?? '-'}</td>
                      <td>
                        <span className={`badge ${supplier.on_hold ? 'on-hold' : supplier.is_active ? 'active' : 'inactive'}`}>
                          {supplier.on_hold ? 'On hold' : supplier.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{supplier.total_grns}</td>
                      <td>{supplier.rejected_grns}</td>
                      <td>{pct(supplier.on_time_delivery_rate)}</td>
                      <td>{supplier.average_lead_time_days ?? '-'}</td>
                      <td>{supplier.price_variance_lines}</td>
                      <td>{supplier.quantity_variance_lines}</td>
                      <td>{supplier.unmatched_lines}</td>
                      <td>{supplier.total_exception_lines}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>

        <div className="procurement-overview-supplier-side">
          <MiniSupplierList
            title="Best Suppliers"
            suppliers={supplierPerformance?.best_suppliers || []}
            emptyText="No best-supplier data."
          />
          <MiniSupplierList
            title="Worst / Risk Suppliers"
            suppliers={supplierPerformance?.worst_suppliers || []}
            emptyText="No risk supplier data."
            attention
          />
        </div>

        <article className="procurement-overview-panel procurement-overview-chart">
          <h3>Top Exception Counts</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={exceptionChartData} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={34} />
              <Tooltip />
              <Bar dataKey="exceptions" fill={PROCUREMENT_CHART_COLORS.red} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article className="procurement-overview-panel procurement-overview-chart">
          <h3>On-time Delivery Rate</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={onTimeChartData} layout="vertical" margin={{ top: 12, right: 16, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={76} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
              <Bar dataKey="rate" fill={PROCUREMENT_CHART_COLORS.green} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>
      </div>
    </section>
  );
};

const MiniSupplierList: React.FC<{
  title: string;
  suppliers: ProcurementSupplierPerformanceRow[];
  emptyText: string;
  attention?: boolean;
}> = ({ title, suppliers, emptyText, attention = false }) => (
  <article className={`procurement-overview-panel procurement-overview-mini-list ${attention ? 'procurement-overview-mini-list--attention' : ''}`}>
    <h3>{title}</h3>
    {suppliers.length === 0 ? (
      <p className="procurement-overview-muted">{emptyText}</p>
    ) : (
      <ol>
        {suppliers.slice(0, 5).map((supplier) => (
          <li key={supplier.supplier_id}>
            <span>{supplier.supplier_name}</span>
            <strong>{supplier.total_exception_lines} exceptions</strong>
          </li>
        ))}
      </ol>
    )}
  </article>
);

const trimName = (name: string): string => (name.length > 14 ? `${name.slice(0, 13)}...` : name);

export default SupplierPerformanceSection;
