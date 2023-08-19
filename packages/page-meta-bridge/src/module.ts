import {
  defineNuxtModule,
  addWebpackPlugin,
  addVitePlugin,
  addTemplate,
} from "@nuxt/kit";
import { resolve } from "pathe";
import { PageMetaPlugin } from "./page-meta";
import type { PageMetaPluginOptions } from "./page-meta";
import { normalizeRoutes, resolvePagesRoutes } from "./utils";

export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "page-meta-bridge",
    compatibility: {
      bridge: true,
    },
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  setup(options, nuxt) {
    const pageMetaOptions: PageMetaPluginOptions = {
      dev: nuxt.options.dev,
      // TODO
      sourcemap: true,
      dirs: nuxt.options._layers.map((layer) =>
        resolve(layer.config.srcDir, layer.config.dir?.pages || "pages")
      ),
    };
    nuxt.hook("modules:done", () => {
      addVitePlugin(PageMetaPlugin.vite(pageMetaOptions));
      addWebpackPlugin(PageMetaPlugin.webpack(pageMetaOptions));
    });

    // Add routes template
    addTemplate({
      filename: "routes.mjs",
      async getContents() {
        const pages = await resolvePagesRoutes();
        await nuxt.callHook("pages:extend", pages);
        const { routes, imports } = normalizeRoutes(pages);
        return [...imports, `export default ${routes}`].join("\n");
      },
    });

    addTemplate({
      filename: "types/define-page-meta.d.ts",
      getContents: () =>
        `export interface PageMeta {
  middleware?: string | string[];
}
declare global {
  const definePageMeta: (meta: PageMeta) => void;
}
`,
    });

    nuxt.hook("prepare:types", ({ references }) => {
      references.push({
        path: resolve(nuxt.options.buildDir, "types/define-page-meta.d.ts"),
      });
    });
  },
});
