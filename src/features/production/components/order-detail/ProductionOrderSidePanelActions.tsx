import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRightCircle,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Play,
  Sparkles,
} from 'lucide-react';
import { useProductionOrderDetailStore } from '../../stores';
import type { ProductionOrder } from '../../types/productionModels';

interface ProductionOrderSidePanelActionsProps {
  order: ProductionOrder;
}

const formatDate = (value: string | null) => {
  if (!value) return '--';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return `${parsed.toLocaleDateString()} ${parsed.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

const formatStatus = (value: string) =>
  value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const StartModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { quantity?: number }) => Promise<void>;
  isSubmitting: boolean;
}> = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (quantity && Number(quantity) <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    await onSubmit(quantity ? { quantity: Number(quantity) } : {});
    setQuantity('');
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content">
        <div className="modal-header">
          <h2>Start Production</h2>
          <button type="button" className="modal-close-btn" onClick={onClose}>x</button>
        </div>
        <form className="edit-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="start-quantity">Quantity Override</label>
            <input
              id="start-quantity"
              type="number"
              min="0"
              step="any"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="Leave blank to use order quantity"
            />
          </div>
          {error && <div className="error-banner">{error}</div>}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Starting...' : 'Start'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

const FinishModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { actual_output: number; waste?: number }) => Promise<void>;
  isSubmitting: boolean;
}> = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [actualOutput, setActualOutput] = useState('');
  const [waste, setWaste] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!actualOutput || Number(actualOutput) <= 0) {
      setError('Actual output must be greater than 0');
      return;
    }
    if (waste && Number(waste) < 0) {
      setError('Waste cannot be negative');
      return;
    }

    await onSubmit({
      actual_output: Number(actualOutput),
      ...(waste ? { waste: Number(waste) } : {}),
    });
    setActualOutput('');
    setWaste('');
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content">
        <div className="modal-header">
          <h2>Finish Production</h2>
          <button type="button" className="modal-close-btn" onClick={onClose}>x</button>
        </div>
        <form className="edit-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="finish-output">Actual Output</label>
            <input
              id="finish-output"
              type="number"
              min="0"
              step="any"
              value={actualOutput}
              onChange={(event) => setActualOutput(event.target.value)}
              placeholder="Enter actual output"
            />
          </div>
          <div className="form-group">
            <label htmlFor="finish-waste">Waste</label>
            <input
              id="finish-waste"
              type="number"
              min="0"
              step="any"
              value={waste}
              onChange={(event) => setWaste(event.target.value)}
              placeholder="Optional waste quantity"
            />
          </div>
          {error && <div className="error-banner">{error}</div>}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Finishing...' : 'Finish'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

const CopyModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    quantity?: number;
    scheduled_start?: string;
    scheduled_end?: string;
  }) => Promise<void>;
  isSubmitting: boolean;
}> = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [quantity, setQuantity] = useState('');
  const [scheduledStart, setScheduledStart] = useState('');
  const [scheduledEnd, setScheduledEnd] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (quantity && Number(quantity) <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    if (
      scheduledStart &&
      scheduledEnd &&
      new Date(scheduledEnd).getTime() <= new Date(scheduledStart).getTime()
    ) {
      setError('Scheduled end must be after scheduled start');
      return;
    }

    await onSubmit({
      ...(quantity ? { quantity: Number(quantity) } : {}),
      ...(scheduledStart ? { scheduled_start: new Date(scheduledStart).toISOString() } : {}),
      ...(scheduledEnd ? { scheduled_end: new Date(scheduledEnd).toISOString() } : {}),
    });
    setQuantity('');
    setScheduledStart('');
    setScheduledEnd('');
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create Copy</h2>
          <button type="button" className="modal-close-btn" onClick={onClose}>x</button>
        </div>
        <form className="edit-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="copy-quantity">Quantity Override</label>
            <input
              id="copy-quantity"
              type="number"
              min="0"
              step="any"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="Optional quantity"
            />
          </div>
          <div className="form-group">
            <label htmlFor="copy-start">Scheduled Start</label>
            <input
              id="copy-start"
              type="datetime-local"
              value={scheduledStart}
              onChange={(event) => setScheduledStart(event.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="copy-end">Scheduled End</label>
            <input
              id="copy-end"
              type="datetime-local"
              value={scheduledEnd}
              onChange={(event) => setScheduledEnd(event.target.value)}
            />
          </div>
          {error && <div className="error-banner">{error}</div>}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Copying...' : 'Create Copy'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

const ProductionOrderSidePanelActions: React.FC<ProductionOrderSidePanelActionsProps> = ({
  order,
}) => {
  const navigate = useNavigate();
  const [showStartModal, setShowStartModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);

  const error = useProductionOrderDetailStore((state) => state.error);
  const isPlanning = useProductionOrderDetailStore((state) => state.isPlanning);
  const isStarting = useProductionOrderDetailStore((state) => state.isStarting);
  const isFinishing = useProductionOrderDetailStore((state) => state.isFinishing);
  const isCopying = useProductionOrderDetailStore((state) => state.isCopying);
  const fetchOrder = useProductionOrderDetailStore((state) => state.fetchOrder);
  const fetchSummary = useProductionOrderDetailStore((state) => state.fetchSummary);
  const fetchFinishExpectations = useProductionOrderDetailStore((state) => state.fetchFinishExpectations);
  const planOrder = useProductionOrderDetailStore((state) => state.planOrder);
  const startOrder = useProductionOrderDetailStore((state) => state.startOrder);
  const finishOrder = useProductionOrderDetailStore((state) => state.finishOrder);
  const copyOrder = useProductionOrderDetailStore((state) => state.copyOrder);

  const handleCopyId = () => {
    navigator.clipboard.writeText(order.id);
  };

  const statusClass = order.status.toLowerCase().replace(/_/g, '-');

  return (
    <>
      <div className="side-panel__header">
        <h1 className="side-panel__title">{order.product_name}</h1>
      </div>

      <div className="side-panel__metadata">
        <div className="metadata-item">
          <label>Order ID</label>
          <div className="metadata-value-with-action">
            <code className="batch-id">{order.id.slice(0, 8)}</code>
            <button onClick={handleCopyId} className="icon-btn" title="Copy order ID" aria-label="Copy order ID">
              <Copy size={16} />
            </button>
          </div>
        </div>

        <div className="metadata-item">
          <label>Status</label>
          <div className={`status-badge production-detail-status ${statusClass}`}>
            {formatStatus(order.status)}
          </div>
        </div>

        <div className="metadata-item">
          <label>Product</label>
          <div className="metadata-value">{order.product_name}</div>
        </div>

        <div className="metadata-item">
          <label>Warehouse</label>
          <div className="metadata-value">{order.warehouse_name}</div>
        </div>

        <div className="metadata-item">
          <label>Quantity</label>
          <div className="metadata-value">{order.quantity}</div>
        </div>

        <div className="metadata-item">
          <label>Scheduled Start</label>
          <div className="metadata-value text-muted">{formatDate(order.scheduled_start)}</div>
        </div>

        <div className="metadata-item">
          <label>Scheduled End</label>
          <div className="metadata-value text-muted">{formatDate(order.scheduled_end)}</div>
        </div>

        <div className="metadata-item">
          <label>Formula</label>
          <div className="metadata-value">{order.formula || '--'}</div>
        </div>

        <div className="metadata-item">
          <label>Planned Order</label>
          <div className="metadata-value">
            {order.planned_order ? `${order.planned_order_status || 'Linked'}` : '--'}
          </div>
        </div>
      </div>

      <div className="side-panel__actions">
        <button
          type="button"
          className="btn btn-secondary btn-block"
          onClick={async () => {
            try {
              await planOrder(order.id);
              await fetchOrder(order.id);
            } catch {
              // Store error state is already updated.
            }
          }}
          disabled={isPlanning}
        >
          <Sparkles size={16} />
          {isPlanning ? 'Planning...' : 'Plan'}
        </button>

        <button
          type="button"
          className="btn btn-secondary btn-block"
          onClick={async () => {
            try {
              await fetchFinishExpectations(order.id);
            } catch {
              // Store error state is already updated.
            }
          }}
        >
          <ClipboardCheck size={16} />
          Get Expected Outcome
        </button>

        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={() => setShowStartModal(true)}
          disabled={order.status === 'completed'}
        >
          <Play size={16} />
          Start
        </button>

        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={() => setShowFinishModal(true)}
          disabled={order.status === 'completed'}
        >
          <CheckCircle2 size={16} />
          Finish
        </button>

        <button
          type="button"
          className="btn btn-secondary btn-block"
          onClick={async () => {
            try {
              await fetchSummary(order.id);
            } catch {
              // Store error state is already updated.
            }
          }}
          disabled={order.status !== 'completed'}
        >
          <ArrowRightCircle size={16} />
          Summarise Order
        </button>

        <button
          type="button"
          className="btn btn-secondary btn-block"
          onClick={() => setShowCopyModal(true)}
        >
          <Copy size={16} />
          Create Copy
        </button>

        {error && <div className="production-side-panel-error">{error}</div>}
      </div>

      <StartModal
        isOpen={showStartModal}
        onClose={() => setShowStartModal(false)}
        isSubmitting={isStarting}
        onSubmit={async (payload) => {
          try {
            await startOrder(order.id, payload);
            await fetchOrder(order.id);
            setShowStartModal(false);
          } catch {
            // Store error state is already updated.
          }
        }}
      />

      <FinishModal
        isOpen={showFinishModal}
        onClose={() => setShowFinishModal(false)}
        isSubmitting={isFinishing}
        onSubmit={async (payload) => {
          try {
            await finishOrder(order.id, payload);
            await fetchOrder(order.id);
            setShowFinishModal(false);
          } catch {
            // Store error state is already updated.
          }
        }}
      />

      <CopyModal
        isOpen={showCopyModal}
        onClose={() => setShowCopyModal(false)}
        isSubmitting={isCopying}
        onSubmit={async (payload) => {
          try {
            const copied = await copyOrder(order.id, payload);
            setShowCopyModal(false);
            navigate(`/production/orders/${copied.id}`);
          } catch {
            // Store error state is already updated.
          }
        }}
      />
    </>
  );
};

export default ProductionOrderSidePanelActions;
