import type {
  BatchDetailResponse,
} from '@/features/inventory/types/batchDetail';
import type {
  StockMovementDetailResponse,
} from '@/features/inventory/types/stockMovementDetail';

export type DecimalValue = number | string;

export interface ProductionQueryParams {
  warehouse_id?: string;
  status?: string;
  product_id?: string;
}

export interface ProductionApiErrorResponse {
  errors?: string | string[] | Record<string, unknown>;
  detail?: string;
  message?: string;
}

export interface ProductionOrder {
  id: string;
  product: string;
  product_name: string;
  quantity: DecimalValue;
  status: string;
  scheduled_start: string | null;
  scheduled_end: string | null;
  warehouse: string;
  warehouse_name: string;
  formula: string | null;
  formula_name: string | null;
  planned_order: string | null;
  planned_order_status: string | null;
}

export interface ProductionBatchLine {
  id: string;
  sequence: number;
  line_type: string;
  product: string | null;
  product_name: string;
  quantity: DecimalValue;
  text: string | null;
}

export interface BatchMaterial {
  id: string;
  product: string;
  product_name: string;
  quantity_used: DecimalValue;
}

export interface BatchOutput {
  id: string;
  product: string;
  product_name: string;
  quantity_produced: DecimalValue;
}

export interface BatchWaste {
  id: string;
  product: string;
  product_name: string;
  quantity_wasted: DecimalValue;
  reason?: string | null;
}

