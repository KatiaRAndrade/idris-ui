import { forwardRef, type HTMLAttributes } from 'react'
import { useButtonContext } from '../Button.context'

export const ButtonContent = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ className, children, ...props }, ref) => {
    useButtonContext('Content')
    return (
      <span ref={ref} className={`inline-flex items-center gap-2 ${className ?? ''}`} {...props}>
        {children}
      </span>
    )
  }
)

ButtonContent.displayName = 'Button.Content'
