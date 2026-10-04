import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const AUDIO_PREFIX = "projects/suchay.dev/conversations";
export { MAX_AUDIO_BYTES, MAX_AUDIO_PARTS, MAX_PART_BYTES, audioType, audioExtension, validAudioHeader } from "./recording-format";
import { MAX_PART_BYTES } from "./recording-format";
export function conversationPrefix(id: string) {
  if (!/^[a-zA-Z0-9-]{1,64}$/.test(id)) throw new Error("Invalid recording identity");
  return `${AUDIO_PREFIX}/${id}/`;
}
export function recordingStorageConfigured() {
  return ["DO_SPACES_KEY", "DO_SPACES_SECRET", "DO_SPACES_REGION", "DO_SPACES_BUCKET", "DO_SPACES_ENDPOINT"].every(key => Boolean(process.env[key]));
}
function storage() {
  if (!recordingStorageConfigured()) throw new Error("Recording storage is not configured");
  const endpoint = new URL(process.env.DO_SPACES_ENDPOINT!);
  if (endpoint.protocol !== "https:" || !endpoint.hostname.endsWith(".digitaloceanspaces.com")) throw new Error("Invalid Spaces endpoint");
  return { bucket: process.env.DO_SPACES_BUCKET!, client: new S3Client({
    endpoint: endpoint.origin, region: process.env.DO_SPACES_REGION!,
    credentials: { accessKeyId: process.env.DO_SPACES_KEY!, secretAccessKey: process.env.DO_SPACES_SECRET! },
    requestChecksumCalculation: "WHEN_REQUIRED", responseChecksumValidation: "WHEN_REQUIRED", maxAttempts: 2,
  }) };
}
export async function putPrivateAudio(key: string, bytes: Buffer, type: string) {
  const { client, bucket } = storage();
  try { await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: bytes, ContentType: type, ACL: "private", CacheControl: "private, no-store" }), { abortSignal: AbortSignal.timeout(12000) }); }
  finally { client.destroy(); }
}
export async function readAudioPart(key: string) {
  const { client, bucket } = storage();
  try {
    const result = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }), { abortSignal: AbortSignal.timeout(12000) });
    if (!result.Body || (result.ContentLength ?? MAX_PART_BYTES + 1) > MAX_PART_BYTES) throw new Error("Invalid audio part");
    return Buffer.from(await result.Body.transformToByteArray());
  } finally { client.destroy(); }
}
export async function privatePlaybackUrl(key: string) {
  const { client, bucket } = storage();
  try { return await getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: key, ResponseContentDisposition: "inline", ResponseCacheControl: "private, no-store" }), { expiresIn: 60 }); }
  finally { client.destroy(); }
}
export async function deleteConversationAudio(id: string) {
  const prefix = conversationPrefix(id);
  const { client, bucket } = storage();
  try {
    let token: string | undefined;
    do {
      const listed = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken: token }), { abortSignal: AbortSignal.timeout(12000) });
      const objects = (listed.Contents ?? []).flatMap(item => item.Key?.startsWith(prefix) ? [{ Key: item.Key }] : []);
      if (objects.length) {
        const result = await client.send(new DeleteObjectsCommand({ Bucket: bucket, Delete: { Objects: objects, Quiet: true } }), { abortSignal: AbortSignal.timeout(12000) });
        if (result.Errors?.length) throw new Error("Recording deletion failed");
      }
      token = listed.IsTruncated ? listed.NextContinuationToken : undefined;
    } while (token);
  } finally { client.destroy(); }
}
export async function deleteAudioParts(id: string, keys: string[]) {
  if (!keys.length) return;
  if (keys.some(key => !key.startsWith(`${conversationPrefix(id)}parts/`))) throw new Error("Invalid part identity");
  const { client, bucket } = storage();
  try {
    const result = await client.send(new DeleteObjectsCommand({ Bucket: bucket, Delete: { Objects: keys.map(Key => ({ Key })), Quiet: true } }), { abortSignal: AbortSignal.timeout(12000) });
    if (result.Errors?.length) throw new Error("Part deletion failed");
  } finally { client.destroy(); }
}
