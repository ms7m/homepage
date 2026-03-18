import http from "http";
import { createServer } from "http";

const CLIENT_ID = "0a5667e69ce34d85885bac1efe496a88";
const CLIENT_SECRET = "a416f90071c6485ba23ca590b6da44cb";
const REDIRECT_URI = "http://127.0.0.1:3000";
const SCOPE = "user-read-currently-playing";

const authUrl =
  `https://accounts.spotify.com/authorize?` +
  new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: SCOPE,
  });

console.log("\n=== Spotify OAuth Flow ===");
console.log("Open this URL in your browser:\n");
console.log(authUrl);
console.log("\nWaiting for callback on http://127.0.0.1:3000 ...\n");

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://127.0.0.1:3000");
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    res.end(`<h1>Error: ${error}</h1>`);
    server.close();
    return;
  }

  if (!code) {
    res.end("<h1>No code received</h1>");
    return;
  }

  // Exchange code for tokens
  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  const tokens = await tokenRes.json();

  if (tokens.error) {
    res.end(`<h1>Token error: ${tokens.error}</h1><p>${tokens.error_description}</p>`);
    server.close();
    return;
  }

  console.log("=== SUCCESS — copy these values ===\n");
  console.log(`SPOTIFY_CLIENT_ID=${CLIENT_ID}`);
  console.log(`SPOTIFY_CLIENT_SECRET=${CLIENT_SECRET}`);
  console.log(`SPOTIFY_REFRESH_TOKEN=${tokens.refresh_token}`);
  console.log("\n===================================\n");

  res.end("<h1>Success! Check your terminal for the refresh token. You can close this tab.</h1>");
  server.close();
});

server.listen(3000, "127.0.0.1");
