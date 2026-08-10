import type { HTMLAttributes } from 'react'
import { useButtonContext } from '../Button.context'

export function ButtonLabel({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  useButtonContext('Label')
  return <span className={className} {...props} />
}

ButtonLabel.displayName = 'Button.Label'
