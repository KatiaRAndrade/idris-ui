# Idris — Fundações v2

> **Fonte da verdade de tokens a partir de 2026-09-30.** Substitui as seções 2.1 (cores), 2.2 (tipografia), 2.4 (bordas e elevação) e 2.5 (motion) de `design-system-fundacao.md`. A escala de espaçamento (2.3) continua valendo.

Recomeço pelo design (Figma) antes de refazer o código. Página visual de referência: artifact "Fundações Idris".

## 1. Decisões fechadas

- Paleta: Bordô PMS 7421C (`#651C32`) + Verde-Oliva PMS 575C (`#67823A`), neutro quente, e 4 cores de status (danger, success, warning, info) **em rampas separadas da marca**.
- Dark e light com os mesmos tokens semânticos; no dark a marca usa tons mais claros da rampa (ex.: ação primária bordô 400 em vez de 700).
- Tipografia: Playfair Display só em H1, H2 e H3; Plus Jakarta Sans em todo o resto. Sem itálico.
- Escala tipográfica 1.25 sobre 16px, line-heights múltiplos de 4px. Pesos: Playfair 400/600, Jakarta 400/500/600.
- Números: `lining-nums` ligado nos títulos Playfair (o padrão dela é algarismo de texto antigo); dados e tabelas em Jakarta com `tabular-nums`.
- Fontes: a lib **não** embute as fontes. Só declara as famílias com fallback; quem consome carrega.
- Radius: 4px em tudo (alterado de 2px em 2026-10-03). Exceções com `radius-full`: avatar, radio e switch (pílula).
- Elevação: borda de 1px define a forma; sombra só no que flutua (níveis 2 e 3). Sombra com a mesma geometria nos dois temas; a cor vem de `color/shadow/ambient` e `color/shadow/key` (quente no light, preta no dark), assim o effect style do Figma funciona com modes.
- Foco: `outline: 2px solid var(--color-focus-ring); outline-offset: 2px` em `:focus-visible`. Bordô 700 no light, bordô 300 no dark.
- Motion: 120/200/320ms, ease-out de entrada, ease-in de saída (70% da duração). Só opacidade, deslocamento até 8px e escala 0.98→1. `prefers-reduced-motion` mantém só opacidade.
- Ícones: Phosphor (regular até 20px, light de 24px pra cima, fill pra estado ativo). O `idris-ui` não depende de biblioteca de ícones: recebe o ícone pela parte `.Icon` e define tamanho (16/20/24) e `currentColor`. No Figma há 23 ícones como componente, incluindo `circle-notch` para o loading.

## 2. Cores — primitivos

Rampas geradas em OKLCH. Os tons marcados com * são os hex aprovados antes; os outros foram calculados a partir deles. Neutro tem um passo extra (975) para os três níveis de fundo do dark.

| Rampa | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 | 975 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `bordo` | `#FBF0F3` | `#F3DCE2`* | `#E9B8C5` | `#D98AA0`* | `#B5405F`* | `#8A2942`* | `#78233A` | `#651C32`* | `#501125` | `#3D0719` | `#28010D` | — |
| `oliva` | `#F3F7ED` | `#E6EEDA`* | `#D4E0C1` | `#BDCFA3` | `#A3BB7F` | `#8AA85C`* | `#78954B` | `#67823A`* | `#506727` | `#394D13` | `#202F00` | — |
| `neutro` | `#FAF6F4` | `#F2F0EE`* | `#E4E0DE` | `#D0C9C5` | `#AAA39F` | `#867E7B` | `#69615E` | `#504845` | `#3B3430` | `#2B2320`* | `#1C1613` | `#130D0A` |
| `danger` | `#FFF2F0` | `#FEE2DD` | `#FFC4BA` | `#FE9C8D` | `#F07363` | `#DD5142` | `#C2372B`* | `#A8251B` | `#821C14` | `#5F120C` | `#3F0704` | — |
| `success` | `#EDF9F0` | `#DBF0E1` | `#BBDFC6` | `#95C9A6` | `#6DB084` | `#4C9969` | `#2E7D4F`* | `#236E43` | `#1A5433` | `#113C23` | `#062614` | — |
| `warning` | `#FFF3E4` | `#F7E7D2` | `#E9D0AF` | `#D7B485` | `#C29555` | `#B07A1E`* | `#986614` | `#8A5A0E`* | `#643F02` | `#482C02` | `#2E1A00` | — |
| `info` | `#EEF6FD` | `#DEECF7` | `#C0D8EA` | `#9EBFDA` | `#7AA4C4` | `#5C8CB0` | `#48779A` | `#3B6A8C`* | `#294B64` | `#1C3648` | `#0E212F` | — |

