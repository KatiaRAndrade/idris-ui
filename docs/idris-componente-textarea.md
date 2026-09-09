# Idris — Componente: Textarea (`Input.Textarea`)

> Segue as specs já fechadas: [`idris-arquitetura-componentes.md`](./idris-arquitetura-componentes.md), [`idris-estrutura-componentes.md`](./idris-estrutura-componentes.md) e estende [`idris-componente-input.md`](./idris-componente-input.md).

---

## 1. Decisão: parte do Input, não componente novo

A Onda 1 lista "Input / Textarea" como um item só, mas `idris-componente-input.md` só modela o `<input>`. Ao fechar essa pendência apareceu a pergunta de arquitetura: `Textarea` é um componente novo ou uma parte do Input?

**É uma parte.** O motivo: rodando a sequência de decisão da seção 8 de `idris-estrutura-componentes.md` pra um textarea isolado, o resultado seria *exatamente* o `Input.Root` que já existe — um `.Root` explícito que gera `id` com `useId`, guarda `size`/`disabled`/`invalid`, coordena `htmlFor` do label e monta o `aria-describedby` a partir de `Hint`/`Error` registrados. Um componente `Textarea` separado teria que reimplementar tudo isso, e aí existiriam dois lugares pra corrigir quando um bug de acessibilidade aparecesse.

O que muda entre um `<input>` e um `<textarea>` é só o elemento renderizado e duas props (`rows`, redimensionamento). Isso é diferença de **parte**, não de componente.

```jsx
// Fica assim — mesma composição, só troca a parte do meio
<Input.Root>
  <Input.Label>Descrição</Input.Label>
  <Input.Textarea rows={4} />
  <Input.Hint>Máximo de 500 caracteres.</Input.Hint>
</Input.Root>
```

**Consequência prática:** esse documento **não cria uma pasta nova**. Ele adiciona `parts/Textarea.tsx` à pasta `Input/` que já existe, mais um bloco no `Input.styles.ts` e uma linha no `index.ts`.

## 2. O que a nova parte precisa resolver

| Questão | Decisão |
|---|---|
| Reaproveita o estilo do `Field`? | Sim — mesmo `tv()`, com um bloco extra pro comportamento de altura |
| Herda `size`/`disabled`/`invalid` do Root? | Sim, via o mesmo `useInputContext` |
| Entra no `aria-describedby`? | Sim, sem código novo — o registro já é do Root |
| Aceita `asChild`? | Sim, mesmo motivo do `Field` (editores de texto de terceiros) |
| Altura | Prop `rows` (padrão 3) + `autoResize` opcional |
| Redimensionamento manual | Prop `resize`: `none` · `vertical` (padrão) |

## 3. Sobre o `autoResize`

Crescer conforme o texto é o comportamento esperado em campos de comentário e descrição. A implementação honesta custa um reflow por tecla digitada: zerar a altura, ler `scrollHeight`, aplicar como altura nova. Ler `scrollHeight` força o navegador a recalcular layout de forma síncrona.

Por isso ele é **opt-in, não padrão**. Num formulário com um campo de observação que quase ninguém preenche, o custo é invisível; num editor onde a pessoa digita parágrafos, aparece. Quem liga a prop está escolhendo isso conscientemente.

**Simplificação deliberada (v1):** sem `maxRows`. Um textarea com auto-resize sem limite cresce indefinidamente e pode empurrar o botão de enviar pra fora da tela. Por enquanto, limitar altura é responsabilidade de quem usa (`className="max-h-64"` — o `overflow-y-auto` do estilo base cuida do resto). Se virar incômodo recorrente, `maxRows` é a próxima prop, e ela mora aqui.

## 4. Tokens usados

Os mesmos do `Input.Field`, sem nada novo: `surface`, `border-thin`, `text-primary`/`text-secondary`, `error`, `brand-400` (ring de foco), `radius-md`, `space-2` a `space-5` (paddings por `size`), `type/body`.

---

## 5. Arquivos tocados

```
src/components/Input/
├── Input.context.ts       # sem mudança
├── Input.Root.tsx          # sem mudança
├── Input.styles.ts         # + bloco `textarea`
├── Input.stories.tsx       # + stories do textarea
├── index.ts                # + export da parte
├── parts/
│   ├── Label.tsx
│   ├── Field.tsx
│   ├── Textarea.tsx        # ← novo
│   ├── Hint.tsx
│   └── Error.tsx
└── specs/
    └── Input.test.tsx      # + testes do textarea
```

Nenhum arquivo novo fora de `parts/` — o Root, o contexto e o registro de `describedby` seguem intactos, que é justamente o ponto da decisão da seção 1.

---

## 6. Código

