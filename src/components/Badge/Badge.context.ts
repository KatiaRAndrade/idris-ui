import { createContext, useContext } from 'react'

export type BadgeVariant = 'neutral' | 'brand' | 'accent' | 'success' | 'warning' | 'error' | 'info'
export type BadgeSize = 'sm' | 'md'

export interface BadgeContextValue {
  size: BadgeSize
}

export const BadgeContext = createContext<BadgeContextValue | null>(null)

export function useBadgeContext(part: string) {
  const ctx = useContext(BadgeContext)
  if (!ctx) {
    throw new Error(`<Badge.${part} /> precisa estar dentro de <Badge>`)
  }
  return ctx
}
