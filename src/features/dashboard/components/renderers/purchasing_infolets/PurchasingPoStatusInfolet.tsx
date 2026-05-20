import React from "react";
import { EmptyInfolet, isRecord, StatusBars } from "../infoletRenderUtils";

export const PurchasingPoStatusInfolet: React.FC<{ data: unknown }> = ({
  data,
}) => {
  const statusMap = isRecord(data) ? data : {};

  if (Object.keys(statusMap).length === 0) {
    return <EmptyInfolet message="No PO status data available." />;
  }

  return (
    <StatusBars
      data={statusMap}
      order={[
        "draft",
        "pending_approval",
        "approved",
        "ordered",
        "partially_received",
        "received",
        "cancelled",
      ]}
    />
  );
};

export default PurchasingPoStatusInfolet;
