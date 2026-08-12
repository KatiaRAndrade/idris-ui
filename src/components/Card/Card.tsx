import { forwardRef, type HTMLAttributes, type ReactElement } from 'react'
import { Slot } from '../../primitives/Slot'
import { card } from './Card.styles'
import { CardContext, type CardVariant, type CardSize } from './Card.context'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  size?: CardSize
  asChild?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', size = 'md', asChild, children, ...props }, ref) => {
    const sharedProps = {
      'data-variant': variant,
      'data-size': size,
      className: card({ variant, className }),
    }

    return (
      <CardContext.Provider value={{ size }}>
        {asChild ? (
          <Slot ref={ref} {...sharedProps} {...props}>
            {children as ReactElement<Record<string, unknown>>}
          </Slot>
        ) : (
          <div ref={ref} {...sharedProps} {...props}>
            {children}
          </div>
        )}
      </CardContext.Provider>
    )
  }
)

Card.displayName = 'Card'
