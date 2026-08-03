# Idris — Passo a Passo de Setup do Projeto

> Guia prático pra sair do zero até o primeiro componente (Button) publicável. Assume que você já tem Node 18+ e npm instalados.
> Referência de decisões: `design-system-fundacao.md`

---

## Status atual do projeto (checado em 02/08)

- [x] Repo git criado (`git init`) — **ainda sem nenhum commit**
- [x] `npx storybook@latest init` rodado — `.storybook/` e `stories/` (exemplos padrão do Storybook, não o Button real) existem
- [x] `vitest.config.ts` existe, mas é o gerado pelo addon-vitest do Storybook (roda testes de stories via browser/Playwright) — **diferente** do vitest.config da seção 6 (jsdom + testing-library)
- [ ] `package.json` ainda é o **padrão do `storybook init`** (nome/versão genéricos, sem scripts de build de lib, sem `peerDependencies`, sem changesets) — passo 9 não feito
- [ ] `src/` não existe — nada de `tokens/theme.css`, `styles/globals.css`, `components/Button`, `index.ts`
- [ ] `tailwind.config.ts` não existe
- [ ] `vite.config.ts` (modo lib) não existe
- [ ] Changesets não instalado/configurado

**Atenção — divergência de versão:** as deps instaladas são **Tailwind v4.3.3** e **TypeScript v7.0.2**, mais novas que a sintaxe assumida originalmente na seção 3 (Tailwind v3, `tailwind.config.ts` + `content` array + `@tailwind base/components/utilities`). A seção 3 abaixo já foi corrigida para v4 (config via CSS com `@theme`, plugin `@tailwindcss/vite`). Também não há `@tailwindcss/postcss` nem `@tailwindcss/vite` instalados ainda — só `tailwindcss`, `postcss` e `autoprefixer` (que na v4 não são mais necessários se usar o plugin do Vite).

**Próximos passos recomendados, na ordem:** 1) commit inicial do que já existe → 2) criar `src/` com tokens e globals.css (seção 4, ajustada p/ v4) → 3) `vite.config.ts` em modo lib (seção 5) → 4) `vitest.config.ts` de verdade p/ testes de componente (seção 6, pode conviver com o de Storybook usando `projects`) → 5) Button real (seção 7) → 6) `package.json` (seção 9) → 7) Changesets (seção 10).

---

## 1. Criar o projeto

```bash
mkdir idris-ui && cd idris-ui
npm init -y
git init
```

Estrutura de pastas alvo (por componente, conforme decidido):

```
idris-ui/
├── src/
│   ├── components/
│   │   └── Button/
│   │       ├── Button.tsx
│   │       ├── Button.stories.tsx
│   │       ├── Button.test.tsx
│   │       └── index.ts
│   ├── tokens/
│   │   └── theme.css          # CSS variables (dark + light)
│   ├── styles/
│   │   └── globals.css        # Tailwind entrypoint
│   └── index.ts                # export público da lib
├── .storybook/
├── tailwind.config.ts
├── vite.config.ts
├── vitest.config.ts
├── tsconfig.json
└── package.json
```

---

## 2. Instalar as dependências

```bash
# Core
npm install react react-dom

# Dev — build e tipos
npm install -D typescript vite @vitejs/plugin-react vite-plugin-dts

# Estilo
npm install -D tailwindcss postcss autoprefixer
npm install tailwind-variants

# Testes
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @testing-library/user-event

# Storybook (rode o CLI — ele detecta Vite automaticamente)
npx storybook@latest init
```

`react`/`react-dom` como `peerDependencies` no `package.json` (ajustamos isso no passo 7).

---

## 3. Configurar o Tailwind

> ⚠️ **Ajustado para Tailwind v4** (versão realmente instalada no projeto, `4.3.3`). Na v4 não existe mais `tailwind.config.ts` com `content`/`darkMode` por padrão — a config vive em CSS, via `@theme`, e a integração com Vite é feita pelo plugin `@tailwindcss/vite` em vez de PostCSS clássico. Se preferir manter `postcss.config` + `autoprefixer` (já instalados), também funciona, mas o caminho recomendado pela v4 é o plugin do Vite.

```bash
npm install -D @tailwindcss/vite
```

**`vite.config.ts`** — adiciona o plugin (ver seção 5 para o resto da config):

```ts
import tailwindcss from '@tailwindcss/vite'
// ...
plugins: [react(), tailwindcss(), dts({ include: ['src'] })],
```

Os tokens da seção 2 do documento de fundação entram direto no CSS via `@theme`, dentro de `src/styles/globals.css` (ver seção 4) — não precisam mais de um arquivo `tailwind.config.ts` separado. Tema dark/light via atributo `data-theme` usa `@custom-variant`:

