import { createContext, useContext } from 'react'

export type CardVariant = 'default' | 'elevated'
export type CardSize = 'sm' | 'md' | 'lg'

export interface CardContextValue {
  size: CardSize
}

export const CardContext = createContext<CardContextValue | null>(null)

export function useCardContext(part: string) {
  const ctx = useContext(CardContext)
  if (!ctx) {
    throw new Error(`<Card.${part} /> precisa estar dentro de <Card>`)
  }
  return ctx
}
