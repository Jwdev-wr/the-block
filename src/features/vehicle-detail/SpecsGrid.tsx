import { formatOdometer } from '@/lib/formatters'
import type { Vehicle } from '@/types/vehicle'

interface SpecsGridProps {
  vehicle: Vehicle
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md border border-border bg-muted/20 p-3">
      <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{value || '—'}</dd>
    </div>
  )
}

export function SpecsGrid({ vehicle }: SpecsGridProps) {
  return (
    <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      <Row label="Engine" value={vehicle.engine} />
      <Row label="Transmission" value={<span className="capitalize">{vehicle.transmission}</span>} />
      <Row label="Drivetrain" value={vehicle.drivetrain} />
      <Row label="Fuel type" value={<span className="capitalize">{vehicle.fuel_type}</span>} />
      <Row label="Body style" value={<span className="capitalize">{vehicle.body_style}</span>} />
      <Row label="Odometer" value={formatOdometer(vehicle.odometer_km)} />
      <Row label="Exterior color" value={vehicle.exterior_color} />
      <Row label="Interior color" value={vehicle.interior_color} />
      <Row label="Location" value={`${vehicle.city}, ${vehicle.province}`} />
    </dl>
  )
}
