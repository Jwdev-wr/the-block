import { X } from 'lucide-react'
import type { FilterState } from '@/types/vehicle'
import { emptyFilterState } from '@/types/vehicle'
import { formatCurrency, formatOdometer } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface Chip {
  key: string
  label: string
  remove: () => void
}

interface ActiveFilterChipsProps {
  filters: FilterState
  onChange: (next: FilterState) => void
  className?: string
}

export function ActiveFilterChips({ filters, onChange, className }: ActiveFilterChipsProps) {
  const chips: Chip[] = []

  function listChips<K extends keyof FilterState>(key: K, formatter?: (v: string) => string) {
    const arr = filters[key] as unknown as string[]
    if (!arr.length) return
    arr.forEach((value) => {
      chips.push({
        key: `${key}:${value}`,
        label: formatter ? formatter(value) : value,
        remove: () => {
          onChange({ ...filters, [key]: arr.filter((v) => v !== value) } as FilterState)
        },
      })
    })
  }

  listChips('makes')
  listChips('bodyStyles', (v) => v.charAt(0).toUpperCase() + v.slice(1))
  listChips('provinces')
  listChips('titleStatuses', (v) => v.charAt(0).toUpperCase() + v.slice(1))
  listChips('fuelTypes', (v) => v.charAt(0).toUpperCase() + v.slice(1))
  listChips('drivetrains')
  listChips('transmissions', (v) => v.charAt(0).toUpperCase() + v.slice(1))

  if (filters.gradeMin !== null) {
    chips.push({
      key: 'gradeMin',
      label: `Grade ≥ ${filters.gradeMin.toFixed(1)}`,
      remove: () => onChange({ ...filters, gradeMin: null }),
    })
  }
  if (filters.priceMin !== null || filters.priceMax !== null) {
    chips.push({
      key: 'price',
      label: `Bid ${filters.priceMin !== null ? formatCurrency(filters.priceMin) : '$0'}–${filters.priceMax !== null ? formatCurrency(filters.priceMax) : '∞'}`,
      remove: () => onChange({ ...filters, priceMin: null, priceMax: null }),
    })
  }
  if (filters.odometerMin !== null || filters.odometerMax !== null) {
    chips.push({
      key: 'odo',
      label: `Odo ${filters.odometerMin !== null ? formatOdometer(filters.odometerMin) : '0 km'}–${filters.odometerMax !== null ? formatOdometer(filters.odometerMax) : '∞'}`,
      remove: () => onChange({ ...filters, odometerMin: null, odometerMax: null }),
    })
  }
  if (filters.hasBuyNow) {
    chips.push({
      key: 'hasBuyNow',
      label: 'Has Buy Now',
      remove: () => onChange({ ...filters, hasBuyNow: false }),
    })
  }
  if (filters.noReserve) {
    chips.push({
      key: 'noReserve',
      label: 'No reserve',
      remove: () => onChange({ ...filters, noReserve: false }),
    })
  }

  if (chips.length === 0) return null

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)} aria-label="Active filters">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.remove}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          data-testid={`chip-${chip.key}`}
        >
          <span>{chip.label}</span>
          <X className="h-3 w-3" aria-hidden />
          <span className="sr-only">Remove filter</span>
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange({ ...emptyFilterState, search: filters.search })}
        className="text-xs text-muted-foreground underline-offset-2 hover:underline"
      >
        Clear all
      </button>
    </div>
  )
}