## 3. Cores — tokens semânticos

Componentes usam só estes tokens. **Regra de nome:** a `/` do Figma vira `-` no CSS, com o prefixo do grupo: `color/action/primary` ↔ `--color-action-primary`. O prefixo `color-` é o namespace que o Tailwind v4 lê para gerar `bg-*`, `text-*` e `border-*`. No Figma: coleção `Semantic` com modes `Light` e `Dark`.

| Figma · CSS | Light | Dark |
|---|---|---|
| `color/bg/default` · `--color-bg-default` | neutro-50 `#FAF6F4` | neutro-975 `#130D0A` |
| `color/surface/default` · `--color-surface-default` | branco `#FFFFFF` | neutro-950 `#1C1613` |
| `color/surface/raised` · `--color-surface-raised` | branco `#FFFFFF` | neutro-900 `#2B2320` |
| `color/surface/sunken` · `--color-surface-sunken` | neutro-100 `#F2F0EE` | neutro-975 `#130D0A` |
| `color/surface/inverse` · `--color-surface-inverse` | neutro-900 `#2B2320` | neutro-100 `#F2F0EE` |
| `color/border/default` · `--color-border-default` | neutro-200 `#E4E0DE` | neutro-800 `#3B3430` |
| `color/border/strong` · `--color-border-strong` | neutro-500 `#867E7B` | neutro-500 `#867E7B` |
| `color/text/primary` · `--color-text-primary` | neutro-900 `#2B2320` | neutro-100 `#F2F0EE` |
| `color/text/secondary` · `--color-text-secondary` | neutro-700 `#504845` | neutro-300 `#D0C9C5` |
| `color/text/muted` · `--color-text-muted` | neutro-600 `#69615E` | neutro-400 `#AAA39F` |
| `color/text/inverse` · `--color-text-inverse` | neutro-50 `#FAF6F4` | neutro-900 `#2B2320` |
| `color/text/on-action` · `--color-text-on-action` | branco `#FFFFFF` | branco `#FFFFFF` |
| `color/text/brand` · `--color-text-brand` | bordo-700 `#651C32` | bordo-300 `#D98AA0` |
| `color/text/accent` · `--color-text-accent` | oliva-800 `#506727` | oliva-400 `#A3BB7F` |
| `color/action/primary` · `--color-action-primary` | bordo-700 `#651C32` | bordo-400 `#B5405F` |
| `color/action/primary-hover` · `--color-action-primary-hover` | bordo-800 `#501125` | bordo-500 `#8A2942` |
| `color/action/primary-active` · `--color-action-primary-active` | bordo-900 `#3D0719` | bordo-600 `#78233A` |
| `color/action/secondary` · `--color-action-secondary` | oliva-800 `#506727` | oliva-500 `#8AA85C` |
| `color/action/secondary-hover` · `--color-action-secondary-hover` | oliva-900 `#394D13` | oliva-400 `#A3BB7F` |
| `color/text/on-secondary` · `--color-text-on-secondary` | branco `#FFFFFF` | neutro-950 `#1C1613` |
| `color/brand/subtle` · `--color-brand-subtle` | bordo-100 `#F3DCE2` | bordo-900 `#3D0719` |
| `color/brand/subtle-fg` · `--color-brand-subtle-fg` | bordo-700 `#651C32` | bordo-200 `#E9B8C5` |
| `color/accent/subtle` · `--color-accent-subtle` | oliva-100 `#E6EEDA` | oliva-950 `#202F00` |
| `color/accent/subtle-fg` · `--color-accent-subtle-fg` | oliva-800 `#506727` | oliva-300 `#BDCFA3` |
| `color/focus/ring` · `--color-focus-ring` | bordo-700 `#651C32` | bordo-300 `#D98AA0` |
| `color/danger/fg` · `--color-danger-fg` | danger-700 `#A8251B` | danger-300 `#FE9C8D` |
| `color/danger/bg` · `--color-danger-bg` | danger-50 `#FFF2F0` | danger-950 `#3F0704` |
| `color/danger/border` · `--color-danger-border` | danger-200 `#FFC4BA` | danger-800 `#821C14` |
| `color/danger/solid` · `--color-danger-solid` | danger-600 `#C2372B` | danger-600 `#C2372B` |
| `color/danger/solid-hover` · `--color-danger-solid-hover` | danger-700 `#A8251B` | danger-700 `#A8251B` |
| `color/success/fg` · `--color-success-fg` | success-700 `#236E43` | success-300 `#95C9A6` |
| `color/success/bg` · `--color-success-bg` | success-50 `#EDF9F0` | success-950 `#062614` |
| `color/success/border` · `--color-success-border` | success-200 `#BBDFC6` | success-800 `#1A5433` |
| `color/success/solid` · `--color-success-solid` | success-600 `#2E7D4F` | success-600 `#2E7D4F` |
| `color/warning/fg` · `--color-warning-fg` | warning-700 `#8A5A0E` | warning-300 `#D7B485` |
| `color/warning/bg` · `--color-warning-bg` | warning-50 `#FFF3E4` | warning-950 `#2E1A00` |
| `color/warning/border` · `--color-warning-border` | warning-200 `#E9D0AF` | warning-800 `#643F02` |
| `color/warning/solid` · `--color-warning-solid` | warning-500 `#B07A1E` | warning-500 `#B07A1E` |
| `color/info/fg` · `--color-info-fg` | info-700 `#3B6A8C` | info-300 `#9EBFDA` |
| `color/info/bg` · `--color-info-bg` | info-50 `#EEF6FD` | info-950 `#0E212F` |
| `color/info/border` · `--color-info-border` | info-200 `#C0D8EA` | info-800 `#294B64` |
| `color/info/solid` · `--color-info-solid` | info-700 `#3B6A8C` | info-600 `#48779A` |

