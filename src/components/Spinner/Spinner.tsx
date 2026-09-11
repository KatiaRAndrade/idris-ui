import { forwardRef, type HTMLAttributes } from 'react'
import { VisuallyHidden } from '../../primitives/VisuallyHidden'
import { spinner } from './Spinner.styles'

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl'

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: SpinnerSize
  /**
   * Texto anunciado por leitores de tela. Sem ele, o spinner é decoração
   * (`aria-hidden`) — o padrão, porque normalmente o controle em volta
   * já comunica o estado via `aria-busy`.
   */
  label?: string
}

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(
  ({ className, size = 'md', label, ...props }, ref) => {
    const circle = (
      <span
        ref={label ? undefined : ref}
        aria-hidden
        data-size={size}
        className={spinner({ size, className })}
        {...(label ? {} : props)}
      />
    )

    if (!label) return circle

    return (
      <span ref={ref} role="status" {...props}>
        {circle}
        <VisuallyHidden>{label}</VisuallyHidden>
      </span>
    )
  }
)

Spinner.displayName = 'Spinner'
