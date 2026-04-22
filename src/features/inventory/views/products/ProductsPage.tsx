import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useProductListStore } from '../../stores';
import { useProductFilters } from '../../hooks';
import ProductsToolbar from '../../components/ProductsToolbar';
import ProductsTable from '../../components/ProductsTable';
import '../../styles/products.css';

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { products, isLoading, error, currentPage, totalPages, fetchProducts } = useProductListStore();
  const { filters, setFilter, getApiQueryParams } = useProductFilters();
  const { search, status, category } = filters;
  const [searchLocal, setSearchLocal] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilter('search', searchLocal);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchLocal, setFilter]);

  useEffect(() => {
    const params = getApiQueryParams();
    fetchProducts(params);
  }, [search, status, category, currentPage, getApiQueryParams, fetchProducts]);

  const handleStatusChange = (status: string) => {
    setFilter('status', status);
  };

  const handleCreateProduct = () => {
    navigate('/inventory/products/new');
  };

  const handleProductClick = (productId: string) => {
    navigate(`/inventory/products/${productId}`);
  };

  const handlePageChange = (page: number) => {
    setFilter('page', page);
  };

  return (
    <div className="products-page">
      <div className="products-sticky-stack">
        <div className="products-page-header">
          <div className="products-page-header__left">
            <h1>Products</h1>
            <p className="products-page-header__breadcrumb">
              Inventory / Products
            </p>
          </div>
          <div className="products-page-header__actions">
            <button
              className="btn btn-primary"
              onClick={handleCreateProduct}
              type="button"
            >
              <Plus size={18} /> New Product
            </button>
          </div>
        </div>
        <ProductsToolbar
          searchTerm={searchLocal}
          onSearchChange={setSearchLocal}
          activeStatus={status}
          onStatusChange={handleStatusChange}
          category={category}
          onCategoryChange={(value) => setFilter('category', value)}
          placeholder="Search by SKU or product name..."
        />
      </div>

      <div className="products-content">
        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        <ProductsTable
          products={products}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          isLoading={isLoading}
          onRowClick={handleProductClick}
        />
      </div>
    </div>
  );
};

export default ProductsPage;
