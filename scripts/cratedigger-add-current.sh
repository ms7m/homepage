#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Add to CrateDigger
# @raycast.mode compact

# Optional parameters:
# @raycast.icon 🎵
# @raycast.packageName CrateDigger

WEBHOOK_URL="https://api.mikka.link/webhook"
WEBHOOK_SECRET="21b1a475e9c0d33f704dda9b023d916e9bb2f094e4d7e938ff8c2278640e7b7e"

# Get currently playing track from Spotify via AppleScript
SPOTIFY_URL=$(osascript <<'EOF'
tell application "Spotify"
  if player state is playing then
    return spotify url of current track
  else
    return ""
  end if
end tell
EOF
)

if [ -z "$SPOTIFY_URL" ]; then
  echo "Nothing playing in Spotify"
  exit 1
fi

# Convert spotify:track:ID URI to https URL if needed
if [[ "$SPOTIFY_URL" == spotify:track:* ]]; then
  TRACK_ID="${SPOTIFY_URL##spotify:track:}"
  SPOTIFY_URL="https://open.spotify.com/track/${TRACK_ID}"
fi

curl -s -o /dev/null \
  -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: $WEBHOOK_SECRET" \
  -d "{\"url\": \"$SPOTIFY_URL\"}" &
disown

echo "Sent to CrateDigger ✓"
