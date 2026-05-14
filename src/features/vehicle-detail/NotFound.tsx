import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/layout/PageContainer'
import { CarFront } from 'lucide-react'

export function NotFound() {
  return (
    <PageContainer>
      <div
        className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 py-20 text-center"
        data-testid="not-found"
      >
        <CarFront className="h-10 w-10 text-muted-foreground" aria-hidden />
        <h1 className="mt-4 text-xl font-semibold tracking-tight">Vehicle not found</h1>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          We couldn’t find a vehicle with that ID. It may have been removed from this prototype
          dataset.
        </p>
        <Button asChild className="mt-5">
          <Link to="/">Back to inventory</Link>
        </Button>
      </div>
    </PageContainer>
  )
}
