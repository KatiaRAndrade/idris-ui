import { forwardRef, useCallback, useId, useMemo, useState, type HTMLAttributes } from 'react'
import { useControllableState } from '../../hooks/useControllableState'
import { BubbleInput } from '../../primitives/BubbleInput'
import { root } from './RadioGroup.styles'
import {
  RadioGroupContext,
  type RadioGroupOrientation,
  type RadioGroupSize,
} from './RadioGroup.context'

export interface RadioGroupRootProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  size?: RadioGroupSize
  orientation?: RadioGroupOrientation
  disabled?: boolean
  invalid?: boolean
  /** Nome do campo no FormData — só necessário dentro de um <form> nativo. */
  name?: string
}

export const RadioGroupRoot = forwardRef<HTMLDivElement, RadioGroupRootProps>(
  (
    {
      className,
      value: valueProp,
      defaultValue,
      onValueChange,
      size = 'md',
      orientation = 'vertical',
      disabled = false,
      invalid = false,
      name,
      children,
      ...props
    },
    ref
  ) => {
    const [value, setValue] = useControllableState<string | undefined>({
      value: valueProp,
      defaultValue,
      onChange: onValueChange as (v: string | undefined) => void,
    })

    // Registro dos itens habilitados, em ordem de montagem —
    // mesmo padrão do registerDescribedBy do Input.Root
    const [items, setItems] = useState<string[]>([])
    const registerItem = useCallback((itemValue: string) => {
      setItems((prev) => (prev.includes(itemValue) ? prev : [...prev, itemValue]))
      return () => setItems((prev) => prev.filter((v) => v !== itemValue))
    }, [])

    const ctx = useMemo(
      () => ({
        value,
        setValue: setValue as (v: string) => void,
        size,
        disabled,
        invalid,
        firstValue: items[0],
        registerItem,
      }),
      [value, setValue, size, disabled, invalid, items, registerItem]
    )

    const fallbackName = useId()

    return (
      <RadioGroupContext.Provider value={ctx}>
        <div
          ref={ref}
          role="radiogroup"
          aria-orientation={orientation}
          aria-invalid={invalid || undefined}
          aria-disabled={disabled || undefined}
          data-orientation={orientation}
          data-size={size}
          data-invalid={invalid || undefined}
          data-disabled={disabled || undefined}
          className={root({ orientation, className })}
          {...props}
        >
          {children}
        </div>

        {name ? (
          <BubbleInput
            type="radio"
            name={name}
            value={value ?? ''}
            checked={value !== undefined}
            disabled={disabled}
            id={fallbackName}
          />
        ) : null}
      </RadioGroupContext.Provider>
    )
  }
)

RadioGroupRoot.displayName = 'RadioGroup.Root'
