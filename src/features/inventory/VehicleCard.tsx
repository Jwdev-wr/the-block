import { Link, useLocation } from 'react-router'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  formatCurrency,
  formatOdometer,
  vehicleTitle,
} from '@/lib/formatters'
import type { Vehicle } from '@/types/vehicle'
import { effectiveCurrent } from '@/lib/bidding-rules'
import { Gauge, MapPin, Store } from 'lucide-react'

interface VehicleCardProps {
  vehicle: Vehicle
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const location = useLocation()
  const hasBids = vehicle.current_bid !== null
  const amount = effectiveCurrent(vehicle)
  const image = vehicle.images[0]
  const titleStatusVariant =
    vehicle.title_status === 'clean'
      ? 'success'
      : vehicle.title_status === 'rebuilt'
        ? 'warning'
        : 'destructive'

  // Remember the inventory URL (path + query) the user clicked from so the
  // detail page's "Back to inventory" link can return to the same search,
  // filter, and sort state instead of an unfiltered home view.
  const fromUrl = `${location.pathname}${location.search}`

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden border-border transition-colors hover:border-primary/30 focus-within:border-primary/50">
      <Link
        to={`/vehicles/${vehicle.id}`}
        state={{ from: fromUrl }}
        className="absolute inset-0 z-10 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={`View details for ${vehicleTitle(vehicle)}, lot ${vehicle.lot}`}
        data-testid={`vehicle-card-link-${vehicle.id}`}
      >
        <span className="sr-only">View details</span>
      </Link>

      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={image}
          alt={`${vehicleTitle(vehicle)} photo 1`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          {vehicle.reserve_price === null && <Badge variant="primary">No reserve</Badge>}
          {vehicle.buy_now_price !== null && <Badge variant="default">Buy Now</Badge>}
        </div>
        <Badge
          variant="muted"
          className="absolute right-2 top-2 bg-background/90 text-foreground"
        >
          Grade {vehicle.condition_grade.toFixed(1)}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold leading-tight tracking-tight text-foreground">
              {vehicleTitle(vehicle)}
            </h3>
            <span className="shrink-0 text-[11px] uppercase tracking-wide text-muted-foreground">
              Lot {vehicle.lot}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Gauge className="h-3 w-3" aria-hidden />
              {formatOdometer(vehicle.odometer_km)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" aria-hidden />
              {vehicle.city}, {vehicle.province}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Store className="h-3 w-3" aria-hidden />
            <span className="truncate">{vehicle.selling_dealership}</span>
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {hasBids ? 'Current bid' : 'Starting bid'}
            </p>
            <p className="text-lg font-semibold tabular-nums">{formatCurrency(amount)}</p>
            <p className="text-[11px] text-muted-foreground">
              {hasBids ? `${vehicle.bid_count} ${vehicle.bid_count === 1 ? 'bid' : 'bids'}` : 'No bids yet'}
            </p>
          </div>
          <Badge variant={titleStatusVariant} className="capitalize">
            {vehicle.title_status}
          </Badge>
        </div>
      </div>
    </Card>
  )
}
