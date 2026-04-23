import React from 'react';
import { ClipboardList } from 'lucide-react';
import '../styles/production.css';

interface ProductionPageShellProps {
  title: string;
  breadcrumb: string;
  description: string;
  highlights: string[];
}

const ProductionPageShell: React.FC<ProductionPageShellProps> = ({
  title,
  breadcrumb,
  description,
  highlights,
}) => {
  return (
    <div className="production-page">
      <div className="production-page__header">
        <div className="production-page__eyebrow">{breadcrumb}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      <section className="production-card production-card--hero">
        <div className="production-card__icon">
          <ClipboardList size={24} />
        </div>
        <div>
          <h2>Base page ready</h2>
          <p>
            This route is now wired into the Production sidebar and can be expanded
            with live data, filters, and actions next.
          </p>
        </div>
      </section>

      <section className="production-card">
        <h2>What lives here</h2>
        <div className="production-highlight-grid">
          {highlights.map((item) => (
            <div key={item} className="production-highlight-tile">
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductionPageShell;
