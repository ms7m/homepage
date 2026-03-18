import type { Env } from "../index";
import { getAlbumsPage } from "@mikka/cloudflare-utils";

export async function handleAlbums(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const page = Math.max(0, parseInt(url.searchParams.get("page") ?? "0", 10));
  const limit = Math.min(48, Math.max(1, parseInt(url.searchParams.get("limit") ?? "24", 10)));

  const result = await getAlbumsPage(env, page, limit);
  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" },
  });
}
