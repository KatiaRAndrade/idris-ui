import { forwardRef, type HTMLAttributes } from 'react'
import { mergeRefs } from '../../../primitives/mergeRefs'
import { arrow } from '../Tooltip.styles'
import { useTooltipContext } from '../Tooltip.context'

export type TooltipArrowProps = HTMLAttributes<HTMLSpanElement>

export const TooltipArrow = forwardRef<HTMLSpanElement, TooltipArrowProps>(
  ({ className, style, ...props }, forwardedRef) => {
    const { open, arrowRef, arrowStyles, resolvedSide } = useTooltipContext('Arrow')
    if (!open) return null

    return (
      <span
        ref={mergeRefs(forwardedRef, arrowRef)}
        aria-hidden
        data-side={resolvedSide}
        style={{ ...arrowStyles, ...style }}
        className={arrow({ className })}
        {...props}
      />
    )
  }
)

TooltipArrow.displayName = 'Tooltip.Arrow'
