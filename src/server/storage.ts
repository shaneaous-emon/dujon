import "server-only";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, normalize } from "node:path";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

/**
 * Private object storage for photos (docs/06). STORAGE_DRIVER=local (dev/tests) or s3 (Cloudflare R2 / any S3 API).
 * The bucket/directory is never public: photos are served only through /api/photos/[id] after an access check.
 */
let s3: S3Client | null = null;
function client(): S3Client {
  s3 ??= new S3Client({
    region: process.env.S3_REGION ?? "auto",
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: true,
    credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "", secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "" },
  });
  return s3;
}

const localRoot = () => join(/*turbopackIgnore: true*/ process.cwd(), process.env.STORAGE_LOCAL_DIR ?? ".data/photos");
const localPath = (key: string) => {
  const p = normalize(join(/*turbopackIgnore: true*/ localRoot(), key));
  if (!p.startsWith(localRoot())) throw new Error("invalid key");
  return p;
};
const isS3 = () => (process.env.STORAGE_DRIVER ?? "local") === "s3";

export async function putObject(key: string, body: Buffer, contentType: string): Promise<void> {
  if (isS3()) {
    await client().send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key, Body: body, ContentType: contentType }));
    return;
  }
  const p = localPath(key);
  await mkdir(dirname(p), { recursive: true });
  await writeFile(p, body);
}

export async function getObject(key: string): Promise<Buffer | null> {
  try {
    if (isS3()) {
      const r = await client().send(new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }));
      return r.Body ? Buffer.from(await r.Body.transformToByteArray()) : null;
    }
    return await readFile(localPath(key));
  } catch {
    return null;
  }
}

export async function deleteObject(key: string): Promise<void> {
  try {
    if (isS3()) await client().send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }));
    else await rm(localPath(key), { force: true });
  } catch {
    /* best effort; orphan cleanup is handled by the purge job */
  }
}
