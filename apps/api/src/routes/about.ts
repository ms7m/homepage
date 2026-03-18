import { marked } from "marked";
import aboutContent from "../about.md";

let cachedHtml: string | null = null;

export async function handleAbout(): Promise<Response> {
  if (!cachedHtml) {
    cachedHtml = await marked.parse(aboutContent);
  }
  return new Response(JSON.stringify({ html: cachedHtml }), {
    headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=3600" },
  });
}
