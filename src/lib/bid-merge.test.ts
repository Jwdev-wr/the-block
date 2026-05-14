import { describe, it, expect } from 'vitest'
import { applyOverride, mergeOverrides } from './bid-merge'
import { makeVehicle } from './__fixtures__'

describe('applyOverride', () => {
  it('returns the original vehicle when no override is provided', () => {
    const v = makeVehicle()
    expect(applyOverride(v, undefined)).toBe(v)
  })

  it('overrides current_bid and bid_count only', () => {
    const v = makeVehicle({ id: 'x', current_bid: 12000, bid_count: 5, condition_grade: 4.2 })
    const out = applyOverride(v, {
      vehicleId: 'x',
      current_bid: 14000,
      bid_count: 6,
      bought_now: false,
      last_bid_at: '2026-05-14T10:00:00.000Z',
    })
    expect(out.current_bid).toBe(14000)
    expect(out.bid_count).toBe(6)
    expect(out.condition_grade).toBe(4.2)
  })
})

describe('mergeOverrides', () => {
  it('is a no-op when overrides is empty', () => {
    const list = [makeVehicle({ id: 'a' }), makeVehicle({ id: 'b' })]
    expect(mergeOverrides(list, {})).toBe(list)
  })

  it('only merges vehicles that have a matching override', () => {
    const a = makeVehicle({ id: 'a', current_bid: 1000, bid_count: 1 })
    const b = makeVehicle({ id: 'b', current_bid: 2000, bid_count: 2 })
    const out = mergeOverrides([a, b], {
      b: { vehicleId: 'b', current_bid: 3000, bid_count: 3, bought_now: false, last_bid_at: '' },
    })
    expect(out[0]).toBe(a)
    expect(out[1].current_bid).toBe(3000)
    expect(out[1].bid_count).toBe(3)
  })
})
