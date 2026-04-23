import React from 'react';
import { AlertTriangle } from 'lucide-react';
import ProductionPageShell from '../../../components/ProductionPageShell';

interface ProductionOrdersPageProps {
  activeWarehouse?: { id: string; name: string } | null;
}

const ProductionOrdersPage: React.FC<ProductionOrdersPageProps> = ({ activeWarehouse }) => {
  // Guard: Require active warehouse
  if (!activeWarehouse?.id) {
    return (
      <div className="production-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="empty-state" style={{ paddingTop: 100 }}>
          <div className="empty-state__icon">
            <AlertTriangle size={48} color="#f59e0b" />
          </div>
          <h3 className="empty-state__title">No Warehouse Selected</h3>
          <p className="empty-state__description">
            Please select a warehouse from the sidebar to view production orders.
          </p>
        </div>
      </div>
    );
  }

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
