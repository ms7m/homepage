import type { APIRoute } from "astro";
import type { CratediggerEnv, AlbumRecord } from "@mikka/cloudflare-utils";
import { putAlbum, prependToIndex } from "@mikka/cloudflare-utils";
import { putAlbumArt, getAlbumArtUrl } from "@mikka/cloudflare-utils";
import {
  detectSource,
  fetchSpotifyMeta,
  fetchSoundCloudMeta,
  fetchAlbumArt,
} from "../../lib/metadata";

function timingSafeEqual(a: string | null, b: string): boolean {
  if (!a) return false;
  const aBytes = new TextEncoder().encode(a.padEnd(b.length, "\0"));
  const bBytes = new TextEncoder().encode(b.padEnd(a.length, "\0"));
  if (aBytes.length !== bBytes.length) return false;
  let diff = 0;
  for (let i = 0; i < aBytes.length; i++) {
    diff |= aBytes[i] ^ bBytes[i];
  }
  return diff === 0;
}

export const POST: APIRoute = async ({ request, locals }) => {
  const runtime = (locals as { runtime: { env: CratediggerEnv } }).runtime;
  const env = runtime.env;

  // Validate shared secret
  const secret = request.headers.get("X-Webhook-Secret");
  if (!timingSafeEqual(secret, env.WEBHOOK_SECRET)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!body.url || typeof body.url !== "string") {
    return new Response(JSON.stringify({ error: "url is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const source = detectSource(body.url);

    let artImageUrl: string;
    let meta: Awaited<ReturnType<typeof fetchSoundCloudMeta>>;

    if (source === "spotify") {
      const spotifyMeta = await fetchSpotifyMeta(body.url, env);
      const { imageUrl, ...rest } = spotifyMeta;
      meta = rest;
      artImageUrl = imageUrl;
    } else {
      const oembedRes = await fetch(
        `https://soundcloud.com/oembed?url=${encodeURIComponent(body.url)}&format=json`
      );
      const oembed = (await oembedRes.json()) as { thumbnail_url?: string };
      artImageUrl = oembed.thumbnail_url ?? "";
      meta = await fetchSoundCloudMeta(body.url, env);
    }

    let artKey = "";
    let artUrl = artImageUrl; // fallback to direct URL

    if (artImageUrl) {
      const { buffer, contentType } = await fetchAlbumArt(artImageUrl);
      artKey = await putAlbumArt(env, meta.id, buffer, contentType);
      const r2PublicUrl = (env as unknown as { R2_PUBLIC_URL?: string }).R2_PUBLIC_URL;
      if (r2PublicUrl) {
        artUrl = await getAlbumArtUrl(r2PublicUrl, artKey);
      }
    }

    const record: AlbumRecord = { ...meta, artKey, artUrl };

    await Promise.all([
      putAlbum(env, record),
      prependToIndex(env, record.id),
    ]);

    return new Response(JSON.stringify({ id: record.id, ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
