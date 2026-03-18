import type { APIRoute } from "astro";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { marked } from "marked";

export const GET: APIRoute = async () => {
  const filePath = join(process.cwd(), "src/about.md");
  const raw = await readFile(filePath, "utf-8");
  const html = await marked(raw);

  return new Response(JSON.stringify({ html }), {
    headers: { "Content-Type": "application/json" },
  });
};
