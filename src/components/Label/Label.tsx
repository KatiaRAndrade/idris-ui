import { forwardRef, type LabelHTMLAttributes } from 'react'
import { VisuallyHidden } from '../../primitives/VisuallyHidden'
import { label, requiredMark } from './Label.styles'

export type LabelSize = 'sm' | 'md'

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  size?: LabelSize
  required?: boolean
  /** Visual apenas — um <label> não tem estado desabilitado nativo. */
  disabled?: boolean
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, size = 'md', required = false, disabled = false, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        data-size={size}
        data-required={required || undefined}
        data-disabled={disabled || undefined}
        className={label({ size, className })}
        {...props}
      >
        {children}
        {required && (
          <>
            {/* O asterisco é decoração; o texto real vai escondido pro leitor de tela */}
            <span aria-hidden className={requiredMark()}>
              *
            </span>
            <VisuallyHidden>(obrigatório)</VisuallyHidden>
          </>
        )}
      </label>
    )
  }
)

Label.displayName = 'Label'
