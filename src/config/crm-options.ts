export const CONTACT_ROLE_FILTER_OPTIONS = [
  { value: "all", label: "All Roles" },
  { value: "founder", label: "Founders" },
  { value: "ceo", label: "CEOs" },
  { value: "investor", label: "Investors" },
  { value: "advisor", label: "Advisors" },
];

export const INTERACTION_GROUP_BY_OPTIONS = [
  { value: "date", label: "Group by Date" },
  { value: "type", label: "Group by Type" },
];

export function getInteractionTypeFilterOptions(counts: {
  all: number;
  email: number;
  call: number;
  meeting: number;
  note: number;
}) {
  return [
    { value: "all", label: `All Types (${counts.all})` },
    { value: "email", label: `Emails (${counts.email})` },
    { value: "call", label: `Calls (${counts.call})` },
    { value: "meeting", label: `Meetings (${counts.meeting})` },
    { value: "note", label: `Notes (${counts.note})` },
  ];
}
