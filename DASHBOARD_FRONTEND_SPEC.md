# Dashboard Frontend Implementation Spec

## Overview

Build a customizable dashboard using **infolets** (widget cards) that users can add, remove, rearrange, and resize. The backend provides 30+ pre-built widgets pulling data from existing summary endpoints across all modules (Production, Inventory, Purchasing, Sales, Costing, Finance).

---

## 1. API Endpoints

### Base URL
All endpoints are under `/dashboard/`

### 1.1 Get Available Widgets
**`GET /dashboard/widgets/`**

Returns the full widget registry — every widget type the user can add to their dashboard.

**Auth:** Required (JWT token)

**Response:** `200 OK`
```json
{
  "production_wip": {
    "label": "WIP Orders",
    "description": "Number of production orders currently in progress.",
    "module": "Production",
    "endpoint": "/production/overview/summary",
    "dataPath": "wip_order_count",
    "width": "half"
  },
  "inventory_low_stock": {
    "label": "Low Stock Alerts",
    "description": "Top products with critically low stock levels.",
    "module": "Inventory",
    "endpoint": "/inventory/overview/summary",
    "dataPath": "top_low_stock_products",
    "width": "full"
  },
  "sales_revenue": {
    "label": "Daily Revenue",
    "description": "Total sales revenue for today.",
    "module": "Sales",
    "endpoint": "/sales/reports/daily-summary",
    "dataPath": "total_revenue",
    "width": "half"
  }
  // ... 27 more widgets
}
```

**Field Guide:**
- `label` — Display name for the widget
- `description` — Tooltip/help text
- `module` — Category/grouping (use for filtering in "Add Widget" picker)
- `endpoint` — Backend URL to fetch widget data from
- `dataPath` — JSON path into the endpoint response to extract this widget's data
  - If `null`, use the full response
  - If a string like `"wip_order_count"`, extract `response.wip_order_count`
  - If nested like `"waste.waste_rate"`, extract `response.waste.waste_rate`
- `width` — Default width: `"half"` (50% grid width) or `"full"` (100% grid width)

---

### 1.2 Get User Layout
**`GET /dashboard/layout/`**

Returns the user's saved dashboard layout. If the user has never customized their dashboard, returns a default layout with 8 starter widgets.

**Auth:** Required

**Response:** `200 OK`
```json
[
  {
    "widget_key": "production_wip",
    "position": 0,
    "is_visible": true,
    "width": "half"
  },
  {
    "widget_key": "inventory_low_stock",
    "position": 1,
    "is_visible": true,
    "width": "full"
  },
  {
    "widget_key": "sales_revenue",
    "position": 2,
    "is_visible": true,
    "width": "half"
  }
  // ...
]
```

**Field Guide:**
- `widget_key` — Matches a key in the registry from `GET /dashboard/widgets/`
- `position` — 0-indexed sort order (determines grid placement)
- `is_visible` — Whether to show this widget (use for "hide" vs. "remove" UX)
- `width` — User's preferred width override (`"half"` | `"full"`)

---

### 1.3 Save User Layout
**`PUT /dashboard/layout/`**

Saves the entire dashboard layout in one shot. Replaces all existing widgets.

**Auth:** Required

**Request Body:** Array of widget objects
```json
[
  {
    "widget_key": "production_wip",
    "position": 0,
    "is_visible": true,
    "width": "half"
  },
  {
    "widget_key": "finance_net_profit",
    "position": 1,
    "is_visible": false,
    "width": "half"
  }
]
```

**Validation Rules:**
- All `widget_key` values must exist in the registry
- Positions must be unique (no duplicates)
- Positions can have gaps (e.g., [0, 2, 5]) — backend doesn't care
- Empty array is valid (clears dashboard)

**Response:** `200 OK` — returns the saved layout (same format as GET)

**Error Response:** `400 Bad Request`
```json
{
  "layout": [
    "Unknown widget_key: 'invalid_widget_name'"
  ]
}
```

---

## 2. Data Flow

