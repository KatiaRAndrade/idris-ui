# Idris — Design System

> Status: rascunho inicial — a ser validado antes do desenvolvimento
> Última atualização: [preencher]

## 1. Visão Geral

**Nome do design system:** Idris
**Finalidade:** Projeto pessoal / portfólio
**Formato de distribuição:** Biblioteca standalone publicável (npm) + Storybook — pacote `idris-ui` (verificar disponibilidade)
**Personalidade visual:** Moderno / tech — dark mode como padrão, com suporte a light mode
**Stack:** React + TypeScript + Tailwind CSS
**Fluxo de trabalho:** Figma (prototipagem) → Código (implementação)

### Objetivo do projeto
[1-2 frases: por que você está construindo isso? Ex: "Demonstrar domínio de arquitetura de componentes, tokens de design e boas práticas de acessibilidade para portfólio profissional."]

### Princípios norteadores
1. **Consistência acima de criatividade pontual** — o sistema existe para não reinventar a roda a cada tela
2. **Flexibilidade dentro de restrições** — componentes compostos, não rígidos (alinhado com os padrões que você já usou no fintrack: Compound Component, Provider, Render Props)
3. **Documentar tudo** — se não está documentado, não existe
4. **Versionamento com caminho de migração** — mudanças breaking precisam de changelog claro

---

## 2. Design Tokens

Como é dark mode + tech + vibrante, a estrutura de tokens precisa suportar **temas** desde o início (não é algo pra adicionar depois).

### 2.1 Cores

**Paleta base atualizada** — teal + magenta-vinho, referência de moodboard (Pantone 19-4524 TCX "Teal Blue" + Pantone 19-2428 TCX "Magenta Purple"), estilo moderno/editorial:

| Token | Hex | Uso |
|---|---|---|
| `brand-700` | `#0B282C` | Teal escuro — backgrounds de destaque, hover |
| `brand-500` | `#123F45` | Teal principal — cor de ação primária (Pantone 19-4524 TCX) |
| `brand-400` | `#4C7D80` | Teal claro — texto sobre fundo escuro, active state |
| `accent-700` | `#3D1723` | Magenta-vinho escuro — hover do accent |
| `accent-500` | `#5A2440` | Magenta-vinho principal — accent secundário/premium (Pantone 19-2428 TCX) |
| `accent-400` | `#96556F` | Magenta-vinho claro — texto sobre fundo escuro, active state |
| `background` | `#171310` | Fundo base do app (preto quente) |
| `surface` | `#1F1B17` | Cards, painéis |
| `surface-elevated` | `#2A2521` | Modais, dropdowns, elementos flutuantes |
| `text-primary` | `#EDE6D6` | Texto principal (bege/creme) |
| `text-secondary` | `#B8AFA0` | Texto secundário (bege dessaturado) |
| `beige-surface` | `#E8E1D3` | Superfícies invertidas (blocos claros sobre fundo escuro) |

**Regra de composição:** teal = ação primária · magenta-vinho = accent secundário/premium (badges, destaques pontuais) · preto = base · bege = texto e respiro. Evitar os quatro competindo no mesmo elemento.

**Distinção vs. error:** tanto o `brand-500` (teal) quanto o `accent-500` (magenta-vinho) ficam claramente distantes do `error` (`#D9433A`, vermelho puro) na roda de cor — sem risco de confusão com estado de erro.

### Variantes metalizadas

O `accent` (magenta-vinho) ganha duas variantes em **gradiente metalizado** — pra uso pontual em momentos de destaque premium (hero, badge de assinatura, CTA especial), nunca em UI funcional do dia a dia (inputs, botões padrão), pra não perder a leitura de "sistema" do resto da interface:

| Token | Valor | Efeito |
|---|---|---|
| `accent-metallic` | `linear-gradient(135deg, #2B0F1A 0%, #5A2440 22%, #9C5E77 48%, #5A2440 74%, #2B0F1A 100%)` | Sheen monocromático — simula superfície polida na própria família do magenta-vinho |
| `accent-metallic-gold` | `linear-gradient(135deg, #3D1723 0%, #5A2440 25%, #C9A227 50%, #5A2440 75%, #3D1723 100%)` | Magenta-vinho + filete dourado — leitura de "foil premium" |

