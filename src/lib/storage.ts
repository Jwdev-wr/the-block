import type { BidOverride } from '@/types/vehicle'

const STORAGE_KEY = 'the-block:bids:v1'

export type BidOverridesMap = Record<string, BidOverride>

function safeParse(raw: string | null): BidOverridesMap {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as BidOverridesMap
    }
    return {}
  } catch {
    return {}
  }
}

export function loadBidOverrides(): BidOverridesMap {
  if (typeof localStorage === 'undefined') return {}
  return safeParse(localStorage.getItem(STORAGE_KEY))
}

export function saveBidOverrides(overrides: BidOverridesMap): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides))
  } catch {
    // Quota or private-mode failure — silently drop. The in-memory state stays correct.
  }
}

export function clearBidOverrides(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

export const __STORAGE_KEY__ = STORAGE_KEY
