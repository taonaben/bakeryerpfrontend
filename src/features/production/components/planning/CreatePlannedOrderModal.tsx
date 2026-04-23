import React, { useState, useEffect } from 'react';
import { X, Calendar, Package, Building2, Hash } from 'lucide-react';
import type {
  PlannedOrderPriority,
  PlannedOrderStatus,
  CreatePlannedOrderDTO,
} from '../../types/plannedOrderModel';
import { planningService } from '../../services/planningServices';
import { productService } from '@/core/products/services/productServices';
import { warehouseService } from '@/core/warehouses/services/warehouseService';
import type { product } from '@/core/products/types/models';
import type { Warehouse } from '@/core/warehouses/types/models';

interface CreatePlannedOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialWarehouseId?: string;
}

const CreatePlannedOrderModal: React.FC<CreatePlannedOrderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialWarehouseId,
}) => {
  const [formData, setFormData] = useState<CreatePlannedOrderDTO>({
    product: '',
    quantity: '',
    warehouse: initialWarehouseId || '',
    need_by: '',
    priority: 'medium',
    status: 'draft',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [warehousesLoading, setWarehousesLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setProductsLoading(true);
        setWarehousesLoading(true);

        const [productsData, warehousesData] = await Promise.all([
          productService.getProducts(),
          warehouseService.getWarehouses(),
        ]);

        setProducts(productsData);
        setWarehouses(warehousesData);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load products or warehouses');
      } finally {
        setProductsLoading(false);
        setWarehousesLoading(false);
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleInputChange = (field: keyof CreatePlannedOrderDTO, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.product) {
      setError('Please select a product');
      return;
    }
    if (!formData.quantity || Number(formData.quantity) <= 0) {
      setError('Please enter a valid quantity');
      return;
    }
    if (!formData.warehouse) {
      setError('Please select a warehouse');
      return;
    }
    if (!formData.need_by) {
      setError('Please select a need by date');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await planningService.createPlannedOrder(formData);
      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create planned order');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      product: '',
      quantity: '',
      warehouse: initialWarehouseId || '',
      need_by: '',
      priority: 'medium',
      status: 'draft',
    });
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  const priorities: PlannedOrderPriority[] = ['low', 'medium', 'high'];
  const statuses: PlannedOrderStatus[] = ['draft', 'scheduled', 'in_production', 'completed'];

  return (
    <div className="modal-overlay">
      <div className="modal create-planned-order-modal">
        <div className="modal-header">
          <h2>Create New Planned Order</h2>
          <button
            className="modal-close-btn"
            onClick={handleClose}
            disabled={loading}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form create-planned-order-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="product">
                <Package size={16} />
                Product
              </label>
              <select
                id="product"
                value={formData.product}
                onChange={(e) => handleInputChange('product', e.target.value)}
                disabled={loading || productsLoading}
                required
              >
                <option value="">Select a product...</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name || product.id}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="quantity">
                <Hash size={16} />
                Quantity
              </label>
              <input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                disabled={loading}
                placeholder="Enter quantity"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="warehouse">
                <Building2 size={16} />
                Warehouse
              </label>
              <select
                id="warehouse"
                value={formData.warehouse}
                onChange={(e) => handleInputChange('warehouse', e.target.value)}
                disabled={loading || warehousesLoading}
                required
              >
                <option value="">Select a warehouse...</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="need_by">
                <Calendar size={16} />
                Need By Date
              </label>
              <input
                id="need_by"
                type="date"
                value={formData.need_by}
                onChange={(e) => handleInputChange('need_by', e.target.value)}
                disabled={loading}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) =>
                  handleInputChange('priority', e.target.value as PlannedOrderPriority)
                }
                disabled={loading}
              >
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as PlannedOrderStatus)}
                disabled={loading}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ').charAt(0).toUpperCase() +
                      status.replace('_', ' ').slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || productsLoading || warehousesLoading}
            >
              {loading ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePlannedOrderModal;
