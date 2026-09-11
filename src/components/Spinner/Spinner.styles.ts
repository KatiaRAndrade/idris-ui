import { tv } from 'tailwind-variants'

export const spinner = tv({
  base: [
    'inline-block shrink-0 rounded-full',
    // A borda toda em currentColor menos o topo, que fica transparente:
    // é o "buraco" girando que dá a leitura de progresso
    'border-current border-t-transparent',
    'animate-spin',
    // Movimento reduzido desacelera, não para — ver seção 6 do doc
    'motion-reduce:[animation-duration:2.5s]',
  ],
  variants: {
    size: {
      sm: 'h-3 w-3 border-2',
      md: 'h-4 w-4 border-2',
      lg: 'h-5 w-5 border-2',
      xl: 'h-8 w-8 border-[3px]',
    },
  },
  defaultVariants: { size: 'md' },
})
