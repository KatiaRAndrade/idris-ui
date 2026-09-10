# Idris — Decisão: Posicionamento Flutuante

> Infraestrutura P2 do [`idris-roadmap-componentes.md`](./idris-roadmap-componentes.md). **Este documento é uma decisão em aberto, não uma spec fechada.** Ele apresenta as opções, o raciocínio e uma recomendação — a escolha final é da Ka, conforme a regra de "nunca mudar uma decisão fechada sem confirmar" das instruções do projeto.
>
> Status: **decidido — Opção A (implementação própria)**, setembro/2026. A implementação está em [`idris-hook-use-floating.md`](./idris-hook-use-floating.md). Este documento fica como registro do raciocínio.
>
> **Ajuste de escopo em relação à seção 6:** o `constrainSize` acabou entrando na v1 (é barato dentro da estrutura da função pura, e sem ele o Select ficaria bloqueado). Continuam fora: recorte por containers roláveis, ancoragem em ponto do mouse e posicionamento de submenu.

---

## 1. O que precisa ser resolvido

Colocar um elemento flutuante em relação a um gatilho. Parece uma conta de `getBoundingClientRect()` — e a primeira versão sempre é. O que transforma isso no problema mais difícil da lista:

| Comportamento | O que é |
|---|---|
| `side` / `align` | Acima/abaixo/esquerda/direita, alinhado ao início/centro/fim |
| **Flip** | Não cabe embaixo → vira pra cima automaticamente |
| **Shift** | Cabe embaixo mas estoura na lateral → desliza pra dentro da viewport |
| **Size** | Não cabe de jeito nenhum → limita altura e ativa rolagem interna |
| **Arrow** | Seta apontando pro gatilho, reposicionada quando o conteúdo desliza |
| Scroll containers aninhados | O gatilho dentro de um `div` com scroll dentro de um modal que também rola |
| Reposicionamento contínuo | `ResizeObserver` no gatilho e no conteúdo, listeners de scroll em todos os ancestrais roláveis |
| Sub-pixel e zoom | Arredondamento que evita texto borrado em telas não-retina |

Os quatro primeiros são o mínimo pra não ter bug visível. Os quatro últimos são o que separa "funciona no meu teste" de "funciona na aplicação de outra pessoa".

## 2. Quem depende disso

**7 componentes + 1 melhoria:**

| Componente | Fase | Precisa de |
|---|---|---|
| Popover | 4 | Tudo |
| HoverCard | 4 | Tudo |
| Select | 4 | Tudo + `size` (lista longa) |
| DropdownMenu | 5 | Tudo + posicionamento de submenu |
| ContextMenu | 5 | Ancoragem em ponto do mouse, não em elemento |
| Menubar | 5 | Tudo |
| NavigationMenu | 5 | Tudo |
| **Tooltip** (retrofit) | 4 | Flip + shift + arrow |

O Tooltip é o caso concreto: ele foi entregue com posicionamento CSS fixo (`absolute`, sempre abaixo do trigger), e isso está documentado como simplificação deliberada na seção 3 de [`idris-componente-tooltip.md`](./idris-componente-tooltip.md). Um tooltip num botão no rodapé da tela hoje abre pra fora da viewport.

---

## 3. As duas opções

### Opção A — Escrever do zero

**A favor:**
- Fidelidade máxima ao espírito do projeto: nenhuma dependência de UI, tudo compreendido de ponta a ponta
- Valor de portfólio alto — é um problema difícil de verdade, e resolvê-lo demonstra bem mais que montar componentes
- Zero peso adicionado ao bundle de quem consome o `idris-ui`

**Contra:**
- Escopo real de semanas, não de dias. E não é trabalho linear: os bugs aparecem em combinações (gatilho dentro de container rolável dentro de modal com zoom do navegador)
- Risco concreto de o projeto travar aqui. Sete componentes ficam bloqueados enquanto isso
- Bugs de posicionamento são sutis e difíceis de testar — o jsdom não calcula layout, então **nada disso é testável em Vitest**. A validação é manual, no navegador, em várias resoluções

