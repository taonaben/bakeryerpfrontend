import React from 'react';
import type {
  FinishProductionResponse,
  ProductionFinishExpectations,
  ProductionOrder,
  ProductionOrderSummary,
  ProductionPlan,
  StartProductionResponse,
} from '../../types/productionModels';

interface ProductionOrderOverviewCardProps {
  order: ProductionOrder;
  planResult: ProductionPlan | null;
  finishExpectations: ProductionFinishExpectations | null;
  finishResult: FinishProductionResponse | null;
  startResult: StartProductionResponse | null;
  summary: ProductionOrderSummary | null;
  isLoadingPlan: boolean;
  isLoadingExpectations: boolean;
  isLoadingSummary: boolean;
}

const formatDate = (value: string | null) => {
  if (!value) return '--';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatStatus = (value: string) =>
  value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

const ResultPanel: React.FC<{
  title: string;
  description: string;
  emptyText: string;
  children: React.ReactNode;
  hasContent: boolean;
  isLoading?: boolean;
}> = ({ title, description, emptyText, children, hasContent, isLoading = false }) => (
  <section className="detail-section">
    <h2 className="section-title">{title}</h2>
    <p className="production-section-description">{description}</p>
    {isLoading ? (
      <div className="empty-state-card">Loading this section...</div>
    ) : hasContent ? (
      children
    ) : (
      <div className="empty-state-card">{emptyText}</div>
    )}
  </section>
);

const ProductionOrderOverviewCard: React.FC<ProductionOrderOverviewCardProps> = ({
  order,
  planResult,
  finishExpectations,
  finishResult,
  startResult,
  summary,
  isLoadingPlan,
  isLoadingExpectations,
  isLoadingSummary,
}) => {
  return (
    <>
      <section className="detail-section">
        <h2 className="section-title">Order Details</h2>
        <p className="production-section-description">
          Core production order information including schedule, formula linkage, warehouse context,
          and the current execution status for this order.
        </p>
        <div className="overview-card">
          <div className="overview-grid">
            <div className="overview-item">
              <label className="overview-label">Product</label>
              <div className="overview-value">{order.product_name}</div>
            </div>

            <div className="overview-item">
              <label className="overview-label">Status</label>
              <div className="overview-value">
                <span
                  className={`badge production-status-badge production-status-badge--detail ${order.status.replace(
                    /_/g,
                    '-',
                  )}`}
                >
                  {formatStatus(order.status)}
                </span>
              </div>
            </div>

            <div className="overview-item">
              <label className="overview-label">Quantity</label>
              <div className="overview-value">{order.quantity}</div>
            </div>

            <div className="overview-item">
              <label className="overview-label">Warehouse</label>
              <div className="overview-value">{order.warehouse_name}</div>
            </div>

            <div className="overview-item">
              <label className="overview-label">Scheduled Start</label>
              <div className="overview-value">{formatDate(order.scheduled_start)}</div>
            </div>

            <div className="overview-item">
              <label className="overview-label">Scheduled End</label>
              <div className="overview-value">{formatDate(order.scheduled_end)}</div>
            </div>

            <div className="overview-item">
              <label className="overview-label">Formula</label>
              <div className="overview-value">{order.formula || '--'}</div>
            </div>

            <div className="overview-item">
              <label className="overview-label">Planned Order</label>
              <div className="overview-value">
                {order.planned_order
                  ? `${order.planned_order} (${order.planned_order_status || 'Linked'})`
                  : '--'}
              </div>
            </div>
          </div>
        </div>
      </section>

      <ResultPanel
        title="Latest Plan Result"
        description="A readiness check for this order. It shows whether the formula can run at the requested scale and highlights shortages or validation problems."
        hasContent={!!planResult}
        emptyText="Planning details are not available for this order right now."
        isLoading={isLoadingPlan}
      >
        <div className="overview-card production-result-card">
          <div className="overview-grid">
            <div className="overview-item">
              <label className="overview-label">Can Run</label>
              <div className="overview-value">{planResult?.can_run ? 'Yes' : 'No'}</div>
            </div>
            <div className="overview-item">
              <label className="overview-label">Scale Factor</label>
              <div className="overview-value">{planResult?.scale_factor ?? '--'}</div>
            </div>
            <div className="overview-item full-width">
              <label className="overview-label">Validation Errors</label>
              <div className="overview-value">
                {planResult?.validation_errors?.length
                  ? planResult.validation_errors.join(', ')
                  : 'None'}
              </div>
            </div>
            <div className="overview-item full-width">
              <label className="overview-label">Shortages</label>
              <div className="overview-value">
                {planResult?.shortages
                  ? Object.entries(planResult.shortages)
                      .map(([name, values]) => `${name}: ${values.available}/${values.required}`)
                      .join(', ')
                  : 'None'}
              </div>
            </div>
          </div>
        </div>
      </ResultPanel>

      <ResultPanel
        title="Expected Outcome"
        description="The projected finished output and waste for this order before production is completed, based on the current order quantity and formula."
        hasContent={!!finishExpectations}
        emptyText="Expected output and waste are not available for this order right now."
        isLoading={isLoadingExpectations}
      >
        <div className="overview-card production-result-card">
          <div className="overview-grid">
            <div className="overview-item">
              <label className="overview-label">Expected Output</label>
              <div className="overview-value">{finishExpectations?.expected_output ?? '--'}</div>
            </div>
            <div className="overview-item">
              <label className="overview-label">Expected Waste</label>
              <div className="overview-value">{finishExpectations?.expected_waste ?? '--'}</div>
            </div>
          </div>
        </div>
      </ResultPanel>

      <ResultPanel
        title="Latest Start Result"
        description="The most recent start response recorded from this page, including the created batch and the execution status at the moment production began."
        hasContent={!!startResult}
        emptyText="Production has not been started from this detail page yet."
      >
        <div className="overview-card production-result-card">
          <div className="overview-grid">
            <div className="overview-item">
              <label className="overview-label">Message</label>
              <div className="overview-value">{startResult?.message}</div>
            </div>
            <div className="overview-item">
              <label className="overview-label">Batch Number</label>
              <div className="overview-value">{startResult?.batch.batch_number || '--'}</div>
            </div>
            <div className="overview-item">
              <label className="overview-label">Batch Status</label>
              <div className="overview-value">{startResult?.batch.status || '--'}</div>
            </div>
            <div className="overview-item">
              <label className="overview-label">Started At</label>
              <div className="overview-value">{formatDate(startResult?.batch.started_at ?? null)}</div>
            </div>
          </div>
        </div>
      </ResultPanel>

      <ResultPanel
        title="Latest Finish Result"
        description="The most recent completion response captured from this page, including actual output, expected outcome, variance, and returned output or waste lines."
        hasContent={!!finishResult}
        emptyText="No finish result has been recorded from this detail page yet."
      >
        <div className="overview-card production-result-card">
          <div className="overview-grid">
            <div className="overview-item">
              <label className="overview-label">Actual Output</label>
              <div className="overview-value">{finishResult?.actual_output ?? '--'}</div>
            </div>
            <div className="overview-item">
              <label className="overview-label">Variance</label>
              <div className="overview-value">{finishResult?.variance ?? '--'}</div>
            </div>
            <div className="overview-item">
              <label className="overview-label">Expected Output</label>
              <div className="overview-value">{finishResult?.expected_output ?? '--'}</div>
            </div>
            <div className="overview-item">
              <label className="overview-label">Expected Waste</label>
              <div className="overview-value">{finishResult?.expected_waste ?? '--'}</div>
            </div>
            <div className="overview-item full-width">
              <label className="overview-label">Output Lines</label>
              <div className="overview-value">
                {finishResult?.outputs?.length
                  ? finishResult.outputs
                      .map((item) => `${item.product_name}: ${item.quantity_produced}`)
                      .join(', ')
                  : 'None'}
              </div>
            </div>
            <div className="overview-item full-width">
              <label className="overview-label">Waste Lines</label>
              <div className="overview-value">
                {finishResult?.waste?.length
                  ? finishResult.waste
                      .map((item) => `${item.product_name}: ${item.quantity_wasted}`)
                      .join(', ')
                  : 'None'}
              </div>
            </div>
          </div>
        </div>
      </ResultPanel>

      <ResultPanel
        title="Completed Summary"
        description="A completed-order snapshot with rolled-up output, waste, variance, and batch count for finished production work."
        hasContent={!!summary}
        emptyText="This summary becomes available automatically once the order is completed and the backend can return completion data."
        isLoading={isLoadingSummary}
      >
        <div className="overview-card production-result-card">
          <div className="overview-grid">
            <div className="overview-item">
              <label className="overview-label">Actual Output</label>
              <div className="overview-value">{summary?.actual_output ?? '--'}</div>
            </div>
            <div className="overview-item">
              <label className="overview-label">Actual Waste</label>
              <div className="overview-value">{summary?.actual_waste ?? '--'}</div>
            </div>
            <div className="overview-item">
              <label className="overview-label">Expected Output</label>
              <div className="overview-value">{summary?.expected_output ?? '--'}</div>
            </div>
            <div className="overview-item">
              <label className="overview-label">Expected Waste</label>
              <div className="overview-value">{summary?.expected_waste ?? '--'}</div>
            </div>
            <div className="overview-item">
              <label className="overview-label">Variance</label>
              <div className="overview-value">{summary?.variance ?? '--'}</div>
            </div>
            <div className="overview-item">
              <label className="overview-label">Batch Count</label>
              <div className="overview-value">{summary?.batches?.length ?? 0}</div>
            </div>
          </div>
        </div>
      </ResultPanel>
    </>
  );
};

export default ProductionOrderOverviewCard;
