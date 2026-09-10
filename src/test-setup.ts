import '@testing-library/jest-dom'

// jsdom não implementa ResizeObserver. useFloating (e qualquer outro hook que
// observe redimensionamento) precisa dele presente mesmo sem funcionar de verdade —
// os testes não dependem de reposicionamento real, só de o hook não quebrar.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}
