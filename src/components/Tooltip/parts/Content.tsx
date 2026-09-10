import { forwardRef, type HTMLAttributes } from 'react'
import { mergeRefs } from '../../../primitives/mergeRefs'
import { content } from '../Tooltip.styles'
import { useTooltipContext } from '../Tooltip.context'

export type TooltipContentProps = HTMLAttributes<HTMLDivElement>

export const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, style, ...props }, forwardedRef) => {
    const { open, contentId, size, floatingRef, floatingStyles, resolvedSide } =
      useTooltipContext('Content')
    if (!open) return null

    return (
      <div
        ref={mergeRefs<HTMLDivElement>(forwardedRef, floatingRef)}
        id={contentId}
        role="tooltip"
        data-side={resolvedSide}
        style={{ ...floatingStyles, ...style }}
        className={content({ size, className })}
        {...props}
      />
    )
  }
)

TooltipContent.displayName = 'Tooltip.Content'