```css
@import 'tailwindcss';

@custom-variant dark (&:where([data-theme='dark'], [data-theme='dark'] *));

@theme {
  --color-brand-700: var(--color-brand-700);
  --color-brand-500: var(--color-brand-500);
  --color-brand-400: var(--color-brand-400);

  --color-background: var(--color-background);
  --color-surface: var(--color-surface);
  --color-surface-elevated: var(--color-surface-elevated);

  --color-text-primary: var(--color-text-primary);
  --color-text-secondary: var(--color-text-secondary);
  --color-beige-surface: var(--color-beige-surface);

  --color-success: var(--color-success);
  --color-success-hover: var(--color-success-hover);
  --color-success-bg: var(--color-success-bg);

  --color-warning: var(--color-warning);
  --color-warning-hover: var(--color-warning-hover);
  --color-warning-bg: var(--color-warning-bg);

  --color-error: var(--color-error);
  --color-error-hover: var(--color-error-hover);
  --color-error-bg: var(--color-error-bg);

  --color-info: var(--color-info);
  --color-info-hover: var(--color-info-hover);
  --color-info-bg: var(--color-info-bg);

  --font-display: 'Fraunces', serif;
  --font-sans: 'Inter', sans-serif;

  --spacing-1: 4px; --spacing-2: 8px; --spacing-3: 12px; --spacing-4: 16px;
  --spacing-5: 24px; --spacing-6: 32px; --spacing-7: 48px; --spacing-8: 64px; --spacing-9: 96px;

  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 16px; --radius-full: 9999px;

  --transition-duration-fast: 150ms;
  --transition-duration-base: 250ms;
  --transition-duration-slow: 400ms;
}
```

Repare que os nomes em `@theme` (ex.: `--color-brand-700`) apontam pra CSS variables de mesmo nome — essas variables reais de valor (`#5C1A20` etc.) continuam vindo de `src/tokens/theme.css`, importado logo depois (seção 4). Isso preserva a troca dark/light por `data-theme` sem duplicar a paleta.

---

## 4. Criar os tokens como CSS variables (dark + light)

**`src/tokens/theme.css`** — os valores exatos que já validamos no Figma:

```css
/* Dark é o tema padrão — vive na raiz */
:root,
[data-theme='dark'] {
  --color-brand-700: #5C1A20;
  --color-brand-500: #7A2028;
  --color-brand-400: #9C3540;

  --color-background: #171310;
  --color-surface: #1F1B17;
  --color-surface-elevated: #2A2521;

  --color-text-primary: #EDE6D6;
  --color-text-secondary: #B8AFA0;
  --color-beige-surface: #E8E1D3;

  --color-success: #5B7A5D;
  --color-success-hover: #4A6350;
  --color-success-bg: #1E241F;

  --color-warning: #C9932E;
  --color-warning-hover: #A97824;
  --color-warning-bg: #2A2318;

  --color-error: #C1443F;
  --color-error-hover: #9E3530;
  --color-error-bg: #2A1917;

  --color-info: #5C87A6;
  --color-info-hover: #3F6883;
  --color-info-bg: #1A2126;
}

[data-theme='light'] {
  --color-brand-700: #5C1A20;
  --color-brand-500: #7A2028;
  --color-brand-400: #9C3540;

  --color-background: #F7F3EA;
  --color-surface: #FFFFFF;
  --color-surface-elevated: #FDFBF7;

  --color-text-primary: #171310;
  --color-text-secondary: #6B6259;
  --color-beige-surface: #E8E1D3;

  --color-success: #5B7A5D;
  --color-success-hover: #4A6350;
  --color-success-bg: #E8EFE9;

  --color-warning: #C9932E;
  --color-warning-hover: #A97824;
  --color-warning-bg: #FBF0DC;

  --color-error: #C1443F;
  --color-error-hover: #9E3530;
  --color-error-bg: #F7E3E1;

  --color-info: #5C87A6;
  --color-info-hover: #3F6883;
  --color-info-bg: #E7EEF2;
}
```

Troca de tema no app-consumidor: `document.documentElement.setAttribute('data-theme', 'light' | 'dark')`.

**`src/styles/globals.css`** — sintaxe v4 (import único do Tailwind + `@theme`/`@custom-variant` da seção 3):

```css
@import 'tailwindcss';
@import './../tokens/theme.css';

@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;1,9..144,400&family=Inter:wght@400;500;600;700&display=swap');

@custom-variant dark (&:where([data-theme='dark'], [data-theme='dark'] *));

@theme {
  /* ver bloco completo na seção 3 */
}
```

> Numa lib publicável, considere self-host das fontes em vez de Google Fonts CDN — evita dependência externa no bundle de quem consome o pacote. Fica como melhoria futura.

---

## 5. Configurar o Vite em modo biblioteca