### Page Load
```
1. GET /dashboard/widgets/     → Build widget registry (metadata for picker)
2. GET /dashboard/layout/      → Get user's active layout
3. For each widget in layout:
   - Look up widget in registry to get its endpoint + dataPath
   - GET {endpoint}             → Fetch widget data
   - Extract data using dataPath
   - Render widget card
```

### Add Widget
```
1. User clicks "Add Widget"
2. Show picker (modal/drawer) listing all widgets from registry
   - Group by module (Production, Inventory, etc.)
   - Show label + description
3. User selects a widget
4. Append to layout array with next available position
5. PUT /dashboard/layout/      → Save updated layout
6. Fetch data for new widget and render it
```

### Remove Widget
```
1. User clicks "Remove" on widget
2. Remove from layout array
3. PUT /dashboard/layout/      → Save updated layout
```

### Reorder Widgets (Drag & Drop)
```
1. User drags widget to new position
2. Re-index all widgets' position values (0, 1, 2, 3...)
3. PUT /dashboard/layout/      → Save updated layout
```

### Resize Widget
```
1. User clicks resize button (half ↔ full width toggle)
2. Update widget's width field
3. PUT /dashboard/layout/      → Save updated layout
```

### Hide/Show Widget
```
Option A (Keep in layout, just hidden):
  - Toggle is_visible field
  - PUT /dashboard/layout/
  
Option B (Remove completely):
  - Same as "Remove Widget" flow
```

---

## 3. Widget Data Fetching

### Strategy: One Request Per Endpoint

**Problem:** Multiple widgets may share the same endpoint (e.g., 4 widgets all use `/production/overview/summary` but extract different fields).

**Solution:** De-duplicate endpoint requests. Make one request per unique endpoint, then fan out the response to all widgets that need it.

**Example:**
```javascript
// User has these 4 widgets active:
[
  { widget_key: "production_wip",     endpoint: "/production/overview/summary", dataPath: "wip_order_count" },
  { widget_key: "production_waste",   endpoint: "/production/overview/summary", dataPath: "waste" },
  { widget_key: "inventory_low_stock",endpoint: "/inventory/overview/summary", dataPath: "top_low_stock_products" },
  { widget_key: "sales_revenue",      endpoint: "/sales/reports/daily-summary", dataPath: "total_revenue" }
]

// Make only 3 HTTP requests:
GET /production/overview/summary  → response shared by production_wip + production_waste
GET /inventory/overview/summary   → response used by inventory_low_stock
GET /sales/reports/daily-summary  → response used by sales_revenue

// Extract data per widget:
production_wip.data     = response1.wip_order_count
production_waste.data   = response1.waste
inventory_low_stock.data= response2.top_low_stock_products
sales_revenue.data      = response3.total_revenue
```

---

### Extracting Data via `dataPath`

**Null dataPath** → Use full response
```javascript
if (widget.dataPath === null) {
  widgetData = response;
}
```

**Simple path** → Direct property access
```javascript
// dataPath: "wip_order_count"
widgetData = response["wip_order_count"];
// or: widgetData = response.wip_order_count;
```

**Nested path** → Dot notation
```javascript
// dataPath: "waste.waste_rate"
widgetData = response.waste?.waste_rate;
// or use lodash: _.get(response, "waste.waste_rate")
```

**Array indexing** (if needed later)
```javascript
// dataPath: "top_products_produced[0].product_name"
// Use lodash _.get() or custom path resolver
```

---

## 4. UI Components

### 4.1 Dashboard Grid Layout

**Requirements:**
- 2-column responsive grid (desktop)
- 1-column on mobile
- Widgets flow top-to-bottom, left-to-right based on `position` field
- `width: "half"` → 50% width (1 column)
- `width: "full"` → 100% width (2 columns)
- Drag-and-drop reordering
- Auto-reflow when widgets are added/removed

**Suggested Libraries:**
- `react-grid-layout` (if React)
- `vue-grid-layout` (if Vue)
- `gridstack.js` (framework-agnostic)

---

### 4.2 Widget Card Component

