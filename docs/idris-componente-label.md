# Idris — Componente: Label

> Segue as specs já fechadas: [`idris-arquitetura-componentes.md`](./idris-arquitetura-componentes.md), [`idris-estrutura-componentes.md`](./idris-estrutura-componentes.md) e o formato dos demais `idris-componente-*.md`. Fase 1 do [`idris-roadmap-componentes.md`](./idris-roadmap-componentes.md).

---

## 1. Root implícito, sem `parts/`

1. **Elemento DOM único?** Sim, um `<label>`. → root implícito.
2. **Partes?** Nenhuma. → sem `parts/`, sem `.context.ts` — componente-folha, igual a `Separator` e `Heading`/`Text`.

## 2. Por que existe, se `Text as="label"` já resolve

Na primeira passada do roadmap eu tinha dito que Label provavelmente não valia standalone, porque `Input.Label` cobria formulários e `<Text as="label">` cobria o resto. Isso mudou quando Checkbox, Switch e RadioGroup entraram em código.

Os três **não têm Root que gere `id`**. O Input tem: o `Input.Root` cria o id com `useId` e o `Input.Label` só consome. Já um checkbox solto exige que quem usa invente o id na mão, em toda tela:

```jsx
// Como está hoje — repetido em toda tela com checkbox
<div className="flex items-center gap-2">
  <Checkbox id="termos"><Checkbox.Indicator><CheckIcon /></Checkbox.Indicator></Checkbox>
  <Text as="label" size="label" htmlFor="termos">Li e aceito os termos</Text>
</div>
```

`<Text as="label">` renderiza uma tag `<label>` com a tipografia certa e para por aí. Ele não sabe nada sobre estado de formulário. O que um Label de design system precisa acrescentar:

| Comportamento | `Text as="label"` | `Label` |
|---|---|---|
| Tipografia do token `label` | ✅ | ✅ |
| Indicador de obrigatório | ❌ | ✅ |
| Estilo de desabilitado | ❌ | ✅ |
| Não selecionar texto no duplo clique | ❌ | ✅ |

**Regra de uso a partir daqui:** `Label` para rotular controles de formulário. `Text as="label"` continua válido pra casos que só precisam da tag semântica sem contexto de formulário (rotular um grupo, uma legenda de gráfico). Na prática, quase tudo vira `Label`.

O `Input.Label` **não** é substituído — ele continua existindo porque consome o id do contexto automaticamente, que é uma vantagem real. Internamente ele pode passar a renderizar o `Label`, mas isso é refatoração opcional.

## 3. A decisão que precisa ser validada: `htmlFor` em controle não-nativo

Clicar no rótulo deveria ativar o controle. Com `<input type="checkbox">` isso é comportamento nativo do navegador. Mas Checkbox, Switch e RadioGroup do Idris são `<button role="checkbox">` — e aí a pergunta é se o encaminhamento nativo do clique ainda funciona.

**A spec do HTML lista `button` entre os elementos rotuláveis** (junto de `input`, `select`, `textarea`, `meter`, `output`, `progress`), e o comportamento de ativação de um `<label>` é encaminhar o clique pro controle rotulado. Pela leitura da spec, `htmlFor` apontando pro id do nosso botão deve funcionar.

**Mas isso é exatamente o tipo de coisa que vale conferir no navegador antes de confiar.** É comportamento com histórico de inconsistência entre implementações, e um rótulo que não ativa o controle é uma falha de usabilidade silenciosa — ninguém reporta, as pessoas só acham o formulário ruim.

**Plano:** a v1 confia no comportamento nativo (nenhum código extra). A story da seção 8 tem um caso dedicado a isso, pra validar em Chrome, Firefox e Safari. Se falhar em algum, o plano B é o Label encaminhar o clique explicitamente:

```tsx
// PLANO B — só implementar se a validação mostrar que é necessário
onClick={(event) => {
  const control = htmlFor && document.getElementById(htmlFor)
  if (control && !event.defaultPrevented) control.click()
}}
```

