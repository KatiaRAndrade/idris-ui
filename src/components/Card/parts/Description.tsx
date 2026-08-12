import type { HTMLAttributes } from 'react'
import { useCardContext } from '../Card.context'
import { description } from '../Card.styles'

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  useCardContext('Description')
  return <p className={description({ className })} {...props} />
}

CardDescription.displayName = 'Card.Description'
