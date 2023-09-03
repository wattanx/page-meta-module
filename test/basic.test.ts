import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Index from "../playground/pages/index.vue";
import PageMeta from "../playground/pages/page-meta.vue";

describe("middleware", async () => {
  it("render", () => {
    const wrapper = mount(Index);
    expect(wrapper.html()).toContain("Nuxt module playground!");
  });

  it("definePageMeta", () => {
    const wrapper = mount(PageMeta);
    expect(wrapper.html()).toContain("PageMeta");
  });
});
