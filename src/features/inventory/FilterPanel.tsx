import * as React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { vehicles as allVehicles } from '@/data'
import type {
  BodyStyle,
  Drivetrain,
  FilterState,
  FuelType,
  TitleStatus,
  Transmission,
} from '@/types/vehicle'
import { uniqueSorted } from '@/lib/vehicle-filters'

interface FilterPanelProps {
  filters: FilterState
  onChange: (next: FilterState) => void
  onClearAll: () => void
}

const TITLE_STATUSES: { value: TitleStatus; label: string }[] = [
  { value: 'clean', label: 'Clean' },
  { value: 'rebuilt', label: 'Rebuilt' },
  { value: 'salvage', label: 'Salvage' },
]

const FUEL_TYPES: { value: FuelType; label: string }[] = [
  { value: 'gasoline', label: 'Gasoline' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'electric', label: 'Electric' },
  { value: 'diesel', label: 'Diesel' },
]

const DRIVETRAINS: Drivetrain[] = ['FWD', 'RWD', 'AWD', '4WD']
const TRANSMISSIONS: { value: Transmission; label: string }[] = [
  { value: 'automatic', label: 'Automatic' },
  { value: 'manual', label: 'Manual' },
  { value: 'CVT', label: 'CVT' },
  { value: 'single-speed', label: 'Single-speed' },
]

const BODY_STYLES: BodyStyle[] = ['SUV', 'sedan', 'truck', 'coupe', 'hatchback']

const GRADE_OPTIONS = [
  { value: null, label: 'Any grade' },
  { value: 4, label: '4.0 and up' },
  { value: 3, label: '3.0 and up' },
  { value: 2, label: '2.0 and up' },
]

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

function FilterSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  // The inner container uses `flex flex-col gap-2` (rather than `space-y-2`)
  // so that inline-flex Checkbox elements always stack vertically instead of
  // flowing on the same line.
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}

export function FilterPanel({ filters, onChange, onClearAll }: FilterPanelProps) {
  const makes = React.useMemo(() => uniqueSorted(allVehicles.map((v) => v.make)), [])
  const provinces = React.useMemo(() => uniqueSorted(allVehicles.map((v) => v.province)), [])

  function setNumber(field: keyof FilterState, raw: string) {
    const trimmed = raw.trim()
    const next = trimmed === '' ? null : Number(trimmed)
    onChange({ ...filters, [field]: Number.isFinite(next) ? next : null })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Filters</h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          data-testid="clear-all-filters"
        >
          Clear all
        </Button>
      </div>

      <FilterSection title="Quick toggles">
        <Checkbox
          checked={filters.hasBuyNow}
          onChange={(e) => onChange({ ...filters, hasBuyNow: e.target.checked })}
          label="Has Buy Now"
          data-testid="filter-has-buy-now"
        />
        <Checkbox
          checked={filters.noReserve}
          onChange={(e) => onChange({ ...filters, noReserve: e.target.checked })}
          label="No reserve"
          data-testid="filter-no-reserve"
        />
      </FilterSection>

      <Separator />

      <FilterSection title="Make">
        <div className="grid grid-cols-2 gap-1.5">
          {makes.map((make) => (
            <Checkbox
              key={make}
              checked={filters.makes.includes(make)}
              onChange={() => onChange({ ...filters, makes: toggle(filters.makes, make) })}
              label={make}
            />
          ))}
        </div>
      </FilterSection>

      <Separator />

      <FilterSection title="Body style">
        <div className="grid grid-cols-2 gap-1.5">
          {BODY_STYLES.map((style) => (
            <Checkbox
              key={style}
              checked={filters.bodyStyles.includes(style)}
              onChange={() => onChange({ ...filters, bodyStyles: toggle(filters.bodyStyles, style) })}
              label={<span className="capitalize">{style}</span>}
            />
          ))}
        </div>
      </FilterSection>

      <Separator />

      <FilterSection title="Province">
        <div className="grid grid-cols-1 gap-1.5">
          {provinces.map((province) => (
            <Checkbox
              key={province}
              checked={filters.provinces.includes(province)}
              onChange={() => onChange({ ...filters, provinces: toggle(filters.provinces, province) })}
              label={province}
            />
          ))}
        </div>
      </FilterSection>

      <Separator />

      <FilterSection title="Title status">
        {TITLE_STATUSES.map((ts) => (
          <Checkbox
            key={ts.value}
            checked={filters.titleStatuses.includes(ts.value)}
            onChange={() =>
              onChange({ ...filters, titleStatuses: toggle(filters.titleStatuses, ts.value) })
            }
            label={ts.label}
            data-testid={`filter-title-${ts.value}`}
          />
        ))}
      </FilterSection>

      <Separator />

      <FilterSection title="Fuel type">
        <div className="grid grid-cols-2 gap-1.5">
          {FUEL_TYPES.map((f) => (
            <Checkbox
              key={f.value}
              checked={filters.fuelTypes.includes(f.value)}
              onChange={() =>
                onChange({ ...filters, fuelTypes: toggle(filters.fuelTypes, f.value) })
              }
              label={f.label}
            />
          ))}
        </div>
      </FilterSection>

      <Separator />

      <FilterSection title="Drivetrain">
        <div className="grid grid-cols-2 gap-1.5">
          {DRIVETRAINS.map((dt) => (
            <Checkbox
              key={dt}
              checked={filters.drivetrains.includes(dt)}
              onChange={() =>
                onChange({ ...filters, drivetrains: toggle(filters.drivetrains, dt) })
              }
              label={dt}
            />
          ))}
        </div>
      </FilterSection>

      <Separator />

      <FilterSection title="Transmission">
        <div className="grid grid-cols-2 gap-1.5">
          {TRANSMISSIONS.map((t) => (
            <Checkbox
              key={t.value}
              checked={filters.transmissions.includes(t.value)}
              onChange={() =>
                onChange({ ...filters, transmissions: toggle(filters.transmissions, t.value) })
              }
              label={t.label}
            />
          ))}
        </div>
      </FilterSection>

      <Separator />

      <FilterSection title="Minimum condition grade">
        <div className="grid grid-cols-2 gap-1.5">
          {GRADE_OPTIONS.map((g) => (
            <label key={String(g.value)} className="inline-flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                name="gradeMin"
                checked={filters.gradeMin === g.value}
                onChange={() => onChange({ ...filters, gradeMin: g.value })}
                className="h-4 w-4 accent-primary"
              />
              {g.label}
            </label>
          ))}
        </div>
      </FilterSection>

      <Separator />

      <FilterSection title="Current bid range (CAD)">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor="priceMin" className="text-xs text-muted-foreground">
              Min
            </Label>
            <Input
              id="priceMin"
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="0"
              value={filters.priceMin ?? ''}
              onChange={(e) => setNumber('priceMin', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="priceMax" className="text-xs text-muted-foreground">
              Max
            </Label>
            <Input
              id="priceMax"
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="∞"
              value={filters.priceMax ?? ''}
              onChange={(e) => setNumber('priceMax', e.target.value)}
            />
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Odometer range (km)">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor="odoMin" className="text-xs text-muted-foreground">
              Min
            </Label>
            <Input
              id="odoMin"
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="0"
              value={filters.odometerMin ?? ''}
              onChange={(e) => setNumber('odometerMin', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="odoMax" className="text-xs text-muted-foreground">
              Max
            </Label>
            <Input
              id="odoMax"
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="∞"
              value={filters.odometerMax ?? ''}
              onChange={(e) => setNumber('odometerMax', e.target.value)}
            />
          </div>
        </div>
      </FilterSection>
    </div>
  )
}
