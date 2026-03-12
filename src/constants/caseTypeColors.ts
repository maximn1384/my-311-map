export const CASE_TYPE_COLORS: Record<number, string> = {
  1: '#0078d4', // Question  — Fluent blue
  2: '#d13438', // Problem   — red
  3: '#107c10', // Request   — green
}

export const CASE_TYPE_LABELS: Record<number, string> = {
  1: 'Question',
  2: 'Problem',
  3: 'Request',
}

export const DEFAULT_CASE_COLOR = '#8a8886' // Unknown — neutral grey

export function getCaseTypeColor(casetypecode: number | null): string {
  if (casetypecode === null) return DEFAULT_CASE_COLOR
  return CASE_TYPE_COLORS[casetypecode] ?? DEFAULT_CASE_COLOR
}

export function getCaseTypeLabel(casetypecode: number | null): string {
  if (casetypecode === null) return 'Unknown'
  return CASE_TYPE_LABELS[casetypecode] ?? 'Unknown'
}
