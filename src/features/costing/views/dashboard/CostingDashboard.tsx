import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  BookOpen,
  Percent,
  Package,
  Tag,
  TrendingUp,
  BarChart3,
  ShoppingBag,
} from 'lucide-react';

const modules = [
  {
    label: 'Costing Entries',
    description: 'Manage and review cost entries for materials, labor, and overhead.',
    path: '/costing/entries',
    icon: FileText,
  },
  {
    label: 'Standard Costs',
    description: 'Define and update standard costs for products or processes.',
    path: '/costing/standard-costs',
    icon: BookOpen,
  },
  {
    label: 'Overhead Rates',
    description: 'Set and manage overhead allocation rates.',
    path: '/costing/overhead-rates',
    icon: Percent,
  },
  {
    label: 'Product Costing',
    description: 'View and analyze product cost breakdowns.',
    path: '/costing/product-costing',
    icon: Package,
  },
  {
    label: 'Product Pricing Rules',
    description: 'Manage rules for pricing products based on cost data.',
    path: '/costing/pricing-rules',
    icon: Tag,
  },
  {
    label: 'Variance Analysis',
    description: 'Analyze variances between standard and actual costs.',
    path: '/costing/variance-analysis',
    icon: TrendingUp,
  },
  {
    label: 'Reports & Analytics',
    description: 'Access costing reports, analytics, and dashboards.',
    path: '/costing/reports',
    icon: BarChart3,
  },
  {
    label: 'COGS Posting',
    description: 'Manage cost of goods sold postings and related actions.',
    path: '/costing/cogs-posting',
    icon: ShoppingBag,
  },
];

const CostingDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '30px' }}>
      <h1 style={{ marginBottom: '6px', fontSize: '1.5rem', fontWeight: 700 }}>Costing</h1>
      <p style={{ color: '#6b7280', marginBottom: '28px' }}>
        Manage costs, pricing rules, and financial analysis.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '16px',
        }}
      >
        {modules.map(({ label, description, path, icon: Icon }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '20px',
              background: 'var(--bg-secondary, #fff)',
              border: '1px solid var(--border-color, #e5e7eb)',
              borderRadius: '10px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'box-shadow 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#6366f1';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-color, #e5e7eb)';
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '8px',
                background: '#eef2ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={20} color="#6366f1" />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '4px' }}>{label}</div>
              <div style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.4 }}>{description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CostingDashboard;
