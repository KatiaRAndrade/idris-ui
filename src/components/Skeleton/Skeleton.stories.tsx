import type { Meta, StoryObj } from '@storybook/react-vite'
import { Skeleton } from './index'

const meta: Meta<typeof Skeleton> = {
  title: 'Components/Skeleton',
  component: Skeleton,
  args: { shape: 'text' },
  argTypes: {
    shape: { control: 'select', options: ['text', 'circle', 'rect'] },
  },
}
export default meta

type Story = StoryObj<typeof Skeleton>

export const Default: Story = {}

export const Formas: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Skeleton shape="text" style={{ width: 120 }} />
      <Skeleton shape="circle" style={{ height: 40 }} />
      <Skeleton shape="rect" style={{ height: 80, width: 120 }} />
    </div>
  ),
}

export const LinhasDeTexto: Story = {
  name: 'Linhas de texto',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 260 }}>
      <Skeleton />
      <Skeleton />
      <Skeleton className="w-3/5" />
    </div>
  ),
}

export const LinhaDeListaComAvatar: Story = {
  name: 'Linha de lista com avatar',
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: 260 }}>
      <Skeleton shape="circle" className="h-10" style={{ width: 40 }} />
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: 6 }}>
        <Skeleton className="w-1/3" />
        <Skeleton className="w-1/2" />
      </div>
    </div>
  ),
}

export const AcompanhaAFonte: Story = {
  name: 'A forma text acompanha a fonte do contexto',
  render: () => (
    <div className="text-2xl" style={{ width: 200 }}>
      <Skeleton />
    </div>
  ),
}
