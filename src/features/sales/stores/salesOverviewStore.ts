import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { reportsService } from "../services/reportsService";
import type {
  DailySummary,
  RevenueByProduct,
  MarginByProduct,
  OutstandingDebtor,
  SalesByWarehouse,
  DateRangeWarehouseParams,
} from "../types/reports_models";

const CACHE_TTL_MS = 5 * 60 * 1000;

const isStale = (ts: number | null): boolean =>
  !ts || Date.now() - ts > CACHE_TTL_MS;

interface SalesOverviewFilters extends DateRangeWarehouseParams {
  date?: string;
}

interface SalesOverviewState {
  dailySummary: DailySummary | null;
  revenueByProduct: RevenueByProduct[];
  marginByProduct: MarginByProduct[];
  outstandingDebtors: OutstandingDebtor[];
  salesByWarehouse: SalesByWarehouse[];
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchOverview: (
    filters?: SalesOverviewFilters,
    force?: boolean,
  ) => Promise<void>;
  clearError: () => void;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

export const useSalesOverviewStore = create<SalesOverviewState>()(
  devtools(
    immer((set, get) => ({
      dailySummary: null,
      revenueByProduct: [],
      marginByProduct: [],
      outstandingDebtors: [],
      salesByWarehouse: [],
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

        const rangeParams: DateRangeWarehouseParams = {
          date_from: filters?.date_from,
          date_to: filters?.date_to,
          warehouse_id: filters?.warehouse_id,
        };

        try {
          const [
            dailySummaryResult,
            revenueByProductResult,
            marginByProductResult,
            outstandingDebtorsResult,
            salesByWarehouseResult,
          ] = await Promise.allSettled([
            reportsService.getDailySummary({
              date: filters?.date || todayIso(),
              warehouse_id: filters?.warehouse_id,
            }),
            reportsService.getRevenueByProduct(rangeParams),
            reportsService.getMarginByProduct(rangeParams),
            reportsService.getOutstandingDebtors(),
            reportsService.getSalesByWarehouse(rangeParams),
          ]);

          const firstRejected = [
            dailySummaryResult,
            revenueByProductResult,
            marginByProductResult,
            outstandingDebtorsResult,
            salesByWarehouseResult,
          ].find((result) => result.status === "rejected") as
            | PromiseRejectedResult
            | undefined;

          set((d) => {
            d.dailySummary =
              dailySummaryResult.status === "fulfilled"
                ? dailySummaryResult.value
                : null;
            d.revenueByProduct =
              revenueByProductResult.status === "fulfilled"
                ? revenueByProductResult.value
                : [];
            d.marginByProduct =
              marginByProductResult.status === "fulfilled"
                ? marginByProductResult.value
                : [];
            d.outstandingDebtors =
              outstandingDebtorsResult.status === "fulfilled"
                ? outstandingDebtorsResult.value
                : [];
            d.salesByWarehouse =
              salesByWarehouseResult.status === "fulfilled"
                ? salesByWarehouseResult.value
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
            d.error = e?.message || "Failed to load sales overview";
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
    { name: "sales-overview-store" },
  ),
);
