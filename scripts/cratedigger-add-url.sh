#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Add URL to CrateDigger
# @raycast.mode compact
# @raycast.argument1 { "type": "text", "placeholder": "Spotify URL (leave blank to use clipboard)", "optional": true }

# Optional parameters:
# @raycast.icon 📋
# @raycast.packageName CrateDigger

WEBHOOK_URL="https://api.mikka.link/webhook"
WEBHOOK_SECRET="21b1a475e9c0d33f704dda9b023d916e9bb2f094e4d7e938ff8c2278640e7b7e"

URL="$1"

# Fall back to clipboard if no argument provided
if [ -z "$URL" ]; then
  URL=$(pbpaste)
fi

if [ -z "$URL" ]; then
  echo "No URL provided and clipboard is empty"
  exit 1
fi

curl -s -o /dev/null \
  -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: $WEBHOOK_SECRET" \
  -d "{\"url\": \"$URL\"}" &
disown

echo "Sent to CrateDigger ✓"
