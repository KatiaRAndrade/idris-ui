import { forwardRef, type AnchorHTMLAttributes } from 'react'
import { VisuallyHidden } from '../../primitives/VisuallyHidden'
import { link } from './Link.styles'

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * Marca o link como saída do site: aplica target="_blank" + rel="noopener
   * noreferrer" (a menos que target/rel já tenham sido passados explicitamente)
   * e acrescenta um ícone + aviso pro leitor de tela.
   */
  external?: boolean
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, external = false, target, rel, children, ...props }, ref) => {
    return (
      <a
        ref={ref}
        target={target ?? (external ? '_blank' : undefined)}
        rel={rel ?? (external ? 'noopener noreferrer' : undefined)}
        data-external={external || undefined}
        className={link({ className })}
        {...props}
      >
        {children}
        {external && (
          <>
            {/* Decoração — o que o leitor de tela anuncia é o texto escondido abaixo */}
            <svg
              aria-hidden
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M3.5 8.5 8.5 3.5M4.5 3.5h4v4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <VisuallyHidden>(abre em nova aba)</VisuallyHidden>
          </>
        )}
      </a>
    )
  }
)

Link.displayName = 'Link'
