export interface CratediggerEnv {
  ALBUMS: KVNamespace;
  DB: D1Database;
  ALBUM_ART: R2Bucket;
  WEBHOOK_SECRET: string;
  SPOTIFY_CLIENT_ID: string;
  SPOTIFY_CLIENT_SECRET: string;
}

export type RecordType = "track" | "set" | "album";

export interface AlbumRecord {
  id: string;
  url: string;
  source: "spotify" | "soundcloud";
  type: RecordType;
  title: string;
  artist: string;
  album: string;
  artKey: string;
  artUrl: string;
  addedAt: string;
}

export type AlbumIndex = string[];