### Opção B — Adotar `floating-ui`

**A favor:**
- Resolve os 8 itens da seção 1, incluindo os quatro que quase ninguém acerta na primeira
- Horas em vez de semanas. Desbloqueia a Fase 4 imediatamente
- É a mesma biblioteca que o Radix usa internamente. "Fizemos a mesma escolha de arquitetura que o Radix" é uma resposta perfeitamente defensável numa entrevista
- É matemática de posicionamento, não componente de UI — não tem opinião sobre aparência, acessibilidade ou API

**Contra:**
- Uma dependência a mais no `package.json`
- Menos aprendizado sobre o problema em si

---

## 4. O critério que eu usaria

A regra 1 das instruções do projeto proíbe `@radix-ui/*` especificamente, e o precedente do `Slot` é reimplementar em vez de instalar. Vale perguntar por que o `Slot` foi reimplementado: **porque eram ~40 linhas estáveis**, com a própria doc dizendo que "não deve precisar de manutenção frequente". O custo de manter era quase zero, e o ganho de entendimento, alto.

Posicionamento flutuante é o oposto disso em todos os eixos: milhares de linhas, área de bug enorme, manutenção contínua conforme navegadores mudam, e **impossível de cobrir com os testes que o projeto usa**.

A regra que fica pro futuro: **reimplementar quando o custo de manter for baixo e o aprendizado alto; adotar quando for o inverso.** `Slot`, `useControllableState`, `FocusScope`, `DismissableLayer` — todos do primeiro tipo, todos reimplementados. Posicionamento é o primeiro caso claro do segundo tipo.

**Recomendação: Opção B**, com a dependência isolada num hook próprio (seção 5).

Se você quiser escrever do zero mesmo assim, uma terceira via: adotar `floating-ui` agora pra destravar a Fase 4, e reimplementar depois como projeto paralelo. Como o encapsulamento da seção 5 esconde a biblioteca atrás de uma API própria, a troca depois toca **um arquivo**, não sete componentes.

---

## 5. Se for a Opção B: o encapsulamento

Nenhum componente importa `@floating-ui/react-dom` direto. Todos consomem `hooks/useFloating.ts`, que é API do Idris.

```
src/hooks/
├── useControllableState.ts
├── useRovingFocus.ts
├── usePresence.ts
└── useFloating.ts        # único arquivo que conhece a biblioteca
```

**API proposta:**

```ts
export type Side = 'top' | 'right' | 'bottom' | 'left'
export type Align = 'start' | 'center' | 'end'

export interface UseFloatingOptions {
  /** Lado preferido. Pode virar por conta do flip. */
  side?: Side
  align?: Align
  /** Distância em px entre gatilho e conteúdo. Default: 8 (space-2) */
  offset?: number
  /** Vira pro lado oposto quando não couber. Default: true */
  flip?: boolean
  /** Desliza pra dentro da viewport quando estourar na lateral. Default: true */
  shift?: boolean
  /** Limita a altura e ativa rolagem interna quando não couber. Default: false */
  constrainSize?: boolean
  /** Recalcula em scroll e resize enquanto aberto. Default: true */
  trackAnchor?: boolean
}

export interface UseFloatingResult {
  /** Ref pro elemento gatilho. */
  anchorRef: (node: HTMLElement | null) => void
  /** Ref pro elemento flutuante. */
  floatingRef: (node: HTMLElement | null) => void
  /** Ref pra seta, quando houver. */
  arrowRef: (node: HTMLElement | null) => void
  /** Estilos a aplicar no flutuante. */
  floatingStyles: React.CSSProperties
  arrowStyles: React.CSSProperties
  /** Lado e alinhamento REAIS depois do flip — viram data-* no componente. */
  resolvedSide: Side
  resolvedAlign: Align
}

export function useFloating(open: boolean, options?: UseFloatingOptions): UseFloatingResult
```

**O detalhe que faz esse encapsulamento valer:** `resolvedSide` e `resolvedAlign` são o lado **de verdade** depois do flip. Eles viram `data-side` e `data-align` no componente, e o `.styles.ts` reage:

