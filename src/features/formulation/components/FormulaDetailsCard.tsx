import React from 'react';
import type { Formula } from '../types/models';

interface FormulaDetailsCardProps {
  formula: Formula;
  productLabel: string;
}

const statusLabel = (status: string) => status.replace(/_/g, ' ');

const FormulaDetailsCard: React.FC<FormulaDetailsCardProps> = ({ formula, productLabel }) => {
  return (
    <section className="formula-card formula-card--compact">
      <div className="formula-card__header">
        <h2>Formula details</h2>
      </div>
      <div className="formula-detail-grid formula-detail-grid--compact">
        <div className="formula-detail-grid__item">
          <span className="formula-detail-grid__label">Formula name</span>
          <strong>{formula.name}</strong>
        </div>
        <div className="formula-detail-grid__item">
          <span className="formula-detail-grid__label">Product</span>
          <strong>{productLabel}</strong>
        </div>
        <div className="formula-detail-grid__item">
          <span className="formula-detail-grid__label">Revision no.</span>
          <strong>{formula.revision}</strong>
        </div>
        <div className="formula-detail-grid__item">
          <span className="formula-detail-grid__label">Batch size</span>
          <strong>{formula.batch_size.toLocaleString()}</strong>
        </div>
        <div className="formula-detail-grid__item">
          <span className="formula-detail-grid__label">Yield %</span>
          <strong>{formula.yield_percentage}%</strong>
        </div>
        <div className="formula-detail-grid__item">
          <span className="formula-detail-grid__label">Status</span>
          <strong>
            <span className={`badge formula-status ${formula.status.replace(/_/g, '-')}`}>
              {statusLabel(formula.status)}
            </span>
          </strong>
        </div>
      </div>
    </section>
  );
};

export default FormulaDetailsCard;
