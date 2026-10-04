import assert from "node:assert/strict";
import { after, test } from "node:test";
import { randomUUID } from "node:crypto";
import { enquirySchema } from "../lib/voice/validation";
import { createEnquiry, authorizeEnquiry, reserveVoice } from "../services/voice-enquiries";
import { prisma } from "../lib/db";
import { checkOrigin, readJson } from "../lib/voice/http";
const caller = `voice-test-${randomUUID()}`;
const email = `${caller}@example.com`;
const input = { name: "Voice Test", email, phone: "+919876543210", reason: "Hiring", message: "An engineering opportunity to discuss.", consent: true, website: "" };
after(async () => { await prisma.voiceEnquiry.deleteMany({ where: { email: { startsWith: caller } } }); await prisma.$disconnect(); });

test("requires email and consent, accepts optional phone, and normalises international formatting", () => {
  assert.equal(enquirySchema.safeParse({ ...input, phone: "" }).success, true);
  assert.equal(enquirySchema.safeParse({ ...input, phone: "9876543210" }).success, false);
  assert.equal(enquirySchema.safeParse({ ...input, phone: "+91<script>" }).success, false);
  assert.equal(enquirySchema.safeParse({ ...input, consent: false }).success, false);
  assert.equal(enquirySchema.safeParse({ ...input, email: "wrong" }).success, false);
  assert.equal(enquirySchema.safeParse({ ...input, website: "bot" }).success, false);
  assert.equal(enquirySchema.parse({ ...input, phone: "+91 98765 43210" }).phone, "+919876543210");
});
test("rejects cross-origin and oversized input", async () => {
  process.env.APP_ORIGIN = "https://suchay.dev";
  assert.throws(() => checkOrigin(new Request("https://suchay.dev/api/voice/enquiries", { headers: { origin: "https://attacker.example" } })));
  await assert.rejects(readJson(new Request("https://suchay.dev", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: "x".repeat(13000) }) })));
});
test("durably captures mandatory details, scopes access and serialises admission limits", async () => {
  process.env.VOICE_ENABLED = "false";
  const saved = await createEnquiry(input, caller);
  assert.equal(saved.voiceAvailable, false);
  const row = await prisma.voiceEnquiry.findUniqueOrThrow({ where: { id: saved.id } });
  assert.equal(row.phone, input.phone);
  assert.equal(row.state, "SAVED");
  assert.notEqual(row.accessHash, saved.token);
  assert.notEqual(row.callerHash, caller);
  const request = (token: string) => new Request("https://suchay.dev", { headers: { authorization: `Bearer ${token}` } });
  assert.equal((await authorizeEnquiry(saved.id, request(saved.token))).id, saved.id);
  await assert.rejects(authorizeEnquiry(saved.id, request("a".repeat(43))));
  await assert.rejects(reserveVoice(saved.id));
  const attempts = await Promise.allSettled(Array.from({ length: 4 }, () => createEnquiry(input, caller)));
  assert.equal(attempts.filter(value => value.status === "fulfilled").length, 2);
  assert.equal(attempts.filter(value => value.status === "rejected").length, 2);
  process.env.VOICE_ENABLED = "true";
  process.env.OPENAI_API_KEY = "test-only-not-a-real-key";
  const reserved = await Promise.allSettled([reserveVoice(saved.id), reserveVoice(saved.id)]);
  assert.equal(reserved.filter(value => value.status === "fulfilled").length, 1);
  assert.equal(reserved.filter(value => value.status === "rejected").length, 1);
  assert.equal((await prisma.voiceEnquiry.findUniqueOrThrow({ where: { id: saved.id } })).state, "CONNECTING");
});


test("omitted phone does not group unrelated visitors under an empty number", async () => {
  const rows = await Promise.all(Array.from({ length: 4 }, (_, index) => createEnquiry({ ...input, email: `${caller}-${index}@example.com`, phone: "" }, `${caller}-${index}`)));
  assert.equal(rows.length, 4);
  await prisma.voiceEnquiry.deleteMany({ where: { id: { in: rows.map(row => row.id) } } });
});
