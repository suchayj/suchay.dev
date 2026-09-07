import assert from "node:assert/strict";
import { test } from "node:test";
import {
  formatCareerDateTime,
  getVisitorPagination,
  getVisitorRetentionCutoff,
  getVisitorRetentionMonths,
  indiaCalendarBoundary,
  normalizeVisitorPage,
  resolveVisitorFilter,
  startOfIndiaDay,
  VISITOR_ORDER_BY,
  VISITOR_PAGE_SIZE,
} from "../lib/analytics/visitor-presentation.ts";

test("formats CareerOS timestamps in IST without changing the instant", () => {
  const storedInstant = new Date("2026-09-07T18:45:00.000Z");
  const originalValue = storedInstant.toISOString();

  assert.equal(formatCareerDateTime(storedInstant), "8 Sept 2026, 12:15 am IST");
  assert.equal(storedInstant.toISOString(), originalValue);
});

test("uses India midnight for visitor dashboard date boundaries", () => {
  assert.equal(
    startOfIndiaDay(new Date("2026-09-07T20:00:00.000Z")).toISOString(),
    "2026-09-07T18:30:00.000Z",
  );
  assert.equal(
    startOfIndiaDay(new Date("2026-09-07T02:00:00.000Z")).toISOString(),
    "2026-09-06T18:30:00.000Z",
  );
});

test("normalizes invalid visitor page parameters", () => {
  assert.equal(normalizeVisitorPage(undefined), 1);
  assert.equal(normalizeVisitorPage("0"), 1);
  assert.equal(normalizeVisitorPage("not-a-page"), 1);
  assert.equal(normalizeVisitorPage(["3", "4"]), 3);
});

test("calculates bounded visitor pages without hiding the final records", () => {
  assert.equal(VISITOR_PAGE_SIZE, 25);
  assert.deepEqual(getVisitorPagination(51, 1), {
    page: 1,
    pageSize: 25,
    totalVisits: 51,
    totalPages: 3,
    skip: 0,
  });
  assert.deepEqual(getVisitorPagination(51, 3), {
    page: 3,
    pageSize: 25,
    totalVisits: 51,
    totalPages: 3,
    skip: 50,
  });
  assert.equal(getVisitorPagination(51, 99).page, 3);
  assert.equal(getVisitorPagination(0, 2).page, 1);
});

test("uses a unique tie-breaker when visitor timestamps are equal", () => {
  assert.deepEqual(VISITOR_ORDER_BY, [{ visitedAt: "desc" }, { id: "desc" }]);
});

test("resolves quick filters as complete IST calendar days across month and year boundaries", () => {
  const now = new Date("2027-01-01T01:00:00.000Z");
  const yesterday = resolveVisitorFilter({ preset: "yesterday" }, now);
  assert.equal(yesterday.startAt?.toISOString(), "2026-12-30T18:30:00.000Z");
  assert.equal(yesterday.endAt?.toISOString(), "2026-12-31T18:30:00.000Z");

  const lastThree = resolveVisitorFilter({ preset: "last-3" }, now);
  assert.equal(lastThree.startAt?.toISOString(), "2026-12-29T18:30:00.000Z");
  assert.equal(lastThree.endAt?.toISOString(), "2027-01-01T18:30:00.000Z");
});

test("translates single dates and inclusive custom ranges into exclusive IST end boundaries", () => {
  assert.equal(indiaCalendarBoundary("2026-03-01")?.toISOString(), "2026-02-28T18:30:00.000Z");
  assert.equal(indiaCalendarBoundary("2026-02-30"), null);

  const single = resolveVisitorFilter({ preset: "custom", start: "2026-03-01" });
  assert.equal(single.startAt?.toISOString(), "2026-02-28T18:30:00.000Z");
  assert.equal(single.endAt?.toISOString(), "2026-03-01T18:30:00.000Z");

  const range = resolveVisitorFilter({ preset: "custom", start: "2026-12-31", end: "2027-01-02" });
  assert.equal(range.startAt?.toISOString(), "2026-12-30T18:30:00.000Z");
  assert.equal(range.endAt?.toISOString(), "2027-01-02T18:30:00.000Z");
});

test("calculates configurable calendar-month retention cutoffs safely", () => {
  assert.equal(getVisitorRetentionMonths(undefined), 6);
  assert.equal(getVisitorRetentionMonths("9"), 9);
  assert.equal(getVisitorRetentionMonths("12"), 6);
  assert.equal(getVisitorRetentionCutoff(new Date("2026-08-31T12:15:00.000Z"), 6).toISOString(), "2026-02-28T12:15:00.000Z");
  assert.equal(getVisitorRetentionCutoff(new Date("2027-01-31T12:15:00.000Z"), 9).toISOString(), "2026-04-30T12:15:00.000Z");
  assert.equal(getVisitorRetentionCutoff(new Date("2026-09-30T20:00:00.000Z"), 6).toISOString(), "2026-03-31T20:00:00.000Z");
});
