import { tv } from 'tailwind-variants'

export const tooltip = tv({
  base: 'inline-flex',
})

export const content = tv({
  base: [
    'z-50 w-max max-w-xs rounded-md border border-white/10 bg-surface-elevated',
    'font-sans text-text-primary shadow-lg pointer-events-none',
    // A animação de entrada nasce do lado certo, depois do flip
    'data-[side=top]:origin-bottom',
    'data-[side=bottom]:origin-top',
    'data-[side=left]:origin-right',
    'data-[side=right]:origin-left',
  ],
  variants: {
    size: {
      sm: 'px-2 py-1 text-xs',
      md: 'px-2.5 py-1.5 text-sm',
    },
  },
  defaultVariants: { size: 'md' },
})

export const arrow = tv({
  base: [
    'h-2 w-2 rotate-45 bg-surface-elevated border border-white/10',
    // A seta encosta na borda oposta ao lado resolvido
    'data-[side=bottom]:-top-1 data-[side=bottom]:border-b-0 data-[side=bottom]:border-r-0',
    'data-[side=top]:-bottom-1 data-[side=top]:border-t-0 data-[side=top]:border-l-0',
    'data-[side=right]:-left-1 data-[side=right]:border-r-0 data-[side=right]:border-t-0',
    'data-[side=left]:-right-1 data-[side=left]:border-l-0 data-[side=left]:border-b-0',
  ],
})
