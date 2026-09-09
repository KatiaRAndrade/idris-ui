import { createContext, useContext } from 'react'

export type CheckedState = boolean | 'indeterminate'
export type CheckboxSize = 'sm' | 'md' | 'lg'

export interface CheckboxContextValue {
  checked: CheckedState
  size: CheckboxSize
}

export const CheckboxContext = createContext<CheckboxContextValue | null>(null)

export function useCheckboxContext(part: string) {
  const ctx = useContext(CheckboxContext)
  if (!ctx) {
    throw new Error(`<Checkbox.${part} /> precisa estar dentro de <Checkbox>`)
  }
  return ctx
}

/** Traduz o estado interno pro valor do `data-state`. */
export function toDataState(checked: CheckedState) {
  if (checked === 'indeterminate') return 'indeterminate'
  return checked ? 'checked' : 'unchecked'
}
