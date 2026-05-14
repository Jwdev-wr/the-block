import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode
}

/**
 * Lightweight, accessible checkbox built on a native input. We keep the
 * native element for free accessibility and use a sibling SVG for the visual
 * checkmark.
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const autoId = React.useId()
    const checkboxId = id ?? autoId
    // The input is nested inside the label, so we do NOT also set htmlFor —
    // a label with both nesting and htmlFor pointing at the same input causes
    // two click events to fire and the checkbox state to toggle twice.
    return (
      <label className="group inline-flex items-center gap-2 cursor-pointer select-none text-sm">
        <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            className={cn(
              'peer h-4 w-4 shrink-0 cursor-pointer appearance-none rounded border border-input bg-background',
              'checked:border-primary checked:bg-primary',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background',
              'disabled:cursor-not-allowed disabled:opacity-50',
              className,
            )}
            {...props}
          />
          <Check
            className="pointer-events-none absolute h-3 w-3 text-primary-foreground opacity-0 peer-checked:opacity-100"
            strokeWidth={3}
          />
        </span>
        {label !== undefined && <span className="leading-none text-foreground">{label}</span>}
      </label>
    )
  },
)
Checkbox.displayName = 'Checkbox'
