import { tv } from 'tailwind-variants'

export const checkbox = tv({
  base: [
    'inline-flex shrink-0 items-center justify-center',
    'rounded-sm border border-white/20 bg-surface',
    'transition-colors duration-fast',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
    'hover:border-white/40',
    'data-[state=checked]:border-brand-500 data-[state=checked]:bg-brand-500',
    'data-[state=indeterminate]:border-brand-500 data-[state=indeterminate]:bg-brand-500',
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
  base: 'inline-flex items-center justify-center text-text-primary',
})
