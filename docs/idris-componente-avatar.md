# Idris — Componente: Avatar

> Segue as specs já fechadas: [`idris-arquitetura-componentes.md`](./idris-arquitetura-componentes.md), [`idris-estrutura-componentes.md`](./idris-estrutura-componentes.md) e o formato dos demais `idris-componente-*.md`. Fase 1 do [`idris-roadmap-componentes.md`](./idris-roadmap-componentes.md).

---

## 1. Root implícito, com contexto

Sequência de decisão da seção 8 de `idris-estrutura-componentes.md`:

1. **Elemento DOM único, sem portal?** Sim — um `<span>` que envolve a imagem ou o fallback. → root implícito, como Badge e Card.
2. **Partes:** `Avatar.Image` e `Avatar.Fallback`.
3. **Precisam saber do pai?** Sim, e mais do que o normal: as duas precisam saber **em que estado o carregamento da imagem está**, porque é isso que decide qual das duas aparece. → `Avatar.context.ts` obrigatório.

## 2. O problema que faz o Avatar não ser trivial

A versão ingênua é `<img src={url} onError={mostrarIniciais} />`. Ela tem dois bugs que só aparecem em condições específicas — e é por isso que Avatar é o mais interessante dos componentes baratos.

**Bug 1: o flash do fallback.** Se o fallback renderiza primeiro e a imagem entra por cima quando carrega, uma imagem em cache aparece assim: iniciais por 30ms, depois a foto. Numa lista de 20 pessoas, isso é uma piscada visível na tela inteira. A solução não é carregar mais rápido — é **atrasar o fallback**: ele só aparece se a imagem demorar mais que um limiar (padrão 600ms).

**Bug 2: a imagem quebrada com espaço reservado.** `onError` esconder a imagem funciona, mas entre o início do carregamento e o erro existe um `<img>` com dimensão e sem conteúdo. Alguns navegadores mostram o ícone de imagem quebrada nesse intervalo.

A saída pros dois é a mesma: **carregar a imagem fora do DOM** com um `new Image()`, e só renderizar o `<img>` de verdade quando o carregamento terminar com sucesso.

## 3. A máquina de estados

| Estado | O que aconteceu | Quem renderiza |
|---|---|---|
| `idle` | Sem `src` | Fallback (imediato) |
| `loading` | Carregando | Nada, ou Fallback depois do delay |
| `loaded` | Carregou | Image |
| `error` | Falhou | Fallback (imediato) |

Repare que `loading` é o único estado onde a decisão depende do tempo. Nos outros três a resposta é imediata — e `error` mostra o fallback na hora, sem delay, porque já se sabe que a imagem não vem.

## 4. Partes

| Parte | Elemento | Papel | Obrigatória? |
|---|---|---|---|
| `Avatar` (root implícito) | `<span>` | Container circular, `size`, contexto do estado | Sim |
| `Avatar.Image` | `<img>` | Só renderiza quando `loaded` | Não |
| `Avatar.Fallback` | `<span>` | Iniciais ou ícone. Respeita o delay | Não — mas sempre use |
| `Avatar.Styles` | — | `tv()` cru | Não |

## 5. Tamanhos

`xs` (24px) · `sm` (32px) · `md` (40px) · `lg` (48px) · `xl` (64px)

Cinco tamanhos, mais que os três habituais, porque avatar aparece em contextos de escala muito diferente: `xs` numa lista compacta de comentários, `xl` num cabeçalho de perfil. A tipografia do fallback acompanha — iniciais de 10px no `xs`, 24px no `xl`.

| Atributo | Valores |
|---|---|
| `data-size` | `xs` · `sm` · `md` · `lg` · `xl` |
| `data-state` | `idle` · `loading` · `loaded` · `error` |

## 6. Tokens usados

`surface-elevated` (fundo do fallback), `text-secondary` (iniciais), `border-thin` (borda sutil, mesma da elevação), `radius-full`. Nenhum token novo.

> **Sem variante quadrada.** Avatar é redondo no Idris. Um "avatar quadrado" costuma ser outra coisa — thumbnail de produto, logo de empresa — e vira `AspectRatio` + imagem, não uma variante aqui. Mesmo argumento que tirou o `lg` do Badge.

---

## 7. Estrutura de pastas

```
src/components/Avatar/
├── Avatar.tsx             # root — contexto (estado + size), forwardRef
├── Avatar.context.ts
├── Avatar.styles.ts
├── Avatar.stories.tsx
├── index.ts
├── parts/
│   ├── Image.tsx
│   └── Fallback.tsx
└── specs/
    ├── Avatar.test.tsx
    └── __snapshots__/
```

---

## 8. Código

