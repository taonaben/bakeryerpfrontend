import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { CreatePlannedOrderModal } from '../../../components/planning';
import type { Warehouse } from '@/core/warehouses/types/models';
import '../../../styles/planning.css';

interface CreatePlannedOrderPageProps {
  activeWarehouse?: Warehouse | null;
}

const CreatePlannedOrderPage: React.FC<CreatePlannedOrderPageProps> = ({ activeWarehouse }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(true);

  // Guard: Require active warehouse
  if (!activeWarehouse?.id) {
    return (
      <div
        className="production-page production-page--planning"
        style={{ justifyContent: 'center', alignItems: 'center' }}
      >
        <div className="empty-state" style={{ paddingTop: 100 }}>
          <div className="empty-state__icon">
            <AlertTriangle size={48} color="#f59e0b" />
          </div>
          <h3 className="empty-state__title">No Warehouse Selected</h3>
          <p className="empty-state__description">
            Please select a warehouse from the sidebar to create a planned order.
          </p>
        </div>
      </div>
    );
  }

  const handleClose = () => {
    setShowModal(false);
    // Navigate back to planned orders list
    navigate('/production/planned-orders');
  };

  const handleSuccess = () => {
    // Navigate back to planned orders list after successful creation
    navigate('/production/planned-orders');
  };

  return (
    <div className="production-page production-page--planning create-planned-order-page">
      <CreatePlannedOrderModal
        isOpen={showModal}
        onClose={handleClose}
        onSuccess={handleSuccess}
        initialWarehouseId={activeWarehouse.id}
      />
    </div>
  );
};

export default CreatePlannedOrderPage;
