import { Card as Root } from './Card'
import { CardHeader } from './parts/Header'
import { CardTitle } from './parts/Title'
import { CardDescription } from './parts/Description'
import { CardContent } from './parts/Content'
import { CardFooter } from './parts/Footer'
import { card as cardStyles } from './Card.styles'

export const Card = Object.assign(Root, {
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Content: CardContent,
  Footer: CardFooter,
  Styles: cardStyles,
})

export type { CardProps } from './Card'
export type { CardTitleProps } from './parts/Title'
