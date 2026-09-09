import type { Meta, StoryObj } from '@storybook/react-vite'
import { Separator } from './index'

const meta: Meta<typeof Separator> = {
  title: 'Components/Separator',
  component: Separator,
  args: { orientation: 'horizontal', decorative: false },
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    decorative: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof Separator>

export const Horizontal: Story = {
  render: (args) => (
    <div style={{ maxWidth: 320 }}>
      <p style={{ fontSize: 14 }}>Seção acima</p>
      <Separator {...args} style={{ margin: '16px 0' }} />
      <p style={{ fontSize: 14 }}>Seção abaixo</p>
    </div>
  ),
}

export const Vertical: Story = {
  args: { orientation: 'vertical', decorative: true },
  // O vertical precisa de um pai com altura definida — sem isso a linha some.
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 32 }}>
      <span style={{ fontSize: 14 }}>Copiar</span>
      <Separator {...args} />
      <span style={{ fontSize: 14 }}>Colar</span>
      <Separator {...args} />
      <span style={{ fontSize: 14 }}>Recortar</span>
    </div>
  ),
}
