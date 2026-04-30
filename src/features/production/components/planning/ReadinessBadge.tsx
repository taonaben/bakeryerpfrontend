import React from 'react';

interface ReadinessBadgeProps {
  needBy: string;
  status?: string;
}

const ReadinessBadge: React.FC<ReadinessBadgeProps> = ({ needBy, status = 'draft' }) => {
  const needByDate = new Date(needBy);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysUntilNeeded = Math.ceil(
    (needByDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  let badgeStatus: 'ready' | 'at-risk' | 'overdue' = 'ready';
  let label = 'Ready';

  if (daysUntilNeeded < 0) {
    badgeStatus = 'overdue';
    label = `${Math.abs(daysUntilNeeded)}d Overdue`;
  } else if (daysUntilNeeded < 3) {
    badgeStatus = 'at-risk';
    label = `${daysUntilNeeded}d Left`;
  } else {
    label = `${daysUntilNeeded}d Left`;
  }

  return (
    <div
      className={`readiness-badge readiness-badge--${badgeStatus}`}
      title={`Need by: ${needByDate.toLocaleDateString('en-GB')}`}
      data-status={status}
    >
      {label}
    </div>
  );
};

export default ReadinessBadge;
