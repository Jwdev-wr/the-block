import { describe, it, expect } from 'vitest'
import { activeFilterCount, applyFilters, vehicleMatchesFilters } from './vehicle-filters'
import { makeVehicle } from './__fixtures__'
import { emptyFilterState } from '@/types/vehicle'

const cleanSuvON = makeVehicle({ id: '1', make: 'Ford', body_style: 'SUV', title_status: 'clean', province: 'Ontario', condition_grade: 4.5, current_bid: 22000, starting_bid: 15000, odometer_km: 30000, buy_now_price: 30000, reserve_price: null })
const salvageSedanBC = makeVehicle({ id: '2', make: 'Honda', body_style: 'sedan', title_status: 'salvage', province: 'British Columbia', condition_grade: 2.1, current_bid: null, starting_bid: 5000, odometer_km: 180000, buy_now_price: null, reserve_price: 8000 })
const rebuiltTruckAB = makeVehicle({ id: '3', make: 'Chevrolet', body_style: 'truck', title_status: 'rebuilt', province: 'Alberta', condition_grade: 3.0, current_bid: 14000, starting_bid: 10000, odometer_km: 95000, buy_now_price: null, reserve_price: 18000, fuel_type: 'diesel', drivetrain: '4WD' })

const list = [cleanSuvON, salvageSedanBC, rebuiltTruckAB]

describe('vehicleMatchesFilters', () => {
  it('matches everything when state is empty', () => {
    expect(vehicleMatchesFilters(cleanSuvON, emptyFilterState)).toBe(true)
  })

  it('filters by make', () => {
    expect(vehicleMatchesFilters(cleanSuvON, { ...emptyFilterState, makes: ['Ford'] })).toBe(true)
    expect(vehicleMatchesFilters(salvageSedanBC, { ...emptyFilterState, makes: ['Ford'] })).toBe(false)
  })

  it('filters by body style', () => {
    expect(applyFilters(list, { ...emptyFilterState, bodyStyles: ['truck'] })).toEqual([rebuiltTruckAB])
  })

  it('filters by title status', () => {
    expect(applyFilters(list, { ...emptyFilterState, titleStatuses: ['clean'] })).toEqual([cleanSuvON])
  })

  it('filters by province', () => {
    expect(applyFilters(list, { ...emptyFilterState, provinces: ['Alberta'] })).toEqual([rebuiltTruckAB])
  })

  it('filters by fuel type and drivetrain together', () => {
    expect(applyFilters(list, { ...emptyFilterState, fuelTypes: ['diesel'], drivetrains: ['4WD'] })).toEqual([rebuiltTruckAB])
  })

  it('filters by minimum condition grade', () => {
    expect(applyFilters(list, { ...emptyFilterState, gradeMin: 3 })).toEqual([cleanSuvON, rebuiltTruckAB])
  })

  it('filters by price range using effective current amount (current bid or starting bid)', () => {
    const out = applyFilters(list, { ...emptyFilterState, priceMin: 6000, priceMax: 15000 })
    // cleanSuvON: 22000 -> excluded. salvageSedanBC: 5000 (starting) -> excluded. rebuiltTruckAB: 14000 -> included.
    expect(out).toEqual([rebuiltTruckAB])
  })

  it('filters by odometer range', () => {
    expect(applyFilters(list, { ...emptyFilterState, odometerMin: 50000, odometerMax: 100000 })).toEqual([rebuiltTruckAB])
  })

  it('filters hasBuyNow', () => {
    expect(applyFilters(list, { ...emptyFilterState, hasBuyNow: true })).toEqual([cleanSuvON])
  })

  it('filters noReserve', () => {
    expect(applyFilters(list, { ...emptyFilterState, noReserve: true })).toEqual([cleanSuvON])
  })

  it('returns an empty list when no vehicles match', () => {
    expect(applyFilters(list, { ...emptyFilterState, makes: ['Tesla'] })).toEqual([])
  })
})

describe('activeFilterCount', () => {
  it('returns 0 for an empty state', () => {
    expect(activeFilterCount(emptyFilterState)).toBe(0)
  })

  it('counts each non-empty list filter independently', () => {
    expect(
      activeFilterCount({
        ...emptyFilterState,
        makes: ['Ford', 'Honda'],
        bodyStyles: ['SUV'],
      }),
    ).toBe(3)
  })

  it('counts price min/max together as one filter', () => {
    expect(activeFilterCount({ ...emptyFilterState, priceMin: 5000, priceMax: 30000 })).toBe(1)
  })

  it('counts odometer min/max together as one filter', () => {
    expect(activeFilterCount({ ...emptyFilterState, odometerMin: 0 })).toBe(1)
  })

  it('counts boolean toggles', () => {
    expect(activeFilterCount({ ...emptyFilterState, hasBuyNow: true, noReserve: true })).toBe(2)
  })
})