**Implementação (Tailwind):** como gradiente não é um "color token" tradicional, ele entra como CSS variable + utility arbitrária:

```css
--gradient-accent-metallic: linear-gradient(135deg, #2B0F1A 0%, #5A2440 22%, #9C5E77 48%, #5A2440 74%, #2B0F1A 100%);
--gradient-accent-metallic-gold: linear-gradient(135deg, #3D1723 0%, #5A2440 25%, #C9A227 50%, #5A2440 75%, #3D1723 100%);
```
```html
<div class="bg-[image:var(--gradient-accent-metallic-gold)]">...</div>
```

| Categoria | Tokens necessários | Status |
|---|---|---|
| Marca (brand) | primary, primary-hover, primary-active | ✅ definido (teal + accent magenta-vinho) |
| Semânticas | success, warning, error, info (+ variações hover/bg) | ✅ definido abaixo |
| Neutras | escala de cinza para dark mode (background, surface, border, text) | ✅ definido acima |
| Superfícies | background, surface, surface-elevated | ✅ definido acima |

**Semânticas — derivadas da paleta teal/magenta-vinho/preto/bege**, mantendo tons terrosos/muted em vez de recorrer a verde/azul saturados genéricos. `error` fica deliberadamente mais quente e saturado que `brand` e `accent`, para não ser confundido com as cores de ação.

| Token | Hex | Uso |
|---|---|---|
| `success` | `#5B7A5D` | Verde oliva — confirmações, estados positivos |
| `success-hover` | `#4A6350` | Hover/active de success |
| `success-bg` | `#1E241F` | Fundo de alerta/toast de sucesso |
| `warning` | `#C9932E` | Mostarda — avisos, atenção |
| `warning-hover` | `#A97824` | Hover/active de warning |
| `warning-bg` | `#2A2318` | Fundo de alerta/toast de warning |
| `error` | `#D9433A` | Vermelho puro/saturado — mais reconhecível como erro, agora que `brand`/`accent` não competem mais nesse território | 
| `error-hover` | `#B23429` | Hover/active de error |
| `error-bg` | `#2E1916` | Fundo de alerta/toast de erro |
| `info` | `#5C87A6` | Azul acinzentado — a única cor "fria" do sistema, por contraste proposital |
| `info-hover` | `#3F6883` | Hover/active de info |
| `info-bg` | `#1A2126` | Fundo de alerta/toast de info |

**Pergunta em aberto:** dark mode é o único tema, ou você também quer suportar light mode no futuro? Isso muda a arquitetura do token (semantic tokens em cima de primitive tokens) — se sim, o bege (`#E8E1D3`) já é um bom candidato a background do tema claro.

✅ **Decidido: vai ter light mode também.** Dark continua sendo o tema padrão. Isso confirma a arquitetura de **tokens semânticos sobre tokens primitivos** — os componentes referenciam sempre o token semântico (`background`, `text-primary`), nunca o hex direto, pra trocar de tema sem tocar em código de componente.

**Tokens — Light mode:**

| Token | Hex (Light) | Observação |
|---|---|---|
| `brand-700` / `brand-500` / `brand-400` (teal) e `accent-700` / `accent-500` / `accent-400` (magenta-vinho) | iguais ao dark | as duas cores funcionam nos dois temas sem ajuste |
| `background` | `#F7F3EA` | branco quente, harmoniza com o bege da marca |
| `surface` | `#FFFFFF` | |
| `surface-elevated` | `#FDFBF7` | |
| `text-primary` | `#171310` | reaproveita o preto que era `background` no dark |
| `text-secondary` | `#6B6259` | |
| `beige-surface` | `#E8E1D3` | mesma cor, papel de destaque em vez de fundo invertido |
| `success-bg` / `warning-bg` / `error-bg` / `info-bg` | versões claras (ex: `#E8EFE9`, `#FBF0DC`, `#FBE4E1`, `#E7EEF2`) | os tons base (`success`, `warning` etc.) continuam os mesmos — só o fundo do alerta muda |

