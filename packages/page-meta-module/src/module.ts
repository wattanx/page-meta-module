import { defineNuxtModule, addWebpackPlugin, addVitePlugin } from "@nuxt/kit";
import { PageMetaPlugin } from "./page-meta";
import type { PageMetaPluginOptions } from "./page-meta";
import { resolve } from "pathe";
import { distDir } from "./dirs";

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

    const runtimeDir = resolve(distDir, "runtime");

    nuxt.hook("imports:extend", (imports) => {
      imports.push({
        name: "definePageMeta",
        as: "definePageMeta",
        from: resolve(runtimeDir, "composables"),
      });
    });
  },
});
