import React, { useEffect, useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { productService } from '../../../core/products/services/productServices';

const BatchModal = ({ isOpen, onClose, warehouseId, onSubmit, submitting }) => {
    const [companyProducts, setCompanyProducts] = useState([]); // Full list of products
    const [productMap, setProductMap] = useState({}); // Key-value: { id: {id, name, sku} }
    const [productsCompanyId, setProductsCompanyId] = useState(null);
    const [productSearch, setProductSearch] = useState('');
    const [showProductDropdown, setShowProductDropdown] = useState(false);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        product: '',
        quantity: '',
        manufacture_date: '',
        expiry_date: '',
    });

    useEffect(() => {
        if (!isOpen) return;

        const savedUser = localStorage.getItem('erp_user');
        if (!savedUser) return;

        let companyId = null;
        try {
            const parsedUser = JSON.parse(savedUser);
            companyId = parsedUser?.company || null;
        } catch (error) {
            console.error('Failed to parse user session:', error);
            return;
        }

        if (!companyId || typeof companyId !== 'string') return;
        if (productsCompanyId === companyId && Object.keys(productMap).length > 0) return;

        let isActive = true;
        setIsLoadingProducts(true);

        const fetchCompanyProducts = async () => {
            try {
                const products = await productService.getProducts();
                if (!isActive) return;
                
                // Filter by company
                const filtered = products.filter((product) => product.company === companyId);
                setCompanyProducts(filtered);
                
                // Build key-value map: { id: {id, name, sku} }
                const map = {};
                filtered.forEach((product) => {
                    map[product.id] = {
                        id: product.id,
                        name: product.name,
                        sku: product.sku,
                        full: product, // Keep full product object for reference
                    };
                });
                setProductMap(map);
                setProductsCompanyId(companyId);
                setIsLoadingProducts(false);
            } catch (error) {
                if (!isActive) return;
                console.error('Failed to fetch company products:', error);
                setCompanyProducts([]);
                setProductMap({});
                setProductsCompanyId(companyId);
                setIsLoadingProducts(false);
            }
        };

        fetchCompanyProducts();

        return () => {
            isActive = false;
        };
    }, [isOpen, productsCompanyId, productMap]);

    // Real-time search through product map - filter by name or SKU
    const filteredProducts = useMemo(() => {
        if (!productSearch.trim()) {
            // Show all products if search is empty
            return companyProducts;
        }
        
        const searchLower = productSearch.toLowerCase().trim();
        // Filter products that match the search in name or SKU
        return companyProducts.filter((p) => {
            const nameMatch = p.name.toLowerCase().includes(searchLower);
            const skuMatch = p.sku.toLowerCase().includes(searchLower);
            return nameMatch || skuMatch;
        });
    }, [productSearch, companyProducts]);

    // Get selected product name for display
    const selectedProductName = productMap[formData.product]?.name || '';

    const validateForm = () => {
        const newErrors = {};

        if (!formData.product) newErrors.product = 'Product is required';
        if (!formData.quantity || parseFloat(formData.quantity) <= 0)
            newErrors.quantity = 'Quantity must be greater than 0';
        if (!formData.manufacture_date) newErrors.manufacture_date = 'Manufacture date is required';
        if (!formData.expiry_date) newErrors.expiry_date = 'Expiry date is required';

        if (formData.manufacture_date && formData.expiry_date) {
            const mfgDate = new Date(formData.manufacture_date);
            const expDate = new Date(formData.expiry_date);
            if (mfgDate >= expDate) {
                newErrors.expiry_date = 'Expiry date must be after manufacture date';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const batchData = {
            product: formData.product,
            warehouse: warehouseId,
            quantity: parseFloat(formData.quantity),
            manufacture_date: formData.manufacture_date,
            expiry_date: formData.expiry_date,
        };

        try {
            await onSubmit(batchData);
            // Reset form on success
            setFormData({
                product: '',
                quantity: '',
                manufacture_date: '',
                expiry_date: '',
            });
            setErrors({});
        } catch (error) {
            console.error('Batch creation failed:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Create Batch</h3>
                    <button className="modal-close" onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    {/* Product Search Dropdown */}
                    <div className="form-group">
                        <label>Product *</label>
                        <div 
                            className="searchable-dropdown"
                            style={{ position: 'relative' }}
                        >
                            {/* Search Input */}
                            <div
                                className="dropdown-input"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    border: errors.product ? '1px solid #dc3545' : '1px solid #ccc',
                                    borderRadius: '4px',
                                    padding: '8px 12px',
                                    backgroundColor: '#fff',
                                    cursor: 'text',
                                }}
                            >
                                <Search size={18} style={{ color: '#999', flexShrink: 0 }} />
                                <input
                                    type="text"
                                    placeholder={formData.product ? '' : 'Search by product name or SKU...'}
                                    value={productSearch || (formData.product ? productMap[formData.product]?.name || '' : '')}
                                    onChange={(e) => {
                                        setProductSearch(e.target.value);
                                        setShowProductDropdown(true);
                                    }}
                                    onFocus={() => setShowProductDropdown(true)}
                                    onBlur={() => {
                                        // Close dropdown after brief delay to allow click handling
                                        setTimeout(() => setShowProductDropdown(false), 150);
                                    }}
                                    style={{
                                        flex: 1,
                                        border: 'none',
                                        outline: 'none',
                                        padding: '0',
                                        fontSize: '14px',
                                        backgroundColor: 'transparent',
                                    }}
                                    autoComplete="off"
                                />
                                {formData.product && !productSearch && (
                                    <div style={{ fontSize: '13px', color: '#666', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {productMap[formData.product]?.name}
                                    </div>
                                )}
                            </div>

                            {/* Dropdown Results */}
                            {showProductDropdown && (
                                <div
                                    className="dropdown-options"
                                    style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        right: 0,
                                        backgroundColor: '#fff',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        maxHeight: '300px',
                                        overflowY: 'auto',
                                        zIndex: 1000,
                                        marginTop: '4px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    }}
                                >
                                    {isLoadingProducts ? (
                                        <div style={{ padding: '12px', textAlign: 'center', color: '#999' }}>
                                            Loading products...
                                        </div>
                                    ) : filteredProducts.length > 0 ? (
                                        <>
                                            <div style={{ padding: '8px 12px', backgroundColor: '#f9f9f9', borderBottom: '1px solid #f0f0f0', fontSize: '12px', color: '#666', fontWeight: 500 }}>
                                                Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                                                {productSearch && <span> matching "{productSearch}"</span>}
                                            </div>
                                            {filteredProducts.map((product) => (
                                                <div
                                                    key={product.id}
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        setFormData((prev) => ({ ...prev, product: product.id }));
                                                        setProductSearch('');
                                                        setShowProductDropdown(false);
                                                    }}
                                                    style={{
                                                        padding: '12px',
                                                        cursor: 'pointer',
                                                        borderBottom: '1px solid #f0f0f0',
                                                        backgroundColor: formData.product === product.id ? '#e8f4f8' : '#fff',
                                                        transition: 'background-color 0.15s',
                                                    }}
                                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
                                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = formData.product === product.id ? '#e8f4f8' : '#fff')}
                                                >
                                                    <div style={{ fontWeight: 500, color: '#333' }}>{product.name}</div>
                                                    <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>SKU: {product.sku}</div>
                                                </div>
                                            ))}
                                        </>
                                    ) : (
                                        <div style={{ padding: '12px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
                                            {productSearch ? `No products match "${productSearch}"` : 'No products available'}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {errors.product && <span style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.product}</span>}
                    </div>

                    {/* Quantity */}
                    <div className="form-group">
                        <label>Quantity *</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.quantity}
                            onChange={(e) => {
                                setFormData((prev) => ({ ...prev, quantity: e.target.value }));
                                if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: '' }));
                            }}
                            placeholder="0.00"
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: errors.quantity ? '1px solid #dc3545' : '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '14px',
                            }}
                        />
                        {errors.quantity && <span style={{ color: '#dc3545', fontSize: '12px' }}>{errors.quantity}</span>}
                    </div>

                    {/* Manufacture Date */}
                    <div className="form-group">
                        <label>Manufacture Date *</label>
                        <input
                            type="date"
                            value={formData.manufacture_date}
                            onChange={(e) => {
                                setFormData((prev) => ({ ...prev, manufacture_date: e.target.value }));
                                if (errors.manufacture_date) setErrors((prev) => ({ ...prev, manufacture_date: '' }));
                            }}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: errors.manufacture_date ? '1px solid #dc3545' : '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '14px',
                            }}
                        />
                        {errors.manufacture_date && <span style={{ color: '#dc3545', fontSize: '12px' }}>{errors.manufacture_date}</span>}
                    </div>

                    {/* Expiry Date */}
                    <div className="form-group">
                        <label>Expiry Date *</label>
                        <input
                            type="date"
                            value={formData.expiry_date}
                            onChange={(e) => {
                                setFormData((prev) => ({ ...prev, expiry_date: e.target.value }));
                                if (errors.expiry_date) setErrors((prev) => ({ ...prev, expiry_date: '' }));
                            }}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: errors.expiry_date ? '1px solid #dc3545' : '1px solid #ccc',
                                borderRadius: '4px',
                                fontSize: '14px',
                            }}
                        />
                        {errors.expiry_date && <span style={{ color: '#dc3545', fontSize: '12px' }}>{errors.expiry_date}</span>}
                    </div>

                    <div className="modal-actions">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? 'Creating...' : 'Create Batch'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BatchModal;



