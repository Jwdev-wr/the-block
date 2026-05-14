import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import type { Vehicle } from '@/types/vehicle'

interface ConditionReportProps {
  vehicle: Vehicle
}

function gradeVariant(grade: number) {
  if (grade >= 4) return 'success'
  if (grade >= 3) return 'primary'
  if (grade >= 2) return 'warning'
  return 'destructive'
}

export function ConditionReport({ vehicle }: ConditionReportProps) {
  const hasDamage = vehicle.damage_notes.length > 0
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold">Condition</h3>
        <Badge variant={gradeVariant(vehicle.condition_grade)}>
          Grade {vehicle.condition_grade.toFixed(1)} / 5
        </Badge>
      </div>
      <p className="text-sm text-foreground/85">{vehicle.condition_report}</p>

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Damage notes
        </h4>
        {hasDamage ? (
          <ul className="mt-2 space-y-1.5" data-testid="damage-notes">
            {vehicle.damage_notes.map((note, idx) => (
              <li
                key={`${idx}:${note}`}
                className="flex items-start gap-2 text-sm text-foreground/90"
              >
                <AlertTriangle
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning"
                  aria-hidden
                />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div
            className="mt-2 inline-flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
            data-testid="no-damage-state"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            <span>No damage notes reported.</span>
          </div>
        )}
      </div>
    </div>
  )
}