**Base Structure:**
```
┌─────────────────────────────────┐
│ [Icon] Widget Label        [⋮]  │  ← Header (title + menu)
├─────────────────────────────────┤
│                                 │
│        Widget Content           │  ← Dynamic content area
│      (chart, table, metric)     │
│                                 │
└─────────────────────────────────┘
```

**Header Actions (⋮ menu):**
- Resize (Toggle Half ↔ Full)
- Hide (set `is_visible: false`)
- Remove (delete from layout)
- Refresh Data (re-fetch endpoint)

**Content Area:**
Render based on widget data type:
- **Single metric:** Large number + label (e.g., "142" for WIP count)
- **Object with multiple fields:** Mini table or key-value list
- **Array:** Data table or list
- **Time series:** Line/bar chart
- **Status breakdown:** Pie/donut chart or progress bars

---

### 4.3 Add Widget Picker

**UI:**
- Modal or slide-out drawer
- Search bar (filter by label/description)
- Group widgets by `module` (collapsible sections)
- Show: Icon + Label + Description
- Disable widgets already on dashboard (or show "Already added")

**On Select:**
- Calculate next `position` value (max position + 1)
- Add widget to layout array
- Save via `PUT /dashboard/layout/`
- Fetch data and render immediately

---

### 4.4 Empty State

When user has removed all widgets:
```
┌────────────────────────────────┐
│                                │
│   📊  Your dashboard is empty  │
│                                │
│   [+ Add Your First Widget]    │
│                                │
└────────────────────────────────┘
```

---

### 4.5 Loading States

**On initial page load:**
- Show skeleton cards in grid while fetching layout + widget data

**When adding/removing widgets:**
- Optimistic UI: Update grid immediately, show spinner on new widget until data loads
- On save error: Rollback UI to previous state, show toast notification

**Widget-level loading:**
- Each widget card shows spinner while its endpoint loads
- On error: Show error state in card ("Failed to load • Retry")

---

## 5. Implementation Steps

### Phase 1: Core Dashboard (MVP)
1. **Dashboard page shell**
   - Create route `/dashboard`
   - Fetch widget registry (`GET /dashboard/widgets/`) on mount
   - Store registry in state/context

2. **Fetch & render user layout**
   - `GET /dashboard/layout/`
   - Map layout → grid of widget cards
   - Deduplicate endpoint requests
   - Render each widget with fetched data

3. **Widget card component**
   - Header (label + menu)
   - Dynamic content area (start with simple JSON dump)
   - Loading/error states

4. **Add widget picker**
   - Modal with widget list grouped by module
   - Add widget → update layout → `PUT /dashboard/layout/`

5. **Remove widget**
   - Menu action → remove from layout → `PUT /dashboard/layout/`

### Phase 2: Interactions
6. **Drag-and-drop reordering**
   - Integrate grid layout library
   - On drop → re-index positions → `PUT /dashboard/layout/`

7. **Resize widget**
   - Toggle half ↔ full width
   - Update layout → `PUT /dashboard/layout/`

8. **Hide/show widgets**
   - Toggle `is_visible` field
   - Option to "restore hidden widgets" (show settings panel)

### Phase 3: Polish
9. **Widget-specific renderers**
   - Create dedicated components for common data shapes:
     - `MetricCard` (single number)
     - `StatusBreakdownCard` (pie chart)
     - `ListCard` (top N items)
     - `TrendCard` (line chart)
   - Map widget types to renderers

10. **Auto-refresh**
    - Poll endpoints every N seconds (configurable per widget)
    - Show "Last updated: 2m ago" timestamp

11. **Error handling**
    - Graceful degradation when endpoint fails
    - Retry button on widget cards

12. **Responsive design**
    - 2-column grid → 1-column on mobile
    - Force all widgets to `width: "full"` on small screens

---

## 6. State Management

