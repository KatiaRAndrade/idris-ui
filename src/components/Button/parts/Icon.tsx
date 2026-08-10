import { cloneElement, isValidElement, type ReactElement } from 'react'
import { useButtonContext, type ButtonSize } from '../Button.context'

const ICON_SIZE: Record<ButtonSize, number> = { sm: 14, md: 16, lg: 18 }

export interface ButtonIconProps {
  children: ReactElement<{ width?: number; height?: number; 'aria-hidden'?: boolean }>
}

export function ButtonIcon({ children }: ButtonIconProps) {
  const { size } = useButtonContext('Icon')
  if (!isValidElement(children)) return null

  return cloneElement(children, {
    width: ICON_SIZE[size],
    height: ICON_SIZE[size],
    'aria-hidden': true,
  })
}

ButtonIcon.displayName = 'Button.Icon'
