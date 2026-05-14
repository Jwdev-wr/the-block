import type { Vehicle, ReserveStatus } from '@/types/vehicle'

/**
 * The effective current amount used as the basis for the next minimum bid.
 * If the vehicle has no active bid yet, the starting bid is the floor.
 */
export function effectiveCurrent(v: Pick<Vehicle, 'current_bid' | 'starting_bid'>): number {
  return v.current_bid ?? v.starting_bid
}

/**
 * Bid increment tiers (documented in README):
 *   < $10,000           → $250
 *   $10,000 – $49,999   → $500
 *   ≥ $50,000           → $1,000
 */
export function bidIncrement(currentAmount: number): number {
  if (currentAmount < 10_000) return 250
  if (currentAmount < 50_000) return 500
  return 1000
}

export function minNextBid(v: Pick<Vehicle, 'current_bid' | 'starting_bid'>): number {
  const current = effectiveCurrent(v)
  // If there's no active bid, the starting bid is itself a valid first bid.
  if (v.current_bid === null) return current
  return current + bidIncrement(current)
}

export function reserveStatus(
  v: Pick<Vehicle, 'reserve_price' | 'current_bid' | 'starting_bid'>,
): ReserveStatus {
  if (v.reserve_price === null) return 'no_reserve'
  const current = v.current_bid ?? 0
  if (current >= v.reserve_price) return 'reserve_met'
  return 'reserve_not_met'
}

export type BidValidation =
  | { ok: true; amount: number }
  | { ok: false; error: string }

export function parseBidInput(raw: string): number | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) return null
  const n = Number(trimmed)
  if (Number.isNaN(n)) return null
  return n
}

export interface ValidateBidOptions {
  /** When true, allows hitting `buy_now_price` exactly (used by the Buy Now CTA). */
  allowBuyNowExact?: boolean
}

export function validateBid(
  v: Pick<Vehicle, 'current_bid' | 'starting_bid' | 'buy_now_price'>,
  rawInput: string,
  opts: ValidateBidOptions = {},
): BidValidation {
  if (!rawInput.trim()) {
    return { ok: false, error: 'Enter a bid amount.' }
  }
  const trimmed = rawInput.trim()
  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return { ok: false, error: 'Bid must be a number.' }
  }
  const n = Number(trimmed)
  if (Number.isNaN(n)) {
    return { ok: false, error: 'Bid must be a number.' }
  }
  if (!Number.isInteger(n)) {
    return { ok: false, error: 'Bid must be a whole dollar amount.' }
  }
  if (n <= 0) {
    return { ok: false, error: 'Bid must be greater than zero.' }
  }
  const floor = minNextBid(v)
  if (n < floor) {
    return { ok: false, error: `Bid must be at least $${floor.toLocaleString('en-CA')}.` }
  }
  if (v.buy_now_price !== null) {
    if (opts.allowBuyNowExact) {
      if (n > v.buy_now_price) {
        return { ok: false, error: `Bid cannot exceed Buy Now price.` }
      }
    } else if (n >= v.buy_now_price) {
      return {
        ok: false,
        error: `Bid must be below Buy Now price ($${v.buy_now_price.toLocaleString('en-CA')}). Use Buy Now to purchase outright.`,
      }
    }
  }
  return { ok: true, amount: n }
}
