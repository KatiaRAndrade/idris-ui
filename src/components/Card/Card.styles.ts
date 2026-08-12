import { tv } from 'tailwind-variants'

export const card = tv({
  base: 'rounded-lg border border-white/10 overflow-hidden transition-colors duration-fast',
  variants: {
    variant: {
      default: 'bg-surface',
      elevated: 'bg-surface-elevated',
    },
  },
  defaultVariants: { variant: 'default' },
})

export const header = tv({
  base: 'flex flex-col gap-1.5',
  variants: {
    size: {
      sm: 'p-4 pb-0',
      md: 'p-5 pb-0',
      lg: 'p-6 pb-0',
    },
  },
})

export const title = tv({
  base: 'font-display text-xl font-semibold text-text-primary',
})

export const description = tv({
  base: 'text-sm text-text-secondary',
})

export const content = tv({
  base: '',
  variants: {
    size: {
      sm: 'p-4',
      md: 'p-5',
      lg: 'p-6',
    },
  },
})

export const footer = tv({
  base: 'flex items-center justify-end gap-2 border-t border-white/10',
  variants: {
    size: {
      sm: 'p-4 mt-4',
      md: 'p-5 mt-5',
      lg: 'p-6 mt-6',
    },
  },
})