### 2.2 Tipografia

**Par tipográfico definido** — inspirado em referência editorial (serifado de display + sans-serif neutro no corpo), reforçando o tom "moderno/tech com toque premium":

- **Display/Títulos:** [Fraunces](https://fonts.google.com/specimen/Fraunces) (serifado, alto contraste, gratuita via Google Fonts) — carrega a personalidade editorial da referência
- **Corpo/UI:** Inter (sans-serif neutro) — já validada pra interface, mantém legibilidade em telas pequenas

| Token | Fonte | Tamanho | Peso | Line-height | Uso |
|---|---|---|---|---|---|
| `display` | Fraunces | 56px | Light (300) | 1.1 | Hero, títulos de seção grandes |
| `heading-1` | Fraunces | 40px | Regular (400) | 1.15 | H1 de página |
| `heading-2` | Fraunces | 32px | Regular (400) | 1.2 | H2, títulos de card grande |
| `heading-3` | Fraunces | 24px | Medium (500) | 1.25 | H3, subtítulos |
| `heading-4` | Fraunces | 20px | SemiBold (600) | 1.3 | H4, títulos de componente |
| `body-lg` | Inter | 18px | Regular (400) | 1.6 | Texto de introdução/lead |
| `body` | Inter | 16px | Regular (400) | 1.6 | Texto padrão |
| `body-sm` | Inter | 14px | Regular (400) | 1.5 | Texto secundário, descrições |
| `label` | Inter | 14px | Medium (500) | 1.4 | Labels de formulário, botões |
| `caption` | Inter | 12px | Medium (500) | 1.4 | Legendas, metadados, uppercase + letter-spacing 0.02em |

**Regra de uso:** Fraunces cobre toda a hierarquia de títulos (display até heading-4) — Inter entra só a partir do `body-lg`, sempre em texto corrido e UI funcional (botões, inputs, badges). Essa divisão clara evita o ponto de atrito onde as duas fontes ficavam coladas na mesma hierarquia.

### 2.3 Espaçamento
Escala base 4px, geométrica nos primeiros passos e depois mais espaçada — cobre de gaps pequenos (ícone+texto) até respiro de seção.

| Token | Valor | Uso típico |
|---|---|---|
| `space-1` | 4px | Gap entre ícone e texto, padding interno mínimo |
| `space-2` | 8px | Gap entre elementos próximos (ex: label + input) |
| `space-3` | 12px | Padding interno de botões pequenos |
| `space-4` | 16px | Padding padrão de card/input, gap entre campos de formulário |
| `space-5` | 24px | Padding interno de card grande, gap entre seções de um formulário |
| `space-6` | 32px | Espaço entre blocos dentro de uma página |
| `space-7` | 48px | Espaço entre seções de página |
| `space-8` | 64px | Margem de topo/rodapé de página, hero |
| `space-9` | 96px | Respiro grande — landing pages, hero sections |

### 2.4 Bordas e Elevação
| Token | Valor | Uso |
|---|---|---|
| `radius-sm` | 6px | Badges, inputs pequenos, tags |
| `radius-md` | 10px | Botões, inputs, cards pequenos |
| `radius-lg` | 16px | Cards grandes, modais |
| `radius-full` | 9999px | Avatares, pills, badges circulares |
| `border-thin` | 1px | Borda padrão (inputs, cards, divisores) |
| `border-thick` | 2px | Borda de foco/estado ativo |

**Elevação:** confirmado — em vez de `box-shadow` tradicional (que "some" em fundos escuros), usar troca de tom entre `surface` → `surface-elevated` combinada com uma borda sutil de 1px (`border-thin`, ~10% branco de opacidade). Reserva-se um glow discreto em `brand-500` só para estados de foco/destaque.

### 2.5 Motion
| Token | Valor | Uso |
|---|---|---|
| `duration-fast` | 150ms | Hover, toggle de estado simples |
| `duration-base` | 250ms | Transições padrão (abrir/fechar dropdown, fade) |
| `duration-slow` | 400ms | Modais, transições de página/layout |
| `easing-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Padrão geral — entrada e saída |
| `easing-out` | `cubic-bezier(0, 0, 0.2, 1)` | Elementos entrando na tela |
| `easing-in` | `cubic-bezier(0.4, 0, 1, 1)` | Elementos saindo da tela |

---

## 3. Arquitetura Técnica

Já que vai ser **biblioteca standalone + Storybook**, algumas decisões precisam ser tomadas antes de escrever o primeiro componente:

| Decisão | Opções | Escolha |
|---|---|---|
| Bundler | tsup / Rollup / Vite (library mode) | ✅ **Vite** (library mode) |
| Gestão de variantes de componente | CVA / tailwind-variants / classnames manual | ✅ **tailwind-variants** — combina bem com os tokens (variant/size/state como os que já modelamos no Button) |
| Estratégia de tokens no Tailwind | CSS variables + tailwind.config lendo os tokens, ou tokens gerados via Style Dictionary | ✅ **CSS variables + tailwind.config** — os hex definidos na seção 2.1 viram `--color-*` e são referenciados no `theme.extend` |
| Estrutura de pastas | Por componente (`/Button/Button.tsx, Button.stories.tsx, Button.test.tsx`) | ✅ **confirmado** — por componente |
| Gestão de tema (dark mode) | CSS variables + `data-theme` attribute, ou Context Provider | ✅ **CSS variables + `data-theme`** |
| Testes | Testing Library + Vitest/Jest | ✅ **Testing Library + Vitest** |
| Documentação viva | Storybook (confirmado) + addon de accessibility (a11y) | ✅ Storybook |
| Publicação | npm público, versionamento semver, Changesets para changelog | ✅ **npm público** |
| Posicionamento flutuante | Implementação própria vs. `floating-ui` | ✅ **Implementação própria** (`useFloating`) — decisão registrada em [`idris-decisao-posicionamento.md`](./idris-decisao-posicionamento.md) |

---

## 4. Componentes — Escopo da v1

Escopo definido: **sistema completo** (tokens + componentes + padrões). Sugestão de priorização em 3 ondas, pra você não travar tentando fazer tudo de uma vez:

### Onda 1 — Fundação (essenciais)
- [x] Button (variantes: primary, secondary, ghost, destructive / estados: default, hover, active, disabled, loading) — **componente-modelo, ver 4.1**
- [x] Input / Textarea — **ver 4.2**, documentação completa em `idris-componente-input.md`
- [ ] Card
- [ ] Badge/Tag
- [ ] Typography (componentes de texto: Heading, Text)

### Onda 2 — Formulários e feedback
- [ ] Select / Dropdown
- [ ] Checkbox / Radio / Switch
- [ ] Toast / Alert
- [ ] Modal / Dialog
- [ ] Tooltip

### Onda 3 — Padrões compostos
- [ ] Formulário completo (Input + validação + erro)
- [ ] Navegação (Tabs, Breadcrumb)
- [ ] Tabela de dados
- [ ] Empty states

**Pergunta em aberto:** quer que eu já detalhe a documentação completa (variantes, estados, props, acessibilidade) do primeiro componente da Onda 1 para servir de modelo?

### 4.1 Componente-modelo: Button

Primeiro componente documentado — serve de template pros próximos.

**Variantes:**
| Variante | Fundo | Texto | Uso |
|---|---|---|---|
| `primary` | `brand-500` | `text-primary` (bege) | Ação principal da tela — 1 por seção, no máximo |
| `secondary` | `surface-elevated` + borda `border-thin` | `text-primary` | Ação alternativa, não-destrutiva |
| `ghost` | transparente | `text-primary` | Ações terciárias, dentro de toolbars/cards |
| `destructive` | `error` | `text-primary` | Ações irreversíveis (excluir, remover) |

> O `accent-500` (magenta-vinho) não entra como variante de Button — fica reservado para badges, tags e destaques pontuais, conforme a regra de composição da seção 2.1.

**Tamanhos:** `sm` (padding `space-2`/`space-3`, `body-sm`), `md` (padding `space-3`/`space-4`, `body`), `lg` (padding `space-4`/`space-5`, `body-lg`)

**Estados:**
| Estado | Comportamento |
|---|---|
| `default` | Cor base da variante |
| `hover` | Troca para o token `-hover` correspondente (ex: `brand-500` → `brand-700` em primary) |
| `active` | Levemente mais escuro que hover, sem transição (feedback imediato) |
| `focus` | Anel de foco 2px em `brand-400`, obrigatório para navegação por teclado |
| `disabled` | Opacidade 40%, sem interação, cursor `not-allowed` |
| `loading` | Ícone de spinner substitui o texto ou aparece antes dele; botão fica `disabled` durante o loading |

**Tokens usados:** `radius-md`, `space-2` a `space-5`, `duration-fast` (transição de hover), `type/label` (tipografia do texto do botão)

**Acessibilidade:** `role="button"` (nativo se for `<button>`), foco visível sempre, `aria-disabled` quando desabilitado, `aria-busy="true"` durante loading, contraste mínimo AA verificado em todas as variantes sobre seus respectivos fundos.

### 4.2 Componente: Input

Segundo componente da Onda 1 — código completo em [`idris-componente-input.md`](./idris-componente-input.md). Diferente do Button, exige `.Root` explícito (coordena `label`/`input`/mensagens via contexto, não é um elemento único).

**Partes:** `Input.Root` (contexto: id, size, disabled, invalid) · `Input.Label` · `Input.Field` (aceita `asChild`) · `Input.Hint` (esconde quando há erro) · `Input.Error` (`role="alert"`, só aparece quando `invalid`)

**Tamanhos:** `sm` / `md` / `lg` — mesma escala de padding do Button, pra alinhar visualmente numa mesma linha de formulário.

**Estados:** `default`, `focus` (ring `brand-400`), `invalid` (borda + ring `error`), `disabled` (propagado do Root pro Field)

**Tokens usados:** `surface`, `border-thin`, `text-primary`/`text-secondary`, `error`, `brand-400`, `radius-md`, `space-2` a `space-5`, `type/label`, `type/body-sm`

**Acessibilidade:** `label` associado ao campo via `htmlFor`/`id` (gerado com `useId`), `aria-invalid` quando `invalid`, `aria-describedby` montado dinamicamente a partir do `Hint`/`Error` renderizados (registro via contexto, não hardcoded), `Error` com `role="alert"` pra leitores de tela anunciarem a mudança.

---

## 5. Acessibilidade (não-negociável, não deixar pra depois)

- Todo componente interativo precisa de: role ARIA correto, navegação por teclado, contraste mínimo AA (4.5:1 texto normal, 3:1 texto grande) — **atenção redobrada em dark mode com acentos vibrantes**, contraste costuma falhar aqui
- Definir isso *durante* o design de cada componente, não como checklist final

---

## 6. Próximos Passos

1. ~~Fechar a paleta de cores~~ ✅
2. ~~Decidir arquitetura técnica (seção 3)~~ ✅
3. ~~Prototipar Onda 1 no Figma~~ ✅ (Button)
4. ~~Documentar o primeiro componente (Button) como modelo de template~~ ✅
5. **Implementar o Button em código** seguindo o template (Vite + tailwind-variants)
6. Modelar os próximos componentes da Onda 1 (Input, Card, Badge, Typography) usando o Button como referência
7. Configurar o projeto (Vite lib mode + Storybook + Vitest) e publicar a v0.1.0 no npm como `idris-ui`

---

## 7. Perguntas em aberto (resumo)

Todas as decisões de fundação estão fechadas. 🎉
