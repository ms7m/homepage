import { createHash } from "node:crypto";
import type { AlbumRecord } from "@mikka/cloudflare-utils";

interface SpotifyEnv {
  SPOTIFY_CLIENT_ID: string;
  SPOTIFY_CLIENT_SECRET: string;
}

export function generateId(url: string): string {
  return createHash("sha256").update(url).digest("hex").slice(0, 12);
}

export function detectSource(url: string): "spotify" | "soundcloud" {
  if (url.includes("spotify.com") || url.startsWith("spotify:")) {
    return "spotify";
  }
  return "soundcloud";
}

export async function fetchSpotifyMeta(
  url: string,
  env: SpotifyEnv
): Promise<Omit<AlbumRecord, "artKey" | "artUrl"> & { imageUrl: string }> {
  const trackIdMatch = url.match(/track\/([a-zA-Z0-9]+)/);
  if (!trackIdMatch) throw new Error("Invalid Spotify track URL");
  const trackId = trackIdMatch[1];

  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`)}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!tokenRes.ok) throw new Error("Failed to get Spotify token");
  const { access_token } = (await tokenRes.json()) as { access_token: string };

  const trackRes = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!trackRes.ok) throw new Error("Failed to fetch Spotify track");
  const track = (await trackRes.json()) as {
    name: string;
    artists: { name: string }[];
    album: { name: string; images: { url: string }[] };
  };

  return {
    id: generateId(url),
    url,
    source: "spotify",
    title: track.name,
    artist: track.artists.map((a) => a.name).join(", "),
    album: track.album.name,
    addedAt: new Date().toISOString(),
    imageUrl: track.album.images[0]?.url ?? "",
  };
}

export async function fetchSoundCloudMeta(
  url: string
): Promise<Omit<AlbumRecord, "artKey" | "artUrl">> {
  const oembedUrl = `https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  const res = await fetch(oembedUrl);

  if (!res.ok) throw new Error("Failed to fetch SoundCloud oembed");
  const data = (await res.json()) as {
    title: string;
    author_name: string;
  };

  const [title, ...rest] = data.title.split(" - ");

  return {
    id: generateId(url),
    url,
    source: "soundcloud",
    title: rest.length > 0 ? rest.join(" - ") : title,
    artist: data.author_name,
    album: "",
    addedAt: new Date().toISOString(),
  };
}

export async function fetchAlbumArt(
  artUrl: string
): Promise<{ buffer: ArrayBuffer; contentType: string }> {
  const res = await fetch(artUrl);
  if (!res.ok) throw new Error("Failed to fetch album art");
  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  const buffer = await res.arrayBuffer();
  return { buffer, contentType };
}
