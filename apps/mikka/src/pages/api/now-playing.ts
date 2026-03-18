import type { APIRoute } from "astro";

const CLIENT_ID = import.meta.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = import.meta.env.SPOTIFY_REFRESH_TOKEN;

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_URL = "https://api.spotify.com/v1/me/player/currently-playing";

async function getAccessToken() {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: REFRESH_TOKEN,
    }),
  });
  const data = await res.json() as { access_token: string };
  return data.access_token;
}

export const GET: APIRoute = async () => {
  try {
    const token = await getAccessToken();
    const res = await fetch(NOW_PLAYING_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 204 || res.status > 400) {
      return new Response(JSON.stringify({ isPlaying: false }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await res.json() as any;

    if (!data?.is_playing || data.currently_playing_type !== "track") {
      return new Response(JSON.stringify({ isPlaying: false }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      isPlaying: true,
      title: data.item.name,
      artist: data.item.artists.map((a: any) => a.name).join(", "),
      album: data.item.album.name,
      artUrl: data.item.album.images[0]?.url ?? "",
      songUrl: data.item.external_urls.spotify,
      progress: Math.round((data.progress_ms / data.item.duration_ms) * 100),
    }), {
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch {
    return new Response(JSON.stringify({ isPlaying: false }), {
      headers: { "Content-Type": "application/json" },
    });
  }
};
