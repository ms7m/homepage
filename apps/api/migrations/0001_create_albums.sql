CREATE TABLE IF NOT EXISTS albums (
  id        TEXT PRIMARY KEY,
  url       TEXT NOT NULL,
  source    TEXT NOT NULL,
  title     TEXT NOT NULL,
  artist    TEXT NOT NULL,
  album     TEXT NOT NULL,
  art_key   TEXT NOT NULL DEFAULT '',
  art_url   TEXT NOT NULL DEFAULT '',
  added_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_albums_added_at ON albums (added_at DESC);
