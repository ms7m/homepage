import { handleNowPlaying } from "./routes/now-playing";
import { handleLastFm } from "./routes/lastfm";
import { handleAbout } from "./routes/about";
import { handleWebhook } from "./routes/webhook";
import { handleAlbums } from "./routes/albums";

export interface Env {
  ALBUMS: KVNamespace;
  ALBUM_ART: R2Bucket;
  WEBHOOK_SECRET: string;
  SPOTIFY_CLIENT_ID: string;
  SPOTIFY_CLIENT_SECRET: string;
  SPOTIFY_REFRESH_TOKEN: string;
  LASTFM_API_KEY: string;
  LASTFM_USER: string;
  R2_PUBLIC_URL: string;
}

const ALLOWED_ORIGINS = [
  "https://mikka.link",
  "https://cratedigger.mikka.link",
  "https://blog.mikka.link",
];

function corsHeaders(origin: string): Record<string, string> {
  const allowed =
    ALLOWED_ORIGINS.includes(origin) || origin.endsWith(".pages.dev");
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Webhook-Secret",
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") ?? "";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    let response: Response;
    const path = url.pathname;

    if (path === "/now-playing" && request.method === "GET") {
      response = await handleNowPlaying(request, env);
    } else if (path === "/lastfm" && request.method === "GET") {
      response = await handleLastFm(request, env);
    } else if (path === "/about" && request.method === "GET") {
      response = await handleAbout();
    } else if (path === "/albums" && request.method === "GET") {
      response = await handleAlbums(request, env);
    } else if (path === "/webhook" && request.method === "POST") {
      response = await handleWebhook(request, env);
    } else {
      response = new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const headers = new Headers(response.headers);
    const cors = corsHeaders(origin);
    for (const [k, v] of Object.entries(cors)) {
      if (v) headers.set(k, v);
    }
    return new Response(response.body, { status: response.status, headers });
  },
} satisfies ExportedHandler<Env>;
