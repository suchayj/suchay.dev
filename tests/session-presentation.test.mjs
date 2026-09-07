import assert from "node:assert/strict";
import { test } from "node:test";
import { anonymousVisitorLabel, classifySource, observedDuration, parseUserAgent, readablePath } from "../lib/analytics/session-presentation.ts";
import { isVisitorEventName } from "../lib/analytics/visitor-events.ts";

test("derives a short stable anonymous label without exposing the visitor key", () => {
  const key = "visitor-cookie-value-that-must-not-be-rendered";
  const label = anonymousVisitorLabel(key);
  assert.match(label, /^Anonymous #[A-F0-9]{4}$/);
  assert.equal(anonymousVisitorLabel(key), label);
  assert.doesNotMatch(label, /visitor-cookie/);
});

test("maps known journey paths and preserves unknown paths", () => {
  assert.equal(readablePath("/"), "Home");
  assert.equal(readablePath("/timeline"), "Work Timeline");
  assert.equal(readablePath("/work/rentora"), "Rentora");
  assert.equal(readablePath("/future/path"), "/future/path");
});

test("reports only observed activity and treats one-page sessions honestly", () => {
  const start = new Date("2026-09-06T02:24:00Z");
  assert.equal(observedDuration(start, start, 1), "Single recorded page view");
  assert.equal(observedDuration(start, start, 2), "Multiple page views at the same recorded time");
  assert.equal(observedDuration(start, new Date("2026-09-06T02:27:18Z"), 4), "3m 18s observed activity");
});

test("parses common device, browser and OS families conservatively", () => {
  assert.deepEqual(parseUserAgent("Mozilla/5.0 (Linux; Android 15; Pixel) AppleWebKit/537.36 Chrome/140.0 Mobile Safari/537.36"), { device: "Mobile", browser: "Chrome", os: "Android", crawler: false });
  assert.deepEqual(parseUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 Version/17.0 Safari/605.1.15"), { device: "Desktop", browser: "Safari", os: "macOS", crawler: false });
  assert.equal(parseUserAgent("Googlebot/2.1").crawler, true);
});

test("classifies explicit campaign attribution without inventing missing sources", () => {
  assert.deepEqual(classifySource({ utmSource: null, utmMedium: null, utmCampaign: null, referrer: null }), { kind: "Direct", label: "Direct / referrer unavailable", detail: null });
  assert.deepEqual(classifySource({ utmSource: "whatsapp", utmMedium: "direct_share", utmCampaign: "portfolio_test", referrer: null }), { kind: "UTM/campaign", label: "WhatsApp", detail: "direct_share · portfolio_test" });
  assert.deepEqual(classifySource({ utmSource: "linkedin", utmMedium: "outreach", utmCampaign: "career_test", referrer: null }), { kind: "UTM/campaign", label: "LinkedIn", detail: "outreach · career_test" });
  assert.equal(classifySource({ utmSource: null, utmMedium: null, utmCampaign: null, referrer: "https://www.google.com/search?q=suchay" }).label, "Google");
});

test("accepts only the strict visitor engagement event set", () => {
  assert.equal(isVisitorEventName("RENTORA_OPENED"), true);
  assert.equal(isVisitorEventName("arbitrary-client-event"), false);
});
