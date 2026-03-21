export function getNotificationFilterOptions(counts: {
  total: number;
  unread: number;
  alert: number;
  deal: number;
  report: number;
  system: number;
}) {
  return [
    { value: "all", label: `All notifications (${counts.total})` },
    { value: "unread", label: `Unread (${counts.unread})` },
    { value: "alert", label: `Alerts (${counts.alert})` },
    { value: "deal", label: `Deals (${counts.deal})` },
    { value: "report", label: `Reports (${counts.report})` },
    { value: "system", label: `System (${counts.system})` },
  ];
}
