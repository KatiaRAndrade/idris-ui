import { Tooltip as Root } from './Tooltip'
import { TooltipTrigger } from './parts/Trigger'
import { TooltipContent } from './parts/Content'
import { TooltipArrow } from './parts/Arrow'
import { tooltip as tooltipStyles } from './Tooltip.styles'

export const Tooltip = Object.assign(Root, {
  Trigger: TooltipTrigger,
  Content: TooltipContent,
  Arrow: TooltipArrow,
  Styles: tooltipStyles,
})

export type { TooltipProps } from './Tooltip'
export type { TooltipTriggerProps } from './parts/Trigger'
export type { TooltipContentProps } from './parts/Content'
export type { TooltipArrowProps } from './parts/Arrow'
export type { TooltipSide, TooltipAlign, TooltipSize } from './Tooltip.context'
