# Idris

> Design system pessoal em React + TypeScript + Tailwind — dark mode por padrão, com suporte a light mode.

[![npm version](https://img.shields.io/npm/v/idris-ui.svg)](https://www.npmjs.com/package/idris-ui)
[![license](https://img.shields.io/npm/l/idris-ui.svg)](./LICENSE)

---

## Sobre

Idris é uma biblioteca de componentes React construída do zero como projeto de portfólio, cobrindo o processo completo de um design system: tokens de design, tipografia, arquitetura de componentes e documentação viva no Storybook.

A identidade visual parte de uma paleta editorial — **bordô, preto e bege** — combinada com uma dupla tipográfica de serifado de display (Fraunces) e sans-serif de interface (Inter), resultando num sistema com personalidade moderna/tech e um toque premium.

## Índice

- [Instalação](#instalação)
- [Uso rápido](#uso-rápido)
- [Temas (dark/light)](#temas-darklight)
- [Design tokens](#design-tokens)
- [Componentes](#componentes)
- [Stack técnica](#stack-técnica)
- [Desenvolvimento](#desenvolvimento)
- [Roadmap](#roadmap)
- [Licença](#licença)

---

## Instalação

```bash
npm install idris-ui
```

Importe o CSS uma vez na raiz da sua aplicação:

```ts
import 'idris-ui/styles.css'
```

## Uso rápido

```tsx
import { Button } from 'idris-ui'

function App() {
  return (
    <Button variant="primary" size="md">
      Salvar
    </Button>
  )
}
```

## Temas (dark/light)

O dark mode é o tema padrão. Para alternar, defina o atributo `data-theme` na tag `<html>`:

```ts
document.documentElement.setAttribute('data-theme', 'light') // ou 'dark'
```

Todos os componentes consomem cores via **tokens semânticos** (CSS variables), então a troca de tema não exige nenhuma mudança de código nos componentes — só o valor do atributo.

## Design tokens

### Cores

Paleta primária derivada de uma referência editorial (bordô + preto + bege), com semânticas ajustadas pra manter a mesma temperatura quente:

| Token | Dark | Light | Uso |
|---|---|---|---|
| `brand-500` | `#7A2028` | `#7A2028` | Cor de ação/marca |
| `background` | `#171310` | `#F7F3EA` | Fundo base |
| `surface` | `#1F1B17` | `#FFFFFF` | Cards, painéis |
| `text-primary` | `#EDE6D6` | `#171310` | Texto principal |
| `success` | `#5B7A5D` | `#5B7A5D` | Estados positivos |
| `warning` | `#C9932E` | `#C9932E` | Avisos |
| `error` | `#C1443F` | `#C1443F` | Erros, ações destrutivas |
| `info` | `#5C87A6` | `#5C87A6` | Informativo |

> Lista completa de tokens (incluindo variações `-hover` e `-bg`) em [`design-system-fundacao.md`](./design-system-fundacao.md).

### Tipografia

| Papel | Fonte | Uso |
|---|---|---|
| Display / Títulos | **Fraunces** (serifado) | `display` até `heading-3` |
| Corpo / UI | **Inter** (sans-serif) | `heading-4` até `caption`, toda UI funcional |

Escala completa: `display` (56px) → `heading-1/2/3` → `heading-4` → `body-lg/body/body-sm` → `label` → `caption` (12px).

### Espaçamento, bordas e motion

- **Espaçamento:** escala base 4px, de `space-1` (4px) a `space-9` (96px)
- **Radius:** `sm` (6px) / `md` (10px) / `lg` (16px) / `full`
- **Elevação:** sem `box-shadow` tradicional — troca de superfície (`surface` → `surface-elevated`) + borda sutil de 1px
- **Motion:** durações `fast` (150ms) / `base` (250ms) / `slow` (400ms), com easings padrão de entrada/saída

## Componentes

Construídos com [`tailwind-variants`](https://www.tailwind-variants.org/) para gestão de variantes/estados.

| Componente | Status | Variantes |
|---|---|---|
| **Button** | ✅ Disponível | `primary` · `secondary` · `ghost` · `destructive` — tamanhos `sm/md/lg` — estados `default/hover/active/disabled/loading` |
| Input / Textarea | 🚧 Planejado | — |
| Card | 🚧 Planejado | — |
| Badge / Tag | 🚧 Planejado | — |
| Select / Dropdown | 🚧 Planejado | — |
| Checkbox / Radio / Switch | 🚧 Planejado | — |
| Toast / Alert | 🚧 Planejado | — |
| Modal / Dialog | 🚧 Planejado | — |
| Tooltip | 🚧 Planejado | — |

Documentação interativa de cada componente disponível no Storybook (veja [Desenvolvimento](#desenvolvimento)).

## Stack técnica

- **Framework:** React 18 + TypeScript
- **Estilo:** Tailwind CSS + `tailwind-variants`
- **Build:** Vite (library mode), gerando ESM + CJS com tipos
- **Documentação:** Storybook
- **Testes:** Vitest + Testing Library
- **Versionamento:** Changesets (semver + changelog automático)
- **Publicação:** npm público

## Desenvolvimento

```bash
git clone https://github.com/<seu-usuario>/idris-ui.git
cd idris-ui
npm install

npm run dev              # Storybook em http://localhost:6006
npm run test             # roda a suíte de testes
npm run test:watch       # testes em modo watch
npm run build             # build da lib (dist/)
npm run build:storybook   # build estático do Storybook
```

### Contribuindo (uso pessoal)

1. Crie um componente seguindo a estrutura por pasta: `src/components/NomeDoComponente/`
2. Cada componente inclui `Componente.tsx`, `Componente.stories.tsx`, `Componente.test.tsx` e `index.ts`
3. Use os tokens (`bg-brand-500`, `text-text-primary` etc.) em vez de valores hardcoded
4. Rode `npm run changeset` descrevendo a mudança antes de publicar

Guia completo de setup em [`idris-passo-a-passo.md`](./idris-passo-a-passo.md).

## Roadmap

- [x] Fundação: tokens de cor, tipografia, espaçamento, radius, motion
- [x] Componente-modelo: Button
- [ ] Onda 1: Input, Card, Badge, Typography
- [ ] Onda 2: Select, Checkbox/Radio/Switch, Toast, Modal, Tooltip
- [ ] Onda 3: padrões compostos (formulário completo, navegação, tabela de dados)
- [ ] Auditoria de acessibilidade (WCAG AA) em todos os componentes
- [ ] v1.0.0 no npm

## Licença

MIT © [Ka](https://github.com/<seu-usuario>)