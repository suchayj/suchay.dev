import assert from "node:assert/strict";
import { test } from "node:test";
import { priceUsage, convertCost, forecastCost } from "../lib/voice/costs";
const usage = { input_tokens: 1000, output_tokens: 200, input_token_details: { audio_tokens: 600, text_tokens: 400, cached_tokens: 300, cached_tokens_details: { audio_tokens: 200, text_tokens: 100 } }, output_token_details: { audio_tokens: 150, text_tokens: 50 } };
test("prices cached audio and text as subsets, not extra input", () => {
  const cost = priceUsage("VOICE", "gpt-realtime-2.1-mini", usage);
  assert.equal(cost.usd, .007366);
  assert.equal(cost.issue, null);
  assert.equal(cost.lines.reduce((n, item) => n + item.tokens, 0), 1200);
});
test("prices summaries including cached input and total output without adding reasoning twice", () => {
  const cost = priceUsage("SUMMARY", "gpt-5.4-mini", { input_tokens: 1000, input_tokens_details: { cached_tokens: 200 }, output_tokens: 100, output_tokens_details: { reasoning_tokens: 20 } });
  assert.equal(cost.usd, .001065);
});
test("prices transcription separately from voice", () => {
  const cost = priceUsage("TRANSCRIPTION", "gpt-4o-mini-transcribe", { input_tokens: 100, input_token_details: { audio_tokens: 100, text_tokens: 0 }, output_tokens: 20 });
  assert.equal(cost.usd, .000225);
});
test("unknown models, missing breakdowns and impossible counts remain unpriced", () => {
  for (const [model, data] of [["unknown", usage], ["gpt-realtime-2.1-mini", {}], ["gpt-realtime-2.1-mini", { ...usage, input_tokens: 1 }], ["gpt-realtime-2.1-mini", { ...usage, output_tokens: -1 }]]) {
    const cost = priceUsage("VOICE", String(model), data);
    assert.equal(cost.usd, null);
    assert.ok(cost.issue);
  }
});
test("conversion and forecast follow the selected assumptions", () => {
  assert.equal(convertCost(.1, 90, 18), 10.62);
  assert.equal(forecastCost(1, 100, .5, "gpt-realtime-2.1-mini"), 1.5);
});
