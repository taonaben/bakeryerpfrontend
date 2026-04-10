import React from 'react';
import { Plus, CheckCircle } from 'lucide-react';
import Button from '../../../components/ui/Button';
import './ActionButtons.css';

const ActionButtons = ({
    activeTab,
    onOpenMovementModal,
    onQualityAudit
}) => {
    // Define actions per tab for easy extension
    const tabActions = {
        balances: [
            {
                id: 'add-stock',
                label: 'Add Stock',
                icon: Plus,
                onClick: onOpenMovementModal,
                variant: 'primary'
            }
        ],
        batches: [
            {
                id: 'quality-audit',
                label: 'Quality Audit',
                icon: CheckCircle,
                onClick: onQualityAudit,
                variant: 'primary'
            }
        ]
    };

    const actions = tabActions[activeTab] || [];

    if (actions.length === 0) {
        return null;
    }

    return (
        <div className="action-buttons">
            {actions.map(action => {
                const IconComponent = action.icon;
                return (
                    <Button
                        key={action.id}
                        variant={action.variant}
                        onClick={action.onClick}
                        aria-label={action.label}
                    >
                        <IconComponent size={18} /> {action.label}
                    </Button>
                );
            })}
        </div>
    );
};

export default ActionButtons;
