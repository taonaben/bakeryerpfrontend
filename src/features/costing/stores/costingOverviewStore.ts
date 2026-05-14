import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { variancesService } from "../services/variancesService";
import { costingReportsService } from "../services/costingReportsService";
import type { VarianceSummaryItem } from "../types/variances_models";
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
            marginReportResult,
            ingredientBreakdownResult,
          ].find((result) => result.status === "rejected") as
            | PromiseRejectedResult
            | undefined;

          set((d) => {
            d.varianceSummary =
              varianceSummaryResult.status === "fulfilled"
                ? varianceSummaryResult.value
                : [];
            d.varianceAnalysis =
              varianceAnalysisResult.status === "fulfilled"
                ? varianceAnalysisResult.value
                : [];
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
