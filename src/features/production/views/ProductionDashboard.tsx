import React from 'react';
import ProductionPageShell from '../components/ProductionPageShell';

const ProductionDashboard: React.FC = () => {
  return (
    <ProductionPageShell
      title="Production Dashboard"
      breadcrumb="Production / Dashboard"
      description="A central overview of production performance, active work, schedule visibility, and operational alerts."
      highlights={[
        'KPIs',
        'Active batches',
        "Today\'s schedule",
        'Alerts',
      ]}
    />
  );
};

export default ProductionDashboard;
