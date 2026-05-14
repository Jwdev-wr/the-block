import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/components/ui/toaster'
import { ReserveStatusBadge } from './ReserveStatusBadge'
import {
  effectiveCurrent,
  minNextBid,
  reserveStatus,
  validateBid,
} from '@/lib/bidding-rules'
import { formatCurrency } from '@/lib/formatters'
import type { Vehicle } from '@/types/vehicle'
import { useBidStore } from './BidContext'
import { Check, Hammer, ShoppingBag } from 'lucide-react'

interface BidPanelProps {
  vehicle: Vehicle
  /** When true, lays out the panel for a sticky mobile bottom bar (compact). */
  compact?: boolean
}

export function BidPanel({ vehicle, compact = false }: BidPanelProps) {
  const { placeBid, buyNow, isBoughtNow } = useBidStore()
  const [input, setInput] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const current = effectiveCurrent(vehicle)
  const floor = minNextBid(vehicle)
  const status = reserveStatus(vehicle)
  const bought = isBoughtNow(vehicle.id)

  // The desktop sticky panel and the mobile sticky bar render side-by-side
  // for the same vehicle. We scope label/error IDs by variant so that each
  // input has exactly one associated label (accessible name) and one error.
  const variant = compact ? 'mobile' : 'desktop'
  const placeholder = String(floor)
  const inputId = `bid-input-${variant}-${vehicle.id}`
  const errorId = `bid-error-${variant}-${vehicle.id}`
  const hintId = `bid-hint-${variant}-${vehicle.id}`

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (bought) return
    const result = validateBid(vehicle, input)
    if (!result.ok) {
      setError(result.error)
      requestAnimationFrame(() => inputRef.current?.focus())
      return
    }
    placeBid(vehicle.id, result.amount)
    setInput('')
    setError(null)
    toast.success('Bid placed', {
      description: `${formatCurrency(result.amount)} on lot ${vehicle.lot}`,
    })
  }

  function handleBuyNow() {
    if (bought) return
    if (vehicle.buy_now_price === null) return
    buyNow(vehicle.id, vehicle.buy_now_price)
    setInput('')
    setError(null)
    toast.success('Purchased via Buy Now', {
      description: `${formatCurrency(vehicle.buy_now_price)} on lot ${vehicle.lot}`,
    })
  }

  return (
    <Card className={compact ? 'shadow-none border-0' : ''}>
      <CardContent className={compact ? 'p-3' : 'p-5 lg:p-6 space-y-5'}>
        {!compact && (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {vehicle.current_bid === null ? 'Starting bid' : 'Current bid'}
                </p>
                <p className="mt-1 text-3xl font-semibold tabular-nums">
                  {formatCurrency(current)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {vehicle.bid_count} {vehicle.bid_count === 1 ? 'bid' : 'bids'} ·
                  {' '}Starting bid {formatCurrency(vehicle.starting_bid)}
                </p>
              </div>
              <ReserveStatusBadge status={status} />
            </div>

            {vehicle.buy_now_price !== null && (
              <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
                <span className="text-muted-foreground">Buy Now price · </span>
                <span className="font-semibold tabular-nums">
                  {formatCurrency(vehicle.buy_now_price)}
                </span>
              </div>
            )}

            <Separator />
          </>
        )}

        {bought ? (
          <div className="flex items-center gap-2 rounded-md border border-success/40 bg-success/10 px-3 py-2 text-sm text-success">
            <Check className="h-4 w-4" aria-hidden />
            <span>Purchased via Buy Now. Bidding closed for this prototype.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate aria-label="Place a bid">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={inputId}>Your bid</Label>
                <span id={hintId} className="text-xs text-muted-foreground">
                  Minimum {formatCurrency(floor)}
                </span>
              </div>
              <div className="relative">
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground"
                >
                  $
                </span>
                <Input
                  id={inputId}
                  ref={inputRef}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                  placeholder={placeholder}
                  className="pl-7"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value)
                    if (error) setError(null)
                  }}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? `${errorId} ${hintId}` : hintId}
                  data-testid={`bid-input-${vehicle.id}`}
                />
              </div>
              {error && (
                <p id={errorId} role="alert" className="text-xs text-destructive">
                  {error}
                </p>
              )}
              <div className="flex gap-2 pt-1">
                <Button
                  type="submit"
                  className="flex-1"
                  size={compact ? 'default' : 'lg'}
                  data-testid={`submit-bid-${vehicle.id}`}
                >
                  <Hammer className="h-4 w-4" aria-hidden />
                  Place bid
                </Button>
                {vehicle.buy_now_price !== null && (
                  <Button
                    type="button"
                    variant="outline"
                    size={compact ? 'default' : 'lg'}
                    onClick={handleBuyNow}
                    aria-label={`Buy now for ${formatCurrency(vehicle.buy_now_price)}`}
                    data-testid={`buy-now-${vehicle.id}`}
                  >
                    <ShoppingBag className="h-4 w-4" aria-hidden />
                    Buy Now
                  </Button>
                )}
              </div>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
