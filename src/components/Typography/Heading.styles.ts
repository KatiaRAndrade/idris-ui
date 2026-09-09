import { tv } from 'tailwind-variants'

export const heading = tv({
  base: 'font-display text-text-primary',
  variants: {
    size: {
      display: 'text-[56px] font-light leading-[1.1]',
      h1: 'text-[40px] font-normal leading-[1.15]',
      h2: 'text-[32px] font-normal leading-[1.2]',
      h3: 'text-[24px] font-semibold leading-[1.25]',
      h4: 'text-[20px] font-semibold leading-[1.3]',
    },
  },
  defaultVariants: { size: 'h2' },
})
