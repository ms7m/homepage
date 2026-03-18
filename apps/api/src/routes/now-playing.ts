import type { Env } from "../index";

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_URL = "https://api.spotify.com/v1/me/player/currently-playing";

async function getAccessToken(env: Env): Promise<string> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`)}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: env.SPOTIFY_REFRESH_TOKEN,
    }),
  });
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export async function handleNowPlaying(_request: Request, env: Env): Promise<Response> {
  const json = (data: unknown) =>
    new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });

  try {
    const token = await getAccessToken(env);
    const res = await fetch(NOW_PLAYING_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 204 || res.status > 400) {
      return json({ isPlaying: false });
    }

    const data = (await res.json()) as any;

    if (!data?.is_playing || data.currently_playing_type !== "track") {
      return json({ isPlaying: false });
    }

    return json({
      isPlaying: true,
      title: data.item.name,
      artist: data.item.artists.map((a: any) => a.name).join(", "),
      album: data.item.album.name,
      artUrl: data.item.album.images[0]?.url ?? "",
      songUrl: data.item.external_urls.spotify,
      progress: Math.round((data.progress_ms / data.item.duration_ms) * 100),
    });
  } catch {
    return json({ isPlaying: false });
  }
}
