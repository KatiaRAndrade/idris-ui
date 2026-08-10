# Idris — Passo a Passo de Setup do Projeto

> Guia prático pra sair do zero até o primeiro componente (Button) publicável. Assume que você já tem Node 18+ e npm instalados.
> Referência de decisões: `design-system-fundacao.md`

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

```bash
npx tailwindcss init -p
```

**`tailwind.config.ts`** — os tokens da seção 2 do documento de fundação, como CSS variables:

```ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{ts,tsx}', './.storybook/**/*.{ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        brand: {
          700: 'var(--color-brand-700)',
          500: 'var(--color-brand-500)',
          400: 'var(--color-brand-400)',
        },
        accent: {
          700: 'var(--color-accent-700)',
          500: 'var(--color-accent-500)',
          400: 'var(--color-accent-400)',
        },
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        'surface-elevated': 'var(--color-surface-elevated)',
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
        },
        beige: 'var(--color-beige-surface)',
        success: {
          DEFAULT: 'var(--color-success)',
          hover: 'var(--color-success-hover)',
          bg: 'var(--color-success-bg)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          hover: 'var(--color-warning-hover)',
          bg: 'var(--color-warning-bg)',
        },
        error: {
          DEFAULT: 'var(--color-error)',
          hover: 'var(--color-error-hover)',
          bg: 'var(--color-error-bg)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          hover: 'var(--color-info-hover)',
          bg: 'var(--color-info-bg)',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        1: '4px', 2: '8px', 3: '12px', 4: '16px',
        5: '24px', 6: '32px', 7: '48px', 8: '64px', 9: '96px',
      },
      borderRadius: {
        sm: '6px', md: '10px', lg: '16px', full: '9999px',
      },
      transitionDuration: {
        fast: '150ms', base: '250ms', slow: '400ms',
      },
    },
  },
  plugins: [],
} satisfies Config
```

---

## 4. Criar os tokens como CSS variables (dark + light)

**`src/tokens/theme.css`** — os valores exatos que já validamos no Figma:

```css
/* Dark é o tema padrão — vive na raiz */
:root,
[data-theme='dark'] {
  --color-brand-700: #0B282C;
  --color-brand-500: #123F45;
  --color-brand-400: #4C7D80;

  --color-accent-700: #3D1723;
  --color-accent-500: #5A2440;
  --color-accent-400: #96556F;

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

  --color-error: #C0261E;
  --color-error-hover: #9A1F18;
  --color-error-bg: #2E1916;

  --color-info: #5C87A6;
  --color-info-hover: #3F6883;
  --color-info-bg: #1A2126;

  /* Variantes metalizadas — uso pontual (hero, badges premium), não em UI funcional */
  --gradient-accent-metallic: linear-gradient(135deg, #2B0F1A 0%, #5A2440 22%, #9C5E77 48%, #5A2440 74%, #2B0F1A 100%);
  --gradient-accent-metallic-gold: linear-gradient(135deg, #3D1723 0%, #5A2440 25%, #C9A227 50%, #5A2440 75%, #3D1723 100%);
}

[data-theme='light'] {
  --color-brand-700: #0B282C;
  --color-brand-500: #123F45;
  --color-brand-400: #4C7D80;

  --color-accent-700: #3D1723;
  --color-accent-500: #5A2440;
  --color-accent-400: #96556F;

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

  --color-error: #C0261E;
  --color-error-hover: #9A1F18;
  --color-error-bg: #FBE4E1;

  --color-info: #5C87A6;
  --color-info-hover: #3F6883;
  --color-info-bg: #E7EEF2;
}
```

Troca de tema no app-consumidor: `document.documentElement.setAttribute('data-theme', 'light' | 'dark')`.

**`src/styles/globals.css`**:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import './../tokens/theme.css';

@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;1,9..144,400&family=Inter:wght@400;500;600;700&display=swap');
```

> Numa lib publicável, considere self-host das fontes em vez de Google Fonts CDN — evita dependência externa no bundle de quem consome o pacote. Fica como melhoria futura.

---

## 5. Configurar o Vite em modo biblioteca

**`vite.config.ts`**:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react(), dts({ include: ['src'] })],
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