### Contraste (WCAG AA)

| Par | Mín. | Light | Dark |
|---|---|---|---|
| `--color-text-primary` / `--color-bg-default` | 4.5:1 | 14.3:1 | 17.0:1 |
| `--color-text-secondary` / `--color-surface-default` | 4.5:1 | 8.9:1 | 10.9:1 |
| `--color-text-muted` / `--color-surface-default` | 4.5:1 | 6.0:1 | 7.2:1 |
| `--color-text-brand` / `--color-surface-default` | 4.5:1 | 11.9:1 | 6.9:1 |
| `--color-text-on-action` / `--color-action-primary` | 4.5:1 | 11.9:1 | 5.4:1 |
| `--color-action-primary` / `--color-bg-default` | 3:1 | 11.1:1 | 3.5:1 |
| `--color-text-on-secondary` / `--color-action-secondary` | 4.5:1 | 6.3:1 | 6.7:1 |
| `--color-border-strong` / `--color-surface-default` | 3:1 | 4.0:1 | 4.5:1 |
| `--color-focus-ring` / `--color-bg-default` | 3:1 | 11.1:1 | 7.4:1 |
| `--color-brand-subtle-fg` / `--color-brand-subtle` | 4.5:1 | 9.1:1 | 9.8:1 |
| `--color-danger-fg` / `--color-danger-bg` | 4.5:1 | 6.5:1 | 8.3:1 |
| `--color-success-fg` / `--color-success-bg` | 4.5:1 | 5.7:1 | 8.6:1 |
| `--color-warning-fg` / `--color-warning-bg` | 4.5:1 | 5.4:1 | 8.5:1 |
| `--color-info-fg` / `--color-info-bg` | 4.5:1 | 5.3:1 | 8.5:1 |

