"use server";

import { requireUser } from "@/services/auth-service";
import { getSessionIntelligence, type SessionFilters } from "@/services/analytics/session-intelligence";

import { createVisitorExport, type VisitorExportFormat } from "@/lib/analytics/session-export";

const visitorValues = ["all", "new", "returning"];
const deviceValues = ["all", "Desktop", "Mobile", "Tablet", "Unknown"];
const sourceValues = ["all", "Direct", "Google", "LinkedIn", "UTM/campaign", "Other referral"];

export async function loadVisitorIntelligence(input: { page?: number; filters?: SessionFilters }) {
  await requireUser();
  const filters = sanitizeFilters(input.filters ?? {});
  const page = Number.isSafeInteger(input.page) && input.page! > 0 ? input.page : 1;
  return getSessionIntelligence({ page, filters });
}

export async function exportVisitorIntelligence(input: { filters?: SessionFilters; format: VisitorExportFormat }) {
  await requireUser();
  if (input.format !== "csv" && input.format !== "json") throw new Error("Choose CSV or JSON for export.");
  const filters = sanitizeFilters(input.filters ?? {});
  const data = await getSessionIntelligence({ filters, exportAll: true });
  return createVisitorExport(data, filters, input.format);
}

function sanitizeFilters(filters: SessionFilters): SessionFilters {
  return {
    ownership: ["all", "external", "own"].includes(filters.ownership ?? "") ? filters.ownership : "external",
    preset: typeof filters.preset === "string" ? filters.preset.slice(0, 30) : "all",
    start: typeof filters.start === "string" ? filters.start.slice(0, 10) : undefined,
    end: typeof filters.end === "string" ? filters.end.slice(0, 10) : undefined,
    visitor: visitorValues.includes(filters.visitor ?? "") ? filters.visitor : "all",
    device: deviceValues.includes(filters.device ?? "") ? filters.device : "all",
    source: sourceValues.includes(filters.source ?? "") ? filters.source : "all",
  };
}