**`Avatar.context.ts`**:

```ts
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
```

**`Avatar.styles.ts`**:

```ts
import { tv } from 'tailwind-variants'

export const avatar = tv({
  base: [
    'relative inline-flex shrink-0 items-center justify-center overflow-hidden',
    'rounded-full border border-white/10 bg-surface-elevated select-none',
  ],
  variants: {
    size: {
      xs: 'h-6 w-6',
      sm: 'h-8 w-8',
      md: 'h-10 w-10',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16',
    },
  },
  defaultVariants: { size: 'md' },
})

export const image = tv({
  base: 'h-full w-full object-cover',
})

export const fallback = tv({
  base: 'font-sans font-medium uppercase text-text-secondary',
  variants: {
    size: {
      xs: 'text-[10px]',
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-2xl',
    },
  },
  defaultVariants: { size: 'md' },
})
```

**`Avatar.tsx`** — o root:

```tsx
import { forwardRef, useMemo, useState, type HTMLAttributes } from 'react'
import { avatar } from './Avatar.styles'
import { AvatarContext, type AvatarSize, type AvatarStatus } from './Avatar.context'

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  size?: AvatarSize
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, size = 'md', children, ...props }, ref) => {
    const [status, setStatus] = useState<AvatarStatus>('idle')

    const value = useMemo(() => ({ size, status, setStatus }), [size, status])

    return (
      <AvatarContext.Provider value={value}>
        <span
          ref={ref}
          data-size={size}
          data-state={status}
          className={avatar({ size, className })}
          {...props}
        >
          {children}
        </span>
      </AvatarContext.Provider>
    )
  }
)

Avatar.displayName = 'Avatar'
```

**`parts/Image.tsx`** — carrega fora do DOM antes de renderizar:

```tsx
import { forwardRef, useEffect, type ImgHTMLAttributes } from 'react'
import { useAvatarContext } from '../Avatar.context'
import { image } from '../Avatar.styles'

export interface AvatarImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src?: string
}

export const AvatarImage = forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, src, alt = '', onLoad, onError, ...props }, ref) => {
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
```

**`parts/Fallback.tsx`** — o delay que evita o flash:

```tsx
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
```

**`index.ts`**:

```ts
import { Avatar as Root } from './Avatar'
import { AvatarImage } from './parts/Image'
import { AvatarFallback } from './parts/Fallback'
import { avatar as avatarStyles } from './Avatar.styles'

export const Avatar = Object.assign(Root, {
  Image: AvatarImage,
  Fallback: AvatarFallback,
  Styles: avatarStyles,
})

export type { AvatarProps } from './Avatar'
export type { AvatarImageProps } from './parts/Image'
export type { AvatarFallbackProps } from './parts/Fallback'
export type { AvatarSize } from './Avatar.context'
```

---

## 9. Uso

```jsx
// Caso comum
<Avatar>
  <Avatar.Image src={usuario.foto} alt={usuario.nome} />
  <Avatar.Fallback>{iniciais(usuario.nome)}</Avatar.Fallback>
</Avatar>

// Sem foto — o fallback aparece na hora, sem esperar o delay
<Avatar size="lg">
  <Avatar.Fallback>KA</Avatar.Fallback>
</Avatar>

// Fallback com ícone, pra quando não há nome
<Avatar size="sm">
  <Avatar.Image src={foto} alt="" />
  <Avatar.Fallback aria-hidden><UserIcon /></Avatar.Fallback>
</Avatar>

// Numa lista compacta
<div className="flex items-center gap-2">
  <Avatar size="xs">
    <Avatar.Image src={autor.foto} alt={autor.nome} />
    <Avatar.Fallback>{iniciais(autor.nome)}</Avatar.Fallback>
  </Avatar>
  <Text size="body-sm">{autor.nome}</Text>
</div>

// Grupo sobreposto — composição, não prop
<div className="flex -space-x-2">
  {membros.map((m) => (
    <Avatar key={m.id} size="sm" className="ring-2 ring-background">
      <Avatar.Image src={m.foto} alt={m.nome} />
      <Avatar.Fallback>{iniciais(m.nome)}</Avatar.Fallback>
    </Avatar>
  ))}
</div>

// Delay zero — quando a imagem vem de rede lenta e mostrar algo é melhor
// que mostrar nada por meio segundo
<Avatar>
  <Avatar.Image src={fotoRemota} alt={nome} />
  <Avatar.Fallback delayMs={0}>{iniciais(nome)}</Avatar.Fallback>
</Avatar>
```

---

## 10. Acessibilidade

