import { createContext, useContext } from 'react'

export type TooltipSide = 'top' | 'right' | 'bottom' | 'left'
export type TooltipSize = 'sm' | 'md'

export interface TooltipContextValue {
  open: boolean
  contentId: string
  side: TooltipSide
  size: TooltipSize
  show: () => void
  hide: () => void
}

export const TooltipContext = createContext<TooltipContextValue | null>(null)

export function useTooltipContext(part: string) {
  const ctx = useContext(TooltipContext)
  if (!ctx) {
    throw new Error(`<Tooltip.${part} /> precisa estar dentro de <Tooltip>`)
  }
  return ctx
}
