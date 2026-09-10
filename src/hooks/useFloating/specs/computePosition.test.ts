import { describe, expect, it } from 'vitest'
import { computePosition, type Rect } from '../computePosition'

const viewport = { width: 1000, height: 800 }
const floating: Rect = { x: 0, y: 0, width: 200, height: 100 }

/** Gatilho de 50×20 centralizado, por padrão. */
const anchorAt = (x: number, y: number): Rect => ({ x, y, width: 50, height: 20 })

describe('computePosition — posicionamento base', () => {
  it('posiciona abaixo e centralizado por padrão', () => {
    const r = computePosition({ anchor: anchorAt(475, 400), floating, viewport })

    expect(r.side).toBe('bottom')
    expect(r.y).toBe(428) // 400 + 20 + 8 de offset
    expect(r.x).toBe(400) // centro do gatilho (500) − metade do flutuante (100)
  })

  it('align start encosta o flutuante no início do gatilho', () => {
    const r = computePosition({ anchor: anchorAt(475, 400), floating, viewport, align: 'start' })
    expect(r.x).toBe(475)
  })

  it('align end encosta o flutuante no fim do gatilho', () => {
    const r = computePosition({ anchor: anchorAt(475, 400), floating, viewport, align: 'end' })
    expect(r.x).toBe(325) // 475 + 50 − 200
  })

  it('posiciona à direita quando side é right', () => {
    const r = computePosition({ anchor: anchorAt(400, 400), floating, viewport, side: 'right' })
    expect(r.x).toBe(458) // 400 + 50 + 8
    expect(r.y).toBe(360) // centro vertical
  })
})

describe('computePosition — flip', () => {
  it('vira pra cima quando não cabe embaixo', () => {
    const r = computePosition({ anchor: anchorAt(475, 750), floating, viewport })

    expect(r.side).toBe('top')
    expect(r.y).toBe(642) // 750 − 100 − 8
  })

  it('não vira quando cabe', () => {
    const r = computePosition({ anchor: anchorAt(475, 100), floating, viewport })
    expect(r.side).toBe('bottom')
  })

  it('não vira quando o lado oposto estoura mais', () => {
    // Flutuante mais alto que a viewport: estoura dos dois lados.
    // Deve ficar onde estava em vez de alternar. anchor.y=300 (não 400: com
    // a altura do anchor de 20px, y=400 deixa MENOS espaço abaixo que acima,
    // o que faria o lado oposto estourar menos e o flip seria correto ali).
    const gigante: Rect = { x: 0, y: 0, width: 200, height: 900 }
    const r = computePosition({ anchor: anchorAt(475, 300), floating: gigante, viewport })

    expect(r.side).toBe('bottom')
  })

  it('respeita flip: false', () => {
    const r = computePosition({ anchor: anchorAt(475, 750), floating, viewport, flip: false })
    expect(r.side).toBe('bottom')
  })
})

describe('computePosition — shift', () => {
  it('desliza pra dentro quando estoura à direita', () => {
    const r = computePosition({ anchor: anchorAt(960, 400), floating, viewport })

    // Centralizado daria x = 785, o que colocaria a borda em 985 (> 1000 − 8)
    expect(r.x).toBe(792) // 1000 − 8 de padding − 200 de largura
  })

  it('desliza pra dentro quando estoura à esquerda', () => {
    const r = computePosition({ anchor: anchorAt(0, 400), floating, viewport })
    expect(r.x).toBe(8) // encosta no padding
  })

  it('respeita shift: false', () => {
    const r = computePosition({ anchor: anchorAt(960, 400), floating, viewport, shift: false })
    expect(r.x).toBe(885) // centralizado, estourando de propósito
  })
})

describe('computePosition — seta', () => {
  const arrow = { size: 8, padding: 8 }

  it('centraliza a seta no gatilho', () => {
    const r = computePosition({ anchor: anchorAt(475, 400), floating, viewport, arrow })
    expect(r.arrow?.x).toBe(96) // centro do gatilho (500) − x (400) − metade da seta (4)
  })

  it('prende a seta dentro do flutuante depois do shift', () => {
    const r = computePosition({ anchor: anchorAt(0, 400), floating, viewport, arrow })

    // O gatilho é estreito e está na borda: sem clamp, a seta ficaria antes do canto
    expect(r.arrow!.x).toBeGreaterThanOrEqual(8)
    expect(r.arrow!.x).toBeLessThanOrEqual(184) // 200 − 8 − 8
  })

  it('usa o eixo vertical quando o lado é lateral', () => {
    const r = computePosition({ anchor: anchorAt(400, 400), floating, viewport, side: 'right', arrow })

    expect(r.arrow?.y).toBeDefined()
    expect(r.arrow?.x).toBeUndefined()
  })
})

describe('computePosition — constrainSize', () => {
  it('devolve o espaço disponível abaixo do gatilho', () => {
    const r = computePosition({
      anchor: anchorAt(475, 400),
      floating,
      viewport,
      constrainSize: true,
    })

    expect(r.available?.height).toBe(364) // 800 − 420 − 8 de offset − 8 de padding
  })

  it('nunca devolve espaço negativo', () => {
    const r = computePosition({
      anchor: anchorAt(475, 795),
      floating,
      viewport,
      flip: false,
      constrainSize: true,
    })

    expect(r.available?.height).toBe(0)
  })
})
