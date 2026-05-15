import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, CalendarDays, Plus } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ClosePeriodModal from "../../components/fiscal_periods/ClosePeriodModal";
import FiscalPeriodModal from "../../components/fiscal_periods/FiscalPeriodModal";
import { useFiscalPeriodsStore } from "../../stores/fiscalPeriodsStore";
import type {
  CreateFiscalPeriodDTO,
  FiscalPeriod,
} from "../../types/fiscal_periods_models";
import "../../styles/finance.css";

type TimelineSegment = {
  id: string;
  name: string;
  start: string;
  end: string;
  days: number;
  status: "open" | "closed" | "gap";
  fill: string;
};

const PERIOD_COLORS = [
  "#2dd4bf", // teal
  "#a78bfa", // lavender
  "#7c3aed", // rich violet
  "#38bdf8", // sky
  "#c084fc", // soft purple
  "#f9a8d4", // rose
  "#fdba74", // peach
  "#5eead4", // aqua
  "#818cf8", // periwinkle
  "#99f6e4", // pale teal
  "#e879f9", // orchid
  "#64748b", // slate
];

const FiscalPeriodPage: React.FC = () => {
  const {
    items,
    isLoading,
    isSubmitting,
    error,
    fetchAll,
    create,
    close,
    clearError,
  } = useFiscalPeriodsStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [periodToClose, setPeriodToClose] = useState<FiscalPeriod | null>(null);

  const loadPeriods = useCallback(async () => {
    await fetchAll(undefined, true);
  }, [fetchAll]);

  useEffect(() => {
    loadPeriods();
  }, [loadPeriods]);

  const sortedPeriods = useMemo(
    () =>
      [...items].sort((a, b) => a.period_start.localeCompare(b.period_start)),
    [items],
  );

  const lastPeriod =
    sortedPeriods.length > 0 ? sortedPeriods[sortedPeriods.length - 1] : null;
  const timelineSegments = useMemo(
    () => buildTimelineSegments(sortedPeriods),
    [sortedPeriods],
  );
  const timelineData = useMemo(
    () => [
      {
        name: "Fiscal periods",
        ...timelineSegments.reduce<Record<string, number>>((row, segment) => {
          row[segment.id] = segment.days;
          return row;
        }, {}),
      },
    ],
    [timelineSegments],
  );

  const handleCreate = async (dto: CreateFiscalPeriodDTO) => {
    await create(dto);
    setIsCreateOpen(false);
    await loadPeriods();
  };

  const handleClose = async () => {
    if (!periodToClose) return;
    await close(periodToClose.id);
    setPeriodToClose(null);
    await loadPeriods();
  };

  return (
    <div className="finance-page">
      <div className="finance-sticky-stack">
        <div className="finance-page-header">
          <div className="finance-page-title">
            <div className="finance-page-title__icon">
              <CalendarDays size={22} />
            </div>
            <div>
              <h1>Fiscal Periods</h1>
              <p>Finance / Configuration / Fiscal Periods</p>
            </div>
          </div>

          <div className="finance-page-header__actions">
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus size={16} />
              New Fiscal Period
            </button>
          </div>
        </div>
      </div>

      <div className="finance-content">
        {error && (
          <div className="finance-error-banner" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
            <button type="button" onClick={clearError}>
              Dismiss
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="finance-loading">
            <div className="finance-spinner" />
            <span>Loading fiscal periods...</span>
          </div>
        ) : (
          <>
            <section className="finance-form-section fiscal-period-timeline-card">
              <div className="finance-section-header">
                <div>
                  <h2>Period Timeline</h2>
                  <p>
                    Fiscal periods use distinct colours; uncovered date gaps are
                    red.
                  </p>
                </div>
              </div>

              {timelineSegments.length === 0 ? (
                <div className="finance-empty-state fiscal-period-empty-timeline">
                  <div className="finance-empty-state__icon">
                    <CalendarDays size={42} />
                  </div>
                  <h3>No fiscal periods configured</h3>
                  <p>
                    Create the first fiscal period to begin posting financial
                    entries.
                  </p>
                </div>
              ) : (
                <div className="fiscal-period-chart">
                  <ResponsiveContainer width="100%" height={110}>
                    <BarChart
                      data={timelineData}
                      layout="vertical"
                      margin={{ top: 8, right: 20, bottom: 8, left: 0 }}
                    >
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" hide />
                      <Tooltip
                        content={
                          <TimelineTooltip segments={timelineSegments} />
                        }
                        cursor={false}
                      />
                      {timelineSegments.map((segment) => (
                        <Bar
                          key={segment.id}
                          dataKey={segment.id}
                          stackId="timeline"
                          isAnimationActive={false}
                          radius={[4, 4, 4, 4]}
                        >
                          <Cell fill={segment.fill} />
                          <LabelList
                            content={<TimelineLabel segment={segment} />}
                          />
                        </Bar>
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>

            <div className="finance-table-container fiscal-period-table-wrap">
              <table className="finance-table fiscal-period-table">
                <thead>
                  <tr>
                    <th>Period Name</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th>Closed By</th>
                    <th>Closed At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPeriods.map((period) => (
                    <tr key={period.id}>
                      <td>{period.name}</td>
                      <td>{formatDate(period.period_start)}</td>
                      <td>{formatDate(period.period_end)}</td>
                      <td>
                        <span
                          className={`finance-badge ${period.status === "open" ? "finance-badge--open" : "finance-badge--closed"}`}
                        >
                          {period.status === "open" ? "Open" : "Closed"}
                        </span>
                      </td>
                      <td>
                        {period.closed_by_name || period.closed_by || "-"}
                      </td>
                      <td>{formatDateTime(period.closed_at)}</td>
                      <td>
                        {period.status === "open" ? (
                          <button
                            className="btn btn-outline fiscal-period-close-btn"
                            type="button"
                            onClick={() => setPeriodToClose(period)}
                          >
                            Close Period
                          </button>
                        ) : (
                          <span className="finance-muted">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {sortedPeriods.length === 0 && (
                    <tr>
                      <td colSpan={7} className="finance-empty-cell">
                        No fiscal periods configured.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <FiscalPeriodModal
        isOpen={isCreateOpen}
        isSubmitting={isSubmitting}
        lastPeriod={lastPeriod}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />
      <ClosePeriodModal
        period={periodToClose}
        isSubmitting={isSubmitting}
        onCancel={() => setPeriodToClose(null)}
        onConfirm={handleClose}
      />
    </div>
  );
};

const TimelineLabel: React.FC<any> = ({ x, y, width, height, segment }) => {
  if (!segment || width < 58) return null;
  return (
    <text
      x={x + width / 2}
      y={y + height / 2}
      textAnchor="middle"
      dominantBaseline="central"
      fill={segment.status === "closed" ? "#475569" : "#ffffff"}
      fontSize={12}
      fontWeight={700}
    >
      {segment.status === "gap" ? "Gap" : segment.name}
    </text>
  );
};

const TimelineTooltip: React.FC<any> = ({ active, payload, segments }) => {
  if (!active || !payload?.length) return null;
  const segment = segments.find(
    (item: TimelineSegment) => item.id === payload[0].dataKey,
  );
  if (!segment) return null;

  return (
    <div className="fiscal-period-tooltip">
      <strong>
        {segment.status === "gap" ? "Coverage Gap" : segment.name}
      </strong>
      <span>
        {formatDate(segment.start)} - {formatDate(segment.end)}
      </span>
      <span>
        {segment.days} day{segment.days === 1 ? "" : "s"}
      </span>
    </div>
  );
};

function buildTimelineSegments(periods: FiscalPeriod[]): TimelineSegment[] {
  const segments: TimelineSegment[] = [];

  periods.forEach((period, index) => {
    if (index > 0) {
      const previous = periods[index - 1];
      const expectedStart = addDays(previous.period_end, 1);
      if (dateToMs(period.period_start) > dateToMs(expectedStart)) {
        const gapEnd = addDays(period.period_start, -1);
        segments.push({
          id: `gap-${previous.id}-${period.id}`,
          name: "Gap",
          start: expectedStart,
          end: gapEnd,
          days: inclusiveDays(expectedStart, gapEnd),
          status: "gap",
          fill: "#dc2626",
        });
      }
    }

    segments.push({
      id: `period-${period.id}`,
      name: period.name,
      start: period.period_start,
      end: period.period_end,
      days: inclusiveDays(period.period_start, period.period_end),
      status: period.status,
      fill: PERIOD_COLORS[index % PERIOD_COLORS.length],
    });
  });

  return segments;
}

function inclusiveDays(start: string, end: string): number {
  return Math.max(
    1,
    Math.round((dateToMs(end) - dateToMs(start)) / 86400000) + 1,
  );
}

function dateToMs(value: string): number {
  const [year, month, day] = value.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function addDays(value: string, days: number): string {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function formatDate(value?: string | null): string {
  if (!value) return "-";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value?: string | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default FiscalPeriodPage;
