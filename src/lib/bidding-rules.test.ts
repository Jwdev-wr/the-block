import { describe, it, expect } from 'vitest'
import {
  bidIncrement,
  effectiveCurrent,
  minNextBid,
  parseBidInput,
  reserveStatus,
  validateBid,
} from './bidding-rules'
import { makeVehicle } from './__fixtures__'

describe('effectiveCurrent', () => {
  it('returns current_bid when present', () => {
    expect(effectiveCurrent({ current_bid: 12000, starting_bid: 5000 })).toBe(12000)
  })

  it('falls back to starting_bid when current_bid is null', () => {
    expect(effectiveCurrent({ current_bid: null, starting_bid: 5000 })).toBe(5000)
  })
})

describe('bidIncrement', () => {
  it('uses $250 below $10,000', () => {
    expect(bidIncrement(9999)).toBe(250)
    expect(bidIncrement(0)).toBe(250)
  })

  it('uses $500 between $10,000 and $49,999', () => {
    expect(bidIncrement(10_000)).toBe(500)
    expect(bidIncrement(49_999)).toBe(500)
  })

  it('uses $1,000 at $50,000 and above', () => {
    expect(bidIncrement(50_000)).toBe(1000)
    expect(bidIncrement(120_000)).toBe(1000)
  })
})

describe('minNextBid', () => {
  it('when there is no active bid, returns the starting bid (first bid floor)', () => {
    expect(minNextBid({ current_bid: null, starting_bid: 9500 })).toBe(9500)
  })

  it('when there is an active bid, adds the tiered increment', () => {
    expect(minNextBid({ current_bid: 8500, starting_bid: 5000 })).toBe(8750)
    expect(minNextBid({ current_bid: 22000, starting_bid: 5000 })).toBe(22500)
    expect(minNextBid({ current_bid: 60000, starting_bid: 5000 })).toBe(61000)
  })
})

describe('reserveStatus', () => {
  it('returns no_reserve when reserve_price is null', () => {
    expect(reserveStatus({ reserve_price: null, current_bid: 5000, starting_bid: 4000 })).toBe('no_reserve')
  })

  it('returns reserve_not_met when current bid is below reserve', () => {
    expect(reserveStatus({ reserve_price: 20000, current_bid: 15000, starting_bid: 10000 })).toBe('reserve_not_met')
  })

  it('returns reserve_not_met when there is no current bid even if reserve exists', () => {
    expect(reserveStatus({ reserve_price: 20000, current_bid: null, starting_bid: 10000 })).toBe('reserve_not_met')
  })

  it('returns reserve_met when current bid meets or exceeds reserve', () => {
    expect(reserveStatus({ reserve_price: 20000, current_bid: 20000, starting_bid: 10000 })).toBe('reserve_met')
    expect(reserveStatus({ reserve_price: 20000, current_bid: 25000, starting_bid: 10000 })).toBe('reserve_met')
  })
})

describe('parseBidInput', () => {
  it('parses a clean integer', () => {
    expect(parseBidInput('12000')).toBe(12000)
    expect(parseBidInput('  12000  ')).toBe(12000)
  })

  it('returns null for empty / non-numeric strings', () => {
    expect(parseBidInput('')).toBeNull()
    expect(parseBidInput('  ')).toBeNull()
    expect(parseBidInput('twelve')).toBeNull()
    expect(parseBidInput('12k')).toBeNull()
  })
})

describe('validateBid', () => {
  const v = makeVehicle({ current_bid: 12000, starting_bid: 8000, buy_now_price: null })

  it('rejects blank input', () => {
    const r = validateBid(v, '   ')
    expect(r.ok).toBe(false)
  })

  it('rejects non-numeric input', () => {
    expect(validateBid(v, 'twelve')).toEqual({ ok: false, error: expect.any(String) })
  })

  it('rejects decimal input with a whole-dollar message', () => {
    const r = validateBid(v, '12500.50')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.toLowerCase()).toMatch(/whole/)
  })

  it('rejects negative input', () => {
    expect(validateBid(v, '-1000').ok).toBe(false)
  })

  it('rejects zero', () => {
    expect(validateBid(v, '0').ok).toBe(false)
  })

  it('rejects a bid equal to the current bid', () => {
    expect(validateBid(v, '12000').ok).toBe(false)
  })

  it('rejects a bid below the minimum next bid', () => {
    // current=12000, increment at 10k–50k = 500, so min next = 12500
    expect(validateBid(v, '12250').ok).toBe(false)
  })

  it('accepts the minimum next bid exactly', () => {
    expect(validateBid(v, '12500')).toEqual({ ok: true, amount: 12500 })
  })

  it('accepts a higher valid integer bid', () => {
    expect(validateBid(v, '15000')).toEqual({ ok: true, amount: 15000 })
  })

  it('uses starting bid as the floor for a vehicle with no active bid', () => {
    const fresh = makeVehicle({ current_bid: null, starting_bid: 9500 })
    expect(validateBid(fresh, '9499').ok).toBe(false)
    expect(validateBid(fresh, '9500')).toEqual({ ok: true, amount: 9500 })
  })

  it('rejects bids at or above the Buy Now price', () => {
    const withBuyNow = makeVehicle({ current_bid: 12000, starting_bid: 8000, buy_now_price: 18000 })
    const r = validateBid(withBuyNow, '18000')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.toLowerCase()).toMatch(/buy now/i)
  })

  it('allows hitting the Buy Now price exactly when allowBuyNowExact is set', () => {
    const withBuyNow = makeVehicle({ current_bid: 12000, starting_bid: 8000, buy_now_price: 18000 })
    expect(validateBid(withBuyNow, '18000', { allowBuyNowExact: true })).toEqual({ ok: true, amount: 18000 })
  })
})
