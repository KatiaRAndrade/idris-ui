import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { useControllableState } from '../../hooks/useControllableState'
import { BubbleInput } from '../../primitives/BubbleInput'
import { checkbox } from './Checkbox.styles'
import {
  CheckboxContext,
  toDataState,
  type CheckedState,
  type CheckboxSize,
} from './Checkbox.context'

export interface CheckboxProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'value' | 'type'> {
  checked?: CheckedState
  defaultChecked?: CheckedState
  onCheckedChange?: (checked: CheckedState) => void
  size?: CheckboxSize
  invalid?: boolean
  /** Nome do campo no FormData — só necessário dentro de um <form> nativo. */
  name?: string
  /** Valor enviado quando marcado. Default: "on", igual ao input nativo. */
  value?: string
}

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  (
    {
      className,
      checked: checkedProp,
      defaultChecked = false,
      onCheckedChange,
      size = 'md',
      invalid = false,
      disabled,
      name,
      value = 'on',
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const [checked, setChecked] = useControllableState<CheckedState>({
      value: checkedProp,
      defaultValue: defaultChecked,
      onChange: onCheckedChange,
    })

    return (
      <CheckboxContext.Provider value={{ checked, size }}>
        <button
          ref={ref}
          type="button"
          role="checkbox"
          // 'mixed' é o valor ARIA pro estado indeterminado — não existe "aria-indeterminate"
          aria-checked={checked === 'indeterminate' ? 'mixed' : checked}
          aria-invalid={invalid || undefined}
          data-state={toDataState(checked)}
          data-size={size}
          data-invalid={invalid || undefined}
          data-disabled={disabled || undefined}
          disabled={disabled}
          className={checkbox({ size, className })}
          onClick={(event) => {
            onClick?.(event)
            if (event.defaultPrevented) return
            // Indeterminado sempre vira marcado — nunca volta sozinho pro estado misto
            setChecked((prev) => (prev === 'indeterminate' ? true : !prev))
          }}
          {...props}
        >
          {children}
        </button>

        {name ? (
          <BubbleInput
            type="checkbox"
            name={name}
            value={value}
            checked={checked === true}
            disabled={disabled}
          />
        ) : null}
      </CheckboxContext.Provider>
    )
  }
)

Checkbox.displayName = 'Checkbox'
