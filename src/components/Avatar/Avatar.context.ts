import { createContext, useContext } from 'react'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type AvatarStatus = 'idle' | 'loading' | 'loaded' | 'error'

export interface AvatarContextValue {
  size: AvatarSize
  status: AvatarStatus
  setStatus: (status: AvatarStatus) => void
}

export const AvatarContext = createContext<AvatarContextValue | null>(null)

export function useAvatarContext(part: string) {
  const ctx = useContext(AvatarContext)
  if (!ctx) {
    throw new Error(`<Avatar.${part} /> precisa estar dentro de <Avatar>`)
  }
  return ctx
}
