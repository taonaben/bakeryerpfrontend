import { useNavigate } from 'react-router-dom';
import '../../styles/inventory.css';
import NoWarehouseSelected from '../../components/NoWarehouseSelected';

interface InventoryDashboardProps {
  activeWarehouse?: { id: string; name: string };
}

const InventoryDashboard = ({ activeWarehouse }: InventoryDashboardProps) => {
  const navigate = useNavigate();

  if (!activeWarehouse?.id) {
    return <NoWarehouseSelected onBack={() => navigate('/dashboard')} />;
  }

  return (
    <div className="inventory-page">
      <div className="inventory-header">
        <h1>Inventory Dashboard</h1>
      </div>
      <div className="inventory-content">
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          Inventory summary and analytics coming soon.
        </p>
      </div>
    </div>
  );
};

export default InventoryDashboard;