**Adição ao `Input.styles.ts`** — o `textarea` reusa a base do `field` em vez de duplicá-la:

```ts
// ...o `field` existente continua igual, sem alteração...

export const textarea = tv({
  extend: field,
  base: 'min-h-[80px] overflow-y-auto',
  variants: {
    resize: {
      none: 'resize-none',
      vertical: 'resize-y',
    },
    autoResize: {
      // Com altura automática, o handle de resize manual não faz sentido:
      // a altura seria sobrescrita na próxima tecla digitada.
      true: 'resize-none overflow-hidden',
    },
  },
  defaultVariants: { resize: 'vertical' },
})
```

> `extend` é do próprio `tailwind-variants` — herda `base`, `variants` (`size`, `invalid`) e `defaultVariants` do `field`, e só acrescenta o que é específico do textarea. Sem ele, as três variantes de `size` estariam escritas duas vezes no arquivo, e uma hora divergiriam.

**`parts/Textarea.tsx`**:

```tsx
import {
  forwardRef,
  useCallback,
  useLayoutEffect,
  useRef,
  type ReactElement,
  type TextareaHTMLAttributes,
} from 'react'
import { Slot } from '../../../primitives/Slot'
import { useInputContext } from '../Input.context'
import { textarea } from '../Input.styles'

export interface InputTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  asChild?: boolean
  /** Cresce em altura conforme o conteúdo. Custa um reflow por digitação — ver seção 3. */
  autoResize?: boolean
  resize?: 'none' | 'vertical'
}

export const InputTextarea = forwardRef<HTMLTextAreaElement, InputTextareaProps>(
  (
    { className, asChild, autoResize = false, resize, rows = 3, disabled, onInput, ...props },
    forwardedRef
  ) => {
    const {
      id,
      size,
      disabled: rootDisabled,
      invalid,
      describedByIds,
    } = useInputContext('Textarea')

    const innerRef = useRef<HTMLTextAreaElement | null>(null)

    const adjustHeight = useCallback(() => {
      const el = innerRef.current
      if (!el || !autoResize) return
      // Zera antes de medir: senão scrollHeight nunca diminui ao apagar texto
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }, [autoResize])

    // useLayoutEffect e não useEffect: ajusta a altura antes do navegador pintar,
    // senão o campo aparece com a altura errada por um frame ao montar com valor inicial
    useLayoutEffect(adjustHeight, [adjustHeight, props.value, props.defaultValue])

    const sharedProps = {
      id,
      rows,
      'data-size': size,
      'data-invalid': invalid || undefined,
      disabled: disabled ?? rootDisabled,
      'aria-invalid': invalid || undefined,
      'aria-describedby': describedByIds.length ? describedByIds.join(' ') : undefined,
      className: textarea({ size, invalid, resize, autoResize, className }),
    }

    if (asChild) {
      const { children, ...rest } = props
      return (
        <Slot ref={forwardedRef} {...sharedProps} {...rest}>
          {children as ReactElement<Record<string, unknown>>}
        </Slot>
      )
    }

    return (
      <textarea
        ref={(node) => {
          innerRef.current = node
          if (typeof forwardedRef === 'function') forwardedRef(node)
          else if (forwardedRef) forwardedRef.current = node
        }}
        onInput={(event) => {
          onInput?.(event)
          adjustHeight()
        }}
        {...sharedProps}
        {...props}
      />
    )
  }
)

InputTextarea.displayName = 'Input.Textarea'
```

> **Por que a ref é mesclada na mão aqui:** o componente precisa do nó pra medir `scrollHeight`, e quem consome também pode querer a ref (foco programático, integração com react-hook-form). O `mergeRefs` do `Slot.tsx` faz exatamente isso — se esse padrão aparecer num terceiro lugar, vale exportá-lo de `primitives/` e reusar em vez de repetir o callback.
>
> **Por que `onInput` e não `onChange`:** `onInput` dispara também quando o valor muda sem digitação (colar com o mouse, autofill do navegador). Como o `onChange` do React já é implementado sobre o evento `input` nativo, os dois disparam junto — mas usar `onInput` deixa explícito que o gatilho é "o conteúdo mudou", não "o usuário digitou".

**Adição ao `index.ts`**:

```ts
export { InputRoot as Root } from './Input.Root'
export { InputLabel as Label } from './parts/Label'
export { InputField as Field } from './parts/Field'
export { InputTextarea as Textarea } from './parts/Textarea'   // ← novo
export { InputHint as Hint } from './parts/Hint'
export { InputError as Error } from './parts/Error'

export type { InputRootProps } from './Input.Root'
export type { InputFieldProps } from './parts/Field'
export type { InputTextareaProps } from './parts/Textarea'      // ← novo
```