**Suggested Structure:**
```javascript
// Global state (React Context / Vuex / Pinia)
{
  registry: {
    // Key-value map of all available widgets
    production_wip: { label: "WIP Orders", endpoint: "/production/...", ... },
    sales_revenue: { label: "Daily Revenue", ... },
    // ...
  },
  
  layout: [
    // User's active widgets
    { widget_key: "production_wip", position: 0, is_visible: true, width: "half" },
    { widget_key: "sales_revenue", position: 1, is_visible: true, width: "half" },
  ],
  
  widgetData: {
    // Cached endpoint responses
    "/production/overview/summary": { wip_order_count: 12, waste: { ... }, ... },
    "/sales/reports/daily-summary": { total_revenue: 45000, ... },
  },
  
  loading: {
    layout: false,
    registry: false,
    endpoints: {
      "/production/overview/summary": false,
      "/sales/reports/daily-summary": true,  // Currently loading
    }
  },
  
  errors: {
    "/production/overview/summary": null,
    "/sales/reports/daily-summary": "Network timeout",
  }
}
```

---

## 7. Available Widgets (30 total)

### Production (7 widgets)
| Key | Label | Endpoint | Data Type |
|-----|-------|----------|-----------|
| `production_wip` | WIP Orders | `/production/overview/summary` | Number |
| `production_orders_status` | Production Order Status | `/production/overview/summary` | Object (counts by status) |
| `production_waste` | Waste & Yield | `/production/overview/summary` | Object (quantity + rate) |
| `production_output` | Output vs Target | `/production/overview/summary` | Object (expected vs actual) |
| `production_top_products` | Top Products Produced | `/production/overview/summary` | Array of products |
| `production_yield_trends` | Yield Trends | `/production/overview/yield-trends` | Time series |
| `production_schedule` | Schedule Adherence | `/production/overview/schedule-adherence` | Object |

### Inventory (6 widgets)
| Key | Label | Endpoint | Data Type |
|-----|-------|----------|-----------|
| `inventory_stock_status` | Stock Status | `/inventory/overview/summary` | Object (counts by status) |
| `inventory_low_stock` | Low Stock Alerts | `/inventory/overview/summary` | Array of products |
| `inventory_expiring` | Expiring Batches | `/inventory/overview/summary` | Object (7/14/30 day counts) |
| `inventory_expired` | Expired Inventory | `/inventory/overview/summary` | Object (count + quantity) |
| `inventory_alerts` | Inventory Alerts | `/inventory/overview/summary` | Object (alerts by type) |
| `inventory_movement` | Stock Movement Trends | `/inventory/overview/movement-trends` | Time series |

### Purchasing (6 widgets)
| Key | Label | Endpoint | Data Type |
|-----|-------|----------|-----------|
| `po_status` | Purchase Order Status | `/purchasing/overview/summary` | Object (counts by status) |
| `open_po_value` | Open PO Value | `/purchasing/overview/summary` | Number (currency) |
| `overdue_pos` | Overdue Purchase Orders | `/purchasing/overview/summary` | Object (count + value) |
| `pending_approvals` | Pending Approvals | `/purchasing/overview/summary` | Object (approvals by type) |
| `supplier_risk` | Supplier Health | `/purchasing/overview/summary` | Object (risk metrics) |
| `purchasing_trends` | Purchasing Trends | `/purchasing/overview/trends` | Time series |

### Sales (4 widgets)
| Key | Label | Endpoint | Data Type |
|-----|-------|----------|-----------|
| `sales_revenue` | Daily Revenue | `/sales/reports/daily-summary` | Number (currency) |
| `sales_gross_profit` | Daily Gross Profit | `/sales/reports/daily-summary` | Number (currency) |
| `sales_transactions` | Transactions Today | `/sales/reports/daily-summary` | Number |
| `sales_cogs` | Daily COGS | `/sales/reports/daily-summary` | Number (currency) |

### Costing (3 widgets)
| Key | Label | Endpoint | Data Type |
|-----|-------|----------|-----------|
| `cost_variance_summary` | Cost Variance Summary | `/costing/reports/variance-analysis` | Array of variances |
| `adverse_variances` | Adverse Variances | `/costing/reports/variance-analysis` | Derived from array |
| `costing_margin` | Product Margins | `/costing/reports/margin-report` | Array of products |

