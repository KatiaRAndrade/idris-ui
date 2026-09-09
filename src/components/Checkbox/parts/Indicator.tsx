import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { useCheckboxContext, type CheckboxSize } from '../Checkbox.context'
import { indicator } from '../Checkbox.styles'

const ICON_SIZE: Record<CheckboxSize, number> = { sm: 10, md: 12, lg: 14 }

export interface CheckboxIndicatorProps extends HTMLAttributes<HTMLSpanElement> {
  /** Conteúdo mostrado no estado indeterminado. Default: um traço. */
  indeterminate?: ReactNode
}

export const CheckboxIndicator = forwardRef<HTMLSpanElement, CheckboxIndicatorProps>(
  ({ className, children, indeterminate, ...props }, ref) => {
    const { checked, size } = useCheckboxContext('Indicator')

    if (checked === false) return null

    const fallbackDash = (
      <span
        style={{ width: ICON_SIZE[size], height: 2 }}
        className="rounded-full bg-current"
        aria-hidden
      />
    )

    return (
      <span ref={ref} aria-hidden className={indicator({ className })} {...props}>
        {checked === 'indeterminate' ? (indeterminate ?? fallbackDash) : children}
      </span>
    )
  }
)

CheckboxIndicator.displayName = 'Checkbox.Indicator'
