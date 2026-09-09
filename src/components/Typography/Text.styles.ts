import { tv } from 'tailwind-variants'

export const text = tv({
  base: 'font-sans',
  variants: {
    size: {
      'body-lg': 'text-lg leading-[1.6]',
      body: 'text-base leading-[1.6]',
      'body-sm': 'text-sm leading-[1.5]',
      label: 'text-sm font-medium leading-[1.4]',
      caption: 'text-xs font-medium leading-[1.4] uppercase tracking-wide',
    },
    color: {
      primary: 'text-text-primary',
      secondary: 'text-text-secondary',
    },
    truncate: {
      true: 'truncate',
    },
  },
  defaultVariants: { size: 'body', color: 'primary' },
})
