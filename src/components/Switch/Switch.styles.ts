import { tv } from 'tailwind-variants'

export const root = tv({
  base: [
    'group relative inline-flex shrink-0 items-center',
    'rounded-full border border-white/20 bg-surface-elevated',
    'transition-colors duration-fast',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
    'data-[state=checked]:border-brand-500 data-[state=checked]:bg-brand-500',
    'data-[disabled]:opacity-40 data-[disabled]:pointer-events-none',
  ],
  variants: {
    size: {
      sm: 'h-[18px] w-8',
      md: 'h-[22px] w-10',
      lg: 'h-[26px] w-12',
    },
  },
  defaultVariants: { size: 'md' },
})

export const thumb = tv({
  base: [
    'pointer-events-none absolute left-[2px] rounded-full bg-text-primary',
    'transition-transform duration-fast',
  ],
  variants: {
    size: {
      // translate = largura do trilho − tamanho do thumb − (2px × 2 de respiro)
      sm: 'h-3.5 w-3.5 group-data-[state=checked]:translate-x-[14px]',
      md: 'h-[18px] w-[18px] group-data-[state=checked]:translate-x-[18px]',
      lg: 'h-[22px] w-[22px] group-data-[state=checked]:translate-x-[22px]',
    },
  },
  defaultVariants: { size: 'md' },
})
