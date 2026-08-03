# Idris — Comandos

Referência rápida dos comandos do dia a dia. Rode tudo a partir da raiz do projeto.

## Setup

```bash
npm install
```

## Storybook (visualizar componentes)

```bash
npm run dev
```

Abre em [http://localhost:6006](http://localhost:6006).

## Testes

```bash
# Testes de componente (jsdom + testing-library)
npm run test

# Mesmo teste, em modo watch
npm run test:watch

# Testes de stories do Storybook (browser real via Playwright)
npm run test:storybook
```

## Build

```bash
# Builda a lib (gera dist/ — .es.js, .cjs.js, .d.ts, .css)
npm run build

# Builda o Storybook estático (gera storybook-static/)
npm run build-storybook
```

## Versionamento e publicação (Changesets)

```bash
# Depois de uma mudança relevante: descreve a mudança e o tipo (patch/minor/major)
npm run changeset

# Builda e publica no npm (requer npm login antes)
npm run release
```

## Componente novo

Sem script dedicado — copie a pasta de um componente existente (ex. `src/components/Button/`) como template: mesmo padrão de arquivos (`Componente.tsx`, `index.ts`, `.stories.tsx`, `.test.tsx`), mesmo uso de `tv()`, e exporte no `src/index.ts`.
