import type { Vehicle, FilterState } from '@/types/vehicle'
import { effectiveCurrent } from '@/lib/bidding-rules'

export function vehicleMatchesFilters(v: Vehicle, f: FilterState): boolean {
  if (f.makes.length && !f.makes.includes(v.make)) return false
  if (f.bodyStyles.length && !f.bodyStyles.includes(v.body_style)) return false
  if (f.provinces.length && !f.provinces.includes(v.province)) return false
  if (f.titleStatuses.length && !f.titleStatuses.includes(v.title_status)) return false
  if (f.fuelTypes.length && !f.fuelTypes.includes(v.fuel_type)) return false
  if (f.drivetrains.length && !f.drivetrains.includes(v.drivetrain)) return false
  if (f.transmissions.length && !f.transmissions.includes(v.transmission)) return false
  if (f.gradeMin !== null && v.condition_grade < f.gradeMin) return false

  const price = effectiveCurrent(v)
  if (f.priceMin !== null && price < f.priceMin) return false
  if (f.priceMax !== null && price > f.priceMax) return false

  if (f.odometerMin !== null && v.odometer_km < f.odometerMin) return false
  if (f.odometerMax !== null && v.odometer_km > f.odometerMax) return false

  if (f.hasBuyNow && v.buy_now_price === null) return false
  if (f.noReserve && v.reserve_price !== null) return false

  return true
}

export function applyFilters(list: Vehicle[], f: FilterState): Vehicle[] {
  return list.filter((v) => vehicleMatchesFilters(v, f))
}

/**
 * Count how many distinct filters the user has applied. Used for the
 * mobile filter button badge and the "Clear all" affordance.
 */
export function activeFilterCount(f: FilterState): number {
  let n = 0
  n += f.makes.length
  n += f.bodyStyles.length
  n += f.provinces.length
  n += f.titleStatuses.length
  n += f.fuelTypes.length
  n += f.drivetrains.length
  n += f.transmissions.length
  if (f.gradeMin !== null) n += 1
  if (f.priceMin !== null || f.priceMax !== null) n += 1
  if (f.odometerMin !== null || f.odometerMax !== null) n += 1
  if (f.hasBuyNow) n += 1
  if (f.noReserve) n += 1
  return n
}

/**
 * Distinct values for facet UIs, sorted for stable rendering.
 */
export function uniqueSorted<T extends string | number>(values: T[]): T[] {
  return [...new Set(values)].sort((a, b) =>
    typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b)),
  )
}
