import type { PropsWithChildren } from 'react'
import { cn } from '@/lib/utils'

interface PageContainerProps extends PropsWithChildren {
  className?: string
}

export function PageContainer({ children, className }: PageContainerProps) {
  return <div className={cn('container-page py-6 lg:py-8', className)}>{children}</div>
}
