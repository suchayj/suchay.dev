import assert from "node:assert/strict";
import { test } from "node:test";
import { tsImport } from "tsx/esm/api";
const { sessionsToCsv, createVisitorExport, formatSessionDetails } = await tsImport("../lib/analytics/session-export.ts", import.meta.url);

function fixture(overrides = {}) {
  return {
    sessionId: "anonymous-session", visitorLabel: "Anonymous #A49E", ownerDeviceName: null,
    returning: false, startAt: new Date("2026-10-04T03:30:00Z"), endAt: new Date("2026-10-04T03:30:07Z"),
    pageCount: 2, duration: "7s observed activity",
    journey: [{ path: "/", label: "Home", visitedAt: new Date("2026-10-04T03:30:00Z"), secondsToNext: 7 },
      { path: "/timeline", label: "Work Timeline", visitedAt: new Date("2026-10-04T03:30:07Z"), secondsToNext: null }],
    device: { device: "Desktop", browser: "Chrome", os: "Windows", crawler: false },
    source: { kind: "Direct", label: "Direct / referrer unavailable", detail: null },
    location: "Hinjawadi, Maharashtra, India",
    context: { viewportWidth: 1440, viewportHeight: 900, browserLanguage: "en-IN", browserTimezone: "Asia/Kolkata",
      referrer: null, utmSource: null, utmMedium: null, utmCampaign: null, utmContent: null, utmTerm: null },
    engagement: [{ type: "RENTORA_OPENED", label: "Rentora opened", occurredAt: new Date("2026-10-04T03:30:04Z") }],
    visitor: { firstSeen: new Date("2026-10-04T03:30:00Z"), lastSeen: new Date("2026-10-04T03:30:07Z"), sessions: 1, pageViews: 2, previousSessions: [] },
    ...overrides,
  };
}

function data(sessions) {
  return { sessions, metrics: { sessions: sessions.length, pageViews: sessions.length * 2 },
    filter: { label: "Today" }, retentionCutoff: new Date("2026-04-04T00:00:00Z") };
}

test("CSV includes numeric activity, journey, event timestamps, attribution and UTC plus IST dates", () => {
  const csv = sessionsToCsv([fixture()]);
  assert.ok(csv.startsWith("\uFEFF"));
  assert.match(csv, /"observed_seconds"/);
  assert.match(csv, /"7","2","Desktop","Chrome","Windows"/);
  assert.match(csv, /"Hinjawadi, Maharashtra, India"/);
  assert.match(csv, /2026-10-04T03:30:00.000Z/);
  assert.match(csv, /9:00 am IST/);
  assert.match(csv, /RENTORA_OPENED/);
  assert.match(csv, /2026-10-04T03:30:04.000Z/);
});

test("CSV escapes quotes and multiline fields and neutralizes spreadsheet formulas", () => {
  const session = fixture();
  session.context.utmSource = '=HYPERLINK("https://example.com")';
  session.context.utmCampaign = 'one, "two"\nthree';
  session.context.utmContent = '  @SUM(1,2)';
  const csv = sessionsToCsv([session]);
  assert.ok(csv.includes('"\'=HYPERLINK(""https://example.com"")"'));
  assert.ok(csv.includes('"one, ""two""\nthree"'));
  assert.ok(csv.includes('"\'  @SUM(1,2)"'));
});

test("exports every provided session rather than limiting output to the displayed 25", () => {
  const sessions = Array.from({ length: 27 }, (_, index) => fixture({ sessionId: `session-${index}` }));
  const csv = createVisitorExport(data(sessions), { preset: "today" }, "csv");
  assert.equal(csv.content.split("\r\n").length, 28);
  const json = JSON.parse(createVisitorExport(data(sessions), { preset: "today" }, "json").content);
  assert.equal(json.sessions.length, 27);
  assert.equal(json.filters.preset, "today");
  assert.equal(json.timeZone, "Asia/Kolkata");
  assert.equal(json.sessions[0].journey.length, 2);
  assert.equal(json.sessions[0].engagement.length, 1);
});

test("export filename uses the IST calendar date", () => {
  const exported = createVisitorExport(data([]), {}, "csv", new Date("2026-10-03T20:00:00Z"));
  assert.equal(exported.filename, "visitors-2026-10-04.csv");
});

test("clipboard details include the complete session, actions and explicit missing data", () => {
  const text = formatSessionDetails(fixture());
  for (const value of ["Anonymous #A49E", "SESSION", "DEVICE & LOCATION", "JOURNEY", "ATTRIBUTION", "ENGAGEMENT", "VISITOR HISTORY", "Rentora opened", "Home (/)", "Work Timeline (/timeline)", "Hinjawadi, Maharashtra, India (approximate)", "Browser time zone: Asia/Kolkata", "Referrer: Not recorded"]) assert.ok(text.includes(value), value);
  const missing = formatSessionDetails(fixture({ location: null, context: null, engagement: [] }));
  assert.match(missing, /Location: Unavailable/);
  assert.match(missing, /No additional actions recorded/);
  assert.match(missing, /Viewport: Not recorded/);
});
