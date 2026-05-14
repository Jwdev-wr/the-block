import * as React from 'react'
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageGalleryProps {
  images: string[]
  alt: string
}

export function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [active, setActive] = React.useState(0)

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 text-muted-foreground">
        <ImageIcon className="h-8 w-8" aria-hidden />
        <span className="sr-only">No images available</span>
      </div>
    )
  }

  const current = images[active]
  const total = images.length

  function prev() {
    setActive((i) => (i - 1 + total) % total)
  }

  function next() {
    setActive((i) => (i + 1) % total)
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      prev()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      next()
    }
  }

  return (
    <div className="space-y-3">
      <div
        className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        tabIndex={0}
        role="region"
        aria-label="Vehicle photo gallery"
        aria-roledescription="carousel"
        onKeyDown={onKey}
      >
        <img
          key={current}
          src={current}
          alt={`${alt} photo ${active + 1} of ${total}`}
          className="h-full w-full object-cover"
        />
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/85 p-2 text-foreground shadow-sm transition-opacity opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/85 p-2 text-foreground shadow-sm transition-opacity opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
            <div
              aria-live="polite"
              className="absolute bottom-2 right-2 rounded-full bg-background/90 px-2 py-0.5 text-xs text-foreground"
            >
              {active + 1} / {total}
            </div>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="grid grid-cols-6 gap-2" role="tablist" aria-label="Photo thumbnails">
          {images.slice(0, 6).map((src, idx) => (
            <button
              key={src + idx}
              type="button"
              role="tab"
              aria-selected={idx === active}
              aria-label={`Show photo ${idx + 1}`}
              onClick={() => setActive(idx)}
              className={cn(
                'relative aspect-square overflow-hidden rounded-md border bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                idx === active ? 'border-primary' : 'border-border opacity-80 hover:opacity-100',
              )}
            >
              <img
                src={src}
                alt=""
                aria-hidden
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
