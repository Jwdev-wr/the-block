import { ShieldCheck, ShieldAlert, ShieldOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { ReserveStatus } from '@/types/vehicle'

interface Props {
  status: ReserveStatus
}

export function ReserveStatusBadge({ status }: Props) {
  if (status === 'no_reserve') {
    return (
      <Badge variant="primary" aria-label="No reserve">
        <ShieldOff className="h-3 w-3" aria-hidden />
        No reserve
      </Badge>
    )
  }
  if (status === 'reserve_met') {
    return (
      <Badge variant="success" aria-label="Reserve met">
        <ShieldCheck className="h-3 w-3" aria-hidden />
        Reserve met
      </Badge>
    )
  }
  return (
    <Badge variant="warning" aria-label="Reserve not met">
      <ShieldAlert className="h-3 w-3" aria-hidden />
      Reserve not met
    </Badge>
  )
}
