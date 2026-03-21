ALTER TABLE albums ADD COLUMN type TEXT NOT NULL DEFAULT 'track';

CREATE INDEX IF NOT EXISTS idx_albums_type ON albums (type);
