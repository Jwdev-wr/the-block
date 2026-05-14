import * as React from 'react'
import { vehicles as baseVehicles } from '@/data'
import type { Vehicle } from '@/types/vehicle'
import { applyOverride } from '@/lib/bid-merge'
import { clearBidOverrides, loadBidOverrides, saveBidOverrides, type BidOverridesMap } from '@/lib/storage'

interface BidStoreState {
  overrides: BidOverridesMap
}

type BidAction =
  | { type: 'PLACE_BID'; vehicleId: string; amount: number }
  | { type: 'BUY_NOW'; vehicleId: string; price: number }
  | { type: 'RESET' }
  | { type: 'HYDRATE'; overrides: BidOverridesMap }

function reducer(state: BidStoreState, action: BidAction): BidStoreState {
  switch (action.type) {
    case 'HYDRATE':
      return { overrides: action.overrides }
    case 'PLACE_BID': {
      const existing = state.overrides[action.vehicleId]
      const base = baseById.get(action.vehicleId)
      const previousCount = existing?.bid_count ?? base?.bid_count ?? 0
      const next: BidOverridesMap = {
        ...state.overrides,
        [action.vehicleId]: {
          vehicleId: action.vehicleId,
          current_bid: action.amount,
          bid_count: previousCount + 1,
          bought_now: existing?.bought_now ?? false,
          last_bid_at: new Date().toISOString(),
        },
      }
      return { overrides: next }
    }
    case 'BUY_NOW': {
      const existing = state.overrides[action.vehicleId]
      const base = baseById.get(action.vehicleId)
      const previousCount = existing?.bid_count ?? base?.bid_count ?? 0
      const next: BidOverridesMap = {
        ...state.overrides,
        [action.vehicleId]: {
          vehicleId: action.vehicleId,
          current_bid: action.price,
          bid_count: previousCount + 1,
          bought_now: true,
          last_bid_at: new Date().toISOString(),
        },
      }
      return { overrides: next }
    }
    case 'RESET':
      return { overrides: {} }
    default:
      return state
  }
}

const baseById = new Map<string, Vehicle>(baseVehicles.map((v) => [v.id, v]))

interface BidContextValue {
  vehicles: Vehicle[]
  getVehicle: (id: string) => Vehicle | undefined
  isBoughtNow: (id: string) => boolean
  placeBid: (vehicleId: string, amount: number) => void
  buyNow: (vehicleId: string, price: number) => void
  resetAll: () => void
  hasOverrides: boolean
}

const BidContext = React.createContext<BidContextValue | null>(null)

export function BidProvider({ children }: { children: React.ReactNode }) {
  // Lazy initializer reads localStorage exactly once during the first render so
  // hydration cannot race with user actions and so StrictMode double-invokes do
  // not overwrite an in-progress edit.
  const [state, dispatch] = React.useReducer(
    reducer,
    undefined as unknown as BidStoreState,
    () => ({ overrides: loadBidOverrides() }),
  )

  const isFirstRender = React.useRef(true)
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    saveBidOverrides(state.overrides)
  }, [state.overrides])

  const vehicles = React.useMemo(
    () => baseVehicles.map((v) => applyOverride(v, state.overrides[v.id])),
    [state.overrides],
  )

  const byId = React.useMemo(() => new Map(vehicles.map((v) => [v.id, v])), [vehicles])

  const value = React.useMemo<BidContextValue>(
    () => ({
      vehicles,
      getVehicle: (id) => byId.get(id),
      isBoughtNow: (id) => state.overrides[id]?.bought_now ?? false,
      placeBid: (vehicleId, amount) => dispatch({ type: 'PLACE_BID', vehicleId, amount }),
      buyNow: (vehicleId, price) => dispatch({ type: 'BUY_NOW', vehicleId, price }),
      resetAll: () => {
        clearBidOverrides()
        dispatch({ type: 'RESET' })
      },
      hasOverrides: Object.keys(state.overrides).length > 0,
    }),
    [vehicles, byId, state.overrides],
  )

  return <BidContext.Provider value={value}>{children}</BidContext.Provider>
}

export function useBidStore(): BidContextValue {
  const ctx = React.useContext(BidContext)
  if (!ctx) {
    throw new Error('useBidStore must be used inside <BidProvider>')
  }
  return ctx
}
