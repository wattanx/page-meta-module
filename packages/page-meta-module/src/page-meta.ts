import { pathToFileURL } from "node:url";
import { createUnplugin } from "unplugin";
import { parseQuery, parseURL } from "ufo";
import type {
  CallExpression,
  ExportDefaultDeclaration,
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

        if (!hasMacro) {
          return;
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

              const defaultDeclaration = _node as ExportDefaultDeclaration & {
                start: number;
                end: number;
              };

              const callexprettison = defaultDeclaration.declaration;
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

              const properties = (node.arguments[0] as ObjectExpression)
                .properties as (Property & {
                start: number;
                end: number;
              })[];

              const setupNode = properties.find(
                (node) =>
                  node.key.type === "Identifier" && node.key.name === "setup"
              );

              if (!setupNode) {
                return;
              }

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

                  contents = `const __nuxt_page_meta = 
                    ${code.slice(meta.start, meta.end) || {}}
                  `;

                  // remove macro
                  s.overwrite(node.start, node.end, "");
                },
              });

              s.prependLeft(defaultDeclaration.start, contents);

              if (code.includes("__nuxt_page_meta")) {
                return;
              }

              s.prependLeft(properties[0].start, `...__nuxt_page_meta,`);
            },
          }
        );

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