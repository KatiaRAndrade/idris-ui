import { forwardRef, type HTMLAttributes } from 'react'
import { separator } from './Separator.styles'

export type SeparatorOrientation = 'horizontal' | 'vertical'

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: SeparatorOrientation
  /** Puramente visual — sai da árvore de acessibilidade. */
  decorative?: boolean
}

export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = 'horizontal', decorative = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role={decorative ? 'none' : 'separator'}
        // aria-orientation só faz sentido num separator de verdade
        aria-orientation={decorative ? undefined : orientation}
        aria-hidden={decorative || undefined}
        data-orientation={orientation}
        className={separator({ orientation, className })}
        {...props}
      />
    )
  }
)

Separator.displayName = 'Separator'
