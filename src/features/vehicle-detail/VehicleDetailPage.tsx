import { Link, useLocation, useParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Badge } from '@/components/ui/badge'
import { ImageGallery } from './ImageGallery'
import { SpecsGrid } from './SpecsGrid'
import { ConditionReport } from './ConditionReport'
import { AuctionMeta } from './AuctionMeta'
import { NotFound } from './NotFound'
import { BidPanel } from '@/features/bidding/BidPanel'
import { useBidStore } from '@/features/bidding/BidContext'
import { vehicleTitle } from '@/lib/formatters'

export function VehicleDetailPage() {
  const params = useParams()
  const location = useLocation()
  const { getVehicle } = useBidStore()
  const vehicle = params.vehicleId ? getVehicle(params.vehicleId) : undefined

  if (!vehicle) return <NotFound />

  // If we arrived from the inventory page via a VehicleCard click, the link
  // carried the previous URL (path + query) in location.state.from. We use
  // that to return to the same search / filter / sort state. Otherwise fall
  // back to the inventory root.
  const backState = location.state as { from?: string } | null
  const backTo = backState?.from ?? '/'

  const titleStatusVariant =
    vehicle.title_status === 'clean'
      ? 'success'
      : vehicle.title_status === 'rebuilt'
        ? 'warning'
        : 'destructive'

  return (
    <PageContainer>
      <Link
        to={backTo}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        data-testid="back-to-inventory"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to inventory
      </Link>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
        <main className="space-y-8 pb-32 lg:pb-0">
          <section className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>Lot {vehicle.lot}</span>
              <span aria-hidden>·</span>
              <Badge variant={titleStatusVariant} className="capitalize">
                {vehicle.title_status} title
              </Badge>
              {vehicle.reserve_price === null && <Badge variant="primary">No reserve</Badge>}
              {vehicle.buy_now_price !== null && <Badge variant="default">Buy Now</Badge>}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">
              {vehicleTitle(vehicle)}
            </h1>
          </section>

          <ImageGallery images={vehicle.images} alt={vehicleTitle(vehicle)} />

          <section aria-labelledby="specs-heading">
            <h2 id="specs-heading" className="mb-3 text-base font-semibold">
              Specs
            </h2>
            <SpecsGrid vehicle={vehicle} />
          </section>

          <section aria-labelledby="condition-heading">
            <h2 id="condition-heading" className="mb-3 text-base font-semibold">
              Condition report
            </h2>
            <ConditionReport vehicle={vehicle} />
          </section>

          <section aria-labelledby="auction-heading">
            <h2 id="auction-heading" className="mb-3 text-base font-semibold">
              Auction & dealer
            </h2>
            <AuctionMeta vehicle={vehicle} />
          </section>
        </main>

        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <BidPanel vehicle={vehicle} />
          </div>
        </aside>
      </div>

      {/* Mobile sticky bottom bid bar */}
      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-3 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] backdrop-blur lg:hidden"
        data-testid="mobile-bid-bar"
      >
        <BidPanel vehicle={vehicle} compact />
      </div>
    </PageContainer>
  )
}