Todos passam. Status sólidos: branco sobre danger-600 5.4:1, success-600 5.1:1, info (700 light / 600 dark) 5.8 / 4.8:1; warning-500 usa texto escuro (neutro 950, 4.8:1).

## 4. Tipografia

```css
--font-display: "Playfair Display", Georgia, "Times New Roman", serif;
--font-sans: "Plus Jakarta Sans", ui-sans-serif, system-ui, -apple-system,
             "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

Georgia como fallback porque tem altura de minúsculas parecida com a Playfair (Didot/Bodoni são menores e fariam o texto "pular" ao trocar). Opcional: `@font-face` de fallback com `size-adjust`/`ascent-override`.

| Token | Fonte | Tamanho/LH | Peso | Tracking |
|---|---|---|---|---|
| `h1` | Playfair Display | 48/56 | 600 | -0.02em |
| `h2` | Playfair Display | 40/48 | 600 | -0.015em |
| `h3` | Playfair Display | 32/40 | 400 | -0.01em |
| `h4` | Plus Jakarta Sans | 24/32 | 600 | -0.01em |
| `h5` | Plus Jakarta Sans | 20/28 | 600 | 0 |
| `body-lg` | Plus Jakarta Sans | 18/28 | 400 | 0 |
| `body` | Plus Jakarta Sans | 16/24 | 400 | 0 |
| `body-sm` | Plus Jakarta Sans | 14/20 | 400 | 0 |
| `label` | Plus Jakarta Sans | 14/20 | 500 | 0 |
| `caption` | Plus Jakarta Sans | 12/16 | 500 | 0.01em |
| `overline` | Plus Jakarta Sans | 12/16 | 600 | 0.08em, uppercase |

Regras: Playfair nunca abaixo de 24px nem em botão, label, input ou tabela (traços finos quebram, pior no dark). `font-variant-numeric: lining-nums` nos títulos.

## 5. Espaçamento (mantido)

`space-1` 4 · `space-2` 8 · `space-3` 12 · `space-4` 16 · `space-5` 24 · `space-6` 32 · `space-7` 48 · `space-8` 64 · `space-9` 96 (px).

## 6. Forma, elevação, foco, motion

| Token | Valor |
|---|---|
| `radius-sm` | 4px (padrão) |
| `radius-full` | 9999px (avatar, radio, switch) |
| `border-thin` | 1px |

| Nível | Uso | Light | Dark |
|---|---|---|---|
| 0 | página | `color/bg/default` | idem |
| 1 | card, input, accordion | `color/surface/default` + borda, sem sombra | idem |
| 2 | dropdown, popover, tooltip | `color/surface/raised` + borda + `shadow-2` | idem |
| 3 | modal, toast | `color/surface/raised` + `shadow-3` + `color/backdrop/default` | idem |

```css
/* geometria igual nos dois temas; só a cor muda (vem do mode) */
--shadow-2: 0 1px 2px var(--color-shadow-ambient), 0 4px 12px -2px var(--color-shadow-key);
--shadow-3: 0 2px 4px var(--color-shadow-ambient), 0 16px 32px -8px var(--color-shadow-key);

/* light */  --color-shadow-ambient: rgba(43,35,32,.06);  --color-shadow-key: rgba(43,35,32,.12);  --color-backdrop-default: rgba(43,35,32,.40);
/* dark  */  --color-shadow-ambient: rgba(0,0,0,.30);      --color-shadow-key: rgba(0,0,0,.55);      --color-backdrop-default: rgba(0,0,0,.60);

:focus-visible { outline: 2px solid var(--color-focus-ring); outline-offset: 2px; }
```

| Token | Valor | Uso |
|---|---|---|
| `duration-fast` | 120ms | hover, cor |
| `duration-base` | 200ms | switch, radio, dropdown |
| `duration-slow` | 320ms | modal, drawer |
| `ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | entrada |
| `ease-in` | `cubic-bezier(0.7, 0, 0.84, 0)` | saída (70% da duração) |

