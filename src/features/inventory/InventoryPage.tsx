import * as React from 'react'
import { useSearchParams } from 'react-router'
import { Filter, RotateCcw, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'
import { PageContainer } from '@/components/layout/PageContainer'
import { VehicleCard } from './VehicleCard'
import { FilterPanel } from './FilterPanel'
import { ActiveFilterChips } from './ActiveFilterChips'
import { SortMenu } from './SortMenu'
import { EmptyState } from './EmptyState'
import { useBidStore } from '@/features/bidding/BidContext'
import { searchVehicles } from '@/lib/vehicle-search'
import { activeFilterCount, applyFilters } from '@/lib/vehicle-filters'
import { sortVehicles } from '@/lib/vehicle-sort'
import { parseUrlState, serializeUrlState } from '@/lib/url-state'
import { emptyFilterState, type FilterState, type SortKey } from '@/types/vehicle'
import { toast } from '@/components/ui/toaster'

export function InventoryPage() {
  const { vehicles, resetAll, hasOverrides } = useBidStore()
  const [searchParams, setSearchParams] = useSearchParams()

  const { filters, sort } = React.useMemo(() => parseUrlState(searchParams), [searchParams])
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false)

  function update(nextFilters: FilterState, nextSort: SortKey) {
    setSearchParams(serializeUrlState(nextFilters, nextSort), { replace: true })
  }

  function setFilters(next: FilterState) {
    update(next, sort)
  }

  function setSort(next: SortKey) {
    update(filters, next)
  }

  function clearAll() {
    update(emptyFilterState, 'recommended')
  }

  const visible = React.useMemo(() => {
    const searched = searchVehicles(vehicles, filters.search)
    const filtered = applyFilters(searched, filters)
    return sortVehicles(filtered, sort)
  }, [vehicles, filters, sort])

  const activeCount = activeFilterCount(filters)

  function handleResetDemoBids() {
    resetAll()
    toast.success('Demo bids reset', {
      description: 'All locally stored bids have been cleared.',
    })
  }

  return (
    <PageContainer>
      <section className="mb-6 flex flex-col gap-2 lg:mb-8">
        <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">Inventory</h1>
        <p className="text-sm text-muted-foreground">
          {visible.length === vehicles.length ? (
            <>Browsing all {vehicles.length} vehicles.</>
          ) : (
            <>
              Showing <span data-testid="visible-count">{visible.length}</span> of {vehicles.length} vehicles.
            </>
          )}
        </p>
      </section>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 lg:max-w-xl">
          <Search
            className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            aria-label="Search vehicles"
            placeholder="Search by year, make, model, VIN, lot, city, dealer…"
            className="pl-9"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            data-testid="search-input"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 lg:justify-end">
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="default"
                className="relative lg:hidden"
                data-testid="open-filters"
              >
                <Filter className="h-4 w-4" aria-hidden />
                Filters
                {activeCount > 0 && (
                  <Badge variant="primary" className="ml-1" data-testid="active-filter-count">
                    {activeCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Narrow the inventory by make, condition, location, and more.
                </SheetDescription>
              </SheetHeader>
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
                <FilterPanel filters={filters} onChange={setFilters} onClearAll={clearAll} />
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button className="w-full">Show {visible.length} vehicles</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
          <SortMenu value={sort} onChange={setSort} />
        </div>
      </div>

      {activeCount > 0 && (
        <ActiveFilterChips filters={filters} onChange={setFilters} className="mt-4" />
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside
          aria-label="Filters"
          className="hidden self-start rounded-xl border border-border bg-card lg:sticky lg:top-20 lg:block lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto"
        >
          <div className="p-5">
            <FilterPanel filters={filters} onChange={setFilters} onClearAll={clearAll} />
          </div>
        </aside>

        <div className="min-w-0">
          {visible.length === 0 ? (
            <EmptyState onClear={clearAll} />
          ) : (
            <ul
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
              data-testid="vehicle-grid"
            >
              {visible.map((v) => (
                <li key={v.id}>
                  <VehicleCard vehicle={v} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {hasOverrides && (
        <div className="mt-10 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetDemoBids}
            className="text-muted-foreground"
            data-testid="reset-demo-bids"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Reset demo bids
          </Button>
        </div>
      )}
    </PageContainer>
  )
}
