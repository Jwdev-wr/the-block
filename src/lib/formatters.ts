/**
 * Pure formatting helpers. Locale is fixed to en-CA to match the Canadian
 * province data in the dataset and to keep tests deterministic.
 */

const currencyFormatter = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const odometerFormatter = new Intl.NumberFormat('en-CA', {
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const shortDateFormatter = new Intl.DateTimeFormat('en-CA', {
  dateStyle: 'medium',
})

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return '—'
  return currencyFormatter.format(amount)
}

export function formatOdometer(km: number | null | undefined): string {
  if (km === null || km === undefined || Number.isNaN(km)) return '—'
  return `${odometerFormatter.format(km)} km`
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return dateFormatter.format(d)
}

export function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return shortDateFormatter.format(d)
}

export function formatGrade(grade: number | null | undefined): string {
  if (grade === null || grade === undefined || Number.isNaN(grade)) return '—'
  return grade.toFixed(1)
}

export function vehicleTitle(v: {
  year: number
  make: string
  model: string
  trim?: string
}): string {
  return [v.year, v.make, v.model, v.trim].filter(Boolean).join(' ')
}