## 7. Nomes dos outros tokens

Mesma regra (`/` → `-`): `space/4` ↔ `--space-4`, `radius/sm` ↔ `--radius-sm`, `font/family/display` ↔ `--font-display`, `duration/base` ↔ `--duration-base`, `ease/out` ↔ `--ease-out`. Tipografia no CSS segue o formato do Tailwind v4: `--text-h1: 48px; --text-h1--line-height: 56px;`.

## 8. Estrutura no Figma (plano Education)

**Dois arquivos:**
- **Idris — Design System:** fundações, ícones e componentes. Publicado como biblioteca.
- **Idris — Exemplos:** telas montadas consumindo a biblioteca (como um app que instala o `idris-ui`). Adiado por enquanto.

**Páginas do arquivo do DS:** Capa · Leia-me · — Fundações — · Cores · Tipografia · Espaçamento e forma · Elevação e foco · Motion · Ícones · — Componentes — · uma página por componente · — Uso — · Rascunho · Arquivo morto.

**Arquivo:** [Idris — Design System](https://www.figma.com/design/mb2mEKEpTbIoqQf6qr7NPs) (time "Idris", plano Education).

**Coleções de variáveis (criadas em 2026-09-30):**
- `Primitives` (85, mode `Value`, scoping vazio, escondida da publicação): `color/<rampa>/<passo>`, `color/white` e `color/overlay/*` (transparências de sombra e backdrop).
- `Semantic` (45, modes `Light` e `Dark`): a árvore `color/...` da seção 3, mais `color/shadow/ambient`, `color/shadow/key`, `color/backdrop/default`. Scoping por grupo: `text/*` e `*/fg` em texto e ícone; `border/*`, `focus/*` em stroke; `bg/*`, `surface/*`, `brand/subtle`, `accent/subtle` e `*/bg` em fill; `action/*` e `*/solid` em fill e stroke; `shadow/*` em effect.
- `Scale` (14, mode `Value`): `space/1–9` (gap/padding), `radius/none|sm|full` (sm = 4px), `border/thin|focus`.
- `Typography` (27, mode `Value`): `font/family/display|sans`, `font/weight/regular|medium|semibold`, `font/size/<estilo>`, `font/line-height/<estilo>`.
- Todas com code syntax WEB `var(--...)` seguindo a regra de nomes.

Desvio do plano inicial: espaçamento, radius e tipografia ficaram em `Scale` e `Typography`, e não em `Primitives`, porque primitivos com scoping vazio não aparecem no seletor de padding/gap/fonte.

**Estilos:** 11 text styles `h1` … `overline` com família, tamanho, line-height e peso ligados às variáveis; effect styles `elevation/2` e `elevation/3` com cor ligada a `color/shadow/*`. Limitação: o Figma não guarda `lining-nums` em text style, então os números da Playfair aparecem no estilo antigo dentro do Figma; no CSS a regra continua valendo.

**Componentes:** nome = export do React (`Button`); partes internas com `_` (`_Input/Field`), espelhando `parts/`; propriedades com os mesmos nomes e valores das props (`variant`, `size`, `state`); partes compostas como boolean + instance swap (`icon` + `iconGlyph`); auto layout com tudo ligado a variáveis. Cada página de componente: component set, anatomia, tabela de props, matriz de estados, prévia light/dark.

## 9. Componentes no Figma

### Button (criado em 2026-09-30, loading em 2026-11-03)
- Component set `Button` com 75 variantes: `variant` (primary · secondary · outline · ghost · destructive) × `size` (sm · md · lg) × `state` (default · hover · active · disabled · loading). Mantido `destructive` (nome da API existente); `outline` é variante nova.
- Propriedades: `label` (texto), `showLabel`, `icon`, `iconGlyph` (instance swap entre os ícones Phosphor), `focusRing`.
- Tamanhos: sm `space/1`×`space/3`, md `space/2`×`space/4`, lg `space/3`×`space/5`; texto sempre `label` (14/20); ícone 16, 16 e 20px.
- Cores por variante: primary `color/action/primary(-hover|-active)` + `color/text/on-action`; secondary `color/action/secondary(-hover)` + `color/text/on-secondary`; outline sem fill, borda `color/border/strong`, hover `color/surface/sunken`; ghost `color/text/brand`, hover `color/brand/subtle`; destructive `color/danger/solid(-hover)` + `color/text/on-action`; disabled `color/surface/sunken` + `color/text/muted` + `color/border/default`.
- Token novo: `color/danger/solid-hover` (danger-700 nos dois temas).
- **Loading:** o texto fica transparente (a largura do botão não muda) e o ícone `Icon/circle-notch` aparece centralizado, **na mesma cor do texto da variante** (branco no primary e no destructive, bordô no ghost, texto principal no outline). Tamanho igual ao ícone do tamanho (16/16/20px). O botão mantém a cor da variante e não fica cinza como o disabled: loading é "trabalhando", não "indisponível". Animação: uma volta a cada 800ms, linear; com `prefers-reduced-motion`, pulsa a opacidade em vez de girar. No código: prop `loading` → `data-loading`, `aria-busy="true"` e `aria-disabled` (não `disabled`, pra manter o foco e bloquear clique duplo). Variação futura possível: `loadingText` (spinner antes de um texto como "Salvando…").

### Input
- `_Input/Field` (parte privada, 24 variantes): `size` (sm · md · lg = 28 · 36 · 44px, mesmas alturas do Button) × `state` (default · focus · invalid · disabled) × `content` (placeholder · value). Propriedades `text`, `icon`, `iconGlyph`.
- `Input` (12 variantes, espelha `Input.Root`): `size` × `state`, com Label, Field exposto, Hint e Error. Em `invalid` o Hint some e o Error aparece. Propriedades `label`, `hint`, `error`, `showLabel`, `showHint`.

### Checkbox · Radio · Switch
- `Checkbox` (9): `checked` (false · true · indeterminate) × `state` (default · focus · disabled). Radius 4px.
- `Radio` (6): `checked` × `state`. Círculo.
- `Switch` (6): `checked` × `state`. Pílula 36×20.
- Todos com `label` e `showLabel`.

### Badge · Avatar
- `Badge` (14): `variant` (neutral · brand · accent · success · warning · error · info) × `size` (sm 20px · md 24px). Propriedades `label`, `icon`, `iconGlyph`. Radius 4px (antes era pílula). Nome `error` mantido da API do Badge; usa as variáveis `color/danger/*`.
- `Avatar` (9): `size` (sm 24 · md 32 · lg 40) × `tone` (brand · accent · neutral). Propriedades `initials`, `showInitials`, `showIcon`.

### Tooltip
- `Tooltip` (2): `side` (bottom · top), seta triangular. Fundo `color/surface/inverse`, texto `color/text/inverse`, `elevation/2`. Propriedades `text`, `showArrow`.

### Card · Alert
- `Card` (6): `variant` (default · elevated) × `size` (sm · md · lg, padding space/4 · /5 · /6). Título em Jakarta (h5 no sm, h4 no md/lg): Playfair fica só na hierarquia da página. `elevated` = `color/surface/raised` + `elevation/2`. Footer com instâncias do Button. Propriedades `title`, `description`, `body`, `showHeader`, `showDescription`, `showFooter`.
- `Alert` (4): `variant` (success · warning · error · info). Ícone e título na cor `-fg`, descrição em `color/text/primary`. Propriedades `title`, `description`, `showTitle`, `dismissible`.

Auditoria (2026-09-30): nenhum fill ou stroke sem variável dentro dos component sets.

## 10. Pendências

- Publicar a biblioteca. O arquivo "Idris — Exemplos" fica para depois.
- Atualizar `README.md`, `idris-memoria-projeto.md`, `idris-instrucoes-projeto.md` e as instruções do projeto, que ainda descrevem teal + magenta-vinho, Fraunces + Inter e plano Starter.
