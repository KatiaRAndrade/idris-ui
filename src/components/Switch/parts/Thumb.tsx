import { forwardRef, type HTMLAttributes } from 'react'
import { useSwitchContext } from '../Switch.context'
import { thumb } from '../Switch.styles'

export const SwitchThumb = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => {
    const { size } = useSwitchContext('Thumb')
    // A posição vem do `data-state` do root via `group-data-[state=checked]:`
    // — o Thumb não precisa saber se está ligado, só qual o tamanho.
    return <span ref={ref} aria-hidden className={thumb({ size, className })} {...props} />
  }
)

SwitchThumb.displayName = 'Switch.Thumb'
