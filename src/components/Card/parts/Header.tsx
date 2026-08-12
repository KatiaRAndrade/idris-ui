import { forwardRef, type HTMLAttributes } from 'react'
import { useCardContext } from '../Card.context'
import { header } from '../Card.styles'

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { size } = useCardContext('Header')
    return <div ref={ref} className={header({ size, className })} {...props} />
  }
)

CardHeader.displayName = 'Card.Header'
