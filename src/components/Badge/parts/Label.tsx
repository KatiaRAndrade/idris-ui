import type { HTMLAttributes } from 'react'
import { useBadgeContext } from '../Badge.context'

export function BadgeLabel({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  useBadgeContext('Label')
  return <span className={className} {...props} />
}

BadgeLabel.displayName = 'Badge.Label'
