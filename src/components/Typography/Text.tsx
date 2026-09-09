import { forwardRef, type HTMLAttributes, type ElementType } from 'react'
import { text } from './Text.styles'

export type TextSize = 'body-lg' | 'body' | 'body-sm' | 'label' | 'caption'
export type TextTag = 'p' | 'span' | 'label' | 'div'

export interface TextProps extends HTMLAttributes<HTMLElement> {
  size?: TextSize
  color?: 'primary' | 'secondary'
  truncate?: boolean
  as?: TextTag
}

export const Text = forwardRef<HTMLElement, TextProps>(
  ({ className, size = 'body', color = 'primary', truncate, as = 'p', ...props }, ref) => {
    const Tag = as as ElementType
    return (
      <Tag
        ref={ref}
        data-size={size}
        className={text({ size, color, truncate, className })}
        {...props}
      />
    )
  }
)

Text.displayName = 'Text'
