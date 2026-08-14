import { cloneElement, isValidElement, type ReactElement } from 'react'
import { useBadgeContext, type BadgeSize } from '../Badge.context'

const ICON_SIZE: Record<BadgeSize, number> = { sm: 10, md: 12 }

export interface BadgeIconProps {
  children: ReactElement<{ width?: number; height?: number; 'aria-hidden'?: boolean }>
}

export function BadgeIcon({ children }: BadgeIconProps) {
  const { size } = useBadgeContext('Icon')
  if (!isValidElement(children)) return null

  return cloneElement(children, {
    width: ICON_SIZE[size],
    height: ICON_SIZE[size],
    'aria-hidden': true,
  })
}

BadgeIcon.displayName = 'Badge.Icon'
