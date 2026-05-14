import type { BidOverride, Vehicle } from '@/types/vehicle'
import type { BidOverridesMap } from '@/lib/storage'

/**
 * Apply a single bid override to a vehicle, returning a new Vehicle. The
 * override always wins for current_bid and bid_count; everything else is
 * preserved from the canonical record.
 */
export function applyOverride(v: Vehicle, override: BidOverride | undefined): Vehicle {
  if (!override) return v
  return {
    ...v,
    current_bid: override.current_bid,
    bid_count: override.bid_count,
  }
}

export function mergeOverrides(
  list: Vehicle[],
  overrides: BidOverridesMap,
): Vehicle[] {
  if (!overrides || Object.keys(overrides).length === 0) return list
  return list.map((v) => applyOverride(v, overrides[v.id]))
}
