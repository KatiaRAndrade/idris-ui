import { createContext, useContext } from 'react'

export type InputSize = 'sm' | 'md' | 'lg'

export interface InputContextValue {
  id: string
  size: InputSize
  disabled: boolean
  invalid: boolean
  describedByIds: string[]
  registerDescribedBy: (id: string) => () => void
}

export const InputContext = createContext<InputContextValue | null>(null)

export function useInputContext(part: string) {
  const ctx = useContext(InputContext)
  if (!ctx) {
    throw new Error(`<Input.${part} /> precisa estar dentro de <Input.Root>`)
  }
  return ctx
}
