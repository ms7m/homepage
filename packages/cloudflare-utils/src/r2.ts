import type { CratediggerEnv } from "./types";

export async function putAlbumArt(
  env: CratediggerEnv,
  id: string,
  imageBuffer: ArrayBuffer,
  contentType: string = "image/jpeg"
): Promise<string> {
  const key = `art/${id}.jpg`;
  await env.ALBUM_ART.put(key, imageBuffer, {
    httpMetadata: { contentType },
  });
  return key;
}

export async function getAlbumArtUrl(
  bucketPublicUrl: string,
  key: string
): Promise<string> {
  return `${bucketPublicUrl}/${key}`;
}
