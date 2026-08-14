import { forwardRef, type HTMLAttributes, type ReactElement } from 'react'
import { Slot } from '../../primitives/Slot'
import { badge } from './Badge.styles'
import { BadgeContext, type BadgeVariant, type BadgeSize } from './Badge.context'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
  asChild?: boolean
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'neutral', size = 'md', asChild, children, ...props }, ref) => {
    const sharedProps = {
      'data-variant': variant,
      'data-size': size,
      className: badge({ variant, size, className }),
    }

    return (
      <BadgeContext.Provider value={{ size }}>
        {asChild ? (
          <Slot ref={ref} {...sharedProps} {...props}>
            {children as ReactElement<Record<string, unknown>>}
          </Slot>
        ) : (
          <span ref={ref} {...sharedProps} {...props}>
            {children}
          </span>
        )}
      </BadgeContext.Provider>
    )
  }
)

Badge.displayName = 'Badge'