```ts
'data-[side=top]:origin-bottom data-[side=bottom]:origin-top'
```

Assim a animação de entrada nasce do lado certo, e o componente continua sem lógica condicional de estilo — princípio 2 da arquitetura preservado mesmo com biblioteca externa por baixo.

**Dependência no `package.json`:** `@floating-ui/react-dom` como `dependency` (não peer) — é detalhe de implementação do `idris-ui`, não algo que o consumidor precise instalar. Pesa poucos KB e não tem dependências transitivas relevantes.

---

## 6. Se for a Opção A: escopo mínimo

Caso a escolha seja escrever do zero, o corte que eu faria pra não travar o projeto:

**v1 (destrava Popover, HoverCard e o retrofit do Tooltip):** `side` + `align` + `offset` + flip + shift + arrow, com recálculo em scroll/resize via listener simples.

**Fora da v1 (adiado):** `constrainSize`, scroll containers aninhados, ancoragem em ponto do mouse (ContextMenu), posicionamento de submenu.

Consequência: **Select e os menus continuam bloqueados** até a v2. Na prática isso adia as Fases 4 (parcialmente) e 5 (inteira).

A API pública seria a mesma da seção 5 — o que é bom: significa que as duas opções produzem o mesmo `useFloating.ts` do ponto de vista dos componentes, e a escolha é só sobre o que existe dentro dele.

---

## 7. Testabilidade — vale saber antes de escolher

O jsdom não calcula layout: `getBoundingClientRect()` retorna zeros. Isso significa que **posicionamento não é testável em Vitest**, em nenhuma das duas opções.

O que dá pra testar:

| Testável em Vitest | Como |
|---|---|
| Os refs são aplicados nos nós certos | Query no DOM |
| `data-side`/`data-align` aparecem no elemento | Com `useFloating` mockado |
| O componente abre e fecha | Já coberto pelos testes de comportamento |
| Cálculo de flip/shift | ❌ — precisa de layout real |

A validação real é **manual, no Storybook**, com uma story dedicada: gatilho posicionável perto de cada borda da viewport, dentro de um container rolável, e num modal. Vale escrever essa story antes do primeiro componente flutuante — ela serve de teste de regressão visual pra todos os sete.

Isso pesa a favor da Opção B: escrever do zero algo que os testes automatizados do projeto não conseguem cobrir aumenta bastante o risco.

---

## 8. Depois da decisão

Se **Opção B**:
1. `npm install @floating-ui/react-dom`
2. Criar `hooks/useFloating.ts` com a API da seção 5
3. Story de validação de bordas no Storybook
4. Retrofit do Tooltip (fecha a pendência da seção 3 daquele doc)
5. Popover → HoverCard → Select

Se **Opção A**:
1. `hooks/useFloating.ts` com a mesma API, implementação própria
2. Escopo da seção 6, com os itens adiados registrados como pendência
3. Mesma story de validação
4. Mesma sequência de componentes, com Select e menus adiados

Nos dois casos, o próximo documento a escrever é `idris-componente-popover.md` — o Popover é o mais simples dos flutuantes e serve pra validar o `useFloating` antes dos caros.

---

## 9. Registrar a decisão

Quando decidir, atualizar:

- [x] Este documento — status já registrado como "decidido — Opção A" no topo
- [x] Seção 3 de `design-system-fundacao.md` — linha nova na tabela de arquitetura técnica
- [ ] `idris-memoria-projeto.md` — stack (arquivo não existe neste repo ainda)
- [ ] `idris-roadmap-componentes.md` — P2 deixa de ser decisão e vira tarefa (concluída: `computePosition.ts` + `useFloating/index.ts` implementados, retrofit do Tooltip feito)
- [x] `idris-instrucoes-projeto.md` — item não se aplica: foi Opção A (implementação própria), não Opção B (`floating-ui`), então a regra 1 não precisa da distinção "biblioteca de UI vs. biblioteca de cálculo"
