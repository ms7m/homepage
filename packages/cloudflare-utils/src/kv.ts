import type { AlbumIndex, AlbumRecord, CratediggerEnv } from "./types";

export async function getAlbum(
  env: CratediggerEnv,
  id: string
): Promise<AlbumRecord | null> {
  const raw = await env.ALBUMS.get(`album:${id}`);
  return raw ? (JSON.parse(raw) as AlbumRecord) : null;
}

export async function putAlbum(
  env: CratediggerEnv,
  record: AlbumRecord
): Promise<void> {
  await env.ALBUMS.put(`album:${record.id}`, JSON.stringify(record));
}

export async function getAlbumIndex(env: CratediggerEnv): Promise<AlbumIndex> {
  const raw = await env.ALBUMS.get("albums:index");
  return raw ? (JSON.parse(raw) as AlbumIndex) : [];
}

export async function prependToIndex(
  env: CratediggerEnv,
  id: string,
  maxSize = 500
): Promise<void> {
  const index = await getAlbumIndex(env);
  const next = [id, ...index.filter((i) => i !== id)].slice(0, maxSize);
  await env.ALBUMS.put("albums:index", JSON.stringify(next));
}

export async function getAllAlbums(
  env: CratediggerEnv
): Promise<AlbumRecord[]> {
  const index = await getAlbumIndex(env);
  const records = await Promise.all(index.map((id) => getAlbum(env, id)));
  return records.filter((r): r is AlbumRecord => r !== null);
}

export async function getAlbumsPage(
  env: CratediggerEnv,
  page: number,
  limit: number
): Promise<{ albums: AlbumRecord[]; total: number; hasMore: boolean }> {
  const index = await getAlbumIndex(env);
  const total = index.length;
  const start = page * limit;
  const slice = index.slice(start, start + limit);
  const records = await Promise.all(slice.map((id) => getAlbum(env, id)));
  return {
    albums: records.filter((r): r is AlbumRecord => r !== null),
    total,
    hasMore: start + limit < total,
  };
}
