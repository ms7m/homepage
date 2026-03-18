import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import { remarkAiDiff } from "./src/plugins/remark-ai-diff.mjs";
import { remarkContextTooltip } from "./src/plugins/remark-context-tooltip.mjs";

export default defineConfig({
  output: "static",
  integrations: [
    vue(),
    tailwind({ configFile: "./tailwind.config.ts" }),
    mdx(),
  ],
  markdown: {
    remarkPlugins: [remarkAiDiff, remarkContextTooltip],
    shikiConfig: {
      theme: "css-variables",
    },
  },
  site: "https://blog.mikka.link",
});
