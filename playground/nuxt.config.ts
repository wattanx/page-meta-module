import { defineNuxtConfig } from "@nuxt/bridge";
import pageMeta from "@wattanx/page-meta";

export default defineNuxtConfig({
  modules: [pageMeta],
  ssr: false,
  telemetry: false,
  bridge: {
    vite: false,
    nitro: true,
  },
  build: {
    quiet: true,
  },
});
