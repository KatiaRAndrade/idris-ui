import { forwardRef, useEffect, type ImgHTMLAttributes } from 'react'
import { useAvatarContext } from '../Avatar.context'
import { image } from '../Avatar.styles'

export interface AvatarImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src?: string
}

export const AvatarImage = forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, src, alt = '', ...props }, ref) => {
    const { status, setStatus } = useAvatarContext('Image')

    useEffect(() => {
      if (!src) {
        setStatus('idle')
        return
      }

      setStatus('loading')

      // Carrega fora do DOM: evita o <img> quebrado visível durante o erro,
      // e permite decidir sobre o fallback antes de qualquer pixel aparecer
      let cancelado = false
      const img = new Image()

      img.onload = () => {
        if (!cancelado) setStatus('loaded')
      }
      img.onerror = () => {
        if (!cancelado) setStatus('error')
      }
      img.src = src

      return () => {
        cancelado = true
      }
    }, [src, setStatus])

    if (status !== 'loaded') return null

    // Neste ponto a imagem já está no cache do navegador — renderizar
    // o <img> é instantâneo, sem segundo carregamento
    return <img ref={ref} src={src} alt={alt} className={image({ className })} {...props} />
  }
)

AvatarImage.displayName = 'Avatar.Image'
