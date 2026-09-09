import { forwardRef, useEffect, type ButtonHTMLAttributes } from 'react'
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

    const isRovingTarget = checked || (group.value === undefined && group.firstValue === value)

    return (
      <RadioItemContext.Provider value={{ checked, size: group.size }}>
        <button
          ref={ref}
          type="button"
          role="radio"
          aria-checked={checked}
          tabIndex={isRovingTarget ? 0 : -1}
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
            handleArrowNavigation(event)
          }}
          {...props}
        >
          {children}
        </button>
      </RadioItemContext.Provider>
    )
  }
)

const NEXT_KEYS = ['ArrowDown', 'ArrowRight']
const PREV_KEYS = ['ArrowUp', 'ArrowLeft']

/**
 * Move o foco pro item vizinho e o seleciona (padrão ARIA de radiogroup:
 * navegar já seleciona). Os irmãos vêm de uma query no DOM — ver seção 3.
 */
function handleArrowNavigation(event: React.KeyboardEvent<HTMLButtonElement>) {
  const isNext = NEXT_KEYS.includes(event.key)
  const isPrev = PREV_KEYS.includes(event.key)
  if (!isNext && !isPrev) return

  const group = event.currentTarget.closest('[role="radiogroup"]')
  if (!group) return

  const items = Array.from(
    group.querySelectorAll<HTMLButtonElement>('[role="radio"]:not([disabled])')
  )
  const current = items.indexOf(event.currentTarget)
  if (current === -1) return

  // Circular: do último volta pro primeiro, e vice-versa
  const nextIndex = isNext
    ? (current + 1) % items.length
    : (current - 1 + items.length) % items.length

  event.preventDefault() // impede a página de rolar com as setas
  items[nextIndex].focus()
  items[nextIndex].click() // navegar seleciona
}

RadioGroupItem.displayName = 'RadioGroup.Item'
