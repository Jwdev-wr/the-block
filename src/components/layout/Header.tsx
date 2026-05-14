import { Link } from 'react-router'
import { Gavel } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container-page flex h-14 items-center justify-between gap-4">
        <Link
          to="/"
          className="group flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="The Block — back to inventory"
        >
          <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
            <Gavel className="h-4 w-4" aria-hidden />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight">The Block</span>
            <span className="text-[11px] text-muted-foreground">Buyer vehicle auctions</span>
          </span>
        </Link>
        <div className="hidden text-xs text-muted-foreground md:block">
          Prototype · synthetic data · bids saved locally
        </div>
      </div>
    </header>
  )
}
