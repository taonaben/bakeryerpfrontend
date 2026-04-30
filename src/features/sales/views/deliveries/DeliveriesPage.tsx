import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Truck,
  Warehouse as WarehouseIcon,
  XCircle,
} from 'lucide-react';
import { warehouseService } from '../../../../core/warehouses/services/warehouseService';
import type { Warehouse } from '../../../../core/warehouses/types/models';
import { useDeliveriesStore } from '../../stores/deliveriesStore';
import type { Delivery } from '../../types/deliveries_models';
import type { DeliveryStatus } from '../../types/shared';
import '../../styles/sales.css';
import '../../../procurement/styles/procurement.css';

type DeliveryStatusFilter = '' | 'pending' | DeliveryStatus;

const STATUS_TABS: Array<{ label: string; value: DeliveryStatusFilter }> = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Transit', value: 'dispatched' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Failed', value: 'failed' },
];

const statusLabel: Record<DeliveryStatusFilter, string> = {
  '': 'All',
  pending: 'Pending',
  dispatched: 'In Transit',
  delivered: 'Delivered',
  failed: 'Failed',
};

const DeliveriesPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    isLoading,
    isSubmitting,
    error,
    fetchAll,
    confirmReceipt,
    fail,
    clearError,
  } = useDeliveriesStore();

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [activeStatus, setActiveStatus] = useState<DeliveryStatusFilter>('');
  const [warehouseId, setWarehouseId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [warehouseError, setWarehouseError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    warehouseService
      .getWarehouses()
      .then((data) => {
        if (!cancelled) setWarehouses(data);
      })
      .catch((err: any) => {
        if (!cancelled) {
          setWarehouseError(err?.message ?? 'Failed to load warehouses');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const fetchData = useCallback(async () => {
    const filters: any = {};

    if (activeStatus && activeStatus !== 'pending') filters.status = activeStatus;
    if (warehouseId) filters.warehouse_id = warehouseId;
    if (dateFrom) filters.date_from = dateFrom;
    if (dateTo) filters.date_to = dateTo;

    await fetchAll(filters, true);
  }, [activeStatus, dateFrom, dateTo, fetchAll, warehouseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const visibleDeliveries = useMemo(() => {
    if (activeStatus !== 'pending') return items;
    return items.filter((delivery) => isPendingDelivery(delivery));
  }, [activeStatus, items]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);

    return {
      awaitingDispatchToday: items.filter((delivery) => isPendingDelivery(delivery)).length,
      inTransit: items.filter((delivery) => delivery.status === 'dispatched').length,
      deliveredToday: items.filter((delivery) =>
        delivery.status === 'delivered' && delivery.delivered_at?.startsWith(today),
      ).length,
      failed: items.filter((delivery) => delivery.status === 'failed').length,
    };
  }, [items]);

  const handleConfirmReceipt = async (delivery: Delivery) => {
    await confirmReceipt(delivery.id);
  };

  const handleMarkFailed = async (delivery: Delivery) => {
    const reason = window.prompt(`Reason ${delivery.delivery_number} failed:`);
    if (!reason?.trim()) return;

    await fail(delivery.id, { reason: reason.trim() });
  };

  return (
    <div className="procurement-page">
      <div className="procurement-sticky-stack">
        <div className="procurement-page-header">
          <div className="procurement-page-header__left">
            <div className="delivery-page-title">
              <div className="delivery-page-title__icon">
                <Truck size={22} />
              </div>
              <div>
                <h1>Deliveries</h1>
                <p className="procurement-page-header__breadcrumb">
                  Sales / Deliveries
                </p>
              </div>
            </div>
          </div>
          <div className="procurement-page-header__actions">
            <button className="btn btn-outline" type="button" onClick={fetchData}>
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        <div className="delivery-filter-bar">
          <div className="delivery-status-tabs" role="tablist" aria-label="Delivery status filters">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value || 'all'}
                type="button"
                role="tab"
                aria-selected={activeStatus === tab.value}
                className={`delivery-status-tab ${activeStatus === tab.value ? 'delivery-status-tab--active' : ''}`}
                onClick={() => setActiveStatus(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="delivery-filter-controls">
            <label className="delivery-filter-field">
              <WarehouseIcon size={15} />
              <select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
                <option value="">All warehouses</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="delivery-filter-field">
              <CalendarDays size={15} />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                aria-label="Date from"
              />
            </label>

            <label className="delivery-filter-field">
              <CalendarDays size={15} />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                aria-label="Date to"
              />
            </label>
          </div>
        </div>

        <div className="sales-summary-cards">
          <div className="sales-summary-card">
            <div className="sales-summary-card__label">Awaiting Dispatch Today</div>
            <div className="sales-summary-card__value sales-summary-card__value--warning">
              {stats.awaitingDispatchToday}
            </div>
          </div>
          <div className="sales-summary-card">
            <div className="sales-summary-card__label">In Transit</div>
            <div className="sales-summary-card__value sales-summary-card__value--info">
              {stats.inTransit}
            </div>
          </div>
          <div className="sales-summary-card">
            <div className="sales-summary-card__label">Delivered Today</div>
            <div className="sales-summary-card__value">{stats.deliveredToday}</div>
          </div>
          <div className="sales-summary-card">
            <div className="sales-summary-card__label">Failed / Needs Attention</div>
            <div className="sales-summary-card__value sales-summary-card__value--danger">
              {stats.failed}
            </div>
          </div>
        </div>
      </div>

      <div className="procurement-content">
        {(error || warehouseError) && (
          <div className="error-banner" role="alert">
            <AlertCircle size={18} />
            <span>{error || warehouseError}</span>
            <button
              type="button"
              onClick={() => {
                clearError();
                setWarehouseError(null);
              }}
            >
              Dismiss
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="loading-container">
            <div className="spinner" />
            <span>Loading deliveries...</span>
          </div>
        ) : visibleDeliveries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">
              <Truck size={48} />
            </div>
            <h3 className="empty-state__title">No deliveries found</h3>
            <p className="empty-state__description">
              No {statusLabel[activeStatus].toLowerCase()} deliveries match the selected filters.
            </p>
          </div>
        ) : (
          <div className="sales-table-container delivery-table-container">
            <table className="sales-table delivery-table">
              <thead>
                <tr>
                  <th>Delivery Ref</th>
                  <th>Sales Order</th>
                  <th>Customer</th>
                  <th>Warehouse</th>
                  <th>Dispatched At</th>
                  <th>Expected Delivery</th>
                  <th>Actual Delivered At</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleDeliveries.map((delivery) => (
                  <tr
                    key={delivery.id}
                    onClick={() => navigate(`/sales/deliveries/${delivery.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <span className="table-link">{delivery.delivery_number}</span>
                    </td>
                    <td>
                      <button
                        className="table-link table-link-button"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/sales/orders/${delivery.sales_order}`);
                        }}
                      >
                        {delivery.order_number}
                      </button>
                    </td>
                    <td>{delivery.customer_name || '-'}</td>
                    <td>{delivery.warehouse_name}</td>
                    <td>{formatDateTime(delivery.dispatched_at)}</td>
                    <td>{formatDate(delivery.expected_delivery_date)}</td>
                    <td>{formatDateTime(delivery.delivered_at)}</td>
                    <td>
                      <span className={`badge ${getDeliveryBadgeClass(delivery)}`}>
                        {getDeliveryStatusLabel(delivery)}
                      </span>
                    </td>
                    <td>
                      {delivery.status === 'dispatched' ? (
                        <div className="delivery-row-actions">
                          <button
                            className="btn btn-primary btn-compact"
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConfirmReceipt(delivery);
                            }}
                            disabled={isSubmitting}
                          >
                            <CheckCircle2 size={14} />
                            Confirm Receipt
                          </button>
                          <button
                            className="btn btn-danger btn-compact"
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkFailed(delivery);
                            }}
                            disabled={isSubmitting}
                          >
                            <XCircle size={14} />
                            Mark Failed
                          </button>
                        </div>
                      ) : (
                        <span className="delivery-muted-action">No action</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

function isPendingDelivery(delivery: Delivery): boolean {
  return delivery.status === 'dispatched' && !delivery.dispatched_at;
}

function getDeliveryStatusLabel(delivery: Delivery): string {
  if (isPendingDelivery(delivery)) return 'Pending';
  if (delivery.status === 'dispatched') return 'In Transit';
  return delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1);
}

function getDeliveryBadgeClass(delivery: Delivery): string {
  if (isPendingDelivery(delivery)) return 'badge-delivery-pending';
  return `badge-${delivery.status}`;
}

function formatDate(value?: string | null): string {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
}

function formatDateTime(value?: string | null): string {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}

export default DeliveriesPage;
