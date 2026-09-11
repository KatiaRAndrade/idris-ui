# Idris — Roadmap Consolidado de Componentes

> Substitui a seção 4 de `design-system-fundacao.md` como fonte da verdade de escopo e ordem. Reorganizado **por dependência de infraestrutura**, não por categoria — a ordem antiga (Onda 1/2/3) agrupava por "tipo de componente", o que fazia peças caríssimas (Select) ficarem ao lado de peças triviais (Tooltip) só porque as duas são "formulário e feedback".
>
> Última atualização: setembro/2026

---

## 1. Onde estamos

**Em código (11):** Button · Badge · Card · Input · Typography (Heading/Text) · Tooltip · Checkbox · Switch · RadioGroup · Separator · Dialog

**Documentado, não implementado (1):** `Input.Textarea`

**Escopo total:** 45 componentes. Restam 34.

### Infraestrutura já existente

| Peça | Status | Quem consome |
|---|---|---|
| `Slot` | ✅ em código | Button, Card, Badge, Input.Field, Dialog.Trigger/Close/Title |
| `useControllableState` | ✅ em código | Checkbox, Switch, RadioGroup, Dialog |
| `BubbleInput` | ✅ em código | Checkbox, Switch, RadioGroup |
| `Portal` | ✅ em código | Dialog |
| `VisuallyHidden` | ✅ em código | Dialog |
| `DismissableLayer` | ✅ em código | Dialog |
| `FocusScope` | ✅ em código | Dialog |
| `useScrollLock` | ✅ em código | Dialog |

---

## 2. As quatro peças que faltam — e o que cada uma destrava

Esse é o ponto central do roadmap. Quatro peças de infraestrutura bloqueiam **26 dos 34 componentes restantes**. Construí-las primeiro não é preciosismo de arquitetura: é a diferença entre escrever collision detection uma vez ou oito.

### P1 — `useRovingFocus` · prioridade máxima

**O que faz:** exatamente um item do grupo tem `tabIndex={0}`; setas navegam entre os irmãos, `Home`/`End` vão às pontas, itens desabilitados são pulados, opcionalmente circular.

**Destrava 7:** Tabs · ToggleGroup · Toolbar · Menubar · NavigationMenu · DropdownMenu · Select

**Por que é a primeira:** o RadioGroup **já implementou isso**, de forma pontual, com query no DOM — documentado como simplificação deliberada na seção 3 de `idris-componente-radio-group.md`. Extrair pra `hooks/useRovingFocus.ts` custa pouco (o comportamento já está escrito e testado) e evita que o padrão seja copiado mais sete vezes. É a mesma economia que o `useControllableState` deu nos controles booleanos.

**Retrofit:** RadioGroup passa a consumir o hook. Os testes dele continuam valendo sem alteração — se passarem depois da troca, a extração está correta.

---

### P2 — Decisão de posicionamento flutuante · maior impacto

**O que faz:** posiciona um elemento flutuante em relação a um gatilho, com `side`/`align`, detecção de colisão (vira pro outro lado quando não cabe), seta apontando pro gatilho, e reposicionamento em scroll/resize.

**Destrava 7 + 1 melhoria:** Popover · HoverCard · Select · DropdownMenu · ContextMenu · Menubar · NavigationMenu — mais a collision detection que o **Tooltip** já tem documentada como pendência.

**Isso é uma decisão, não uma tarefa.** Duas saídas:

| | Escrever do zero | Adotar `floating-ui` |
|---|---|---|
| Fidelidade ao princípio "sem dependência de UI" | Total | Mantida — `floating-ui` é matemática de posicionamento, não componente |
| Esforço | Semanas. Colisão, flip, shift, arrow, `ResizeObserver`, scroll containers aninhados | Horas |
| Risco de bug sutil | Alto | Baixo |
| Valor de portfólio | Alto se terminar, negativo se travar aqui | Neutro |

O precedente do projeto é o `Slot`: reimplementado do zero porque eram ~40 linhas estáveis. Posicionamento não é isso — é o problema mais difícil da lista inteira, e o Radix mesmo usa `floating-ui` internamente em vez de resolver na mão.

**Recomendação:** adotar `floating-ui`, encapsulado num `hooks/useFloating.ts` próprio. Assim a dependência fica isolada num arquivo, os componentes consomem a API do Idris, e trocar depois (ou reimplementar por esporte) não toca em sete componentes. Isso **não** viola a regra 1 das instruções do projeto, que proíbe `@radix-ui/*` especificamente — mas é decisão sua, e por isso está marcada como decisão e não como tarefa.

