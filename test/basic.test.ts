import { describe, it, expect } from "vitest";
import { fileURLToPath } from "node:url";
import { $fetch, setup } from "@nuxt/test-utils";

await setup({
  rootDir: fileURLToPath(new URL("../playground", import.meta.url)),
  server: true,
  nuxtConfig: {
    ssr: true,
  },
});

describe("middleware", async () => {
  it("redirect to index", async () => {
    // Get response to a server-rendered page with `$fetch`.
    const html = await $fetch("/page-meta");
    expect(html).toContain("<div>Nuxt module playground!</div>");
  });
});
