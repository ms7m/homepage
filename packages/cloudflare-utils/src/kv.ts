import type { AlbumRecord, CratediggerEnv, RecordType } from "./types";

interface AlbumRow {
  id: string;
  url: string;
  source: string;
  type: string;
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
    type: (row.type ?? "track") as RecordType,
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
    INSERT INTO albums (id, url, source, type, title, artist, album, art_key, art_url, added_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      url = excluded.url,
      source = excluded.source,
      type = excluded.type,
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
      record.type,
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

export async function getTypeCounts(
  env: CratediggerEnv
): Promise<{ tracks: number; sets: number; albums: number }> {
  const { results } = await env.DB.prepare(
    "SELECT type, COUNT(*) as count FROM albums GROUP BY type"
  ).all<{ type: string; count: number }>();

  const map: Record<string, number> = {};
  for (const row of results) map[row.type] = row.count;
  return { tracks: map.track ?? 0, sets: map.set ?? 0, albums: map.album ?? 0 };
}

export async function getAlbumsPage(
  env: CratediggerEnv,
  page: number,
  limit: number,
  type?: RecordType
): Promise<{ albums: AlbumRecord[]; total: number; hasMore: boolean }> {
  const where = type ? "WHERE type = ?" : "";
  const bindings = type
    ? [limit, page * limit, type]
    : [limit, page * limit];

  const [countRow, { results }] = await Promise.all([
    type
      ? env.DB.prepare(`SELECT COUNT(*) as count FROM albums WHERE type = ?`).bind(type).first<{ count: number }>()
      : env.DB.prepare("SELECT COUNT(*) as count FROM albums").first<{ count: number }>(),
    env.DB.prepare(`SELECT * FROM albums ${where} ORDER BY added_at DESC LIMIT ? OFFSET ?`)
      .bind(...(type ? [type, limit, page * limit] : [limit, page * limit]))
      .all<AlbumRow>(),
  ]);

  const total = countRow?.count ?? 0;
  return {
    albums: results.map(rowToRecord),
    total,
    hasMore: page * limit + limit < total,
  };
}
