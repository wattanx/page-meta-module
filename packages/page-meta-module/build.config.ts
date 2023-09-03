import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: [
    "src/module",
    {
      input: "src/runtime/",
      outDir: "dist/runtime",
      format: "esm",
      declaration: true,
    },
  ],
  externals: [
    "nuxt",
    "@nuxt/schema",
    "estree-walker",
    "unplugin",
    "pathe",
    "pathe/utils",
    "ufo",
    "mlly",
    "magic-string",
    "@jridgewell/sourcemap-codec",
    "acorn",
    "pkg-types",
    "jsonc-parser",
    "knitwork",
    "escape-string-regexp",
    "ohash",
  ],
});
