import { CalendarDays, MapPin, Store, FileBadge } from 'lucide-react'
import { formatDate } from '@/lib/formatters'
import type { Vehicle } from '@/types/vehicle'

interface AuctionMetaProps {
  vehicle: Vehicle
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  )
}

export function AuctionMeta({ vehicle }: AuctionMetaProps) {
  return (
    <div className="divide-y divide-border rounded-lg border border-border bg-card p-1">
      <Row
        icon={<CalendarDays className="h-4 w-4" aria-hidden />}
        label="Auction start (synthetic)"
        value={formatDate(vehicle.auction_start)}
      />
      <Row
        icon={<Store className="h-4 w-4" aria-hidden />}
        label="Selling dealership"
        value={vehicle.selling_dealership}
      />
      <Row
        icon={<MapPin className="h-4 w-4" aria-hidden />}
        label="Location"
        value={`${vehicle.city}, ${vehicle.province}`}
      />
      <Row
        icon={<FileBadge className="h-4 w-4" aria-hidden />}
        label="VIN"
        value={<span className="font-mono text-xs tracking-tight">{vehicle.vin}</span>}
      />
    </div>
  )
}