export interface ProductionBatch {
  id: string;
  production_order: string;
  batch_number: string;
  quantity_produced: DecimalValue;
  status: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface ProductionBatchDetail extends ProductionBatch {
  lines: ProductionBatchLine[];
  materials: BatchMaterial[];
  outputs: BatchOutput[];
  waste: BatchWaste[];
}

export interface FormulaSummary {
  id?: string;
  product?: string;
  product_name?: string;
  name?: string;
  code?: string;
  version?: string | number;
  yield_percentage?: DecimalValue;
  [key: string]: unknown;
}

export interface ProductionPlanShortageItem {
  available: DecimalValue;
  required: DecimalValue;
}

export type ProductionPlanShortages = Record<string, ProductionPlanShortageItem>;

export interface ProductionPlan {
  scale_factor: DecimalValue;
  formula: FormulaSummary | null;
  shortages: ProductionPlanShortages | null;
  validation_errors: string[];
  can_run: boolean;
}

export interface SelectedBatchAllocation {
  product_id: string;
  batch_id: string;
  quantity: DecimalValue;
}

export interface StartProductionPayload {
  quantity?: DecimalValue;
  selected_batches?: SelectedBatchAllocation[];
}

export interface ProductionFinishOutputLinePayload {
  product: string;
  quantity: DecimalValue;
}

export interface ProductionFinishWasteLinePayload {
  product: string;
  quantity: DecimalValue;
  reason?: string | null;
}

export interface FinishProductionDetailedPayload {
  outputs: ProductionFinishOutputLinePayload[];
  waste?: ProductionFinishWasteLinePayload[];
}

export interface FinishProductionSummaryPayload {
  actual_output: DecimalValue;
  waste?: DecimalValue;
}

export type FinishProductionPayload =
  | FinishProductionDetailedPayload
  | FinishProductionSummaryPayload;

export interface ProductionFinishExpectations {
  expected_output: DecimalValue;
  expected_waste: DecimalValue;
}

export interface StartProductionResponse {
  message: string;
  batch: ProductionBatch;
  movements: StockMovementDetailResponse[];
  plan: ProductionPlan;
}

export interface FinishProductionResponse {
  message: string;
  batch: ProductionBatch;
  movement: StockMovementDetailResponse;
  outputs: BatchOutput[];
  waste: BatchWaste[];
  expected_output: DecimalValue;
  expected_waste: DecimalValue;
  actual_output: DecimalValue;
  variance: DecimalValue;
}

export interface ProductionOrderSummary extends Omit<ProductionOrder, 'planned_order' | 'planned_order_status'> {
  expected_output: DecimalValue;
  expected_waste: DecimalValue;
  actual_output: DecimalValue;
  actual_waste: DecimalValue;
  variance: DecimalValue;
  batches: ProductionBatchDetail[];
}

export interface CreateProductionOrderPayload {
  product: string;
  quantity: DecimalValue;
  scheduled_start: string;
  scheduled_end: string;
  warehouse: string;
  formula: string;
  planned_order?: string | null;
}

export interface UpdateProductionOrderPayload extends Partial<CreateProductionOrderPayload> {}

export interface CopyProductionOrderPayload extends Partial<CreateProductionOrderPayload> {}

export interface ReworkInput {
  id: string;
  batch: string;
  batch_number: string;
  product_name: string;
  quantity_used: DecimalValue;
  notes?: string | null;
}

export interface ReworkOutput {
  id: string;
  product: string;
  product_name: string;
  quantity_produced: DecimalValue;
  output_batch: string;
  output_batch_number: string;
}

export interface ReworkOrder {
  id: string;
  target_product: string;
  target_product_name: string;
  quantity_requested: DecimalValue;
  warehouse: string;
  warehouse_name: string;
  status: string;
  reason: string;
  created_at: string;
  completed_at: string | null;
  inputs?: ReworkInput[];
  outputs?: ReworkOutput[];
}

export interface CreateReworkOrderPayload {
  target_product: string;
  quantity_requested: DecimalValue;
  warehouse: string;
  reason: string;
}

export interface UpdateReworkOrderPayload extends Partial<CreateReworkOrderPayload> {}

export interface ReworkStartInputPayload {
  batch_id: string;
  quantity: DecimalValue;
  notes?: string | null;
}

export interface StartReworkPayload {
  inputs: ReworkStartInputPayload[];
}

export interface ReworkFinishOutputPayload {
  product: string;
  quantity: DecimalValue;
}

export interface FinishReworkPayload {
  outputs: ReworkFinishOutputPayload[];
}

export interface StartReworkResponse {
  message: string;
  order: ReworkOrder;
  movement: StockMovementDetailResponse;
  total_input: DecimalValue;
}

export interface FinishReworkResponse {
  message: string;
  order: ReworkOrder;
  movement: StockMovementDetailResponse;
  total_output: DecimalValue;
}

export interface ProductionOrderListState {
  orders: ProductionOrder[];
  finishedOrders: ProductionOrderSummary[];
  filters: ProductionQueryParams;
  isLoading: boolean;
  isLoadingFinished: boolean;
  error: string | null;
  errorDetails: ProductionApiErrorResponse | null;
  fetchOrders: (params?: ProductionQueryParams) => Promise<void>;
  fetchFinishedOrders: () => Promise<void>;
  setFilters: (filters: Partial<ProductionQueryParams>) => void;
  clearFilters: () => void;
}

export interface ProductionOrderDetailState {
  order: ProductionOrder | null;
  summary: ProductionOrderSummary | null;
  finishExpectations: ProductionFinishExpectations | null;
  planResult: ProductionPlan | null;
  lastStartResult: StartProductionResponse | null;
  lastFinishResult: FinishProductionResponse | null;
  lastCopiedOrder: ProductionOrder | null;
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  isPlanning: boolean;
  isStarting: boolean;
  isFinishing: boolean;
  isCopying: boolean;
  isLoadingSummary: boolean;
  isLoadingExpectations: boolean;
  error: string | null;
  errorDetails: ProductionApiErrorResponse | null;
  fetchOrder: (id: string) => Promise<void>;
  createOrder: (payload: CreateProductionOrderPayload) => Promise<ProductionOrder>;
  updateOrder: (
    id: string,
    payload: UpdateProductionOrderPayload,
    method?: 'put' | 'patch',
  ) => Promise<ProductionOrder>;
  deleteOrder: (id: string) => Promise<void>;
  fetchSummary: (id: string) => Promise<void>;
  fetchFinishExpectations: (id: string) => Promise<void>;
  planOrder: (id: string) => Promise<ProductionPlan>;
  startOrder: (id: string, payload?: StartProductionPayload) => Promise<StartProductionResponse>;
  finishOrder: (id: string, payload: FinishProductionPayload) => Promise<FinishProductionResponse>;
  copyOrder: (id: string, payload?: CopyProductionOrderPayload) => Promise<ProductionOrder>;
  clearOrder: () => void;
}

export interface ReworkOrderListState {
  orders: ReworkOrder[];
  filters: ProductionQueryParams;
  isLoading: boolean;
  error: string | null;
  errorDetails: ProductionApiErrorResponse | null;
  fetchOrders: (params?: ProductionQueryParams) => Promise<void>;
  setFilters: (filters: Partial<ProductionQueryParams>) => void;
  clearFilters: () => void;
}

export interface ReworkOrderDetailState {
  order: ReworkOrder | null;
  lastStartResult: StartReworkResponse | null;
  lastFinishResult: FinishReworkResponse | null;
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  isStarting: boolean;
  isFinishing: boolean;
  error: string | null;
  errorDetails: ProductionApiErrorResponse | null;
  fetchOrder: (id: string) => Promise<void>;
  createOrder: (payload: CreateReworkOrderPayload) => Promise<ReworkOrder>;
  updateOrder: (
    id: string,
    payload: UpdateReworkOrderPayload,
    method?: 'put' | 'patch',
  ) => Promise<ReworkOrder>;
  deleteOrder: (id: string) => Promise<void>;
  startOrder: (id: string, payload: StartReworkPayload) => Promise<StartReworkResponse>;
  finishOrder: (id: string, payload: FinishReworkPayload) => Promise<FinishReworkResponse>;
  clearOrder: () => void;
}

export type ProductionInventoryBatch = BatchDetailResponse;
