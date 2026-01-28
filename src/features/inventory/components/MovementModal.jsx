import React from 'react';
import { X } from 'lucide-react';
import Button from '../../../components/ui/Button';

const MovementModal = ({ isOpen, onClose, formData, setFormData, onSubmit, submitting }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Log Stock Movement</h3>
                    <button className="modal-close" onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label>Batch ID</label>
                        <input
                            type="text"
                            value={formData.batch}
                            onChange={(e) => setFormData((prev) => ({ ...prev, batch: e.target.value }))}
                            placeholder="Batch UUID"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Movement Type</label>
                        <select
                            value={formData.movement_type}
                            onChange={(e) => setFormData((prev) => ({ ...prev, movement_type: e.target.value }))}
                        >
                            <option value="IN">IN - Stock Added</option>
                            <option value="OUT">OUT - Stock Removed</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Quantity</label>
                        <input
                            type="number"
                            value={formData.quantity}
                            onChange={(e) => setFormData((prev) => ({ ...prev, quantity: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Reference Number</label>
                        <input
                            type="text"
                            value={formData.reference_number}
                            onChange={(e) => setFormData((prev) => ({ ...prev, reference_number: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="modal-actions">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? 'Adding...' : 'Add Movement'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MovementModal;
