import { forwardRef, type ReactElement } from 'react'
import { Slot } from '../../../primitives/Slot'
import { mergeRefs } from '../../../primitives/mergeRefs'
import { useTooltipContext } from '../Tooltip.context'

export interface TooltipTriggerProps {
  children: ReactElement<Record<string, unknown>>
}

export const TooltipTrigger = forwardRef<HTMLElement, TooltipTriggerProps>(
  ({ children }, forwardedRef) => {
    const { open, contentId, anchorRef } = useTooltipContext('Trigger')
    return (
      <Slot ref={mergeRefs(forwardedRef, anchorRef)} aria-describedby={open ? contentId : undefined}>
        {children}
      </Slot>
    )
  }
)

TooltipTrigger.displayName = 'Tooltip.Trigger'
