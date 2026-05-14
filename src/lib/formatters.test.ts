import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatDate,
  formatGrade,
  formatOdometer,
  formatShortDate,
  vehicleTitle,
} from './formatters'

describe('formatCurrency', () => {
  it('formats an integer dollar amount as CAD with no fraction digits', () => {
    expect(formatCurrency(12500)).toMatch(/\$12,500/)
  })

  it('returns an em-dash for null / undefined / NaN', () => {
    expect(formatCurrency(null)).toBe('—')
    expect(formatCurrency(undefined)).toBe('—')
    expect(formatCurrency(NaN)).toBe('—')
  })

  it('formats zero', () => {
    expect(formatCurrency(0)).toMatch(/\$0/)
  })
})

describe('formatOdometer', () => {
  it('appends " km" with thousands separator', () => {
    expect(formatOdometer(143092)).toMatch(/143,092 km/)
  })

  it('falls back to em-dash on missing data', () => {
    expect(formatOdometer(null)).toBe('—')
    expect(formatOdometer(undefined)).toBe('—')
  })
})

describe('formatDate', () => {
  it('produces a non-empty localized string for a valid ISO date', () => {
    const out = formatDate('2026-04-05T14:00:00')
    expect(out).not.toBe('—')
    expect(out.length).toBeGreaterThan(4)
  })

  it('returns em-dash for empty or invalid input', () => {
    expect(formatDate(null)).toBe('—')
    expect(formatDate('')).toBe('—')
    expect(formatDate('not-a-date')).toBe('—')
  })

  it('short form does not include time', () => {
    const out = formatShortDate('2026-04-05T14:00:00')
    expect(out).not.toMatch(/:/)
  })
})

describe('formatGrade', () => {
  it('shows one decimal', () => {
    expect(formatGrade(3.8)).toBe('3.8')
    expect(formatGrade(5)).toBe('5.0')
  })

  it('handles missing values', () => {
    expect(formatGrade(null)).toBe('—')
    expect(formatGrade(undefined)).toBe('—')
  })
})

describe('vehicleTitle', () => {
  it('joins year/make/model/trim with single spaces', () => {
    expect(vehicleTitle({ year: 2023, make: 'Ford', model: 'Bronco', trim: 'Big Bend' })).toBe(
      '2023 Ford Bronco Big Bend',
    )
  })

  it('omits a missing trim cleanly', () => {
    expect(vehicleTitle({ year: 2023, make: 'Ford', model: 'Bronco' })).toBe('2023 Ford Bronco')
  })
})