---

### P3 — `usePresence` · destrava animação de saída

**O que faz:** mantém um elemento montado até a transição de saída terminar, escutando `transitionend`/`animationend`.

**Destrava:** animação de saída de Dialog · Popover · Select · Toast · todos os menus · Accordion · Collapsible

**Por que importa:** hoje o `Dialog.Portal` desmonta assim que `open` vira `false` — a entrada anima, a saída é instantânea (documentado na seção 11 de `idris-componente-dialog.md`). Toast e Accordion são os casos onde isso fica realmente feio: um toast que some sem transição parece bug.

**Retrofit:** Dialog ganha animação de saída sem mudar API pública (o `forceMount` do Portal já deixou a porta aberta).

---

### P4 — Engine de menu · a peça mais cara

**O que faz:** `role="menu"`/`menuitem`, navegação por setas, typeahead (digitar "co" pula pra "Configurações"), submenus com temporizador e triângulo de segurança do mouse, fechamento em cascata.

**Destrava 4:** DropdownMenu · ContextMenu · Menubar · NavigationMenu

**Depende de:** P1 (roving focus) e P2 (posicionamento).

É a parte mais complexa do Radix inteiro. Fica no fim de propósito — os quatro componentes que ela destrava são também os de menor retorno pra um DS de portfólio.

---

## 3. Ordem de criação

Cada fase alterna peças baratas com investimento de infra, pra nunca passar semanas sem nada visível saindo.

### Fase 0 — Extração (antes de qualquer componente novo)

| # | Item | Tipo | Nota |
|---|---|---|---|
| 1 | `useRovingFocus` | Infra P1 | Extrair do RadioGroup + retrofit |
| 2 | `usePresence` | Infra P3 | Retrofit no Dialog |
| 3 | **Decisão de posicionamento** | Decisão P2 | Bloqueia a Fase 3 inteira |

### Fase 1 — Colheita barata (nenhuma infra nova)

Doze componentes que só precisam do que já existe. É a fase que mais engorda o Storybook por hora investida.

| # | Componente | Nota |
|---|---|---|
| 4 | **Label** | Standalone. Checkbox/Switch/RadioGroup hoje exigem `<Text as="label" htmlFor>` composto na mão — e nenhum tem Root que gere o `id` |
| 5 | **Spinner** | Extrair de dentro do Button. Dialog e Toast vão querer |
| 6 | **Skeleton** | CSS puro |
| 7 | **Link** | Estados de foco/visitado, `external` com ícone e `rel` |
| 8 | **Kbd** | `<kbd>` estilizado |
| 9 | **AspectRatio** | Trivial |
| 10 | **Progress** | `role="progressbar"`, determinado e indeterminado |
| 11 | **Avatar** | Fallback com delay pra evitar flash quando a imagem carrega rápido |
| 12 | **Alert** (inline) | ≠ Toast: estático, no fluxo da página. 4 variantes semânticas — os tokens `-bg` já existem |
| 13 | **EmptyState** | Composição de Heading + Text + Button |
| 14 | **AlertDialog** | Reusa as partes do Dialog. Ver seção 15 de `idris-componente-dialog.md` |
| 15 | **AccessibleIcon** | Utilitário. Opcional — `aria-label` na mão já resolve |

### Fase 2 — Consomem `useRovingFocus`

| # | Componente | Nota |
|---|---|---|
| 16 | **Toggle** | Botão de dois estados. Base do ToggleGroup |
| 17 | **ToggleGroup** | Single e multiple |
| 18 | **Tabs** | Estava na Onda 3 antiga. Alto retorno visual |
| 19 | **Toolbar** | Agrupa Button/Toggle/Separator com navegação por setas |
| 20 | **Breadcrumb** | Não precisa de roving focus, mas é parente de navegação. Barato |
| 21 | **Pagination** | Idem |

### Fase 3 — Collapsible e derivados

| # | Componente | Nota |
|---|---|---|
| 22 | **Collapsible** | Pré-requisito real do Accordion. Precisa de `usePresence` pra animar altura |
| 23 | **Accordion** | N Collapsibles + coordenação de qual abre. `single`/`multiple`, com/sem `collapsible` |

### Fase 4 — Dependem do posicionamento (P2)

