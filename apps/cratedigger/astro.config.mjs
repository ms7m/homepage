import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";
import tailwind from "@astrojs/tailwind";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  output: "server",
  adapter: cloudflare({
    platformProxy: { enabled: true },
  }),
  integrations: [
    vue(),
    tailwind({ configFile: "./tailwind.config.ts" }),
  ],
  site: "https://cratedigger.mikka.link",
});
