import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { productService } from '@/core/products/services/productServices';
import type { product } from '@/core/products/types/models';
import { formulationService } from '../services/formulationService';
import FormulaLineEditorTable, { type FormulaEntryLine } from '../components/FormulaLineEditorTable';
import type { CreateFormulaWithLinesDTO, FormulaLineType, FormulaStatus } from '../types/models';
import '@/features/procurement/styles/procurement.css';
import '@/features/inventory/styles/inventory.css';
import '../styles/formulation.css';

const createLine = (sequence: number): FormulaEntryLine => ({
  localId: `line-${Date.now()}-${sequence}-${Math.random().toString(16).slice(2)}`,
  sequence,
  line_type: 'MATERIAL',
  product: '',
  quantity: '',
  text: '',
  location: '',
});

const PRODUCT_LINE_TYPES: FormulaLineType[] = ['MATERIAL', 'BYPRODUCT'];

const FormulaCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState<product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggingLineId, setDraggingLineId] = useState<string | null>(null);

  const [header, setHeader] = useState({
    formulaKey: '',
    formulaDescription: '',
    dateTimeRevised: new Date().toLocaleString(),
    costMethod: 'STANDARD',
    viewMode: 'By Quantity',
    product: '',
    batchSize: '',
    yieldPercentage: '100',
    laborMinutesPerBatch: '',
    status: 'draft' as FormulaStatus,
  });

  const [lines, setLines] = useState<FormulaEntryLine[]>([
    createLine(1),
    createLine(2),
    createLine(3),
  ]);

  useEffect(() => {
    const loadProducts = async () => {
      setLoadingProducts(true);
      try {
        const result = await productService.getProducts();
        setProducts(result);
      } catch (err: any) {
        setError(err.message || 'Failed to load products');
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  const totalWeight = useMemo(
    () =>
      lines.reduce((sum, line) => {
        if (line.line_type !== 'MATERIAL' && line.line_type !== 'BYPRODUCT') return sum;
        return sum + Number(line.quantity || 0);
      }, 0),
    [lines],
  );

  const totalRmCost = useMemo(
    () =>
      lines.reduce((sum, line) => {
        if (line.line_type !== 'MATERIAL') return sum;
        return sum + Number(line.quantity || 0) * 0.07;
      }, 0),
    [lines],
  );

  const totalVolume = useMemo(() => totalWeight, [totalWeight]);

  const updateHeader = (key: keyof typeof header, value: string) => {
    setHeader((prev) => ({ ...prev, [key]: value }));
  };

  const addLine = () => {
    setLines((prev) => [...prev, createLine(prev.length + 1)]);
  };

  const removeLine = (lineId: string) => {
    setLines((prev) =>
      prev
        .filter((line) => line.localId !== lineId)
        .map((line, index) => ({ ...line, sequence: index + 1 })),
    );
  };

  const updateLine = (lineId: string, key: keyof FormulaEntryLine, value: string | number) => {
    setLines((prev) =>
      prev.map((line) => {
        if (line.localId !== lineId) return line;

        if (key === 'line_type') {
          const nextType = value as FormulaLineType;
          return {
            ...line,
            line_type: nextType,
            product: PRODUCT_LINE_TYPES.includes(nextType) ? line.product : '',
          };
        }

        if (key === 'product') {
          const selectedProduct = products.find((item) => item.id === value);
          return {
            ...line,
            product: String(value),
            text: selectedProduct?.name ?? '',
          };
        }

        return { ...line, [key]: value };
      }),
    );
  };

  const syncSequences = (nextLines: FormulaEntryLine[]) =>
    nextLines.map((line, index) => ({ ...line, sequence: index + 1 }));

  const handleDragStart = (lineId: string) => {
    setDraggingLineId(lineId);
  };

  const handleDragOver = (event: React.DragEvent<HTMLTableRowElement>, overLineId: string) => {
    event.preventDefault();
    if (!draggingLineId || draggingLineId === overLineId) return;

    setLines((prev) => {
      const dragIndex = prev.findIndex((line) => line.localId === draggingLineId);
      const overIndex = prev.findIndex((line) => line.localId === overLineId);
      if (dragIndex === -1 || overIndex === -1) return prev;

      const reordered = [...prev];
      const [moved] = reordered.splice(dragIndex, 1);
      reordered.splice(overIndex, 0, moved);
      return syncSequences(reordered);
    });
  };

  const handleDrop = () => {
    setDraggingLineId(null);
  };

  const handleDragEnd = () => {
    setDraggingLineId(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const payload: CreateFormulaWithLinesDTO = {
      name: header.formulaKey,
      product: header.product,
      batch_size: Number(header.batchSize),
      yield_percentage: Number(header.yieldPercentage),
      labor_minutes_per_batch: header.laborMinutesPerBatch
        ? Number(header.laborMinutesPerBatch)
        : undefined,
      status: header.status,
      is_active: header.status === 'active',
      lines: syncSequences(lines).map((line) => ({
        sequence: line.sequence,
        line_type: line.line_type as FormulaLineType,
        product: line.product || undefined,
        quantity: line.quantity ? Number(line.quantity) : undefined,
        text: line.text || undefined,
      })),
    };

    try {
      const created = await formulationService.createFormulaWithLines(payload);
      navigate(`/formulation/${created.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create formula');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="formula-entry-page">
      <div className="formula-entry-topbar">
        <div>
          <button type="button" className="back-button" onClick={() => navigate('/formulation')}>
            <ArrowLeft size={18} />
            <span>Back to formulas</span>
          </button>
          <h1>Formula Entry</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="formula-entry-form">
        {error && <div className="error-banner">{error}</div>}

        <section className="formula-entry-header-card">
          <div className="formula-entry-header-grid">
            <div className="form-group">
              <label htmlFor="formula-key">
                Formula Key <span className="required">*</span>
              </label>
              <input
                id="formula-key"
                value={header.formulaKey}
                onChange={(e) => updateHeader('formulaKey', e.target.value)}
                placeholder="BREAD LOAVES PREP"
              />
            </div>
            <div className="form-group">
              <label htmlFor="formula-description">Formula Description</label>
              <input
                id="formula-description"
                value={header.formulaDescription}
                onChange={(e) => updateHeader('formulaDescription', e.target.value)}
                placeholder="Bread loaves preparation"
              />
            </div>
            <div className="form-group">
              <label htmlFor="formula-date-time">Date and Time Revised</label>
              <input
                id="formula-date-time"
                value={header.dateTimeRevised}
                onChange={(e) => updateHeader('dateTimeRevised', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="formula-cost-method">Cost Method</label>
              <select
                id="formula-cost-method"
                value={header.costMethod}
                onChange={(e) => updateHeader('costMethod', e.target.value)}
              >
                <option value="STANDARD">STANDARD</option>
                <option value="AVERAGE">AVERAGE</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="formula-view-mode">View Mode</label>
              <select
                id="formula-view-mode"
                value={header.viewMode}
                onChange={(e) => updateHeader('viewMode', e.target.value)}
              >
                <option value="By Quantity">By Quantity</option>
                <option value="By Percentage">By Percentage</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="formula-product">
                Product <span className="required">*</span>
              </label>
              <select
                id="formula-product"
                value={header.product}
                onChange={(e) => updateHeader('product', e.target.value)}
                disabled={loadingProducts}
              >
                <option value="">Select product</option>
                {products.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.sku} - {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="formula-status">Status</label>
              <select
                id="formula-status"
                value={header.status}
                onChange={(e) => updateHeader('status', e.target.value)}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="archived">Archived</option>
                <option value="deactivated">Deactivated</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="formula-batch-size">
                Batch Size <span className="required">*</span>
              </label>
              <input
                id="formula-batch-size"
                type="number"
                min="0"
                step="0.000001"
                value={header.batchSize}
                onChange={(e) => updateHeader('batchSize', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="formula-yield">
                Yield % <span className="required">*</span>
              </label>
              <input
                id="formula-yield"
                type="number"
                min="0"
                step="0.000001"
                value={header.yieldPercentage}
                onChange={(e) => updateHeader('yieldPercentage', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="formula-labor-minutes">Labor Minutes / Batch</label>
              <input
                id="formula-labor-minutes"
                type="number"
                min="0"
                step="0.01"
                value={header.laborMinutesPerBatch}
                onChange={(e) => updateHeader('laborMinutesPerBatch', e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>
        </section>

        <section className="formula-entry-metrics-bar">
          <div className="formula-entry-section-heading">
            <h2>Metrics</h2>
          </div>
          <div className="formula-entry-metrics">
            <div>
              <span>Total Weight (KG)</span>
              <strong>{totalWeight.toFixed(6)}</strong>
            </div>
            <div>
              <span>Total Volume (L)</span>
              <strong>{totalVolume.toFixed(6)}</strong>
            </div>
            <div>
              <span>Total RM Cost</span>
              <strong>{totalRmCost.toFixed(6)}</strong>
            </div>
          </div>
        </section>

        <FormulaLineEditorTable
          lines={lines}
          products={products}
          draggingLineId={draggingLineId}
          onAddLine={addLine}
          onRemoveLine={removeLine}
          onUpdateLine={updateLine}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
        />

        <div className="formula-entry-footer">
          <button type="button" className="btn btn-outline" onClick={() => navigate('/formulation')}>
            Close
          </button>
          <button type="button" className="btn btn-outline">
            Search
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormulaCreatePage;
