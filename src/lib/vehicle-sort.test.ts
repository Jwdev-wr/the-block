import { describe, it, expect } from 'vitest'
import { sortVehicles } from './vehicle-sort'
import { makeVehicle } from './__fixtures__'

describe('sortVehicles', () => {
  const a = makeVehicle({ id: 'a', current_bid: 20000, starting_bid: 10000, condition_grade: 4.5, year: 2024, odometer_km: 50000, auction_start: '2026-04-10T00:00:00' })
  const b = makeVehicle({ id: 'b', current_bid: null, starting_bid: 9000, condition_grade: 4.2, year: 2025, odometer_km: 25000, auction_start: '2026-04-01T00:00:00' })
  const c = makeVehicle({ id: 'c', current_bid: 15000, starting_bid: 12000, condition_grade: 3.0, year: 2020, odometer_km: 120000, auction_start: '2026-05-01T00:00:00' })
  const list = [b, a, c]

  it('recommended: active bids first, then higher grade, then newer year, then lower odo', () => {
    const out = sortVehicles(list, 'recommended').map((v) => v.id)
    // a (active, grade 4.5) > c (active, grade 3.0) > b (no active bid, lower priority)
    expect(out).toEqual(['a', 'c', 'b'])
  })

  it('bid_asc uses effective current (starting_bid when no current_bid)', () => {
    const out = sortVehicles(list, 'bid_asc').map((v) => v.id)
    // b=9000, c=15000, a=20000
    expect(out).toEqual(['b', 'c', 'a'])
  })

  it('bid_desc reverses bid_asc', () => {
    const out = sortVehicles(list, 'bid_desc').map((v) => v.id)
    expect(out).toEqual(['a', 'c', 'b'])
  })

  it('year_desc: newer first', () => {
    const out = sortVehicles(list, 'year_desc').map((v) => v.id)
    expect(out).toEqual(['b', 'a', 'c'])
  })

  it('odometer_asc: lower mileage first', () => {
    const out = sortVehicles(list, 'odometer_asc').map((v) => v.id)
    expect(out).toEqual(['b', 'a', 'c'])
  })

  it('grade_desc: higher grade first', () => {
    const out = sortVehicles(list, 'grade_desc').map((v) => v.id)
    expect(out).toEqual(['a', 'b', 'c'])
  })

  it('auction_soonest: earliest start first', () => {
    const out = sortVehicles(list, 'auction_soonest').map((v) => v.id)
    expect(out).toEqual(['b', 'a', 'c'])
  })

  it('does not mutate the input array', () => {
    const before = list.map((v) => v.id)
    sortVehicles(list, 'bid_asc')
    expect(list.map((v) => v.id)).toEqual(before)
  })
})
