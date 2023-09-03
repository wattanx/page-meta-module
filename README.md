# Page Meta Module

This module provides the `definePageMeta` macro in Nuxt 2 as well.

> **Warning**
> This library is in active development. Use at your own risk.

> **Warning**
> Requires `nuxt/bridge`.

## Quick Setup

1. Add `@wattanx/page-meta` dependency to your project

```bash
# Using pnpm
pnpm add -D @wattanx/page-meta

# Using yarn
yarn add --dev @wattanx/page-meta

# Using npm
npm install --save-dev @wattanx/page-meta
```

2. Add `@wattanx/page-meta` to the `modules` section of `nuxt.config.ts`

```js
export default defineNuxtConfig({
  modules: ["@wattanx/page-meta"],
});
```

That's it! You can now use My Module in your Nuxt app ✨

## Development

```bash
# Install dependencies
npm install

# Generate type stubs
npm run dev:prepare

# Develop with the playground
npm run dev

# Build the playground
npm run dev:build

# Run ESLint
npm run lint

# Run Vitest
npm run test
npm run test:watch

# Release new version
npm run release
```
