import { describe, it, expect } from 'vitest'
import { searchVehicles, vehicleMatchesSearch } from './vehicle-search'
import { makeVehicle } from './__fixtures__'

const bronco = makeVehicle({ id: '1', make: 'Ford', model: 'Bronco', city: 'Toronto', lot: 'A-0043', vin: 'TRD7L1KS0HNB5X3K3', selling_dealership: 'King City Auto' })
const civic = makeVehicle({ id: '2', make: 'Honda', model: 'Civic', city: 'Vancouver', lot: 'A-0044', vin: 'HNDA9999X', selling_dealership: 'Burrard Auto', province: 'British Columbia' })
const f150 = makeVehicle({ id: '3', make: 'Ford', model: 'F-150', city: 'Calgary', lot: 'A-0045', vin: 'FRDF1500', selling_dealership: 'Bow Valley Cars', province: 'Alberta' })

const list = [bronco, civic, f150]

describe('vehicleMatchesSearch', () => {
  it('matches on make case-insensitively', () => {
    expect(vehicleMatchesSearch(bronco, 'ford')).toBe(true)
    expect(vehicleMatchesSearch(bronco, 'FORD')).toBe(true)
  })

  it('matches on city', () => {
    expect(vehicleMatchesSearch(civic, 'Vancouver')).toBe(true)
  })

  it('matches on VIN', () => {
    expect(vehicleMatchesSearch(bronco, 'TRD7L')).toBe(true)
  })

  it('matches on lot number', () => {
    expect(vehicleMatchesSearch(civic, 'A-0044')).toBe(true)
  })

  it('matches on selling dealership', () => {
    expect(vehicleMatchesSearch(f150, 'Bow Valley')).toBe(true)
  })

  it('matches on body style', () => {
    expect(vehicleMatchesSearch(bronco, 'suv')).toBe(true)
  })

  it('matches on year', () => {
    expect(vehicleMatchesSearch(bronco, '2023')).toBe(true)
  })

  it('trims whitespace', () => {
    expect(vehicleMatchesSearch(bronco, '  bronco  ')).toBe(true)
  })

  it('returns true for an empty query', () => {
    expect(vehicleMatchesSearch(bronco, '')).toBe(true)
    expect(vehicleMatchesSearch(bronco, '   ')).toBe(true)
  })

  it('returns false when nothing matches', () => {
    expect(vehicleMatchesSearch(bronco, 'tesla')).toBe(false)
  })
})

describe('searchVehicles', () => {
  it('returns the full list when query is empty', () => {
    expect(searchVehicles(list, '')).toHaveLength(3)
  })

  it('filters to matching vehicles', () => {
    expect(searchVehicles(list, 'ford')).toEqual([bronco, f150])
  })

  it('returns empty array when nothing matches', () => {
    expect(searchVehicles(list, 'lamborghini')).toEqual([])
  })
})
