import { forwardRef, useEffect, useState, type HTMLAttributes } from 'react'
import { useAvatarContext } from '../Avatar.context'
import { fallback } from '../Avatar.styles'

export interface AvatarFallbackProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Quanto esperar antes de aparecer, enquanto a imagem carrega.
   * Evita a piscada quando a imagem vem do cache. Default: 600ms.
   */
  delayMs?: number
}

export const AvatarFallback = forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  ({ className, delayMs = 600, ...props }, ref) => {
    const { size, status } = useAvatarContext('Fallback')
    const [delayPassou, setDelayPassou] = useState(delayMs === 0)

    useEffect(() => {
      if (delayMs === 0) return
      const timer = setTimeout(() => setDelayPassou(true), delayMs)
      return () => clearTimeout(timer)
    }, [delayMs])

    // Sem src ou com erro: já se sabe que a imagem não vem, aparece na hora.
    // Só o estado `loading` espera o delay.
    const deveAparecer =
      status === 'idle' || status === 'error' || (status === 'loading' && delayPassou)

    if (!deveAparecer) return null

    return <span ref={ref} className={fallback({ size, className })} {...props} />
  }
)

AvatarFallback.displayName = 'Avatar.Fallback'
