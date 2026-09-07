export const visitorEventTypes = [
  "RESUME_VIEWED",
  "CONTACT_OPENED",
  "EMAIL_CONTINUE_CLICKED",
  "RENTORA_OPENED",
  "EDVORA_OPENED",
  "LOOM_OPENED",
  "GITHUB_OPENED",
  "LINKEDIN_OPENED",
] as const;

export type VisitorEventName = (typeof visitorEventTypes)[number];

export function isVisitorEventName(value: unknown): value is VisitorEventName {
  return typeof value === "string" && visitorEventTypes.includes(value as VisitorEventName);
}
