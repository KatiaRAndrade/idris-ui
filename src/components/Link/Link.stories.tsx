import type { Meta, StoryObj } from '@storybook/react-vite'
import { Link } from './index'

const meta: Meta<typeof Link> = {
  title: 'Components/Link',
  component: Link,
  args: { children: 'Ver documentação', href: '/docs', external: false },
  argTypes: {
    external: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof Link>

export const Default: Story = {}

export const External: Story = {
  args: {
    children: 'Ver no GitHub',
    href: 'https://github.com',
    external: true,
  },
}

export const DentroDeParagrafo: Story = {
  name: 'Dentro de um parágrafo',
  render: () => (
    <p style={{ maxWidth: 320, fontSize: 14, lineHeight: 1.6 }}>
      Leia mais em <Link href="/docs">nossa documentação</Link> antes de configurar o projeto, ou
      abra as <Link external href="https://github.com">notas de versão</Link> no GitHub.
    </p>
  ),
}

export const TargetRelExplicitos: Story = {
  name: 'target/rel explícitos vencem os automáticos',
  args: {
    children: 'Abrir na mesma aba',
    href: '/preview',
    external: true,
    target: '_self',
    rel: 'bookmark',
  },
}
