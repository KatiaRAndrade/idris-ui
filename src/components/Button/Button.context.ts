import { createContext, useContext } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'metallic' | 'metallic-gold'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonContextValue {
  variant: ButtonVariant
  size: ButtonSize
}

export const ButtonContext = createContext<ButtonContextValue | null>(null)

export function useButtonContext(part: string) {
  const ctx = useContext(ButtonContext)
  if (!ctx) {
    throw new Error(`<Button.${part} /> precisa estar dentro de <Button>`)
  }
  return ctx
}
