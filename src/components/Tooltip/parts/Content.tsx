import { forwardRef, type HTMLAttributes } from 'react'
import { content } from '../Tooltip.styles'
import { useTooltipContext } from '../Tooltip.context'

export type TooltipContentProps = HTMLAttributes<HTMLDivElement>

export const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, ...props }, ref) => {
    const { open, contentId, side, size } = useTooltipContext('Content')
    if (!open) return null

    return (
      <div
        ref={ref}
        id={contentId}
        role="tooltip"
        data-side={side}
        className={content({ side, size, className })}
        {...props}
      />
    )
  }
)

TooltipContent.displayName = 'Tooltip.Content'
