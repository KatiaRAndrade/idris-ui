import { createContext, useContext } from 'react'

export type RadioGroupSize = 'sm' | 'md' | 'lg'
export type RadioGroupOrientation = 'vertical' | 'horizontal'

export interface RadioGroupContextValue {
  value: string | undefined
  setValue: (value: string) => void
  size: RadioGroupSize
  disabled: boolean
  invalid: boolean
  /** Primeiro item habilitado — recebe tabIndex 0 quando nada está selecionado. */
  firstValue: string | undefined
  /** Cada item habilitado se registra ao montar. Devolve a função de limpeza. */
  registerItem: (value: string) => () => void
}

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null)

export function useRadioGroupContext(part: string) {
  const ctx = useContext(RadioGroupContext)
  if (!ctx) {
    throw new Error(`<RadioGroup.${part} /> precisa estar dentro de <RadioGroup.Root>`)
  }
  return ctx
}

/** Contexto do item — só pro Indicator saber se deve aparecer. */
export interface RadioItemContextValue {
  checked: boolean
  size: RadioGroupSize
}

export const RadioItemContext = createContext<RadioItemContextValue | null>(null)

export function useRadioItemContext(part: string) {
  const ctx = useContext(RadioItemContext)
  if (!ctx) {
    throw new Error(`<RadioGroup.${part} /> precisa estar dentro de <RadioGroup.Item>`)
  }
  return ctx
}
