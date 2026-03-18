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

URL="$1"

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
