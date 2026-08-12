import { forwardRef, type HTMLAttributes } from 'react'
import { useCardContext } from '../Card.context'
import { footer } from '../Card.styles'

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { size } = useCardContext('Footer')
    return <div ref={ref} className={footer({ size, className })} {...props} />
  }
)

CardFooter.displayName = 'Card.Footer'
