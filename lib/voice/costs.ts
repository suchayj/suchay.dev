// Standard USD rates per million tokens, verified 2026-09-16 against official model pages.
// Store the priced line items per event; changing this table must not reprice past calls.
export const RATE_VERSION = "openai-standard-2026-09-16";
export const RATE_SOURCE = "https://developers.openai.com/api/docs/pricing";
export type CostKind = "VOICE" | "TRANSCRIPTION" | "SUMMARY";
export type CostLine = { label: string; tokens: number; rate: number; usd: number };
type Rates = { textIn: number; textCached: number; textOut: number; audioIn?: number; audioCached?: number; audioOut?: number };
export const RATES: Record<string, Rates> = {
  "gpt-realtime-2.1-mini": { textIn: .6, textCached: .06, textOut: 2.4, audioIn: 10, audioCached: .3, audioOut: 20 },
  "gpt-realtime-2.1": { textIn: 4, textCached: .4, textOut: 24, audioIn: 32, audioCached: .4, audioOut: 64 },
  "gpt-5.4-mini": { textIn: .75, textCached: .075, textOut: 4.5 },
  "gpt-5.4-mini-2026-03-17": { textIn: .75, textCached: .075, textOut: 4.5 },
  "gpt-4o-mini-transcribe": { textIn: 1.25, textCached: 1.25, textOut: 5, audioIn: 1.25 },
};
function record(value: unknown): Record<string, unknown> { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function count(value: unknown): number { if (!Number.isSafeInteger(value) || Number(value) < 0) throw new Error("Missing or invalid usage breakdown"); return Number(value); }
export function priceUsage(kind: CostKind, model: string, raw: unknown): { usd: number | null; lines: CostLine[]; issue: string | null } {
  const rates = RATES[model];
  if (!rates) return { usd: null, lines: [], issue: `No verified rate for ${model}` };
  const lines: CostLine[] = [];
  function line(label: string, tokens: number, rate: number | undefined) {
    if (!tokens) return;
    if (rate === undefined) throw new Error("No verified rate for this token category");
    lines.push({ label, tokens, rate, usd: Math.round(tokens * rate * 1000) / 1e9 });
  }
  try {
    const usage = record(raw);
    const input = count(usage.input_tokens), output = count(usage.output_tokens);
    if (kind === "SUMMARY") {
      const details = record(usage.input_tokens_details);
      const cached = count(details.cached_tokens);
      if (cached > input) throw new Error("Invalid cached token count");
      line("Text input", input - cached, rates.textIn); line("Cached text", cached, rates.textCached); line("Text output", output, rates.textOut);
    } else {
      const details = record(usage.input_token_details);
      const audio = count(details.audio_tokens), text = count(details.text_tokens);
      if (audio + text !== input) throw new Error("Input contains missing or unsupported token categories");
      const cached = kind === "VOICE" ? count(details.cached_tokens) : 0;
      const cache = record(details.cached_tokens_details);
      const cachedAudio = cached ? count(cache.audio_tokens) : 0;
      const cachedText = cached ? count(cache.text_tokens) : 0;
      if (cachedAudio + cachedText !== cached || cachedAudio > audio || cachedText > text) throw new Error("Cached token breakdown is incomplete");
      line("Audio input", audio - cachedAudio, rates.audioIn); line("Cached audio", cachedAudio, rates.audioCached);
      line("Text input", text - cachedText, rates.textIn); line("Cached text", cachedText, rates.textCached);
      if (kind === "TRANSCRIPTION") line("Transcript output", output, rates.textOut);
      else {
        const out = record(usage.output_token_details);
        const outAudio = count(out.audio_tokens), outText = count(out.text_tokens);
        if (outAudio + outText !== output) throw new Error("Output contains missing or unsupported token categories");
        line("Audio output", outAudio, rates.audioOut); line("Text output", outText, rates.textOut);
      }
    }
    return { usd: Math.round(lines.reduce((sum, item) => sum + item.usd, 0) * 1e9) / 1e9, lines, issue: null };
  } catch (error) { return { usd: null, lines: [], issue: error instanceof Error ? error.message : "Usage unavailable" }; }
}
export function convertCost(usd: number, inrPerUsd: number, taxPercent: number) {
  return usd * inrPerUsd * (1 + taxPercent / 100);
}
export function forecastCost(minutes: number, calls: number, assistantShare: number, model: string) {
  const rates = RATES[model];
  // New speech only: 600 input and 1200 output audio tokens per spoken minute.
  // Context, summaries, transcription and tools are deliberately excluded from this forecast.
  if (!rates?.audioIn || !rates.audioOut) return 0;
  return minutes * calls * ((1 - assistantShare) * 600 * rates.audioIn + assistantShare * 1200 * rates.audioOut) / 1e6;
}