- **O `alt` da imagem carrega o nome acessível.** Se o avatar aparece ao lado do nome escrito (o caso mais comum), o `alt` deve ser vazio (`alt=""`) — senão o leitor anuncia o nome duas vezes
- **O fallback de iniciais é texto visível**, então é lido. "KA" é anunciado letra por letra ou como palavra, dependendo do leitor — nenhum dos dois é útil. Se o nome já está escrito ao lado, marque o fallback com `aria-hidden`
- **Fallback de ícone sempre `aria-hidden`** — é decoração pura
- O root não tem `role`. Um avatar não é um elemento interativo nem uma imagem em si; é um container. Se ele for clicável (abrir perfil), quem envolve é um Button ou Link, não uma prop aqui
- Nenhuma exigência de contraste: iniciais em `text-secondary` sobre `surface-elevated` passam AA, mas o avatar não é conteúdo essencial — o nome sempre está disponível em texto por perto

---

## 11. Teste (`specs/Avatar.test.tsx`)

```tsx
import { render, screen, waitFor, act } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { Avatar } from '../index'

/** O jsdom não carrega imagens de verdade — controlamos o Image global. */
function mockImage(resultado: 'load' | 'error', atraso = 0) {
  class FakeImage {
    onload: (() => void) | null = null
    onerror: (() => void) | null = null
    set src(_valor: string) {
      setTimeout(() => {
        if (resultado === 'load') this.onload?.()
        else this.onerror?.()
      }, atraso)
    }
  }
  vi.stubGlobal('Image', FakeImage)
}

describe('Avatar', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('mostra o fallback imediatamente quando não há src', () => {
    render(
      <Avatar>
        <Avatar.Fallback>KA</Avatar.Fallback>
      </Avatar>
    )
    expect(screen.getByText('KA')).toBeInTheDocument()
  })

  it('mostra a imagem quando o carregamento dá certo', async () => {
    mockImage('load')
    render(
      <Avatar>
        <Avatar.Image src="/foto.jpg" alt="Ka" />
        <Avatar.Fallback>KA</Avatar.Fallback>
      </Avatar>
    )

    await act(async () => {
      vi.advanceTimersByTime(0)
    })

    expect(screen.getByRole('img', { name: 'Ka' })).toBeInTheDocument()
  })

  it('mostra o fallback imediatamente quando a imagem falha', async () => {
    mockImage('error')
    render(
      <Avatar>
        <Avatar.Image src="/quebrada.jpg" alt="Ka" />
        <Avatar.Fallback>KA</Avatar.Fallback>
      </Avatar>
    )

    await act(async () => {
      vi.advanceTimersByTime(0)
    })

    expect(screen.getByText('KA')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('segura o fallback durante o delay enquanto carrega', async () => {
    mockImage('load', 1000) // imagem lenta
    render(
      <Avatar>
        <Avatar.Image src="/lenta.jpg" alt="Ka" />
        <Avatar.Fallback delayMs={600}>KA</Avatar.Fallback>
      </Avatar>
    )

    await act(async () => {
      vi.advanceTimersByTime(300)
    })
    expect(screen.queryByText('KA')).not.toBeInTheDocument()

    await act(async () => {
      vi.advanceTimersByTime(400)
    })
    expect(screen.getByText('KA')).toBeInTheDocument()
  })

  it('mostra o fallback na hora com delayMs zero', () => {
    mockImage('load', 1000)
    render(
      <Avatar>
        <Avatar.Image src="/lenta.jpg" alt="Ka" />
        <Avatar.Fallback delayMs={0}>KA</Avatar.Fallback>
      </Avatar>
    )
    expect(screen.getByText('KA')).toBeInTheDocument()
  })

  it('expõe o data-state', async () => {
    mockImage('load')
    const { container } = render(
      <Avatar>
        <Avatar.Image src="/foto.jpg" alt="Ka" />
        <Avatar.Fallback>KA</Avatar.Fallback>
      </Avatar>
    )

    await act(async () => {
      vi.advanceTimersByTime(0)
    })

    expect(container.firstChild).toHaveAttribute('data-state', 'loaded')
  })

  it('lança erro se uma parte for usada fora do Avatar', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Avatar.Fallback>KA</Avatar.Fallback>)).toThrow()
    spy.mockRestore()
  })

  it('corresponde ao snapshot', () => {
    const { container } = render(
      <Avatar size="lg">
        <Avatar.Fallback>KA</Avatar.Fallback>
      </Avatar>
    )
    expect(container).toMatchSnapshot()
  })
})
```

> O mock do `Image` global é o que torna a máquina de estados testável. Sem ele, o jsdom nunca dispara `onload` nem `onerror`, e o componente ficaria travado em `loading` pra sempre nos testes — dando a falsa impressão de que o delay funciona.
