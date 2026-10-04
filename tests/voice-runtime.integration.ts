import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { after, mock, test } from "node:test";
import { randomUUID } from "node:crypto";
import { prisma } from "../lib/db";

const sockets: FakeSocket[] = [];
class FakeSocket extends EventEmitter {
  constructor() { super(); sockets.push(this); setImmediate(() => this.emit("open")); }
  close() { this.emit("close"); }
}
mock.module("ws", { defaultExport: FakeSocket });
const { connectVoice, endVoice } = await import("../services/voice-runtime");
const prefix = `runtime-test-${randomUUID()}`;
process.env.OPENAI_API_KEY = "test-only-key";
process.env.VOICE_MAX_SECONDS = "1";
let rejectConnect = false;
let rejectSummary = false;
const requests: { path: string; body?: BodyInit | null }[] = [];
mock.method(globalThis, "fetch", async (url: string, init: RequestInit) => {
  const path = new URL(url).pathname;
  requests.push({ path, body: init.body });
  if (path === "/v1/realtime/calls") return rejectConnect ? new Response("unavailable", { status: 503 }) : new Response("v=0\r\nanswer", { headers: { location: `/v1/realtime/calls/rtc_${randomUUID()}` } });
  if (path.endsWith("/hangup")) return new Response(null, { status: 200 });
  if (path === "/v1/responses") return rejectSummary ? new Response("unavailable", { status: 503 }) : Response.json({ id: "summary_test", model: "gpt-5.4-mini", usage: { input_tokens: 100, input_tokens_details: { cached_tokens: 0 }, output_tokens: 20 }, output: [{ content: [{ type: "output_text", text: "Visitor asked about an engineering project. Follow up by email." }] }] });
  throw new Error(`Unexpected external request: ${path}`);
});
after(async () => { mock.restoreAll(); await prisma.voiceEnquiry.deleteMany({ where: { email: `${prefix}@example.com` } }); await prisma.$disconnect(); });
async function create() {
  return prisma.voiceEnquiry.create({ data: { name: "Runtime test", email: `${prefix}@example.com`, phone: "+919000000001", reason: "Project enquiry", message: "Discuss a product engineering project", consentVersion: "voice-enquiry-v1", callerHash: prefix, accessHash: randomUUID(), state: "CONNECTING", startedAt: new Date() } });
}
async function eventually(check: () => Promise<boolean>) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (await check()) return;
    await new Promise(resolve => setTimeout(resolve, 30));
  }
  assert.fail("Timed out waiting for persisted call state");
}

test("uses server configuration, saves provider transcripts once, summarises, and closes idempotently", async () => {
  const row = await create();
  const sdp = await connectVoice(row.id, "v=0\r\noffer", prefix);
  assert.match(sdp, /^v=0/);
  const body = requests.find(request => request.path === "/v1/realtime/calls")!.body as FormData;
  const config = JSON.parse(String(body.get("session")));
  assert.equal(config.type, "realtime");
  assert.match(config.instructions, /AI assistant/);
  assert.equal(config.max_output_tokens, 2000);
  assert.match(config.instructions, /Discuss a product engineering project/);
  assert.doesNotMatch(config.instructions, new RegExp(row.email));
  assert.ok(!config.instructions.includes(row.phone));
  const socket = sockets.at(-1)!;
  const emit = (event: object) => socket.emit("message", Buffer.from(JSON.stringify(event)));
  emit({ type: "conversation.item.input_audio_transcription.completed", event_id: "u1", transcript: "I have a project.", usage: { input_tokens: 10, input_token_details: { audio_tokens: 10, text_tokens: 0 }, output_tokens: 5 } });
  emit({ type: "conversation.item.input_audio_transcription.completed", event_id: "u1", transcript: "I have a project.", usage: { input_tokens: 10, input_token_details: { audio_tokens: 10, text_tokens: 0 }, output_tokens: 5 } });
  emit({ type: "response.output_audio_transcript.done", event_id: "a1", transcript: "Tell me about it." });
  emit({ type: "response.done", event_id: "usage1", response: { usage: { input_tokens: 50, output_tokens: 80, input_token_details: { audio_tokens: 30, text_tokens: 20, cached_tokens: 0 }, output_token_details: { audio_tokens: 60, text_tokens: 20 } } } });
  await endVoice(row.id);
  await endVoice(row.id);
  const saved = await prisma.voiceEnquiry.findUniqueOrThrow({ where: { id: row.id } });
  assert.equal(saved.state, "COMPLETED");
  assert.equal(saved.transcript, "Visitor: I have a project.\nAssistant: Tell me about it.");
  assert.equal(saved.inputTokens, 50);
  assert.equal(saved.outputTokens, 80);
  assert.equal(saved.summaryKind, "AI");
  const charges = await prisma.voiceUsage.findMany({ where: { enquiryId: row.id } });
  assert.equal(charges.length, 3);
  assert.ok(charges.every(charge => charge.costUsd !== null));
  assert.deepEqual(charges.map(charge => charge.kind).sort(), ["SUMMARY", "TRANSCRIPTION", "VOICE"]);
  assert.ok(saved.endedAt);
  assert.equal(requests.filter(request => request.path.includes(saved.callId!) && request.path.endsWith("/hangup")).length, 1);
});

test("server timer ends an abandoned browser call and summary failure retains the transcript", async () => {
  rejectSummary = true;
  const row = await create();
  await connectVoice(row.id, "v=0\r\noffer", prefix);
  sockets.at(-1)!.emit("message", Buffer.from(JSON.stringify({ type: "conversation.item.input_audio_transcription.completed", event_id: "u2", transcript: "Please follow up." })));
  await eventually(async () => (await prisma.voiceEnquiry.findUniqueOrThrow({ where: { id: row.id } })).summaryKind === "FALLBACK");
  const saved = await prisma.voiceEnquiry.findUniqueOrThrow({ where: { id: row.id } });
  assert.equal(saved.state, "LIMIT_REACHED");
  assert.equal(saved.transcript, "Visitor: Please follow up.");
  rejectSummary = false;
});

test("provider failure preserves the original enquiry", async () => {
  rejectConnect = true;
  const row = await create();
  await assert.rejects(connectVoice(row.id, "v=0\r\noffer", prefix));
  const saved = await prisma.voiceEnquiry.findUniqueOrThrow({ where: { id: row.id } });
  assert.equal(saved.state, "FAILED");
  assert.equal(saved.message, row.message);
  assert.equal(saved.phone, row.phone);
  rejectConnect = false;
});

test("a cancelled connecting enquiry never leaves an unmonitored provider call", async () => {
  const row = await create();
  await endVoice(row.id, "INTERRUPTED");
  const before = requests.filter(request => request.path.endsWith("/hangup")).length;
  await assert.rejects(connectVoice(row.id, "v=0\r\noffer", prefix));
  assert.equal(requests.filter(request => request.path.endsWith("/hangup")).length, before + 1);
});
