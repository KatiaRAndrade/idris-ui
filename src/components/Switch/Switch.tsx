import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { useControllableState } from '../../hooks/useControllableState'
import { BubbleInput } from '../../primitives/BubbleInput'
import { root } from './Switch.styles'
import { SwitchContext, type SwitchSize } from './Switch.context'

export interface SwitchProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'value' | 'type'> {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  size?: SwitchSize
  /** Nome do campo no FormData — só necessário dentro de um <form> nativo. */
  name?: string
  /** Valor enviado quando ligado. Default: "on". */
  value?: string
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      className,
      checked: checkedProp,
      defaultChecked = false,
      onCheckedChange,
      size = 'md',
      disabled,
      name,
      value = 'on',
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const [checked, setChecked] = useControllableState<boolean>({
      value: checkedProp,
      defaultValue: defaultChecked,
      onChange: onCheckedChange,
    })

    return (
      <SwitchContext.Provider value={{ checked, size }}>
        <button
          ref={ref}
          type="button"
          role="switch"
          aria-checked={checked}
          data-state={checked ? 'checked' : 'unchecked'}
          data-size={size}
          data-disabled={disabled || undefined}
          disabled={disabled}
          className={root({ size, className })}
          onClick={(event) => {
            onClick?.(event)
            if (event.defaultPrevented) return
            setChecked((prev) => !prev)
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
            checked={checked}
            disabled={disabled}
          />
        ) : null}
      </SwitchContext.Provider>
    )
  }
)

Switch.displayName = 'Switch'
