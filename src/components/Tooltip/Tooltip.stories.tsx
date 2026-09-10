import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tooltip } from './index'
import type { TooltipSide } from './Tooltip.context'

const SIDES: TooltipSide[] = ['top', 'right', 'bottom', 'left']

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  args: { side: 'top', align: 'center', size: 'md', delay: 200 },
  argTypes: {
    side: { control: 'select', options: SIDES },
    align: { control: 'select', options: ['start', 'center', 'end'] },
    size: { control: 'select', options: ['sm', 'md'] },
    delay: { control: { type: 'number', min: 0, step: 50 } },
  },
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof Tooltip>

export const Padrao: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <Tooltip.Trigger>
        <button type="button">Passe o mouse</button>
      </Tooltip.Trigger>
      <Tooltip.Content>
        Dica útil aqui
        <Tooltip.Arrow />
      </Tooltip.Content>
    </Tooltip>
  ),
}

export const Lados: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 48 }}>
      {SIDES.map((side) => (
        <Tooltip key={side} {...args} side={side}>
          <Tooltip.Trigger>
            <button type="button">{side}</button>
          </Tooltip.Trigger>
          <Tooltip.Content>
            Lado {side}
            <Tooltip.Arrow />
          </Tooltip.Content>
        </Tooltip>
      ))}
    </div>
  ),
}

export const Tamanhos: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 48 }}>
      <Tooltip {...args} size="sm">
        <Tooltip.Trigger>
          <button type="button">sm</button>
        </Tooltip.Trigger>
        <Tooltip.Content>
          Tooltip pequeno
          <Tooltip.Arrow />
        </Tooltip.Content>
      </Tooltip>
      <Tooltip {...args} size="md">
        <Tooltip.Trigger>
          <button type="button">md</button>
        </Tooltip.Trigger>
        <Tooltip.Content>
          Tooltip médio
          <Tooltip.Arrow />
        </Tooltip.Content>
      </Tooltip>
    </div>
  ),
}

export const SempreAberto: Story = {
  args: { defaultOpen: true, delay: 0 },
  render: (args) => (
    <Tooltip {...args}>
      <Tooltip.Trigger>
        <button type="button">Visível</button>
      </Tooltip.Trigger>
      <Tooltip.Content>
        Aberto por padrão
        <Tooltip.Arrow />
      </Tooltip.Content>
    </Tooltip>
  ),
}

/**
 * Story de validação do `useFloating` — não é só do Tooltip: serve de teste de
 * regressão visual pra todos os componentes flutuantes que vierem depois
 * (Popover, HoverCard, Select…). Cobre o que o jsdom não consegue testar:
 * flip nas quatro bordas da viewport, shift lateral, e um gatilho dentro de
 * um container com scroll. Ver seção 7 de idris-decisao-posicionamento.md.
 */
export const BordasDaViewport: Story = {
  name: 'Validação — bordas da viewport',
  args: { defaultOpen: true, delay: 0 },
  render: (args) => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 24,
        width: '90vw',
        height: '80vh',
        alignItems: 'center',
        justifyItems: 'center',
      }}
    >
      {(['top', 'top', 'top', 'left', 'bottom', 'right', 'bottom', 'bottom', 'bottom'] as const).map(
        (preferredSide, i) => (
          <Tooltip key={i} {...args} side={preferredSide}>
            <Tooltip.Trigger>
              <button type="button">canto {i + 1}</button>
            </Tooltip.Trigger>
            <Tooltip.Content>
              Sempre pedindo &quot;{preferredSide}&quot; — repare o flip nos cantos
              <Tooltip.Arrow />
            </Tooltip.Content>
          </Tooltip>
        )
      )}
    </div>
  ),
}

export const DentroDeContainerComScroll: Story = {
  name: 'Validação — container com scroll',
  args: { defaultOpen: true, delay: 0, side: 'right' },
  render: (args) => (
    <div style={{ width: 240, height: 160, overflow: 'auto', border: '1px solid #444' }}>
      <div style={{ width: 500, height: 400, padding: 24 }}>
        <Tooltip {...args}>
          <Tooltip.Trigger>
            <button type="button">gatilho dentro do scroll</button>
          </Tooltip.Trigger>
          <Tooltip.Content>
            Limite conhecido: só a viewport é considerada fronteira, não o container
            <Tooltip.Arrow />
          </Tooltip.Content>
        </Tooltip>
      </div>
    </div>
  ),
}
