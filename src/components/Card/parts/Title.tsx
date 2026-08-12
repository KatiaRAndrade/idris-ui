import { forwardRef, type HTMLAttributes, type ReactElement } from 'react'
import { Slot } from '../../../primitives/Slot'
import { useCardContext } from '../Card.context'
import { title } from '../Card.styles'

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  asChild?: boolean
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, asChild, children, ...props }, ref) => {
    useCardContext('Title')
    const sharedProps = { className: title({ className }) }

    if (asChild) {
      return (
        <Slot ref={ref} {...sharedProps} {...props}>
          {children as ReactElement<Record<string, unknown>>}
        </Slot>
      )
    }

    return (
      <h3 ref={ref} {...sharedProps} {...props}>
        {children}
      </h3>
    )
  }
)

CardTitle.displayName = 'Card.Title'
