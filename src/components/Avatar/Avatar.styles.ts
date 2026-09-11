import { tv } from 'tailwind-variants'

export const avatar = tv({
  base: [
    'relative inline-flex shrink-0 items-center justify-center overflow-hidden',
    'rounded-full border border-white/10 bg-surface-elevated select-none',
  ],
  variants: {
    size: {
      xs: 'h-6 w-6',
      sm: 'h-8 w-8',
      md: 'h-10 w-10',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16',
    },
  },
  defaultVariants: { size: 'md' },
})

export const image = tv({
  base: 'h-full w-full object-cover',
})

export const fallback = tv({
  base: 'font-sans font-medium uppercase text-text-secondary',
  variants: {
    size: {
      xs: 'text-[10px]',
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-2xl',
    },
  },
  defaultVariants: { size: 'md' },
})
