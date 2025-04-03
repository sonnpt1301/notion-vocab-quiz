export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  KEYWORD_CHECK: 'keyword_check',
  SYNONYM: 'synonym',
  MATCHING: 'matching',
  FILL_IN_BLANK: 'fill_in_blank',
} as const;

export const TIME_OPTIONS = [
  'All words',
  'Today',
  'Yesterday',
  'Last 7 days',
  'Last 30 days',
  'Specific date',
  'Export to CSV',
  'Exit',
] as const;
