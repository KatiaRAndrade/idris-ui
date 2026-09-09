import { forwardRef, type ReactElement } from 'react'
import { Slot } from '../../../primitives/Slot'
import { useTooltipContext } from '../Tooltip.context'

export interface TooltipTriggerProps {
  children: ReactElement<Record<string, unknown>>
}

export const TooltipTrigger = forwardRef<HTMLElement, TooltipTriggerProps>(
  ({ children }, ref) => {
    const { open, contentId } = useTooltipContext('Trigger')
    return (
      <Slot ref={ref} aria-describedby={open ? contentId : undefined}>
        {children}
      </Slot>
    )
  }
)

TooltipTrigger.displayName = 'Tooltip.Trigger'
