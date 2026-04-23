import React from 'react';
import type { Formula, FormulaLine } from '../types/models';

interface FormulaLineItemsCardProps {
  formula: Formula;
  productLookup: Record<string, string>;
}

const getLineDescriptor = (line: FormulaLine, productLookup: Record<string, string>) => {
  if (line.text?.trim()) return line.text.trim();
  if (line.material_name?.trim()) return line.material_name.trim();
  if (line.product) return productLookup[line.product] || line.product;
  return '—';
};

const getTotalWeight = (formula: Formula) =>
  formula.lines
    .filter((line) => line.line_type === 'MATERIAL' || line.line_type === 'BYPRODUCT')
    .reduce((sum, line) => sum + Number(line.quantity || 0), 0);

const getEstimatedRmCost = (formula: Formula) =>
  formula.lines
    .filter((line) => line.line_type === 'MATERIAL')
    .reduce((sum, line) => sum + Number(line.quantity || 0) * 0.07, 0);

const FormulaLineItemsCard: React.FC<FormulaLineItemsCardProps> = ({ formula, productLookup }) => {
  const totalWeight = getTotalWeight(formula);
  const totalRmCost = getEstimatedRmCost(formula);

  return (
    <section className="formula-card formula-card--compact">
      <div className="formula-card__header formula-card__header--split">
        <h2>Line items</h2>
        <div className="formula-summary-metrics">
          <div>
            <span className="formula-summary-metrics__label">Total RM cost</span>
            <strong>${totalRmCost.toFixed(2)}</strong>
          </div>
          <div>
            <span className="formula-summary-metrics__label">Total weight</span>
            <strong>{totalWeight.toFixed(2)} kg</strong>
          </div>
        </div>
      </div>

      {formula.lines.length > 0 ? (
        <table className="line-items-table formula-line-items-table formula-line-items-table--compact">
          <thead>
            <tr>
              <th>Seq</th>
              <th>Type</th>
              <th>Item / Text</th>
              <th>Qty</th>
            </tr>
          </thead>
          <tbody>
            {formula.lines
              .slice()
              .sort((a, b) => a.sequence - b.sequence)
              .map((line) => (
                <tr key={line.id}>
                  <td>{line.sequence}</td>
                  <td>
                    <span className={`formula-type-pill formula-type-pill--${line.line_type.toLowerCase()}`}>
                      {line.line_type}
                    </span>
                  </td>
                  <td>{getLineDescriptor(line, productLookup)}</td>
                  <td>{line.quantity != null ? Number(line.quantity).toLocaleString() : '—'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      ) : (
        <div className="empty-state-card">No line items</div>
      )}
    </section>
  );
};

export default FormulaLineItemsCard;