---

## 7. Uso

```jsx
// Caso comum
<Input.Root>
  <Input.Label>Descrição</Input.Label>
  <Input.Textarea rows={4} placeholder="Conte um pouco sobre o projeto…" />
  <Input.Hint>Aparece na listagem pública.</Input.Hint>
</Input.Root>

// Com erro — o Hint some e o Error assume o describedby, exatamente como no Field
<Input.Root invalid>
  <Input.Label>Motivo do cancelamento</Input.Label>
  <Input.Textarea />
  <Input.Error>Explique em pelo menos 20 caracteres.</Input.Error>
</Input.Root>

// Altura automática, com teto definido por quem usa
<Input.Root size="sm">
  <Input.Label>Comentário</Input.Label>
  <Input.Textarea autoResize rows={1} className="max-h-40" />
</Input.Root>

// Sem redimensionamento manual (layout rígido)
<Input.Root>
  <Input.Label>Observações</Input.Label>
  <Input.Textarea resize="none" rows={6} />
</Input.Root>

// Desabilitado — propaga do Root, igual ao Field
<Input.Root disabled>
  <Input.Label>Anotações internas</Input.Label>
  <Input.Textarea defaultValue="Somente leitura" />
</Input.Root>
```

---

## 8. Acessibilidade

Nada novo — é o ponto forte da decisão de fazer disso uma parte. `htmlFor`/`id`, `aria-invalid`, `aria-describedby` e a propagação de `disabled` vêm todos do `Input.Root`, já testados. O que a parte acrescenta:

- `rows` sempre definido (padrão 3), pra o campo ter altura previsível antes do CSS carregar
- Com `autoResize`, `overflow: hidden` — sem isso o campo cresce **e** ganha barra de rolagem interna ao mesmo tempo
- O redimensionamento manual (`resize-y`) continua disponível por padrão: tirar o handle é uma escolha de layout, não um default

---

## 9. Testes (adicionar em `specs/Input.test.tsx`)

```tsx
describe('Input.Textarea', () => {
  it('associa label e textarea pelo mesmo id', () => {
    render(
      <Input.Root>
        <Input.Label>Descrição</Input.Label>
        <Input.Textarea />
      </Input.Root>
    )
    expect(screen.getByLabelText('Descrição').tagName).toBe('TEXTAREA')
  })

  it('herda invalid do Root e registra o Error no describedby', () => {
    render(
      <Input.Root invalid>
        <Input.Label>Motivo</Input.Label>
        <Input.Textarea />
        <Input.Error>Muito curto</Input.Error>
      </Input.Root>
    )
    const field = screen.getByLabelText('Motivo')
    expect(field).toHaveAttribute('aria-invalid', 'true')
    expect(field).toHaveAttribute('aria-describedby', screen.getByText('Muito curto').id)
  })

  it('propaga disabled do Root', () => {
    render(
      <Input.Root disabled>
        <Input.Label>Notas</Input.Label>
        <Input.Textarea />
      </Input.Root>
    )
    expect(screen.getByLabelText('Notas')).toBeDisabled()
  })

  it('usa rows=3 por padrão', () => {
    render(
      <Input.Root>
        <Input.Label>Notas</Input.Label>
        <Input.Textarea />
      </Input.Root>
    )
    expect(screen.getByLabelText('Notas')).toHaveAttribute('rows', '3')
  })

  it('ajusta a altura ao digitar quando autoResize', async () => {
    render(
      <Input.Root>
        <Input.Label>Comentário</Input.Label>
        <Input.Textarea autoResize />
      </Input.Root>
    )
    const field = screen.getByLabelText('Comentário') as HTMLTextAreaElement

    // jsdom não calcula layout, então scrollHeight é 0 — mockamos pra testar
    // que a altura É escrita, não qual valor exato ela recebe
    Object.defineProperty(field, 'scrollHeight', { configurable: true, value: 120 })
    await userEvent.type(field, 'texto')

    expect(field.style.height).toBe('120px')
  })

  it('lança erro se usada fora do Root', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Input.Textarea />)).toThrow()
    spy.mockRestore()
  })

  it('corresponde ao snapshot', () => {
    const { container } = render(
      <Input.Root>
        <Input.Label>Descrição</Input.Label>
        <Input.Textarea rows={4} />
      </Input.Root>
    )
    expect(container).toMatchSnapshot()
  })
})
```

> O teste de `autoResize` é o único que precisa de mock: o jsdom não roda layout, então `scrollHeight` é sempre 0. Testar que a altura **foi escrita** é o máximo que dá pra garantir aqui — o comportamento visual de verdade fica pro Storybook.
