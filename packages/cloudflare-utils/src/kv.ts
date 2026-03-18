import type { AlbumRecord, CratediggerEnv } from "./types";

interface AlbumRow {
  id: string;
  url: string;
  source: string;
  title: string;
  artist: string;
  album: string;
  art_key: string;
  art_url: string;
  added_at: string;
}

function rowToRecord(row: AlbumRow): AlbumRecord {
  return {
    id: row.id,
    url: row.url,
    source: row.source as AlbumRecord["source"],
    title: row.title,
    artist: row.artist,
    album: row.album,
    artKey: row.art_key,
    artUrl: row.art_url,
    addedAt: row.added_at,
  };
}

export async function getAlbum(
  env: CratediggerEnv,
  id: string
): Promise<AlbumRecord | null> {
  const row = await env.DB.prepare("SELECT * FROM albums WHERE id = ?")
    .bind(id)
    .first<AlbumRow>();
  return row ? rowToRecord(row) : null;
}

export async function putAlbum(
  env: CratediggerEnv,
  record: AlbumRecord
): Promise<void> {
  await env.DB.prepare(`
    INSERT INTO albums (id, url, source, title, artist, album, art_key, art_url, added_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      url = excluded.url,
      source = excluded.source,
      title = excluded.title,
      artist = excluded.artist,
      album = excluded.album,
      art_key = excluded.art_key,
      art_url = excluded.art_url
  `)
    .bind(
      record.id,
      record.url,
      record.source,
      record.title,
      record.artist,
      record.album,
      record.artKey,
      record.artUrl,
      record.addedAt
    )
    .run();
}

export async function getAlbumCount(env: CratediggerEnv): Promise<number> {
  const row = await env.DB.prepare("SELECT COUNT(*) as count FROM albums").first<{ count: number }>();
  return row?.count ?? 0;
}

export async function getAlbumsPage(
  env: CratediggerEnv,
  page: number,
  limit: number
): Promise<{ albums: AlbumRecord[]; total: number; hasMore: boolean }> {
  const [countRow, { results }] = await Promise.all([
    env.DB.prepare("SELECT COUNT(*) as count FROM albums").first<{ count: number }>(),
    env.DB.prepare("SELECT * FROM albums ORDER BY added_at DESC LIMIT ? OFFSET ?")
      .bind(limit, page * limit)
      .all<AlbumRow>(),
  ]);

  const total = countRow?.count ?? 0;
  return {
    albums: results.map(rowToRecord),
    total,
    hasMore: page * limit + limit < total,
  };
}
