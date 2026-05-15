import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { variancesService } from "../services/variancesService";
import { costingReportsService } from "../services/costingReportsService";
import type { Variance, VarianceSummaryItem } from "../types/variances_models";
import type {
  VarianceAnalysisReport,
  MarginReportItem,
  IngredientCostBreakdownItem,
} from "../types/reports_models";

const CACHE_TTL_MS = 5 * 60 * 1000;

const isStale = (ts: number | null): boolean =>
  !ts || Date.now() - ts > CACHE_TTL_MS;

interface CostingOverviewFilters {
  warehouse_id?: string;
  product_id?: string;
  date_from?: string;
  date_to?: string;
}

interface CostingOverviewState {
  varianceSummary: VarianceSummaryItem[];
  varianceAnalysis: VarianceAnalysisReport[];
  marginReport: MarginReportItem[];
  ingredientBreakdown: IngredientCostBreakdownItem[];
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchOverview: (
    filters?: CostingOverviewFilters,
    force?: boolean,
  ) => Promise<void>;
  clearError: () => void;
}

export const useCostingOverviewStore = create<CostingOverviewState>()(
  devtools(
    immer((set, get) => ({
      varianceSummary: [],
      varianceAnalysis: [],
      marginReport: [],
      ingredientBreakdown: [],
      isLoading: false,
      isFetching: false,
      error: null,
      lastFetched: null,

      fetchOverview: async (filters, force = false) => {
        const state = get();
        if (!force && !isStale(state.lastFetched)) return;
        if (state.isFetching) return;

        set((d) => {
          d.isLoading = true;
          d.isFetching = true;
          d.error = null;
        });

        try {
          const [
            varianceSummaryResult,
            varianceAnalysisResult,
            varianceListResult,
            marginReportResult,
            ingredientBreakdownResult,
          ] = await Promise.allSettled([
            variancesService.fetchSummary({
              group_by: "product",
              date_from: filters?.date_from,
              date_to: filters?.date_to,
            }),
            costingReportsService.getVarianceAnalysis({
              warehouse_id: filters?.warehouse_id,
              product_id: filters?.product_id,
              date_from: filters?.date_from,
              date_to: filters?.date_to,
            }),
            variancesService.fetchAll({
              warehouse_id: filters?.warehouse_id,
              product_id: filters?.product_id,
              date_from: filters?.date_from,
              date_to: filters?.date_to,
              ordering: "-computed_at",
              page: 1,
              page_size: 100,
            }),
            costingReportsService.getMarginReport({
              product_id: filters?.product_id,
            }),
            costingReportsService.getIngredientCostBreakdown({
              product_id: filters?.product_id,
            }),
          ]);

          const firstRejected = [
            varianceSummaryResult,
            varianceAnalysisResult,
            varianceListResult,
            marginReportResult,
            ingredientBreakdownResult,
          ].find((result) => result.status === "rejected") as
            | PromiseRejectedResult
            | undefined;

          set((d) => {
            const varianceRows =
              varianceListResult.status === "fulfilled"
                ? varianceListResult.value.data
                : [];
            const varianceAnalysis =
              varianceAnalysisResult.status === "fulfilled"
                ? varianceAnalysisResult.value
                : [];
            const varianceSummary =
              varianceSummaryResult.status === "fulfilled"
                ? varianceSummaryResult.value
                : [];
            const derivedVarianceSummary =
              buildVarianceSummaryFromRows(varianceRows);
            const derivedVarianceAnalysis =
              buildVarianceAnalysisFromRows(varianceRows);
            const varianceSummaryHasMissingLabels = varianceSummary.some(
              (item) => !item.group_name,
            );
            const varianceAnalysisHasMissingLabels = varianceAnalysis.some(
              (item) => !item.product_name || !item.warehouse_name,
            );

            d.varianceSummary =
              varianceSummary.length > 0 &&
              !varianceSummaryHasMissingLabels
                ? varianceSummary
                : derivedVarianceSummary;
            d.varianceAnalysis =
              varianceAnalysis.length > 0 &&
              !varianceAnalysisHasMissingLabels
                ? varianceAnalysis
                : derivedVarianceAnalysis;
            d.marginReport =
              marginReportResult.status === "fulfilled"
                ? marginReportResult.value
                : [];
            d.ingredientBreakdown =
              ingredientBreakdownResult.status === "fulfilled"
                ? ingredientBreakdownResult.value
                : [];
            d.error = firstRejected
              ? firstRejected.reason?.message ||
                "Some overview data could not be loaded"
              : null;
            d.lastFetched = Date.now();
            d.isLoading = false;
            d.isFetching = false;
          });
        } catch (e: any) {
          set((d) => {
            d.error = e?.message || "Failed to load costing overview";
            d.isLoading = false;
            d.isFetching = false;
          });
        }
      },

      clearError: () => {
        set((d) => {
          d.error = null;
        });
      },
    })),
    { name: "costing-overview-store" },
  ),
);

