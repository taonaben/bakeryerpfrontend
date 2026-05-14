import React, { useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ProcurementOverviewTrends } from '../../types/procurement_overview_models';
import {
  compactMoney,
  formatPeriodLabel,
  money,
  PROCUREMENT_CHART_COLORS,
} from './procurementOverviewUtils';

interface ProcurementTrendsSectionProps {
  trends: ProcurementOverviewTrends | null;
}

const ProcurementTrendsSection: React.FC<ProcurementTrendsSectionProps> = ({
  trends,
}) => {
  const invoiceData = useMemo(() => {
    const byPeriod = new Map<string, { period: string; approved: number; paid: number }>();

    trends?.supplier_invoices_approved.forEach((point) => {
      byPeriod.set(point.period, {
        period: point.period,
        approved: point.total_value,
        paid: byPeriod.get(point.period)?.paid || 0,
      });
    });

    trends?.supplier_invoices_paid.forEach((point) => {
      byPeriod.set(point.period, {
        period: point.period,
        approved: byPeriod.get(point.period)?.approved || 0,
        paid: point.total_value,
      });
    });

    return Array.from(byPeriod.values()).sort((a, b) => a.period.localeCompare(b.period));
  }, [trends]);

  return (
    <section className="procurement-overview-section">
      <div className="procurement-overview-section__head">
        <div>
          <h2>Procurement Trends</h2>
          <p>Secondary context for purchase value, receiving, invoices, and overdue exposure.</p>
        </div>
      </div>

      <div className="procurement-overview-trends-grid">
        <ChartPanel title="PO Value Trend" size="large">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trends?.po_value || []} margin={{ top: 12, right: 18, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="poValueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={PROCUREMENT_CHART_COLORS.blue} stopOpacity={0.22} />
                  <stop offset="95%" stopColor={PROCUREMENT_CHART_COLORS.blue} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
              <XAxis dataKey="period" tickFormatter={formatPeriodLabel} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={compactMoney} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={58} />
              <Tooltip content={<MoneyTooltip valueKey="total_value" valueLabel="PO value" />} />
              <Area
                type="monotone"
                dataKey="total_value"
                stroke={PROCUREMENT_CHART_COLORS.blue}
                strokeWidth={2.5}
                fill="url(#poValueGradient)"
                dot={{ r: 3, fill: PROCUREMENT_CHART_COLORS.blue, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Approved GRNs">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trends?.grns_approved || []} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
              <XAxis dataKey="period" tickFormatter={formatPeriodLabel} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={36} />
              <Tooltip content={<CountTooltip valueLabel="Approved GRNs" />} />
              <Bar dataKey="count" fill={PROCUREMENT_CHART_COLORS.green} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Supplier Invoices">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={invoiceData} margin={{ top: 12, right: 16, left: 0, bottom: 0 }} barGap={5}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
              <XAxis dataKey="period" tickFormatter={formatPeriodLabel} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={compactMoney} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={56} />
              <Tooltip content={<GroupedMoneyTooltip />} />
              <Bar dataKey="approved" fill={PROCUREMENT_CHART_COLORS.blueLight} radius={[4, 4, 0, 0]} />
              <Bar dataKey="paid" fill={PROCUREMENT_CHART_COLORS.green} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="procurement-overview-legend">
            <span><i style={{ background: PROCUREMENT_CHART_COLORS.blueLight }} />Approved</span>
            <span><i style={{ background: PROCUREMENT_CHART_COLORS.green }} />Paid</span>
          </div>
        </ChartPanel>

        <ChartPanel title="Overdue PO Trend">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trends?.overdue_pos || []} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
              <XAxis dataKey="period" tickFormatter={formatPeriodLabel} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={36} />
              <Tooltip content={<CountTooltip valueLabel="Overdue POs" />} />
              <Line
                type="monotone"
                dataKey="count"
                stroke={PROCUREMENT_CHART_COLORS.red}
                strokeWidth={2.5}
                dot={{ r: 3, fill: PROCUREMENT_CHART_COLORS.red, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>
    </section>
  );
};

const ChartPanel: React.FC<{
  title: string;
  children: React.ReactNode;
  size?: 'normal' | 'large';
}> = ({ title, children, size = 'normal' }) => (
  <article className={`procurement-overview-panel procurement-overview-chart procurement-overview-chart--${size}`}>
    <h3>{title}</h3>
    {children}
  </article>
);

const MoneyTooltip: React.FC<any> = ({ active, payload, label, valueKey, valueLabel }) => {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  return (
    <div className="procurement-overview-tooltip">
      <strong>{formatPeriodLabel(label)}</strong>
      <span>{valueLabel}: {money(point?.[valueKey] || 0)}</span>
    </div>
  );
};

const CountTooltip: React.FC<any> = ({ active, payload, label, valueLabel }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="procurement-overview-tooltip">
      <strong>{formatPeriodLabel(label)}</strong>
      <span>{valueLabel}: {payload[0].value || 0}</span>
    </div>
  );
};

const GroupedMoneyTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="procurement-overview-tooltip">
      <strong>{formatPeriodLabel(label)}</strong>
      {payload.map((item: any) => (
        <span key={item.dataKey}>{item.name}: {money(item.value || 0)}</span>
      ))}
    </div>
  );
};

export default ProcurementTrendsSection;
