import type { Env } from "../index";

const BASE = "https://ws.audioscrobbler.com/2.0/";
const PLACEHOLDER = "2a96cbd8b46e442fc41c2b86b821562f";

function bestImage(images: any[]): string {
  if (!Array.isArray(images)) return "";
  for (const size of ["extralarge", "large", "medium"]) {
    const img = images.find((i: any) => i.size === size);
    const url: string = img?.["#text"] ?? "";
    if (url && !url.includes(PLACEHOLDER)) return url;
  }
  return "";
}

async function resolveTrackArt(artist: string, track: string, apiKey: string): Promise<string> {
  const res = await fetch(
    `${BASE}?method=track.getinfo&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}&api_key=${apiKey}&format=json`
  );
  const data = (await res.json()) as any;
  return bestImage(data.track?.album?.image ?? []);
}

async function resolveArtistImage(artistName: string): Promise<string> {
  try {
    const searchRes = await fetch(
      `https://musicbrainz.org/ws/2/artist/?query=${encodeURIComponent(artistName)}&limit=1&fmt=json`,
      { headers: { "User-Agent": "mikka.link/1.0 (hi@mikka.link)" } }
    );
    const searchData = (await searchRes.json()) as any;
    const mbid = searchData.artists?.[0]?.id;
    if (!mbid) return "";

    const relRes = await fetch(
      `https://musicbrainz.org/ws/2/artist/${mbid}?inc=url-rels&fmt=json`,
      { headers: { "User-Agent": "mikka.link/1.0 (hi@mikka.link)" } }
    );
    const relData = (await relRes.json()) as any;
    const wikiImg = relData.relations?.find((r: any) => r.type === "image");
    return wikiImg?.url?.resource ?? "";
  } catch {
    return "";
  }
}

export async function handleLastFm(_request: Request, env: Env): Promise<Response> {
  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    });

  try {
    const [userRes, topTrackRes, topArtistRes] = await Promise.all([
      fetch(`${BASE}?method=user.getinfo&user=${env.LASTFM_USER}&api_key=${env.LASTFM_API_KEY}&format=json`),
      fetch(`${BASE}?method=user.gettoptracks&user=${env.LASTFM_USER}&api_key=${env.LASTFM_API_KEY}&format=json&period=7day&limit=1`),
      fetch(`${BASE}?method=user.gettopartists&user=${env.LASTFM_USER}&api_key=${env.LASTFM_API_KEY}&format=json&period=7day&limit=1`),
    ]);

    const [userData, topTrackData, topArtistData] = await Promise.all([
      userRes.json() as Promise<any>,
      topTrackRes.json() as Promise<any>,
      topArtistRes.json() as Promise<any>,
    ]);

    const u = userData.user;
    const user = u ? { totalScrobbles: Number(u.playcount).toLocaleString() } : null;

    const rawTrack = topTrackData.toptracks?.track?.[0] ?? null;
    const rawArtist = topArtistData.topartists?.artist?.[0] ?? null;

    let trackArt = "";
    if (rawTrack) {
      try { trackArt = await resolveTrackArt(rawTrack.artist.name, rawTrack.name, env.LASTFM_API_KEY); } catch {}
    }

    let artistImageUrl = "";
    if (rawArtist) {
      try { artistImageUrl = await resolveArtistImage(rawArtist.name); } catch {}
    }

    return json({
      user,
      topTrack: rawTrack
        ? {
            name: rawTrack.name,
            artist: rawTrack.artist.name,
            artUrl: trackArt,
            url: rawTrack.url,
            playcount: rawTrack.playcount,
          }
        : null,
      topArtist: rawArtist
        ? {
            name: rawArtist.name,
            url: rawArtist.url,
            playcount: rawArtist.playcount,
            imageUrl: artistImageUrl,
          }
        : null,
    });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
}
