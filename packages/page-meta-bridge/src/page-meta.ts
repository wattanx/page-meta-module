import { pathToFileURL } from "node:url";
import { createUnplugin } from "unplugin";
import { parseQuery, parseURL } from "ufo";
import type { StaticImport } from "mlly";
import { findExports, findStaticImports, parseStaticImport } from "mlly";
import type {
  CallExpression,
  Expression,
  Identifier,
  ObjectExpression,
  Property,
} from "estree";
import type { Node } from "estree-walker";
import { walk } from "estree-walker";
import MagicString from "magic-string";
import { isAbsolute, normalize } from "pathe";

export interface PageMetaPluginOptions {
  dirs: Array<string | RegExp>;
  dev?: boolean;
  sourcemap?: boolean;
}

const NODE_MODULES_RE = /[\\/]node_modules[\\/]/;
const HAS_MACRO_RE = /\bdefinePageMeta\s*\(\s*/;

const CODE_EMPTY = `
const  __default__ = null
export default __nuxt_page_meta
`;

const CODE_HMR = `
// Vite
if (import.meta.hot) {
  import.meta.hot.accept(mod => {
    Object.assign(__nuxt_page_meta, mod)
  })
}
// webpack
if (import.meta.webpackHot) {
  import.meta.webpackHot.accept((err) => {
    if (err) { window.location = window.location.href }
  })
}`;

export const PageMetaPlugin = createUnplugin(
  (options: PageMetaPluginOptions) => {
    return {
      name: "nuxt:pages-macros-transform",
      enforce: "post",
      transformInclude(id) {
        const { pathname, search } = parseURL(
          decodeURIComponent(pathToFileURL(id).href)
        );
        const { type, macro, setup } = parseQuery(search);

        // vue files
        if (
          pathname.endsWith(".vue") &&
          (type === "template" ||
            type === "script" ||
            setup === "true" ||
            macro ||
            !search)
        ) {
          return true;
        }
      },
      transform(code, id) {
        id = normalize(id);
        const isNodeModule = NODE_MODULES_RE.test(id);

        if (isNodeModule) {
          return;
        }
        const query = parseMacroQuery(id);
        if (query.type && query.type !== "script") {
          return;
        }

        const s = new MagicString(code);
        function result() {
          if (s.hasChanged()) {
            return {
              code: s.toString(),
              map: options.sourcemap
                ? s.generateMap({ hires: true })
                : undefined,
            };
          }
        }

        const hasMacro = HAS_MACRO_RE.test(code);

        const imports = findStaticImports(code);

        if (!hasMacro) {
          return;
        }

        const importMap = new Map<string, StaticImport>();

        for (const i of imports) {
          const parsed = parseStaticImport(i);
          for (const name of [
            parsed.defaultImport,
            ...Object.values(parsed.namedImports || {}),
            parsed.namespacedImport,
          ].filter(Boolean) as string[]) {
            importMap.set(name, i);
          }
        }

        walk(
          this.parse(code, {
            sourceType: "module",
            ecmaVersion: "latest",
          }) as Node,
          {
            enter(_node) {
              if (_node.type !== "ExportDefaultDeclaration") {
                return;
              }
              const callexprettison = _node.declaration;
              if (
                callexprettison.type !== "CallExpression" ||
                (callexprettison as CallExpression).callee.type !== "Identifier"
              ) {
                return;
              }
              const node = callexprettison as CallExpression & {
                start: number;
                end: number;
              };
              const name = "name" in node.callee && node.callee.name;

              if (!name.includes("defineComponent")) {
                return;
              }

              const arg = node.arguments[0] as ObjectExpression & {
                start: number;
                end: number;
              };

              const properties = arg.properties as (Property & {
                start: number;
                end: number;
              })[];

              const setupNode = properties.find(
                (node) =>
                  node.key.type === "Identifier" && node.key.name === "setup"
              );

              let options;
              let contents;
              walk(setupNode, {
                enter(_node) {
                  if (
                    _node.type !== "CallExpression" ||
                    (_node as CallExpression).callee.type !== "Identifier"
                  ) {
                    return;
                  }
                  const node = _node as CallExpression & {
                    start: number;
                    end: number;
                  };
                  const name = "name" in node.callee && node.callee.name;

                  if (name !== "definePageMeta") {
                    return;
                  }

                  const meta = node.arguments[0] as ObjectExpression & {
                    start: number;
                    end: number;
                  };

                  s.overwrite(node.start, node.end, "");

                  options = [
                    ...meta.properties.map((p) => code.slice(p.start, p.end)),
                  ].join(",");
                },
              });

              if (code.includes("__nuxt_page_meta")) {
                return;
              }

              s.prependLeft(properties[0].start, `${options},`);
            },
          }
        );

        console.log(s.toString());

        // if (!s.hasChanged() && !code.includes("__default__")) {
        //   s.overwrite(
        //     0,
        //     code.length,
        //     CODE_EMPTY + (options.dev ? CODE_HMR : "")
        //   );
        // }

        return result();
      },
      vite: {
        handleHotUpdate: {
          order: "pre",
          handler: ({ modules }) => {
            // Remove macro file from modules list to prevent HMR overrides
            const index = modules.findIndex((i) =>
              i.id?.includes("?macro=true")
            );
            if (index !== -1) {
              modules.splice(index, 1);
            }
          },
        },
      },
    };
  }
);

// https://github.com/vuejs/vue-loader/pull/1911
// https://github.com/vitejs/vite/issues/8473
function rewriteQuery(id: string) {
  return id.replace(
    /\?.+$/,
    (r) => "?macro=true&" + r.replace(/^\?/, "").replace(/&macro=true/, "")
  );
}

function parseMacroQuery(id: string) {
  const { search } = parseURL(
    decodeURIComponent(isAbsolute(id) ? pathToFileURL(id).href : id).replace(
      /\?macro=true$/,
      ""
    )
  );
  const query = parseQuery(search);
  if (id.includes("?macro=true")) {
    return { macro: "true", ...query };
  }
  return query;
}
