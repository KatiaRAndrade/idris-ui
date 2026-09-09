import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export interface PortalProps {
  children: ReactNode
  /** Onde renderizar. Default: document.body */
  container?: Element | null
}

export function Portal({ children, container }: PortalProps) {
  const [mounted, setMounted] = useState(false)

  // No servidor não existe `document`. Só liberamos o portal depois
  // da primeira renderização no cliente — sem isso, quebra em SSR (Next.js).
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const target = container ?? document.body
  return createPortal(children, target)
}

Portal.displayName = 'Portal'
