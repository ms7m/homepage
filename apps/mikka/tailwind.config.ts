import type { Config } from "tailwindcss";
import baseConfig from "@mikka/tailwind-config";

export default {
  ...baseConfig,
  content: [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
    "../../packages/ui/src/**/*.{vue,ts}",
  ],
} satisfies Config;
