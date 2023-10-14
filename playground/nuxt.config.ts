import { defineNuxtConfig } from "@nuxt/bridge";

export default defineNuxtConfig({
  modules: ["@wattanx/page-meta"],
  ssr: false,
  telemetry: false,
  bridge: {
    vite: !process.env.TEST_WITH_WEBPACK,
    nitro: true,
  },
  build: {
    quiet: true,
  },
});
