import React from 'react';
import ProductionPageShell from '../../../components/ProductionPageShell';

const PlannedOrdersPage: React.FC = () => {
  return (
    <ProductionPageShell
      title="Planned Orders"
      breadcrumb="Production / Planning / Planned Orders"
      description="View and manage the list of planned production orders before they move into execution."
      highlights={[
        'Planned production order list',
        'Scheduling readiness',
        'Order prioritization',
        'Planning follow-up',
      ]}
    />
  );
};

export default PlannedOrdersPage;
