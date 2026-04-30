/**
 * Shared print stylesheet injected as `pageStyle` into react-to-print.
 *
 * Overrides the app-wide `@media print { body * { visibility: hidden } }` rule
 * that lives in procurement.css (and any other feature stylesheet), so the
 * document content is always rendered correctly regardless of which page the
 * user triggers print from.
 *
 * Base layout classes (.pr-doc, .pr-meta-grid, .pr-line-items, etc.) are
 * defined here so every document template can share them without re-declaring
 * them.  Feature-specific overrides can be appended with string concatenation:
 *
 *   pageStyle={SHARED_PRINT_STYLES + myFeatureExtraStyles}
 */
export const SHARED_PRINT_STYLES = `
  /* ── Reset visibility override from app stylesheets ───────────────── */
  body, body * { visibility: visible !important; }

  /* ── Page setup ───────────────────────────────────────────────────── */
  @page { size: A4; margin: 20mm; }
  *, *::before, *::after { box-sizing: border-box; }
  body {
    font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
    font-size: 12px;
    color: #111;
    margin: 0;
    padding: 0;
  }

  /* ── Document root ────────────────────────────────────────────────── */
  .pr-doc { max-width: 100%; }

  /* ── Document header ──────────────────────────────────────────────── */
  .pr-doc-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 14px;
    border-bottom: 2px solid #1a1a2e;
    margin-bottom: 18px;
  }
  .pr-doc-header h1 { font-size: 20px; font-weight: 700; margin: 0 0 4px; color: #1a1a2e; }
  .pr-doc-header .pr-number { font-size: 13px; color: #555; font-family: monospace; }

  /* ── Status badges ────────────────────────────────────────────────── */
  .pr-badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .pr-badge-draft     { background: #f3f4f6; color: #374151; }
  .pr-badge-submitted { background: #eff6ff; color: #1e40af; }
  .pr-badge-approved  { background: #f0fdf4; color: #166534; }
  .pr-badge-rejected  { background: #fef2f2; color: #991b1b; }
  .pr-badge-converted { background: #faf5ff; color: #6b21a8; }
  .pr-badge-active    { background: #d1fae5; color: #065f46; }
  .pr-badge-pending   { background: #fef3c7; color: #92400e; }
  .pr-badge-cancelled { background: #fee2e2; color: #991b1b; }

  /* ── Metadata grid ────────────────────────────────────────────────── */
  .pr-meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 24px;
    margin-bottom: 18px;
  }
  .pr-meta-item label {
    display: block;
    font-size: 10px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 2px;
  }
  .pr-meta-item .value { font-size: 12px; color: #111; }

  /* ── Description box ──────────────────────────────────────────────── */
  .pr-description-box {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 10px 14px;
    margin-bottom: 18px;
    font-size: 12px;
  }
  .pr-description-box strong {
    display: block;
    font-size: 10px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 4px;
  }

  /* ── Section title ────────────────────────────────────────────────── */
  .pr-section-title {
    font-size: 13px;
    font-weight: 600;
    color: #1a1a2e;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 6px;
    margin: 0 0 10px;
  }

  /* ── Line items table ─────────────────────────────────────────────── */
  .pr-line-items { width: 100%; border-collapse: collapse; font-size: 11.5px; }
  .pr-line-items thead th {
    text-align: left;
    padding: 6px 10px;
    background: #f1f5f9;
    font-size: 10px;
    font-weight: 700;
    color: #374151;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border-bottom: 2px solid #e2e8f0;
  }
  .pr-line-items tbody td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
  .pr-line-items tbody tr:last-child td { border-bottom: none; }
  .pr-line-items .num { color: #9ca3af; }

  /* ── Alert / notice boxes ─────────────────────────────────────────── */
  .pr-alert-box {
    border-radius: 6px;
    padding: 10px 14px;
    margin-top: 18px;
    font-size: 12px;
  }
  .pr-alert-box strong {
    display: block;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 4px;
  }
  .pr-alert-box--danger  { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }
  .pr-alert-box--warning { background: #fef3c7; border: 1px solid #fde68a; color: #92400e; }
  .pr-alert-box--info    { background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; }

  /* ── Document footer ──────────────────────────────────────────────── */
  .pr-footer {
    margin-top: 28px;
    padding-top: 12px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: #9ca3af;
  }
`;
