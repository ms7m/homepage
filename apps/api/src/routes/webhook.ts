import type { Env } from "../index";
import type { AlbumRecord } from "@mikka/cloudflare-utils";
import { putAlbum, putAlbumArt, getAlbumArtUrl } from "@mikka/cloudflare-utils";
import { detectSource, fetchSpotifyMeta, fetchSoundCloudMeta, fetchAlbumArt } from "../lib/metadata";

function timingSafeEqual(a: string | null, b: string): boolean {
  if (!a) return false;
  const aBytes = new TextEncoder().encode(a.padEnd(b.length, "\0"));
  const bBytes = new TextEncoder().encode(b.padEnd(a.length, "\0"));
  if (aBytes.length !== bBytes.length) return false;
  let diff = 0;
  for (let i = 0; i < aBytes.length; i++) {
    diff |= aBytes[i]! ^ bBytes[i]!;
  }
  return diff === 0;
}

export async function handleWebhook(request: Request, env: Env): Promise<Response> {
  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    });

  const secret = request.headers.get("X-Webhook-Secret");
  if (!timingSafeEqual(secret, env.WEBHOOK_SECRET)) {
    return json({ error: "Unauthorized" }, 401);
  }

  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  if (!body.url || typeof body.url !== "string") {
    return json({ error: "url is required" }, 400);
  }

  // Extract URL from text in case the client sends something like
  // "Check out X on Spotify: https://open.spotify.com/track/abc?si=xyz"
  const urlMatch = body.url.match(/https?:\/\/\S+/);
  const rawUrl = urlMatch ? urlMatch[0] : body.url;

  try {
    const source = detectSource(rawUrl);

    let artImageUrl: string;
    let meta: Awaited<ReturnType<typeof fetchSoundCloudMeta>>;

    if (source === "spotify") {
      const spotifyMeta = await fetchSpotifyMeta(rawUrl, env);
      const { imageUrl, ...rest } = spotifyMeta;
      meta = rest;
      artImageUrl = imageUrl;
    } else {
      const oembedRes = await fetch(
        `https://soundcloud.com/oembed?url=${encodeURIComponent(rawUrl)}&format=json`
      );
      const oembed = (await oembedRes.json()) as { thumbnail_url?: string };
      artImageUrl = oembed.thumbnail_url ?? "";
      meta = await fetchSoundCloudMeta(rawUrl, env.SOUNDCLOUD_CLIENT_ID);
    }

    let artKey = "";
    let artUrl = artImageUrl;

    if (artImageUrl) {
      const { buffer, contentType } = await fetchAlbumArt(artImageUrl);
      artKey = await putAlbumArt(env, meta.id, buffer, contentType);
      if (env.R2_PUBLIC_URL) {
        artUrl = await getAlbumArtUrl(env.R2_PUBLIC_URL, artKey);
      }
    }

    const record: AlbumRecord = { ...meta, artKey, artUrl };
    await putAlbum(env, record);

    return json({ id: record.id, ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return json({ error: "Internal server error" }, 500);
  }
}
