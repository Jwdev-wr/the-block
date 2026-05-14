import { describe, it, expect } from 'vitest'
import { parseUrlState, serializeUrlState } from './url-state'
import { emptyFilterState } from '@/types/vehicle'

describe('url-state', () => {
  it('returns defaults when params are empty', () => {
    const out = parseUrlState(new URLSearchParams())
    expect(out.sort).toBe('recommended')
    expect(out.filters).toEqual(emptyFilterState)
  })

  it('round-trips a typical filter set', () => {
    const filters = {
      ...emptyFilterState,
      search: 'bronco',
      makes: ['Ford', 'Honda'],
      bodyStyles: ['SUV' as const],
      provinces: ['Ontario'],
      titleStatuses: ['clean' as const],
      fuelTypes: ['gasoline' as const],
      drivetrains: ['4WD' as const],
      transmissions: ['automatic' as const],
      gradeMin: 3,
      priceMin: 5000,
      priceMax: 30000,
      odometerMin: 0,
      odometerMax: 100000,
      hasBuyNow: true,
      noReserve: false,
    }
    const params = serializeUrlState(filters, 'bid_asc')
    const parsed = parseUrlState(new URLSearchParams(params.toString()))
    expect(parsed.sort).toBe('bid_asc')
    expect(parsed.filters).toEqual(filters)
  })

  it('omits "recommended" sort from the URL (default)', () => {
    const params = serializeUrlState(emptyFilterState, 'recommended')
    expect(params.has('sort')).toBe(false)
  })

  it('ignores invalid enum values when parsing', () => {
    const params = new URLSearchParams('title=clean,bogus&fuel=gasoline,not-a-fuel')
    const parsed = parseUrlState(params)
    expect(parsed.filters.titleStatuses).toEqual(['clean'])
    expect(parsed.filters.fuelTypes).toEqual(['gasoline'])
  })

  it('falls back to recommended for an unknown sort key', () => {
    const params = new URLSearchParams('sort=does-not-exist')
    expect(parseUrlState(params).sort).toBe('recommended')
  })
})
