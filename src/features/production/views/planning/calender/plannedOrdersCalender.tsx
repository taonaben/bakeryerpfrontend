import React from 'react';
import ProductionPageShell from '../../../components/ProductionPageShell';

const PlannedOrdersCalendarPage: React.FC = () => {
  return (
    <ProductionPageShell
      title="Production Calendar"
      breadcrumb="Production / Planning / Calendar"
      description="A calendar view for production scheduling so teams can balance demand, capacity, and timing."
      highlights={[
        'Scheduling calendar',
        'Date-based planning',
        'Capacity visibility',
        'Shift alignment',
      ]}
    />
  );
};

export default PlannedOrdersCalendarPage;
