import { tv } from 'tailwind-variants'

export const overlay = tv({
  base: [
    'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm',
    'transition-opacity duration-base',
  ],
})

export const content = tv({
  base: [
    'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
    'w-[calc(100vw-2rem)] max-h-[calc(100vh-4rem)] overflow-y-auto',
    'rounded-lg border border-white/10 bg-surface-elevated',
    'focus-visible:outline-none',
    'transition-opacity duration-base',
  ],
  variants: {
    size: {
      sm: 'max-w-[400px]',
      md: 'max-w-[520px]',
      lg: 'max-w-[680px]',
      full: 'max-w-[calc(100vw-4rem)] max-h-[calc(100vh-4rem)]',
    },
  },
  defaultVariants: { size: 'md' },
})

export const header = tv({ base: 'flex flex-col gap-1.5 p-6 pb-0' })
export const title = tv({ base: 'font-display text-xl font-semibold text-text-primary' })
export const description = tv({ base: 'text-sm text-text-secondary' })
export const body = tv({ base: 'p-6' })
export const footer = tv({
  base: 'flex items-center justify-end gap-2 border-t border-white/10 p-6',
})
export const close = tv({
  base: [
    'absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center',
    'rounded-md text-text-secondary transition-colors duration-fast',
    'hover:bg-surface hover:text-text-primary',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
  ],
})