Registrado como pendência de validação, não como código.

## 4. Props

| Prop | Tipo | Papel |
|---|---|---|
| `htmlFor` | `string` | Nativo — id do controle rotulado |
| `required` | `boolean` | Mostra o indicador de campo obrigatório |
| `disabled` | `boolean` | Estilo esmaecido, acompanhando o controle |
| `size` | `'sm' \| 'md'` | `sm` = token `caption`, `md` = token `label` (padrão) |

`disabled` num `<label>` é puramente visual — a tag não tem estado desabilitado nativo. É por isso que ele precisa ser passado, não inferido: o Label não tem como saber que o controle ao lado está desabilitado.

## 5. O indicador de obrigatório

Um asterisco visual não significa nada pra quem usa leitor de tela — `*` costuma ser lido como "asterisco" ou ignorado. A solução é separar as duas camadas:

```jsx
<span aria-hidden>*</span>
<VisuallyHidden>(obrigatório)</VisuallyHidden>
```

O asterisco é decoração; o texto real está escondido visualmente e disponível pro leitor. É o mesmo padrão que o `Dialog.Title` dentro de `VisuallyHidden` já usa.

> **Isso não substitui o `required` no campo.** O indicador é comunicação visual; a validação e o `aria-required` são responsabilidade do controle. Um Label com `required` num campo sem `required` é uma mentira que ninguém percebe até o formulário deixar passar.

## 6. Tokens usados

`type/label` (Inter 14px medium — o mesmo token que `Input.Label` e o texto de Button já usam), `type/caption` no tamanho `sm`, `text-primary`, `text-secondary` (desabilitado), `error` (asterisco), `space-1` (gap). Nenhum token novo.

---

## 7. Estrutura de pastas

```
src/components/Label/
├── Label.tsx
├── Label.styles.ts
├── Label.stories.tsx
├── index.ts
└── specs/
    ├── Label.test.tsx
    └── __snapshots__/
```

---

## 8. Código

**`Label.styles.ts`**:

```ts
import { tv } from 'tailwind-variants'

export const label = tv({
  base: [
    'inline-flex items-center gap-1 font-sans text-text-primary',
    // Sem isso, o duplo clique no rótulo seleciona o texto em vez de
    // ativar o controle duas vezes — atrito pequeno e constante
    'select-none',
    'data-[disabled]:text-text-secondary data-[disabled]:cursor-not-allowed',
  ],
  variants: {
    size: {
      sm: 'text-xs font-medium uppercase tracking-wide',
      md: 'text-sm font-medium',
    },
  },
  defaultVariants: { size: 'md' },
})

export const requiredMark = tv({
  base: 'text-error',
})
```

**`Label.tsx`**:

```tsx
import { forwardRef, type LabelHTMLAttributes } from 'react'
import { VisuallyHidden } from '../../primitives/VisuallyHidden'
import { label, requiredMark } from './Label.styles'

export type LabelSize = 'sm' | 'md'

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  size?: LabelSize
  required?: boolean
  /** Visual apenas — um <label> não tem estado desabilitado nativo. */
  disabled?: boolean
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, size = 'md', required = false, disabled = false, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        data-size={size}
        data-required={required || undefined}
        data-disabled={disabled || undefined}
        className={label({ size, className })}
        {...props}
      >
        {children}
        {required && (
          <>
            {/* O asterisco é decoração; o texto real vai escondido pro leitor de tela */}
            <span aria-hidden className={requiredMark()}>
              *
            </span>
            <VisuallyHidden>(obrigatório)</VisuallyHidden>
          </>
        )}
      </label>
    )
  }
)

Label.displayName = 'Label'
```

**`index.ts`**:

```ts
export { Label } from './Label'
export type { LabelProps, LabelSize } from './Label'
```

---

## 9. Uso

