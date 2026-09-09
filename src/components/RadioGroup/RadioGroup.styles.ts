import { tv } from 'tailwind-variants'

export const root = tv({
  base: 'flex',
  variants: {
    orientation: {
      vertical: 'flex-col gap-3',
      horizontal: 'flex-row items-center gap-4',
    },
  },
  defaultVariants: { orientation: 'vertical' },
})

export const item = tv({
  base: [
    'inline-flex shrink-0 items-center justify-center',
    'rounded-full border border-white/20 bg-surface',
    'transition-colors duration-fast',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
    'hover:border-white/40',
    'data-[state=checked]:border-brand-500',
    'data-[invalid]:border-error data-[invalid]:focus-visible:ring-error',
    'data-[disabled]:opacity-40 data-[disabled]:pointer-events-none',
  ],
  variants: {
    size: {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    },
  },
  defaultVariants: { size: 'md' },
})

export const indicator = tv({
  base: 'rounded-full bg-brand-500',
  variants: {
    size: {
      sm: 'h-1.5 w-1.5',
      md: 'h-2 w-2',
      lg: 'h-2.5 w-2.5',
    },
  },
  defaultVariants: { size: 'md' },
})
