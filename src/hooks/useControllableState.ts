import { useCallback, useEffect, useRef, useState } from 'react'

export type SetControllableState<T> = (next: T | ((prev: T) => T)) => void

export interface UseControllableStateParams<T> {
  /** Valor vindo do consumidor. `undefined` significa não-controlado. */
  value?: T
  /** Valor inicial no modo não-controlado. */
  defaultValue: T
  /** Chamado sempre que o valor muda — nos dois modos. */
  onChange?: (value: T) => void
}

export function useControllableState<T>({
  value: controlledValue,
  defaultValue,
  onChange,
}: UseControllableStateParams<T>): [T, SetControllableState<T>] {
  const [uncontrolledValue, setUncontrolledValue] = useState<T>(defaultValue)
  const isControlled = controlledValue !== undefined
  const value = isControlled ? (controlledValue as T) : uncontrolledValue

  // Mantém o onChange sempre atualizado sem entrar nas deps do setValue —
  // senão um handler inline (`onChange={() => ...}`) recriaria o setValue a cada render.
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  })

  const setValue = useCallback<SetControllableState<T>>(
    (next) => {
      const resolved = typeof next === 'function' ? (next as (prev: T) => T)(value) : next

      // Nada mudou: não avisa ninguém. Evita re-render e onChange redundante.
      if (Object.is(resolved, value)) return

      if (!isControlled) setUncontrolledValue(resolved)
      onChangeRef.current?.(resolved)
    },
    [isControlled, value]
  )

  useControlledWarning(isControlled)

  return [value, setValue]
}

/** Avisa em dev se o componente alternar entre controlado e não-controlado. */
function useControlledWarning(isControlled: boolean) {
  const wasControlled = useRef(isControlled)

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return
    if (wasControlled.current !== isControlled) {
      console.warn(
        `[idris] Um componente mudou de ${wasControlled.current ? 'controlado para não-controlado' : 'não-controlado para controlado'}. ` +
          `Decida um dos dois modos e mantenha — provavelmente o \`value\` virou \`undefined\` sem querer.`
      )
      wasControlled.current = isControlled
    }
  }, [isControlled])
}
