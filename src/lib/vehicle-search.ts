import type { Vehicle } from '@/types/vehicle'

/**
 * Build a lowercase haystack of the fields searchable per the brief:
 * year, make, model, trim, VIN, lot, city, province, selling dealership, body style.
 */
function haystackOf(v: Vehicle): string {
  return [
    v.year,
    v.make,
    v.model,
    v.trim,
    v.vin,
    v.lot,
    v.city,
    v.province,
    v.selling_dealership,
    v.body_style,
  ]
    .join(' ')
    .toLowerCase()
}

export function vehicleMatchesSearch(v: Vehicle, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return haystackOf(v).includes(needle)
}

export function searchVehicles(list: Vehicle[], query: string): Vehicle[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return list
  return list.filter((v) => haystackOf(v).includes(needle))
}
