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
  it("redirect to redirected", async () => {
    // Get response to a server-rendered page with `$fetch`.
    const html = await $fetch("/page-meta");
    expect(html).toContain("<div>redirected !</div>");
  });

  it("redirect to redirected", async () => {
    // Get response to a server-rendered page with `$fetch`.
    const html = await $fetch("/js/with-middleware");
    expect(html).toContain("<div>redirected !</div>");
  });
});

describe("layout", () => {
  it("should render layout", async () => {
    const html = await $fetch("/");
    expect(html).toContain("<header>test layout</header>");
  });

  it("should render layout", async () => {
    const html = await $fetch("/js/with-layout");
    expect(html).toContain("<header>test layout</header>");
  });
});
