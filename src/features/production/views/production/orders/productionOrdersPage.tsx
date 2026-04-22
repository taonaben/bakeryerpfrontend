import React from 'react';
import ProductionPageShell from '../../../components/ProductionPageShell';

const ProductionOrdersPage: React.FC = () => {
  return (
    <ProductionPageShell
      title="Production Orders"
      breadcrumb="Production / Orders"
      description="Track production orders in execution, including start and finish actions and batch progress."
      highlights={[
        'Production orders list',
        'Start and finish actions',
        'Batch tracking',
        'Execution monitoring',
      ]}
    />
  );
};

export default ProductionOrdersPage;
