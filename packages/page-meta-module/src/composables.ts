export interface PageMeta {
  middleware?: string | string[];
}

const warnRuntimeUsage = (method: string) =>
  console.warn(
    `${method}() is a compiler-hint helper that is only usable inside ` +
      "the script block of a single file component which is also a page. Its arguments should be " +
      "compiled away and passing it at runtime has no effect."
  );

export const definePageMeta = (meta: PageMeta): void => {
  // @ts-ignore
  if (process.dev) {
    warnRuntimeUsage("definePageMeta");
  }
};
