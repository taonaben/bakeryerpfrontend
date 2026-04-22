import React from 'react';
import ProductionPageShell from '../../../components/ProductionPageShell';

const ReworkPage: React.FC = () => {
  return (
    <ProductionPageShell
      title="Rework"
      breadcrumb="Production / Rework"
      description="Manage rework activity, including the materials going back in and the output being recovered."
      highlights={[
        'Rework orders',
        'Input tracking',
        'Output tracking',
        'Recovery visibility',
      ]}
    />
  );
};

export default ReworkPage;