```jsx
// Rotulando um Checkbox — o caso que motivou o componente
<div className="flex items-center gap-2">
  <Checkbox id="termos">
    <Checkbox.Indicator><CheckIcon /></Checkbox.Indicator>
  </Checkbox>
  <Label htmlFor="termos">Li e aceito os termos</Label>
</div>

// Switch numa linha de configuração
<div className="flex items-center justify-between">
  <Label htmlFor="notif">Notificações por e-mail</Label>
  <Switch id="notif" defaultChecked><Switch.Thumb /></Switch>
</div>

// Campo obrigatório
<Label htmlFor="email" required>E-mail</Label>
<Input.Root>
  <Input.Field id="email" type="email" required />
</Input.Root>

// Acompanhando um controle desabilitado
<Label htmlFor="cupom" disabled>Cupom</Label>
<Checkbox id="cupom" disabled><Checkbox.Indicator><CheckIcon /></Checkbox.Indicator></Checkbox>

// Rótulo do grupo num RadioGroup — aqui o Label não aponta pra um controle único,
// então usa id + aria-labelledby em vez de htmlFor
<Label id="label-plano">Plano</Label>
<RadioGroup.Root aria-labelledby="label-plano" defaultValue="mensal">
  {/* ... */}
</RadioGroup.Root>

// Tamanho sm — metadados de formulário, cabeçalho de seção
<Label size="sm">Preferências avançadas</Label>
```

---

## 10. Acessibilidade

- `<label>` nativo com `htmlFor` — a associação mais robusta que existe, e a que leitores de tela tratam melhor
- Rótulo de **grupo** (RadioGroup, fieldset) usa `id` + `aria-labelledby` no grupo, não `htmlFor`. `htmlFor` aponta pra um controle único; um grupo não é um controle
- Indicador de obrigatório em duas camadas (seção 5)
- `select-none` evita que o duplo clique selecione o texto
- **Pendência de validação:** clicar no rótulo ativa um `<button role="checkbox">` (seção 3). Testar nos três navegadores antes de considerar o componente pronto

---

## 11. Teste (`specs/Label.test.tsx`)

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Label } from '../index'
import { Checkbox } from '../../Checkbox'

describe('Label', () => {
  it('renderiza como <label>', () => {
    render(<Label>E-mail</Label>)
    expect(screen.getByText('E-mail').tagName).toBe('LABEL')
  })

  it('associa ao controle via htmlFor', () => {
    render(
      <>
        <Label htmlFor="campo">E-mail</Label>
        <input id="campo" />
      </>
    )
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
  })

  it('anuncia "obrigatório" pro leitor de tela, não o asterisco', () => {
    render(<Label required>E-mail</Label>)

    expect(screen.getByText('(obrigatório)')).toBeInTheDocument()
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true')
  })

  it('não mostra o indicador quando não é obrigatório', () => {
    render(<Label>E-mail</Label>)
    expect(screen.queryByText('(obrigatório)')).not.toBeInTheDocument()
  })

  it('expõe data-disabled', () => {
    render(<Label disabled>Cupom</Label>)
    expect(screen.getByText('Cupom')).toHaveAttribute('data-disabled', 'true')
  })

  it('ativa o Checkbox ao clicar no rótulo', async () => {
    render(
      <>
        <Checkbox id="termos" aria-label="Termos">
          <Checkbox.Indicator>✓</Checkbox.Indicator>
        </Checkbox>
        <Label htmlFor="termos">Li e aceito</Label>
      </>
    )

    await userEvent.click(screen.getByText('Li e aceito'))
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true')
  })

  it('corresponde ao snapshot', () => {
    const { container } = render(
      <Label htmlFor="email" required>
        E-mail
      </Label>
    )
    expect(container).toMatchSnapshot()
  })
})
```

> **Atenção ao último teste de comportamento:** ele passa no jsdom, que implementa o encaminhamento de clique do `<label>`. Isso **não** garante que os navegadores reais fazem o mesmo com `<button role="checkbox">` — é justamente a pendência da seção 3. O teste é útil como regressão, não como prova.
