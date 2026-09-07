export const CAREER_TIME_ZONE = "Asia/Kolkata";
export const VISITOR_PAGE_SIZE = 25;
export const DEFAULT_VISITOR_RETENTION_MONTHS = 6;
export const VISITOR_ORDER_BY = [{ visitedAt: "desc" }, { id: "desc" }] as const;

const INDIA_OFFSET_MS = 5.5 * 60 * 60 * 1_000;

export const visitorPresetValues = ["all", "today", "yesterday", "day-before-yesterday", "last-3", "last-4", "last-10", "custom"] as const;
export type VisitorPreset = (typeof visitorPresetValues)[number];
export type VisitorFilterInput = { preset?: string | string[]; start?: string | string[]; end?: string | string[] };
export type VisitorFilter = { preset: VisitorPreset; start?: string; end?: string; startAt?: Date; endAt?: Date; label: string };

export function formatCareerDateTime(value: Date) {
  return `${value.toLocaleString("en-IN", {
    timeZone: CAREER_TIME_ZONE,
    dateStyle: "medium",
    timeStyle: "short",
  })} IST`;
}

export function formatCareerDate(value: Date) {
  return value.toLocaleDateString("en-IN", { timeZone: CAREER_TIME_ZONE, dateStyle: "medium" });
}

export function startOfIndiaDay(now = new Date()) {
  const indiaTime = new Date(now.getTime() + INDIA_OFFSET_MS);
  return new Date(
    Date.UTC(indiaTime.getUTCFullYear(), indiaTime.getUTCMonth(), indiaTime.getUTCDate()) - INDIA_OFFSET_MS,
  );
}

function valueOf(input: string | string[] | undefined) {
  return Array.isArray(input) ? input[0] : input;
}

function addIndiaCalendarDays(dayStart: Date, days: number) {
  return new Date(dayStart.getTime() + days * 24 * 60 * 60 * 1_000);
}

function toDateInput(dayStart: Date) {
  const indiaTime = new Date(dayStart.getTime() + INDIA_OFFSET_MS);
  return `${indiaTime.getUTCFullYear()}-${String(indiaTime.getUTCMonth() + 1).padStart(2, "0")}-${String(indiaTime.getUTCDate()).padStart(2, "0")}`;
}

export function indiaCalendarBoundary(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  if (utcDate.getUTCFullYear() !== year || utcDate.getUTCMonth() !== month - 1 || utcDate.getUTCDate() !== day) return null;
  return new Date(utcDate.getTime() - INDIA_OFFSET_MS);
}

export function resolveVisitorFilter(input: VisitorFilterInput, now = new Date()): VisitorFilter {
  const requestedPreset = valueOf(input.preset);
  const preset = visitorPresetValues.includes(requestedPreset as VisitorPreset) ? requestedPreset as VisitorPreset : "all";
  const today = startOfIndiaDay(now);

  const relative = (startOffset: number, endOffset: number, label: string): VisitorFilter => ({
    preset,
    startAt: addIndiaCalendarDays(today, startOffset),
    endAt: addIndiaCalendarDays(today, endOffset),
    label,
  });

  if (preset === "today") return relative(0, 1, `Today · ${formatCareerDate(today)} IST`);
  if (preset === "yesterday") return relative(-1, 0, `Yesterday · ${formatCareerDate(addIndiaCalendarDays(today, -1))} IST`);
  if (preset === "day-before-yesterday") return relative(-2, -1, `Day before yesterday · ${formatCareerDate(addIndiaCalendarDays(today, -2))} IST`);
  if (preset === "last-3") return relative(-2, 1, `Last 3 calendar days · ${formatCareerDate(addIndiaCalendarDays(today, -2))}–${formatCareerDate(today)} IST`);
  if (preset === "last-4") return relative(-3, 1, `Last 4 calendar days · ${formatCareerDate(addIndiaCalendarDays(today, -3))}–${formatCareerDate(today)} IST`);
  if (preset === "last-10") return relative(-9, 1, `Last 10 calendar days · ${formatCareerDate(addIndiaCalendarDays(today, -9))}–${formatCareerDate(today)} IST`);

  if (preset === "custom") {
    const requestedStart = valueOf(input.start) ?? "";
    const requestedEnd = valueOf(input.end) || requestedStart;
    const startAt = indiaCalendarBoundary(requestedStart);
    const endDay = indiaCalendarBoundary(requestedEnd);
    if (startAt && endDay && startAt <= endDay) {
      return {
        preset,
        start: requestedStart,
        end: requestedEnd,
        startAt,
        endAt: addIndiaCalendarDays(endDay, 1),
        label: requestedStart === requestedEnd
          ? `${formatCareerDate(startAt)} · complete IST day`
          : `${formatCareerDate(startAt)}–${formatCareerDate(endDay)} · inclusive IST range`,
      };
    }
  }

  return { preset: "all", label: "All retained history" };
}

export function normalizeVisitorPage(value: string | string[] | undefined) {
  const candidate = valueOf(value);
  const page = Number(candidate);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export function getVisitorPagination(totalVisits: number, requestedPage: number) {
  const totalPages = Math.max(1, Math.ceil(totalVisits / VISITOR_PAGE_SIZE));
  const page = Math.min(Math.max(1, requestedPage), totalPages);
  return {
    page,
    pageSize: VISITOR_PAGE_SIZE,
    totalVisits,
    totalPages,
    skip: (page - 1) * VISITOR_PAGE_SIZE,
  };
}

export function getVisitorRetentionMonths(value = process.env.ANALYTICS_RETENTION_MONTHS) {
  return value === "9" ? 9 : DEFAULT_VISITOR_RETENTION_MONTHS;
}

export function getVisitorRetentionCutoff(now = new Date(), months = getVisitorRetentionMonths()) {
  const indiaTime = new Date(now.getTime() + INDIA_OFFSET_MS);
  const monthIndex = indiaTime.getUTCMonth() - months;
  const targetYear = indiaTime.getUTCFullYear() + Math.floor(monthIndex / 12);
  const targetMonth = ((monthIndex % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  return new Date(Date.UTC(targetYear, targetMonth, Math.min(indiaTime.getUTCDate(), lastDay), indiaTime.getUTCHours(), indiaTime.getUTCMinutes(), indiaTime.getUTCSeconds(), indiaTime.getUTCMilliseconds()) - INDIA_OFFSET_MS);
}

export function visitorFilterQuery(filter: VisitorFilter) {
  const query = new URLSearchParams();
  if (filter.preset !== "all") query.set("visitPreset", filter.preset);
  if (filter.start) query.set("visitStart", filter.start);
  if (filter.end) query.set("visitEnd", filter.end);
  return query;
}

export function todayDateInput(now = new Date()) {
  return toDateInput(startOfIndiaDay(now));
}
