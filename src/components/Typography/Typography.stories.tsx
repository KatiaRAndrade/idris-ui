import type { Meta, StoryObj } from '@storybook/react-vite'
import { Heading, type HeadingSize } from './Heading'
import { Text, type TextSize } from './Text'

const HEADING_SIZES: HeadingSize[] = ['display', 'h1', 'h2', 'h3', 'h4']
const TEXT_SIZES: TextSize[] = ['body-lg', 'body', 'body-sm', 'label', 'caption']

const meta: Meta = {
  title: 'Components/Typography',
}
export default meta

type Story = StoryObj

export const Headings: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {HEADING_SIZES.map((size) => (
        <Heading key={size} size={size}>
          {size} — Fraunces
        </Heading>
      ))}
    </div>
  ),
}

export const Texts: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {TEXT_SIZES.map((size) => (
        <Text key={size} size={size}>
          {size} — Inter, o texto padrão do corpo
        </Text>
      ))}
    </div>
  ),
}

export const Cores: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Text color="primary">Texto primário</Text>
      <Text color="secondary">Texto secundário</Text>
    </div>
  ),
}

export const SizeVsTag: Story = {
  name: 'Size visual x tag semântica',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Heading size="h3" as="h2">
        Visualmente um h3, mas é o &lt;h2&gt; real da página
      </Heading>
      <Text as="label" size="label" htmlFor="email">
        E-mail (renderizado como &lt;label&gt;)
      </Text>
    </div>
  ),
}

export const Truncate: Story = {
  render: () => (
    <Text truncate style={{ maxWidth: 220 }}>
      Um texto bem comprido que deveria cortar com reticências no fim da linha
    </Text>
  ),
}
