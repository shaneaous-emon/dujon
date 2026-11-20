import "server-only";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { appConfig } from "@/config/app";
import { exec, one, tx } from "../db";
import { randomPublicId } from "../crypto";
import { deleteObject, putObject } from "../storage";

export type PhotoError = "tooLarge" | "type" | "tooSmall" | "invalid";

/**
 * Validates and re-encodes an uploaded photo (FR-PHOTO-*): checks the real image format (not the file name),
 * applies EXIF rotation, strips ALL metadata (incl. GPS), and stores full + thumbnail WebP files.
 */
export async function savePhoto(profileId: number, input: Buffer): Promise<{ ok: true; publicId: string } | { ok: false; error: PhotoError }> {
  if (input.length > appConfig.photoMaxBytes) return { ok: false, error: "tooLarge" };
  let meta: import("sharp").Metadata;
  try {
    meta = await sharp(input, { failOn: "error", limitInputPixels: 50_000_000 }).metadata();
  } catch {
    return { ok: false, error: "invalid" };
  }
  if (!meta.format || !["jpeg", "png", "webp"].includes(meta.format)) return { ok: false, error: "type" };
  const w = meta.autoOrient?.width ?? meta.width ?? 0;
  const h = meta.autoOrient?.height ?? meta.height ?? 0;
  if (Math.min(w, h) < appConfig.photoMinDimension) return { ok: false, error: "tooSmall" };

  let full: { data: Buffer; info: import("sharp").OutputInfo };
  let thumb: Buffer;
  try {
    const base = sharp(input, { failOn: "error", limitInputPixels: 50_000_000 }).rotate(); // rotate() bakes EXIF orientation, output has no metadata
    full = await base.clone().resize({ width: 1000, height: 1250, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
    thumb = await base.clone().resize({ width: 320, height: 400, fit: "cover", position: "attention" }).webp({ quality: 75 }).toBuffer();
  } catch {
    return { ok: false, error: "invalid" };
  }

  const dir = `photos/${randomUUID()}`;
  const keyFull = `${dir}/full.webp`;
  const keyThumb = `${dir}/thumb.webp`;
  await putObject(keyFull, full.data, "image/webp");
  await putObject(keyThumb, thumb, "image/webp");

  const old = await one<{ storage_key_full: string; storage_key_thumb: string }>(
    "SELECT storage_key_full, storage_key_thumb FROM profile_photos WHERE profile_id=?",
    [profileId],
  );
  const publicId = randomPublicId(16);
  await tx(async (conn) => {
    await exec("DELETE FROM profile_photos WHERE profile_id=?", [profileId], conn);
    await exec(
      "INSERT INTO profile_photos (public_id, profile_id, storage_key_full, storage_key_thumb, width, height, bytes) VALUES (?,?,?,?,?,?,?)",
      [publicId, profileId, keyFull, keyThumb, full.info.width, full.info.height, full.data.length],
      conn,
    );
  });
  if (old) {
    await deleteObject(old.storage_key_full);
    await deleteObject(old.storage_key_thumb);
  }
  return { ok: true, publicId };
}

export async function deletePhoto(profileId: number): Promise<void> {
  const old = await one<{ storage_key_full: string; storage_key_thumb: string }>(
    "SELECT storage_key_full, storage_key_thumb FROM profile_photos WHERE profile_id=?",
    [profileId],
  );
  await exec("DELETE FROM profile_photos WHERE profile_id=?", [profileId]);
  if (old) {
    await deleteObject(old.storage_key_full);
    await deleteObject(old.storage_key_thumb);
  }
}
