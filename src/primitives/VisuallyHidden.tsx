import { forwardRef, type HTMLAttributes } from 'react'

export const VisuallyHidden = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    // `sr-only` é utilitário nativo do Tailwind: position absolute, 1×1px,
    // clip-path, overflow hidden — some da tela sem sair do a11y tree
    <span ref={ref} className={`sr-only ${className ?? ''}`} {...props} />
  )
)

VisuallyHidden.displayName = 'VisuallyHidden'
