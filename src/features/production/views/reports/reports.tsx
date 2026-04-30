import React from 'react';
import ProductionPageShell from '../../components/ProductionPageShell';

const ProductionReportsPage: React.FC = () => {
  return (
    <ProductionPageShell
      title="Production Reports"
      breadcrumb="Production / Reports"
      description="Review analytical outputs for production performance, losses, and traceability."
      highlights={[
        'Yield analysis',
        'Waste summary',
        'Batch history',
        'Operational reporting',
      ]}
    />
  );
};

export default ProductionReportsPage;
