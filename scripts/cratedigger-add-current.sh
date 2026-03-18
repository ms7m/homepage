#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Add to CrateDigger
# @raycast.mode compact

# Optional parameters:
# @raycast.icon 🎵
# @raycast.packageName CrateDigger

WEBHOOK_URL="https://api.mikka.link/webhook"
CONFIG_FILE="$HOME/.config/cratedigger/config"

if [ ! -f "$CONFIG_FILE" ]; then
  echo "Missing config at ~/.config/cratedigger/config"
  exit 1
fi

source "$CONFIG_FILE"

if [ -z "$WEBHOOK_SECRET" ]; then
  echo "WEBHOOK_SECRET not set in config"
  exit 1
fi

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
