import { Tooltip as Root } from './Tooltip'
import { TooltipTrigger } from './parts/Trigger'
import { TooltipContent } from './parts/Content'
import { tooltip as tooltipStyles } from './Tooltip.styles'

export const Tooltip = Object.assign(Root, {
  Trigger: TooltipTrigger,
  Content: TooltipContent,
  Styles: tooltipStyles,
})

export type { TooltipProps } from './Tooltip'
export type { TooltipTriggerProps } from './parts/Trigger'
export type { TooltipContentProps } from './parts/Content'
export type { TooltipSide, TooltipSize } from './Tooltip.context'
