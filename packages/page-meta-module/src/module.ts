import {
  defineNuxtModule,
  addWebpackPlugin,
  addVitePlugin,
  addTemplate,
} from "@nuxt/kit";
import { PageMetaPlugin } from "./page-meta";
import type { PageMetaPluginOptions } from "./page-meta";
import { resolve } from "pathe";

export default defineNuxtModule({
  meta: {
    name: "@wattanx/page-meta",
    configKey: "pageMeta",
    compatibility: {
      bridge: true,
    },
  },
  setup(_, nuxt) {
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
