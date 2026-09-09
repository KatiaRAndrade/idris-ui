import { tv } from 'tailwind-variants'

export const tooltip = tv({
  base: 'relative inline-flex',
})

export const content = tv({
  base: 'absolute z-50 w-max max-w-xs rounded-md border border-white/10 bg-surface-elevated font-sans text-text-primary shadow-lg pointer-events-none',
  variants: {
    side: {
      top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
      right: 'left-full top-1/2 ml-2 -translate-y-1/2',
      bottom: 'top-full left-1/2 mt-2 -translate-x-1/2',
      left: 'right-full top-1/2 mr-2 -translate-y-1/2',
    },
    size: {
      sm: 'px-2 py-1 text-xs',
      md: 'px-2.5 py-1.5 text-sm',
    },
  },
  defaultVariants: { side: 'top', size: 'md' },
})
