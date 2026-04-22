import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Breadcrumb from '@/shared/components/Breadcrumb';
import type { BreadcrumbItem } from '@/shared/components/Breadcrumb';
import { productService } from '@/core/products/services/productServices';
import type { product } from '@/core/products/types/models';
import FormulaDetailHeader from '../components/FormulaDetailHeader';
import FormulaDetailsCard from '../components/FormulaDetailsCard';
import FormulaLineItemsCard from '../components/FormulaLineItemsCard';
import FormulaHoldModal from '../components/FormulaHoldModal';
import useFormulaDetailStore from '../stores/formulaDetailStore';
import '@/features/procurement/styles/procurement.css';
import '@/features/inventory/styles/inventory.css';
import '../styles/formulation.css';

const FormulaDetailPage: React.FC = () => {
  const { formulaId } = useParams<{ formulaId: string }>();
  const navigate = useNavigate();

  const formula = useFormulaDetailStore((s) => s.formula);
  const isLoading = useFormulaDetailStore((s) => s.isLoading);
  const error = useFormulaDetailStore((s) => s.error);
  const isActivating = useFormulaDetailStore((s) => s.isActivating);
  const isArchiving = useFormulaDetailStore((s) => s.isArchiving);
  const isDeactivating = useFormulaDetailStore((s) => s.isDeactivating);
  const isDeleting = useFormulaDetailStore((s) => s.isDeleting);
  const isPuttingOnHold = useFormulaDetailStore((s) => s.isPuttingOnHold);
  const isReleasingHold = useFormulaDetailStore((s) => s.isReleasingHold);
  const fetchFormula = useFormulaDetailStore((s) => s.fetchFormula);
  const clearFormula = useFormulaDetailStore((s) => s.clearFormula);
  const activateFormula = useFormulaDetailStore((s) => s.activateFormula);
  const archiveFormula = useFormulaDetailStore((s) => s.archiveFormula);
  const deactivateFormula = useFormulaDetailStore((s) => s.deactivateFormula);
  const deleteFormula = useFormulaDetailStore((s) => s.deleteFormula);
  const putFormulaOnHold = useFormulaDetailStore((s) => s.putFormulaOnHold);
  const releaseFormulaHold = useFormulaDetailStore((s) => s.releaseFormulaHold);
  const setError = useFormulaDetailStore((s) => s.setError);

  const [products, setProducts] = useState<product[]>([]);
  const [isHoldModalOpen, setIsHoldModalOpen] = useState(false);

  useEffect(() => {
    if (!formulaId) {
      navigate('/formulation');
      return;
    }

    fetchFormula(formulaId);

    const loadProducts = async () => {
      try {
        const result = await productService.getProducts();
        setProducts(result);
      } catch {
        // Detail page still works with raw IDs if products fail.
      }
    };

    loadProducts();

    return () => {
      clearFormula();
    };
  }, [formulaId, fetchFormula, navigate, clearFormula]);

  const productLookup = useMemo(
    () => Object.fromEntries(products.map((item) => [item.id, `${item.sku} · ${item.name}`])),
    [products],
  );

  const productLabel = formula?.product ? productLookup[formula.product] || formula.product : '—';

  const busy =
    isActivating || isArchiving || isDeactivating || isDeleting || isPuttingOnHold || isReleasingHold;

  const refreshCurrent = useCallback(async () => {
    if (!formulaId) return;
    await fetchFormula(formulaId);
  }, [fetchFormula, formulaId]);

  const handleDelete = async () => {
    if (!formula || !window.confirm(`Delete formula "${formula.name}"?`)) return;
    try {
      await deleteFormula(formula.id);
      navigate('/formulation');
    } catch {
      // store handles error
    }
  };

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Formulation', href: '/formulation' },
    ...(formula ? [{ label: formula.name, isActive: true } as BreadcrumbItem] : []),
  ];

  if (isLoading) {
    return (
      <div className="formula-detail-page">
        <div className="detail-header">
          <button onClick={() => navigate(-1)} className="back-button" aria-label="Go back">
            <ArrowLeft size={18} /> <span>Back</span>
          </button>
        </div>
        <div className="loading-container">
          <div className="spinner" />
          <span>Loading formula…</span>
        </div>
      </div>
    );
  }

  if (error && !formula) {
    return (
      <div className="formula-detail-page">
        <div className="detail-header">
          <button onClick={() => navigate(-1)} className="back-button" aria-label="Go back">
            <ArrowLeft size={18} /> <span>Back</span>
          </button>
        </div>
        <div className="error-banner" role="alert">
          <AlertCircle size={20} />
          <div>
            <strong>Error</strong>
            <p>{error}</p>
          </div>
          <button type="button" onClick={refreshCurrent} className="btn btn-outline">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!formula) {
    return (
      <div className="formula-detail-page">
        <div className="empty-state">
          <h3 className="empty-state__title">Formula not found</h3>
          <p className="empty-state__description">
            The formula you are looking for doesn&apos;t exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="formula-detail-page">
      <div className="detail-header formula-detail-page__header">
        <button onClick={() => navigate('/formulation')} className="back-button" aria-label="Go back">
          <ArrowLeft size={18} /> <span>Back</span>
        </button>
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {error && (
        <div className="error-banner formula-detail-page__error" role="alert">
          {error}
          <button type="button" onClick={() => setError(null)} className="btn btn-outline">
            Dismiss
          </button>
        </div>
      )}

      <FormulaDetailHeader
        formula={formula}
        isBusy={busy}
        onActivate={() => activateFormula(formula.id)}
        onArchive={() => archiveFormula(formula.id)}
        onDeactivate={() => deactivateFormula(formula.id)}
        onPutOnHold={() => setIsHoldModalOpen(true)}
        onReleaseHold={() => releaseFormulaHold(formula.id)}
        onDelete={handleDelete}
      />

      <div className="formula-detail-layout">
        <FormulaDetailsCard formula={formula} productLabel={productLabel} />
        <FormulaLineItemsCard formula={formula} productLookup={productLookup} />
      </div>

      <FormulaHoldModal
        isOpen={isHoldModalOpen}
        formulaName={formula.name}
        isSubmitting={isPuttingOnHold}
        onClose={() => setIsHoldModalOpen(false)}
        onConfirm={async (reason) => {
          await putFormulaOnHold(formula.id, { reason });
          setIsHoldModalOpen(false);
        }}
      />
    </div>
  );
};

export default FormulaDetailPage;
