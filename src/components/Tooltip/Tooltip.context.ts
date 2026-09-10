import { createContext, useContext, type CSSProperties } from 'react'
import type { Align, Side } from '../../hooks/useFloating'

export type TooltipSide = Side
export type TooltipAlign = Align
export type TooltipSize = 'sm' | 'md'

export interface TooltipContextValue {
  open: boolean
  contentId: string
  size: TooltipSize
  show: () => void
  hide: () => void
  anchorRef: (node: HTMLElement | null) => void
  floatingRef: (node: HTMLElement | null) => void
  arrowRef: (node: HTMLElement | null) => void
  floatingStyles: CSSProperties
  arrowStyles: CSSProperties
  /** Lado e alinhamento REAIS depois do flip — o que vira data-side no Content/Arrow. */
  resolvedSide: Side
  resolvedAlign: Align
}

export const TooltipContext = createContext<TooltipContextValue | null>(null)

export function useTooltipContext(part: string) {
  const ctx = useContext(TooltipContext)
  if (!ctx) {
    throw new Error(`<Tooltip.${part} /> precisa estar dentro de <Tooltip>`)
  }
  return ctx
}