**`vite.config.ts`**:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss(), dts({ include: ['src'] })],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'IdrisUI',
      fileName: (format) => `idris-ui.${format}.js`,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: { react: 'React', 'react-dom': 'ReactDOM' },
      },
    },
  },
})
```

---

## 6. Configurar o Vitest

**`vitest.config.ts`**:

```ts
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: './src/test-setup.ts',
      globals: true,
    },
  })
)
```

**`src/test-setup.ts`**:

```ts
import '@testing-library/jest-dom'
```

---

## 7. Criar o primeiro componente: Button

**`src/components/Button/Button.tsx`**:

```tsx
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

const button = tv({
  base: [
    'inline-flex items-center justify-center font-sans font-medium',
    'rounded-md transition-colors duration-fast',
    'disabled:opacity-40 disabled:pointer-events-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
  ],
  variants: {
    variant: {
      primary: 'bg-brand-500 text-text-primary hover:bg-brand-700',
      secondary: 'bg-surface-elevated text-text-primary border border-white/10 hover:bg-surface',
      ghost: 'bg-transparent text-text-primary hover:bg-surface',
      destructive: 'bg-error text-text-primary hover:bg-error-hover',
    },
    size: {
      sm: 'px-3 py-2 text-sm gap-1.5',
      md: 'px-4 py-3 text-base gap-2',
      lg: 'px-5 py-4 text-lg gap-2.5',
    },
    loading: {
      true: 'relative text-transparent pointer-events-none',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
})

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={button({ variant, size, loading, className })}
        {...props}
      >
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            {/* substituir por um spinner de verdade */}
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent text-text-primary" />
          </span>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
```

**`src/components/Button/index.ts`**:

```ts
export { Button } from './Button'
export type { ButtonProps } from './Button'
```

**`src/components/Button/Button.stories.tsx`**:

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  args: { children: 'Button', variant: 'primary', size: 'md' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'destructive'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
}
export default meta

type Story = StoryObj<typeof Button>

export const Primary: Story = { args: { variant: 'primary' } }
export const Secondary: Story = { args: { variant: 'secondary' } }
export const Ghost: Story = { args: { variant: 'ghost' } }
export const Destructive: Story = { args: { variant: 'destructive' } }
export const Loading: Story = { args: { loading: true } }
export const Disabled: Story = { args: { disabled: true } }
```

**`src/components/Button/Button.test.tsx`**:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renderiza o texto', () => {
    render(<Button>Salvar</Button>)
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument()
  })

  it('dispara onClick', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Clique</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('fica desabilitado quando loading', () => {
    render(<Button loading>Enviar</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
  })

  it('não dispara onClick quando disabled', async () => {
    const onClick = vi.fn()
    render(<Button disabled onClick={onClick}>Enviar</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })
})
```

---

## 8. Exportar tudo no entrypoint da lib

**`src/index.ts`**:

```ts
export * from './components/Button'
import './styles/globals.css'
```

---

## 9. Ajustar o `package.json`

```json
{
  "name": "idris-ui",
  "version": "0.1.0",
  "description": "Idris — design system pessoal em React + Tailwind",
  "type": "module",
  "main": "./dist/idris-ui.cjs.js",
  "module": "./dist/idris-ui.es.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/idris-ui.es.js",
      "require": "./dist/idris-ui.cjs.js"
    },
    "./styles.css": "./dist/style.css"
  },
  "files": ["dist"],
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18"
  },
  "scripts": {
    "dev": "storybook dev -p 6006",
    "build": "vite build",
    "build:storybook": "storybook build",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src",
    "changeset": "changeset",
    "release": "npm run build && changeset publish"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

---

## 10. Configurar o Changesets (versionamento + changelog)

```bash
npm install -D @changesets/cli
npx changeset init
```

Fluxo de trabalho a partir daqui: a cada mudança relevante, rode `npm run changeset`, descreva a mudança e o tipo de versão (patch/minor/major). Isso gera um arquivo de changeset que o `changeset publish` consome pra versionar e gerar o changelog automaticamente.

---

## 11. Rodar e validar

```bash
# Ver o Button no Storybook
npm run dev

# Rodar os testes
npm run test

# Gerar o build da lib
npm run build
```

Checklist antes de considerar o Button "pronto":
- [ ] Todas as 4 variantes renderizando corretamente no Storybook
- [ ] Estado `loading` e `disabled` funcionando
- [ ] Testes passando (`npm run test`)
- [ ] Alternar `data-theme="light"` no `<html>` e confirmar que as cores trocam
- [ ] Contraste AA verificado nas 4 variantes (usar o addon de a11y do Storybook)

---

## 12. Publicar a primeira versão

```bash
npm login
npm run changeset       # descreve a mudança, escolhe "minor" pra v0.1.0
npm run release         # builda e publica
```

Depois disso, o pacote fica disponível como `npm install idris-ui`.

---

## Próximo componente

Repita a estrutura das seções 7-8 pro próximo item da Onda 1 (Input, Card, Badge ou Typography) — o Button serve de template: mesmo padrão de pasta, mesmo uso de `tv()`, mesmo formato de teste e story.