### Finance (5 widgets)
| Key | Label | Endpoint | Data Type |
|-----|-------|----------|-----------|
| `finance_net_profit` | Net Profit | `/finance/reports/income-statement` | Number (currency) |
| `finance_gross_profit` | Gross Profit | `/finance/reports/income-statement` | Number (currency) |
| `finance_revenue` | Total Revenue | `/finance/reports/income-statement` | Number (currency) |
| `finance_expenses` | Operating Expenses | `/finance/reports/income-statement` | Number (currency) |
| `finance_pnl` | P&L Summary | `/finance/reports/income-statement` | Full object |

---

## 8. Example API Calls

### Fetch Registry
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/dashboard/widgets/
```

### Get User Layout
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/dashboard/layout/
```

### Save Layout
```bash
curl -X PUT \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '[
    {"widget_key": "production_wip", "position": 0, "is_visible": true, "width": "half"},
    {"widget_key": "sales_revenue", "position": 1, "is_visible": true, "width": "half"}
  ]' \
  http://localhost:8000/dashboard/layout/
```

### Fetch Widget Data (Example: Production Summary)
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/production/overview/summary

# Response (example):
{
  "as_of_date": "2026-05-19",
  "wip_order_count": 12,
  "waste": {
    "waste_quantity": 45.5,
    "waste_rate": 0.023
  },
  "production_order_counts_by_status": {
    "scheduled": 8,
    "in_progress": 12,
    "completed": 156,
    "cancelled": 2
  },
  ...
}

# Extract for widgets:
# production_wip → response.wip_order_count = 12
# production_waste → response.waste = { waste_quantity: 45.5, waste_rate: 0.023 }
```

---

## 9. Design Considerations

### Performance
- **Parallel endpoint fetching:** Use `Promise.all()` to fetch all unique endpoints concurrently
- **Cache responses:** Store endpoint data for 30-60 seconds, refresh on user action or auto-refresh timer
- **Lazy load off-screen widgets:** Only fetch data for widgets in viewport (use Intersection Observer)

### UX
- **Debounce saves:** When dragging widgets, don't `PUT` on every pixel move — debounce to 500ms after drag ends
- **Optimistic updates:** Update UI immediately on add/remove/reorder, rollback on server error
- **Skeleton loading:** Show grid with skeleton cards while layout + data load

### Accessibility
- **Keyboard navigation:** Support tab/arrow keys for widget picker
- **Screen reader:** Announce widget additions/removals
- **Focus management:** Return focus to trigger button after closing picker modal

### Mobile
- **Single column:** Force all widgets to `width: "full"` on screens < 768px
- **Touch-friendly drag:** Larger drag handles, tap-to-reorder option
- **Collapsible widgets:** Option to collapse widget to header-only on mobile

---

## 10. Future Enhancements (Out of Scope for V1)

- **Custom widget builder:** Let users create their own widgets with custom queries
- **Dashboard templates:** Pre-built layouts for different roles (Manager, Operator, Finance)
- **Widget refresh intervals:** Per-widget auto-refresh settings
- **Export dashboard:** Save as PDF / email scheduled snapshots
- **Widget drill-down:** Click metric to navigate to detailed report
- **Dark mode:** Respect system/user theme preference
- **Widget annotations:** Add notes/comments to specific widgets
- **Multi-dashboard:** Allow users to create multiple named dashboards

---

## Questions for Frontend Team

1. **Framework/Stack:** React, Vue, Angular, or something else?
2. **Grid library:** Do you have a preference for drag-and-drop grid? (react-grid-layout, gridstack.js, etc.)
3. **Chart library:** What are you using for data visualization? (Chart.js, D3, Recharts, etc.)
4. **Date ranges:** Should widgets support date filters (e.g., "Sales Revenue: Last 7 Days" vs. "Today")? This would require query params on endpoints.
5. **Real-time updates:** Do you want WebSocket support for live data, or is periodic polling sufficient?
6. **Widget persistence per company:** Should all users in a company share the same default layout, or is it strictly per-user?

---

## Contact

For backend API questions or to request new widgets/endpoints:
- Check `/api/schema/swagger-ui/` for live API docs
- Dashboard endpoints are under the `dashboard` tag
- All widget data endpoints already exist and are documented under their respective module tags
