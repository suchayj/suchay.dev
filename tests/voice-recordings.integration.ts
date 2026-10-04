import assert from "node:assert/strict";
import { after, mock, test } from "node:test";
import { randomUUID } from "node:crypto";
import { prisma } from "../lib/db";
const objects = new Map<string, Buffer>();
let failDelete = false;
class Command { constructor(public input: Record<string, unknown>) {} }
class PutObjectCommand extends Command {}
class GetObjectCommand extends Command {}
class DeleteObjectsCommand extends Command {}
class ListObjectsV2Command extends Command {}
class S3Client {
  async send(command: Command) {
    const key = String(command.input.Key);
    if (command instanceof PutObjectCommand) { assert.equal(command.input.ACL, "private"); assert.match(key, /^projects\/suchay\.dev\/conversations\//); objects.set(key, Buffer.from(command.input.Body as Buffer)); return {}; }
    if (command instanceof GetObjectCommand) { const body = objects.get(key)!; return { ContentLength: body.length, Body: { transformToByteArray: async () => body } }; }
    if (command instanceof ListObjectsV2Command) return { Contents: [...objects.keys()].filter(key => key.startsWith(String(command.input.Prefix))).map(Key => ({ Key })) };
    if (failDelete) return { Errors: [{ Code: "AccessDenied" }] };
    for (const object of (command.input.Delete as { Objects: { Key: string }[] }).Objects) objects.delete(object.Key);
    return {};
  }
  destroy() {}
}
mock.module("@aws-sdk/client-s3", { namedExports: { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectsCommand, ListObjectsV2Command } });
mock.module("@aws-sdk/s3-request-presigner", { namedExports: { getSignedUrl: async (_client: unknown, _command: unknown, options: { expiresIn: number }) => { assert.equal(options.expiresIn, 60); return "https://private-playback.example"; } } });
for (const [key,value] of Object.entries({ DO_SPACES_KEY: "test-only", DO_SPACES_SECRET: "test-only", DO_SPACES_BUCKET: "test", DO_SPACES_REGION: "sgp1", DO_SPACES_ENDPOINT: "https://sgp1.digitaloceanspaces.com" })) process.env[key] = value;
const { storeRecordingPart, finaliseRecording, deleteRecordedEnquiry, recordingPlayback } = await import("../services/voice-recordings");
const prefix = `recording-test-${randomUUID()}`;
const audio = Buffer.from([0x1a,0x45,0xdf,0xa3,1,2,3,4]);
async function create(consent = true) { return prisma.voiceEnquiry.create({data:{name:"Synthetic recording test",email:`${prefix}@example.com`,phone:"",reason:"Other",message:"Disposable recording test",consentVersion:"test",audioConsent:consent,accessHash:randomUUID(),callerHash:prefix,startedAt:new Date()}}); }
after(async()=>{await prisma.voiceEnquiry.deleteMany({where:{email:`${prefix}@example.com`}});await prisma.$disconnect();mock.restoreAll();});
test("requires consent and validates recording headers, sizes and indices",async()=>{const row=await create(false);await assert.rejects(storeRecordingPart(row.id,0,"audio/webm",audio),/consent/);await assert.rejects(storeRecordingPart(row.id,200,"audio/webm",audio));await assert.rejects(storeRecordingPart(row.id,0,"audio/webm",Buffer.alloc(60001)));await assert.rejects(storeRecordingPart(row.id,0,"audio/webm",Buffer.from("bad")));});
test("serialises duplicate uploads, rejects conflicting data, and finalises once",async()=>{const row=await create();await Promise.all([storeRecordingPart(row.id,0,"audio/webm",audio),storeRecordingPart(row.id,0,"audio/webm",audio)]);assert.equal(await prisma.voiceRecordingPart.count({where:{enquiryId:row.id}}),1);await assert.rejects(storeRecordingPart(row.id,0,"audio/webm",Buffer.concat([audio,Buffer.from("different")])),/already saved/);assert.deepEqual(await finaliseRecording(row.id,1,true),{saved:true,partial:false});assert.deepEqual(await finaliseRecording(row.id,1,true),{saved:true,partial:false});assert.equal(await recordingPlayback(row.id),"https://private-playback.example");await assert.rejects(storeRecordingPart(row.id,1,"audio/webm",audio),/finalised/);});
test("a gap preserves only the contiguous beginning and clearly marks partial audio",async()=>{const row=await create();await storeRecordingPart(row.id,0,"audio/webm",audio);await storeRecordingPart(row.id,2,"audio/webm",audio);assert.deepEqual(await finaliseRecording(row.id,3,true),{saved:true,partial:true});assert.equal((await prisma.voiceEnquiry.findUniqueOrThrow({where:{id:row.id}})).audioBytes,audio.length);});
test("failed cloud deletion preserves the enquiry; successful deletion removes only its objects",async()=>{const row=await create();await storeRecordingPart(row.id,0,"audio/webm",audio);failDelete=true;await assert.rejects(deleteRecordedEnquiry(row.id),/deletion failed/);assert.ok(await prisma.voiceEnquiry.findUnique({where:{id:row.id}}));failDelete=false;const before=objects.size;await deleteRecordedEnquiry(row.id);assert.equal(await prisma.voiceEnquiry.findUnique({where:{id:row.id}}),null);assert.equal(objects.size,before-1);});
test("expired uploads and premature recovery playback are rejected",async()=>{const row=await create();await storeRecordingPart(row.id,0,"audio/webm",audio);await assert.rejects(recordingPlayback(row.id),/still being saved/);await prisma.voiceEnquiry.update({where:{id:row.id},data:{startedAt:new Date(Date.now()-700000)}});await assert.rejects(storeRecordingPart(row.id,1,"audio/webm",audio),/window/);assert.equal(await recordingPlayback(row.id),"https://private-playback.example");assert.equal((await prisma.voiceEnquiry.findUniqueOrThrow({where:{id:row.id}})).audioState,"PARTIAL");});
