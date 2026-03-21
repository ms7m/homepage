import type { Env } from "../index";
import type { RecordType } from "@mikka/cloudflare-utils";
import { getAlbumsPage } from "@mikka/cloudflare-utils";

const VALID_TYPES = new Set<RecordType>(["track", "set", "album"]);

export async function handleAlbums(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const page = Math.max(0, parseInt(url.searchParams.get("page") ?? "0", 10));
  const limit = Math.min(48, Math.max(1, parseInt(url.searchParams.get("limit") ?? "24", 10)));
  const typeParam = url.searchParams.get("type");
  const type = typeParam && VALID_TYPES.has(typeParam as RecordType) ? (typeParam as RecordType) : undefined;

  const result = await getAlbumsPage(env, page, limit, type);
  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" },
  });
}
