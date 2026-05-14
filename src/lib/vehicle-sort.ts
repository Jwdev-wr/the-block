import type { Vehicle, SortKey } from '@/types/vehicle'
import { effectiveCurrent } from '@/lib/bidding-rules'

type Comparator = (a: Vehicle, b: Vehicle) => number

/**
 * Composite "Recommended" ranking, documented as a product assumption:
 *   1. Vehicles with active bids first.
 *   2. Higher condition grade.
 *   3. Newer year.
 *   4. Lower odometer.
 */
const recommendedComparator: Comparator = (a, b) => {
  const aActive = a.current_bid !== null ? 1 : 0
  const bActive = b.current_bid !== null ? 1 : 0
  if (aActive !== bActive) return bActive - aActive
  if (a.condition_grade !== b.condition_grade) return b.condition_grade - a.condition_grade
  if (a.year !== b.year) return b.year - a.year
  return a.odometer_km - b.odometer_km
}

const comparators: Record<SortKey, Comparator> = {
  recommended: recommendedComparator,
  bid_asc: (a, b) => effectiveCurrent(a) - effectiveCurrent(b),
  bid_desc: (a, b) => effectiveCurrent(b) - effectiveCurrent(a),
  year_desc: (a, b) => b.year - a.year || recommendedComparator(a, b),
  odometer_asc: (a, b) => a.odometer_km - b.odometer_km || recommendedComparator(a, b),
  grade_desc: (a, b) => b.condition_grade - a.condition_grade || recommendedComparator(a, b),
  auction_soonest: (a, b) =>
    new Date(a.auction_start).getTime() - new Date(b.auction_start).getTime() ||
    recommendedComparator(a, b),
}

export function sortVehicles(list: Vehicle[], key: SortKey): Vehicle[] {
  const cmp = comparators[key] ?? recommendedComparator
  return [...list].sort(cmp)
}

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'recommended', label: 'Recommended' },
  { key: 'bid_asc', label: 'Current bid: low to high' },
  { key: 'bid_desc', label: 'Current bid: high to low' },
  { key: 'year_desc', label: 'Year: newest first' },
  { key: 'odometer_asc', label: 'Odometer: low to high' },
  { key: 'grade_desc', label: 'Condition grade: high to low' },
  { key: 'auction_soonest', label: 'Auction start: soonest first' },
]
