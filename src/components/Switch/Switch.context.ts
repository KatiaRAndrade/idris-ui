import { createContext, useContext } from 'react'

export type SwitchSize = 'sm' | 'md' | 'lg'

export interface SwitchContextValue {
  checked: boolean
  size: SwitchSize
}

export const SwitchContext = createContext<SwitchContextValue | null>(null)

export function useSwitchContext(part: string) {
  const ctx = useContext(SwitchContext)
  if (!ctx) {
    throw new Error(`<Switch.${part} /> precisa estar dentro de <Switch>`)
  }
  return ctx
}
