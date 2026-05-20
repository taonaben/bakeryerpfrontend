import React from 'react';
import type { DashboardWidgetWidth } from '../types/dashboardTypes';

interface GenericInfoletRendererProps {
  data: unknown;
  width: DashboardWidgetWidth;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const formatLabel = (value: string): string =>
  value
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return 'Not available';
  if (typeof value === 'number') return new Intl.NumberFormat().format(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return `${value.length} item${value.length === 1 ? '' : 's'}`;
  if (isRecord(value)) return 'View details';
  return String(value);
};

const getObjectEntries = (value: Record<string, unknown>) =>
  Object.entries(value).filter(([, entryValue]) => entryValue !== undefined);

const getTableColumns = (
  rows: Record<string, unknown>[],
  columnLimit: number,
): string[] => {
  const columns = new Set<string>();
  rows.slice(0, 5).forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (columns.size < columnLimit) columns.add(key);
    });
  });
  return Array.from(columns);
};

const PrimitiveMetric: React.FC<{ value: string | number | boolean }> = ({
  value,
}) => (
  <div className="dashboard-infolet-metric">
    <span>{formatValue(value)}</span>
  </div>
);

const ObjectSummary: React.FC<{
  value: Record<string, unknown>;
  width: DashboardWidgetWidth;
}> = ({ value, width }) => {
  const limit = width === 'full' ? 10 : 5;
  const entries = getObjectEntries(value).slice(0, limit);

  if (entries.length === 0) {
    return <div className="dashboard-infolet-empty">No data available.</div>;
  }

  return (
    <dl className="dashboard-infolet-kv">
      {entries.map(([key, entryValue]) => (
        <div key={key} className="dashboard-infolet-kv__row">
          <dt>{formatLabel(key)}</dt>
          <dd>{formatValue(entryValue)}</dd>
        </div>
      ))}
    </dl>
  );
};

const ArraySummary: React.FC<{
  value: unknown[];
  width: DashboardWidgetWidth;
}> = ({ value, width }) => {
  const rowLimit = width === 'full' ? 8 : 4;
  const columnLimit = width === 'full' ? 5 : 3;

  if (value.length === 0) {
    return <div className="dashboard-infolet-empty">No records to show.</div>;
  }

  const rows = value.filter(isRecord);

  if (rows.length === 0) {
    return (
      <ul className="dashboard-infolet-list">
        {value.slice(0, rowLimit).map((item, index) => (
          <li key={`${formatValue(item)}-${index}`}>{formatValue(item)}</li>
        ))}
      </ul>
    );
  }

  const columns = getTableColumns(rows, columnLimit);

  return (
    <div className="dashboard-infolet-table-wrap">
      <table className="dashboard-infolet-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{formatLabel(column)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, rowLimit).map((row, rowIndex) => (
            <tr key={String(row.id ?? row.uuid ?? rowIndex)}>
              {columns.map((column) => (
                <td key={column}>{formatValue(row[column])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {value.length > rowLimit && (
        <div className="dashboard-infolet-more">
          Showing {rowLimit} of {value.length}
        </div>
      )}
    </div>
  );
};

export const GenericInfoletRenderer: React.FC<GenericInfoletRendererProps> = ({
  data,
  width,
}) => {
  if (data === null || data === undefined) {
    return <div className="dashboard-infolet-empty">No data available.</div>;
  }

  if (
    typeof data === 'number' ||
    typeof data === 'string' ||
    typeof data === 'boolean'
  ) {
    return <PrimitiveMetric value={data} />;
  }

  if (Array.isArray(data)) {
    return <ArraySummary value={data} width={width} />;
  }

  if (isRecord(data)) {
    return <ObjectSummary value={data} width={width} />;
  }

  return <div className="dashboard-infolet-empty">{formatValue(data)}</div>;
};

export default GenericInfoletRenderer;
