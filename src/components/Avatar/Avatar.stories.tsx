import type { Meta, StoryObj } from '@storybook/react-vite'
import { Avatar } from './index'

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  args: { size: 'md' },
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
  },
}
export default meta

type Story = StoryObj<typeof Avatar>

export const ComFoto: Story = {
  name: 'Caso comum',
  render: (args) => (
    <Avatar {...args}>
      <Avatar.Image src="https://i.pravatar.cc/128?img=5" alt="Katia" />
      <Avatar.Fallback>KA</Avatar.Fallback>
    </Avatar>
  ),
}

export const SemFoto: Story = {
  name: 'Sem foto — fallback imediato',
  args: { size: 'lg' },
  render: (args) => (
    <Avatar {...args}>
      <Avatar.Fallback>KA</Avatar.Fallback>
    </Avatar>
  ),
}

export const ImagemQuebrada: Story = {
  name: 'Imagem quebrada — cai no fallback',
  render: (args) => (
    <Avatar {...args}>
      <Avatar.Image src="https://exemplo-invalido.test/quebrada.jpg" alt="Ka" />
      <Avatar.Fallback>KA</Avatar.Fallback>
    </Avatar>
  ),
}

export const Tamanhos: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Avatar key={size} size={size}>
          <Avatar.Fallback>KA</Avatar.Fallback>
        </Avatar>
      ))}
    </div>
  ),
}

export const ListaCompacta: Story = {
  name: 'Numa lista compacta',
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Avatar size="xs">
        <Avatar.Image src="https://i.pravatar.cc/64?img=12" alt="" />
        <Avatar.Fallback aria-hidden>AL</Avatar.Fallback>
      </Avatar>
      <span style={{ fontSize: 14 }}>Autor do comentário</span>
    </div>
  ),
}

export const GrupoSobreposto: Story = {
  name: 'Grupo sobreposto',
  render: () => (
    <div style={{ display: 'flex' }}>
      {[1, 2, 3, 4].map((n) => (
        <Avatar
          key={n}
          size="sm"
          className="ring-2 ring-background"
          style={{ marginLeft: n === 1 ? 0 : -8 }}
        >
          <Avatar.Image src={`https://i.pravatar.cc/64?img=${n * 7}`} alt="" />
          <Avatar.Fallback aria-hidden>{n}</Avatar.Fallback>
        </Avatar>
      ))}
    </div>
  ),
}

export const DelayZero: Story = {
  name: 'Delay zero — rede lenta',
  render: (args) => (
    <Avatar {...args}>
      <Avatar.Image src="https://i.pravatar.cc/128?img=9" alt="Ka" />
      <Avatar.Fallback delayMs={0}>KA</Avatar.Fallback>
    </Avatar>
  ),
}
