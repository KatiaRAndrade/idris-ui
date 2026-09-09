import { forwardRef, type HTMLAttributes } from 'react'
import { useRadioItemContext } from '../RadioGroup.context'
import { indicator } from '../RadioGroup.styles'

export const RadioGroupIndicator = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => {
    const { checked, size } = useRadioItemContext('Indicator')
    if (!checked) return null
    return <span ref={ref} aria-hidden className={indicator({ size, className })} {...props} />
  }
)

RadioGroupIndicator.displayName = 'RadioGroup.Indicator'
