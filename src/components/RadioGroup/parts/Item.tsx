import { forwardRef, useEffect, type ButtonHTMLAttributes } from 'react'
import { resolveRovingTabIndex, useRovingFocus } from '../../../hooks/useRovingFocus'
import { useRadioGroupContext, RadioItemContext } from '../RadioGroup.context'
import { item as itemStyles } from '../RadioGroup.styles'

export interface RadioGroupItemProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'type'> {
  value: string
}

export const RadioGroupItem = forwardRef<HTMLButtonElement, RadioGroupItemProps>(
  ({ className, value, disabled, onClick, onKeyDown, children, ...props }, ref) => {
    const group = useRadioGroupContext('Item')
    const isDisabled = disabled || group.disabled
    const checked = group.value === value

    // Só itens habilitados entram na disputa pelo tabIndex 0
    useEffect(() => {
      if (isDisabled) return
      return group.registerItem(value)
    }, [isDisabled, value, group.registerItem]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleRovingKeyDown = useRovingFocus({
      containerSelector: '[role="radiogroup"]',
      orientation: 'both', // radio aceita as quatro setas
      loop: true,
      activateOnNavigate: true, // navegar seleciona — comportamento nativo de radio
    })

    return (
      <RadioItemContext.Provider value={{ checked, size: group.size }}>
        <button
          ref={ref}
          type="button"
          role="radio"
          data-roving-item
          aria-checked={checked}
          tabIndex={resolveRovingTabIndex({
            isActive: checked,
            hasActive: group.value !== undefined,
            isFirst: group.firstValue === value,
          })}
          disabled={isDisabled}
          data-state={checked ? 'checked' : 'unchecked'}
          data-size={group.size}
          data-invalid={group.invalid || undefined}
          data-disabled={isDisabled || undefined}
          className={itemStyles({ size: group.size, className })}
          onClick={(event) => {
            onClick?.(event)
            if (event.defaultPrevented) return
            group.setValue(value)
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event)
            if (event.defaultPrevented) return
            handleRovingKeyDown(event)
          }}
          {...props}
        >
          {children}
        </button>
      </RadioItemContext.Provider>
    )
  }
)

RadioGroupItem.displayName = 'RadioGroup.Item'
