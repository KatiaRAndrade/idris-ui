# Idris

Design system pessoal em React, TypeScript e Tailwind, publicado como `idris-ui`.

> **Em reconstrução (v2).** O código da v1 foi removido neste branch e continua disponível no `main` e no histórico do git. A v2 começou pelo design no Figma; o código volta a ser escrito a partir das decisões registradas em [`docs/idris-fundacoes-v2.md`](./docs/idris-fundacoes-v2.md).

## Identidade

- **Cores:** Bordô (PMS 7421C) e Verde-Oliva (PMS 575C), com neutro quente e quatro cores de status (danger, success, warning, info) em rampas separadas da marca. Temas light e dark com os mesmos tokens semânticos.
- **Tipografia:** Playfair Display nos títulos H1 a H3; Plus Jakarta Sans em todo o resto.
- **Forma:** radius de 4px; círculo em avatar e radio; pílula no switch.
- **Ícones:** Phosphor. A biblioteca não depende de nenhum pacote de ícones: o ícone entra pela parte `.Icon` de cada componente.

## Fonte da verdade

| O quê | Onde |
|---|---|
| Tokens, decisões e especificação dos componentes | [`docs/idris-fundacoes-v2.md`](./docs/idris-fundacoes-v2.md) |
| Design (variáveis, estilos e componentes) | [Figma: Idris — Design System](https://www.figma.com/design/mb2mEKEpTbIoqQf6qr7NPs) |
| Referência visual da paleta | `docs/NovasCores/` (fora do git) |

Os nomes dos tokens são os mesmos no Figma e no CSS: a barra do Figma vira hífen, com o prefixo do grupo (`color/action/primary` ↔ `--color-action-primary`).

## Stack

Vite (library mode) · React + TypeScript · Tailwind + `tailwind-variants` · Storybook · Vitest + Testing Library · Changesets · npm (`idris-ui`). Tema via CSS variables e atributo `data-theme`.

## Próximos passos

1. Rediscutir a estrutura do código (regras de arquitetura, Tailwind v3 ou v4).
2. Gerar o `theme.css` a partir das variáveis do Figma.
3. Reconstruir os componentes na ordem do Figma: base (`Slot`, `useControllableState`, Heading/Text), Button, Input, Checkbox · Radio · Switch, Badge · Avatar, Tooltip, Card · Alert.

As configurações de Vite, Storybook e Vitest foram mantidas, mas ainda apontam para arquivos da v1 (`src/index.ts`, `src/test-setup.ts`, stories em `src/`). Elas serão ajustadas quando o novo `src/` começar.
