/** Maps DB enum values (e.g. 'first_meeting') to display names (e.g. 'First Meeting') */
export const PIPELINE_STAGE_DISPLAY_NAMES: Record<string, string> = {
  sourced: 'Sourced',
  first_meeting: 'First Meeting',
  due_diligence: 'Due Diligence',
  term_sheet: 'Term Sheet',
  closed: 'Closed',
};

/** Maps display names back to DB enum values */
export const PIPELINE_STAGE_API_VALUES: Record<string, string> = Object.fromEntries(
  Object.entries(PIPELINE_STAGE_DISPLAY_NAMES).map(([k, v]) => [v, k])
);

export const PIPELINE_DEAL_OUTCOMES = [
  'active',
  'won',
  'lost',
  'withdrawn',
  'passed',
] as const;