const toNumber = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined) return 0;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const buildVarianceSummaryFromRows = (rows: Variance[]): VarianceSummaryItem[] => {
  const grouped = new Map<string, VarianceSummaryItem>();

  rows.forEach((row) => {
    const existing = grouped.get(row.product) || {
      group_by: "product" as const,
      group_id: row.product,
      group_name: row.product_name,
      total_variance: "0",
      avg_variance_percentage: "0",
      favourable_count: 0,
      adverse_count: 0,
      batch_count: 0,
    };

    existing.total_variance = String(
      toNumber(existing.total_variance) + toNumber(row.total_variance),
    );
    existing.avg_variance_percentage = String(
      toNumber(existing.avg_variance_percentage) + toNumber(row.variance_percentage),
    );
    existing.batch_count += 1;
    if (row.is_favourable) existing.favourable_count += 1;
    else existing.adverse_count += 1;

    grouped.set(row.product, existing);
  });

  return Array.from(grouped.values()).map((item) => ({
    ...item,
    avg_variance_percentage: String(
      item.batch_count > 0 ? toNumber(item.avg_variance_percentage) / item.batch_count : 0,
    ),
  }));
};

const buildVarianceAnalysisFromRows = (rows: Variance[]): VarianceAnalysisReport[] => {
  const grouped = new Map<string, VarianceAnalysisReport>();

  rows.forEach((row) => {
    const key = `${row.product}-${row.warehouse}`;
    const existing = grouped.get(key) || {
      product_id: row.product,
      product_name: row.product_name,
      warehouse_id: row.warehouse,
      warehouse_name: row.warehouse_name,
      total_variance: "0",
      material_price_variance: "0",
      material_usage_variance: "0",
      yield_variance: "0",
      overhead_variance: "0",
      avg_variance_percentage: "0",
      batch_count: 0,
    };

    existing.total_variance = String(toNumber(existing.total_variance) + toNumber(row.total_variance));
    existing.material_price_variance = String(toNumber(existing.material_price_variance) + toNumber(row.material_price_variance));
    existing.material_usage_variance = String(toNumber(existing.material_usage_variance) + toNumber(row.material_usage_variance));
    existing.yield_variance = String(toNumber(existing.yield_variance) + toNumber(row.yield_variance));
    existing.overhead_variance = String(toNumber(existing.overhead_variance) + toNumber(row.overhead_variance));
    existing.avg_variance_percentage = String(toNumber(existing.avg_variance_percentage) + toNumber(row.variance_percentage));
    existing.batch_count += 1;

    grouped.set(key, existing);
  });

  return Array.from(grouped.values()).map((item) => ({
    ...item,
    avg_variance_percentage: String(
      item.batch_count > 0 ? toNumber(item.avg_variance_percentage) / item.batch_count : 0,
    ),
  }));
};
