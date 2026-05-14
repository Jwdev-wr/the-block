import { SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  onClear: () => void
}

export function EmptyState({ onClear }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-6 py-16 text-center"
      role="status"
      data-testid="empty-state"
    >
      <SearchX className="h-8 w-8 text-muted-foreground" aria-hidden />
      <h2 className="mt-3 text-base font-semibold">No vehicles match your filters</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Try widening your search, removing a filter, or clearing everything to see the full
        inventory again.
      </p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onClear}>
        Clear search & filters
      </Button>
    </div>
  )
}
