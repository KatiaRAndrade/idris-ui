import { forwardRef, type HTMLAttributes } from 'react'
import { useCardContext } from '../Card.context'
import { content } from '../Card.styles'

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { size } = useCardContext('Content')
    return <div ref={ref} className={content({ size, className })} {...props} />
  }
)

CardContent.displayName = 'Card.Content'
