import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SORT_OPTIONS } from '@/lib/vehicle-sort'
import type { SortKey } from '@/types/vehicle'

interface SortMenuProps {
  value: SortKey
  onChange: (key: SortKey) => void
}

export function SortMenu({ value, onChange }: SortMenuProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="text-xs text-muted-foreground">
        Sort
      </label>
      <Select value={value} onValueChange={(v) => onChange(v as SortKey)}>
        <SelectTrigger
          id="sort-select"
          aria-label="Sort vehicles"
          className="h-9 w-[230px]"
          data-testid="sort-select"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((opt) => (
            <SelectItem key={opt.key} value={opt.key} data-testid={`sort-option-${opt.key}`}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