| # | Componente | Nota |
|---|---|---|
| 24 | **Popover** | O mais simples dos flutuantes. Valida o `useFloating` antes dos caros |
| 25 | **Tooltip — melhoria** | Retrofit: collision detection, `side`/`align`. Fecha a pendência da v1 |
| 26 | **HoverCard** | Popover + delay de hover |
| 27 | **Select** | Posicionamento + roving focus + typeahead + `BubbleInput`. O mais caro fora dos menus |

### Fase 5 — Engine de menu (P4)

| # | Componente | Nota |
|---|---|---|
| 28 | **Engine de menu** | Infra P4 |
| 29 | **DropdownMenu** | Items, checkbox items, radio items, submenus |
| 30 | **ContextMenu** | Mesma engine, gatilho de botão direito |
| 31 | **Menubar** | N DropdownMenus coordenados horizontalmente |
| 32 | **NavigationMenu** | O mais complexo do Radix |

### Fase 6 — Infra própria, cada um o seu

| # | Componente | Nota |
|---|---|---|
| 33 | **Toast** | Viewport global, fila, swipe pra dispensar, `aria-live`, pausa no hover. Precisa de `usePresence` |
| 34 | **Table** | Não é Radix. Estrutura + ordenação. Virtualização fica fora |
| 35 | **Slider** | Drag, teclado, passo, múltiplos thumbs |
| 36 | **ScrollArea** | Barra customizada. Alto custo, ganho estético |
| 37 | **PasswordToggleField** | Mostrar/ocultar senha mantendo o cursor |
| 38 | **OneTimePasswordField** | Input segmentado, colar código, auto-avançar |
| 39 | **DirectionProvider** | RTL. Só se algum dia houver suporte a direita-pra-esquerda — provavelmente nunca |

---

## 4. Melhorias de retrofit (fora da contagem)

Não são componentes novos, mas não podem se perder:

- [ ] RadioGroup consome `useRovingFocus` (Fase 0)
- [ ] Dialog ganha animação de saída via `usePresence` (Fase 0)
- [ ] Tooltip ganha collision detection (Fase 4)
- [ ] `Card.Footer` consome `Separator` em vez de desenhar `border-t` na mão
- [ ] Revisitar **Drawer** — decidido ficar como está por ora; se ganhar comportamento próprio (swipe, snap points), vira namespace próprio reusando as partes do Dialog, com o refactor de `scope` no contexto
- [ ] `mergeRefs` exportado de `primitives/` — já aparece em `Input.Textarea`, `DismissableLayer` e `FocusScope`; na terceira repetição vale extrair
- [ ] `inert` no fundo do modal (limite conhecido do `FocusScope`)

---

## 5. Inconsistências abertas

- [ ] **Hex do `error` diverge:** `#D9433A` em `design-system-fundacao.md` e `idris-memoria-projeto.md`, `#C0261E` em `idris-passo-a-passo.md` e `README.md`. Precisa de uma escolha sua antes de qualquer auditoria de contraste
- [ ] **README desatualizado:** lista Input/Card/Badge/Tooltip como "🚧 Planejado" e o Button como disponível no npm
- [ ] **`ds-architecture.md`** é referenciado em todos os docs como `idris-estrutura-componentes.md` — mesmo conteúdo, nome diferente
- [ ] **Nomenclatura Modal/Dialog:** o roadmap antigo diz "Modal / Dialog" como se fossem sinônimos. Dialog é o componente, modal é um comportamento (a prop `modal`)
- [ ] **Fill branco no footer do Dialog** no Figma — o código já está correto, o Figma que precisa se alinhar

---

## 6. Distribuição do esforço

| Fase | Componentes | Custo relativo |
|---|---|---|
| 0 — Extração | 3 peças de infra | Baixo |
| 1 — Colheita barata | 12 | Baixo |
| 2 — Roving focus | 6 | Baixo-médio |
| 3 — Collapsible | 2 | Médio |
| 4 — Flutuantes | 4 | Alto |
| 5 — Menus | 5 | Muito alto |
| 6 — Diversos | 7 | Alto |

Fases 0 a 3 entregam **23 componentes** e custam menos que a Fase 5 sozinha. Se em algum momento fizer sentido parar e chamar de v1.0, é no fim da Fase 4: 27 componentes cobrindo praticamente tudo que uma aplicação real usa, sem os quatro menus — que são justamente os de menor retorno pra portfólio e maior risco de travar o projeto.
