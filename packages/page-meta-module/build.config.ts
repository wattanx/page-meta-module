import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: ["src/module"],
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
