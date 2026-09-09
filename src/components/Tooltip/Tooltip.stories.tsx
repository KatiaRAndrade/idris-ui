import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tooltip } from './index'
import type { TooltipSide } from './Tooltip.context'

const SIDES: TooltipSide[] = ['top', 'right', 'bottom', 'left']

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  args: { side: 'top', size: 'md', delay: 200 },
  argTypes: {
    side: { control: 'select', options: SIDES },
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
      <Tooltip.Content>Dica útil aqui</Tooltip.Content>
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
          <Tooltip.Content>Lado {side}</Tooltip.Content>
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
        <Tooltip.Content>Tooltip pequeno</Tooltip.Content>
      </Tooltip>
      <Tooltip {...args} size="md">
        <Tooltip.Trigger>
          <button type="button">md</button>
        </Tooltip.Trigger>
        <Tooltip.Content>Tooltip médio</Tooltip.Content>
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
      <Tooltip.Content>Aberto por padrão</Tooltip.Content>
    </Tooltip>
  ),
}
