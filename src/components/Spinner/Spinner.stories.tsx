import type { Meta, StoryObj } from '@storybook/react-vite'
import { Spinner } from './index'

const meta: Meta<typeof Spinner> = {
  title: 'Components/Spinner',
  component: Spinner,
  args: { size: 'md' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
    label: { control: 'text' },
  },
}
export default meta

type Story = StoryObj<typeof Spinner>

export const Default: Story = {}

export const Tamanhos: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
      <Spinner size="xl" />
    </div>
  ),
}

export const ComLabel: Story = {
  name: 'Com label (região viva)',
  args: { label: 'Carregando pedidos' },
}

export const HerdandoCor: Story = {
  name: 'Herdando a cor do contexto',
  render: () => (
    <div style={{ display: 'flex', gap: 24 }}>
      <div className="text-text-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Spinner />
        <span>text-primary</span>
      </div>
      <div className="text-text-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Spinner />
        <span>text-secondary</span>
      </div>
    </div>
  ),
}

export const CarregandoSecao: Story = {
  name: 'Sozinho, carregando uma seção',
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <Spinner size="xl" label="Carregando pedidos" />
    </div>
  ),
}
