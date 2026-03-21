import { createHash } from "node:crypto";
import type { AlbumRecord, RecordType } from "@mikka/cloudflare-utils";

interface SpotifyEnv {
  SPOTIFY_CLIENT_ID: string;
  SPOTIFY_CLIENT_SECRET: string;
}

const SET_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes

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

  if (url.includes("/album/")) {
    const albumIdMatch = url.match(/album\/([a-zA-Z0-9]+)/);
    if (!albumIdMatch) throw new Error("Invalid Spotify album URL");

    const albumRes = await fetch(`https://api.spotify.com/v1/albums/${albumIdMatch[1]}`, {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (!albumRes.ok) throw new Error("Failed to fetch Spotify album");
    const album = (await albumRes.json()) as {
      name: string;
      artists: { name: string }[];
      images: { url: string }[];
    };

    return {
      id: generateId(url),
      url,
      source: "spotify",
      type: "album",
      title: album.name,
      artist: album.artists.map((a) => a.name).join(", "),
      album: album.name,
      addedAt: new Date().toISOString(),
      imageUrl: album.images[0]?.url ?? "",
    };
  }

  const trackIdMatch = url.match(/track\/([a-zA-Z0-9]+)/);
  if (!trackIdMatch) throw new Error("Invalid Spotify track URL");

  const trackRes = await fetch(`https://api.spotify.com/v1/tracks/${trackIdMatch[1]}`, {
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
    type: "track",
    title: track.name,
    artist: track.artists.map((a) => a.name).join(", "),
    album: track.album.name,
    addedAt: new Date().toISOString(),
    imageUrl: track.album.images[0]?.url ?? "",
  };
}

export async function fetchSoundCloudMeta(
  url: string,
  soundcloudClientId?: string
): Promise<Omit<AlbumRecord, "artKey" | "artUrl">> {
  const oembedUrl = `https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  const res = await fetch(oembedUrl);

  if (!res.ok) throw new Error("Failed to fetch SoundCloud oembed");
  const data = (await res.json()) as {
    title: string;
    author_name: string;
    html: string;
  };

  // Strip trailing " by Artist" which SoundCloud appends, then split on " - " if present
  const cleanTitle = data.title.replace(/\s+by\s+[^-]+$/i, "").trim();
  const parts = cleanTitle.split(" - ");
  const title = parts.length > 1 ? parts.slice(1).join(" - ").trim() : cleanTitle;

  let type: RecordType = "track";

  if (soundcloudClientId) {
    const trackIdMatch = data.html.match(/tracks(?:\/|%2F)(\d+)/);
    if (trackIdMatch) {
      const apiRes = await fetch(
        `https://api-v2.soundcloud.com/tracks/${trackIdMatch[1]}?client_id=${soundcloudClientId}`
      );
      if (apiRes.ok) {
        const track = (await apiRes.json()) as { duration: number };
        type = track.duration >= SET_THRESHOLD_MS ? "set" : "track";
      }
    }
  }

  return {
    id: generateId(url),
    url,
    source: "soundcloud",
    type,
    title,
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
