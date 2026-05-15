import React from 'react';
import {
  BarChart3,
  FileSpreadsheet,
  Landmark,
  Scale,
} from 'lucide-react';

export type FinanceReportType =
  | 'trial_balance'
  | 'income_statement'
  | 'balance_sheet'
  | 'ar_aging'
  | 'ap_aging';

interface ReportSelectorCardsProps {
  activeReport: FinanceReportType | null;
  isLoading: boolean;
  onGenerate: (report: FinanceReportType) => void;
}

const ReportSelectorCards: React.FC<ReportSelectorCardsProps> = ({
  activeReport,
  isLoading,
  onGenerate,
}) => (
  <div className="finance-report-card-grid">
    <ReportCard
      icon={<Scale size={22} />}
      title="Trial Balance"
      description="Audit debits, credits, balances, and normal balance by account."
      active={activeReport === 'trial_balance'}
      isLoading={isLoading && activeReport === 'trial_balance'}
      onGenerate={() => onGenerate('trial_balance')}
    />
    <ReportCard
      icon={<BarChart3 size={22} />}
      title="Income Statement"
      description="Review revenue, cost of sales, expenses, and net profit."
      active={activeReport === 'income_statement'}
      isLoading={isLoading && activeReport === 'income_statement'}
      onGenerate={() => onGenerate('income_statement')}
    />
    <ReportCard
      icon={<Landmark size={22} />}
      title="Balance Sheet"
      description="Compare assets against liabilities and equity as of a date."
      active={activeReport === 'balance_sheet'}
      isLoading={isLoading && activeReport === 'balance_sheet'}
      onGenerate={() => onGenerate('balance_sheet')}
    />
    <div className={`finance-report-card ${(activeReport === 'ar_aging' || activeReport === 'ap_aging') ? 'finance-report-card--active' : ''}`}>
      <div className="finance-report-card__icon">
        <FileSpreadsheet size={22} />
      </div>
      <div>
        <h3>AR Aging / AP Aging</h3>
        <p>Track customer and supplier balances by overdue age bucket.</p>
      </div>
      <div className="finance-report-card__split-actions">
        <button
          type="button"
          className="btn btn-primary"
          disabled={isLoading}
          onClick={() => onGenerate('ar_aging')}
        >
          {isLoading && activeReport === 'ar_aging' ? 'Generating...' : 'Generate AR Aging'}
        </button>
        <button
          type="button"
          className="btn btn-outline"
          disabled={isLoading}
          onClick={() => onGenerate('ap_aging')}
        >
          {isLoading && activeReport === 'ap_aging' ? 'Generating...' : 'Generate AP Aging'}
        </button>
      </div>
    </div>
  </div>
);

interface ReportCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  active: boolean;
  isLoading: boolean;
  onGenerate: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({
  icon,
  title,
  description,
  active,
  isLoading,
  onGenerate,
}) => (
  <div className={`finance-report-card ${active ? 'finance-report-card--active' : ''}`}>
    <div className="finance-report-card__icon">{icon}</div>
    <div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
    <button type="button" className="btn btn-primary" disabled={isLoading} onClick={onGenerate}>
      {isLoading ? 'Generating...' : 'Generate'}
    </button>
  </div>
);

export default ReportSelectorCards;
