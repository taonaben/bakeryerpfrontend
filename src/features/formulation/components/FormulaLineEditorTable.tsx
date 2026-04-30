import React from 'react';
import { GripVertical, Plus, Search, Trash2 } from 'lucide-react';
import type { product } from '@/core/products/types/models';
import type { FormulaLineType } from '../types/models';

export interface FormulaEntryLine {
  localId: string;
  sequence: number;
  line_type: FormulaLineType;
  product: string;
  quantity: string;
  text: string;
  location: string;
}

interface FormulaLineEditorTableProps {
  lines: FormulaEntryLine[];
  products: product[];
  draggingLineId: string | null;
  onAddLine: () => void;
  onRemoveLine: (lineId: string) => void;
  onUpdateLine: (lineId: string, key: keyof FormulaEntryLine, value: string | number) => void;
  onDragStart: (lineId: string) => void;
  onDragOver: (event: React.DragEvent<HTMLTableRowElement>, overLineId: string) => void;
  onDrop: () => void;
  onDragEnd: () => void;
  /** When true all inputs are disabled and add/remove actions are hidden */
  readOnly?: boolean;
}

const LINE_TYPE_OPTIONS: FormulaLineType[] = ['TEXT', 'INSTRUCTION', 'MATERIAL', 'BYPRODUCT', 'PROCESS'];
const PRODUCT_LINE_TYPES: FormulaLineType[] = ['MATERIAL', 'BYPRODUCT'];

const FormulaLineEditorTable: React.FC<FormulaLineEditorTableProps> = ({
  lines,
  products,
  draggingLineId,
  onAddLine,
  onRemoveLine,
  onUpdateLine,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  readOnly = false,
}) => {
  return (
    <section className="formula-entry-grid-card">
      <div className="formula-entry-grid-card__header">
        <div>
          <h2>Line Items</h2>
          <p>Drag rows to reorder and use text-based lines for notes, instructions, and process steps.</p>
        </div>
      </div>

      <div className="formula-entry-table-wrap">
        <table className="formula-entry-table">
          <thead>
            <tr>
              <th>Action</th>
              <th>SeqNo</th>
              <th>Type</th>
              <th>Item Key</th>
              <th>Text</th>
              <th>Location</th>
              <th>Qty Required</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => {
              const itemKeyEnabled = PRODUCT_LINE_TYPES.includes(line.line_type);

              return (
                <tr
                  key={line.localId}
                  draggable
                  onDragStart={() => onDragStart(line.localId)}
                  onDragOver={(event) => onDragOver(event, line.localId)}
                  onDrop={onDrop}
                  onDragEnd={onDragEnd}
                  className={draggingLineId === line.localId ? 'is-dragging' : ''}
                >
                  <td>
                    <div className="formula-entry-row-actions">
                      <button
                        type="button"
                        className="formula-drag-handle"
                        aria-label={`Reorder line ${line.sequence}`}
                        title="Drag to reorder"
                        disabled={readOnly}
                      >
                        <GripVertical size={16} />
                      </button>
                      {!readOnly && (
                        <button
                          type="button"
                          className="formula-row-icon-btn"
                          onClick={() => onRemoveLine(line.localId)}
                          title="Remove line"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={line.sequence}
                      onChange={(e) => onUpdateLine(line.localId, 'sequence', Number(e.target.value))}
                      disabled={readOnly}
                    />
                  </td>
                  <td>
                    <select
                      value={line.line_type}
                      onChange={(e) => onUpdateLine(line.localId, 'line_type', e.target.value)}
                      disabled={readOnly}
                    >
                      {LINE_TYPE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div className={`formula-entry-field-with-icon${itemKeyEnabled ? '' : ' is-disabled'}`}>
                      <select
                        value={line.product}
                        onChange={(e) => onUpdateLine(line.localId, 'product', e.target.value)}
                        disabled={!itemKeyEnabled || readOnly}
                      >
                        <option value="">
                          {itemKeyEnabled ? 'Select item' : 'Not used for this line'}
                        </option>
                        {products.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.sku} - {item.name}
                          </option>
                        ))}
                      </select>
                      <Search size={16} />
                    </div>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={line.text}
                      onChange={(e) => onUpdateLine(line.localId, 'text', e.target.value)}
                      placeholder="Line text"
                      disabled={readOnly}
                    />
                  </td>
                  <td>
                    <div className="formula-entry-field-with-icon">
                      <input
                        type="text"
                        value={line.location}
                        onChange={(e) => onUpdateLine(line.localId, 'location', e.target.value)}
                        placeholder="01"
                        disabled={readOnly}
                      />
                      <Search size={16} />
                    </div>
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="0.000001"
                      value={line.quantity}
                      onChange={(e) => onUpdateLine(line.localId, 'quantity', e.target.value)}
                      disabled={readOnly}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="formula-entry-grid-footer">
        {!readOnly && (
          <button type="button" className="btn btn-outline formula-entry-add-line-btn" onClick={onAddLine}>
            <Plus size={16} />
            Add Line
          </button>
        )}
      </div>
    </section>
  );
};

export default FormulaLineEditorTable;
