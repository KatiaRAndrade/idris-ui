import { forwardRef, type HTMLAttributes } from 'react'
import { skeleton } from './Skeleton.styles'

export type SkeletonShape = 'text' | 'circle' | 'rect'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  shape?: SkeletonShape
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, shape = 'text', ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-shape={shape}
        className={skeleton({ shape, className })}
        {...props}
        // Sempre escondido do leitor de tela — ver seção 5 do doc.
        // Depois do spread de propósito: um aria-hidden={false} vindo
        // de fora não pode vencer. Quem anuncia é o container, com aria-busy.
        aria-hidden
      />
    )
  }
)

Skeleton.displayName = 'Skeleton'
