import { forwardRef, type HTMLAttributes } from 'react'
import { heading } from './Heading.styles'

export type HeadingSize = 'display' | 'h1' | 'h2' | 'h3' | 'h4'
export type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

// Tag semântica padrão por tamanho — pode ser sobrescrita via `as`
const DEFAULT_TAG: Record<HeadingSize, HeadingTag> = {
  display: 'h1',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
}

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  size?: HeadingSize
  as?: HeadingTag
}

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, size = 'h2', as, ...props }, ref) => {
    const Tag = as ?? DEFAULT_TAG[size]
    return <Tag ref={ref} data-size={size} className={heading({ size, className })} {...props} />
  }
)

Heading.displayName = 'Heading'
