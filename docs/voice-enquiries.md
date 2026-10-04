# Website voice enquiries

## Behaviour

Public phone links/numbers are removed from About, Contact and both resume surfaces.
Visitors submit name, email, reason, context and consent; international phone is optional.
Their details are self-reported, not verified. No OTP, telecom provider, transfer or phone dialling is involved.
Written enquiries work even when voice is disabled. An enquiry is committed before microphone permission is requested.
CareerOS → Enquiries is protected by the existing owner session and supports status updates, pagination, transcripts, summaries and explicit deletion.
With explicit recording consent, microphone and assistant audio are mixed in the browser and uploaded incrementally to private DigitalOcean Spaces objects under projects/suchay.dev/conversations/<enquiry-id>/. Owner-only playback issues a 60-second signed URL; the object itself stays private. Existing conversations cannot gain recordings retrospectively. Interrupted recordings are marked partial. Deleting an enquiry removes its recording and temporary parts before deleting the database row. See /privacy for the visitor disclosure.

## Enable through Loom

Deploy the new commit through Loom: install dependencies, `npx prisma generate`, `npx prisma migrate deploy`, build/restart according to the deployment profile.
Additive migrations include `20260916120000_voice_enquiries` and `20261005010000_voice_recordings`; existing enquiries have recording consent off.
Configure server-side environment variables (never NEXT_PUBLIC_):

- `APP_ORIGIN=https://suchay.dev` (exact origin; use http://localhost:3010 during local development)
- `OPENAI_API_KEY`: a project API key with access to the selected voice and summary models
- `VOICE_ENABLED=true` (defaults off; requires recording storage configured)
- `DO_SPACES_KEY`, `DO_SPACES_SECRET`, `DO_SPACES_REGION`, `DO_SPACES_BUCKET`, `DO_SPACES_ENDPOINT`: server-only existing Spaces credentials and regional endpoint; all recordings use private ACLs.
- `OPENAI_REALTIME_MODEL=gpt-realtime-2.1` (tested production choice; the code falls back to mini if unset)
- `OPENAI_SUMMARY_MODEL=gpt-5.4-mini`
- `VOICE_MAX_SECONDS=180` (maximum allowed configuration 300)
- `VOICE_DAILY_CALL_LIMIT=20` (maximum allowed configuration 100)
- `TRUST_VOICE_PROXY=true` only after confirming Nginx overwrites X-Real-IP with the real client address; otherwise leave false.

The assistant receives the submitted topic and message as untrusted context, alongside the public portfolio knowledge. Implementation answers use concrete project scenarios and documented component flows. The Vocalink knowledge includes Suchay’s 5 October clarification: three immediate retries at 10/20/40-second waits, next-day recovery at 22:00 UTC through feedback-raw, and feedback IDs published to feedback-status-raw. Payload feedbackCallCount increases per failed daily recovery cycle; recovery stops after three failed daily cycles. The initial counter value and handling after cutoff are unspecified. Email and phone are not included in the model instructions.

No key is committed. Restart after changing environment values. The inbox displays whether voice is configured.
Check the project’s provider spending settings too: the app limits session admission and duration, not a guaranteed rupee amount.

## Runtime and failure behaviour

Requires the existing long-running Node/PM2 deployment, not a short-lived serverless host.
The server creates the WebRTC session with the secret key and attaches a WebSocket sideband before giving the browser its answer.
Only provider events captured server-side are persisted as the voice transcript; the browser cannot upload a fabricated transcript or summary.
The sideband writes text incrementally, captures token totals, and ends calls after the configured duration.
Summary generation is server-side; if it fails, the original message and captured transcript remain accessible.
A microphone denial, connection failure, full daily quota, or absent key preserves the original written enquiry.
One session per enquiry; duplicate start requests are rejected under a PostgreSQL advisory lock.
Admission: three enquiries per caller/email/phone per rolling 24 hours; 100 total per rolling 24 hours; separately limited voice starts.
Identifiers are hashed, contact tokens are random and hashed at rest, and expire after 30 minutes. Public endpoints return no stored contact/transcript content.

Active sessions are process-owned. Normal navigation/end requests close calls. A forced process crash/redeployment can interrupt monitoring and its timer; the UI marks stale sessions as unconfirmed rather than completed. Schedule deployments outside active conversations. Multi-process end requests use the persisted provider call ID. These limits are not a substitute for provider-level spend controls or verified identity.
The daily admission cap cannot be bypassed by clearing cookies, but per-caller limits are weaker when trusted proxy IP handling is off. Contact details themselves remain unverified.

## Validation

`npm run build`, `npm run typecheck`, `npm run lint`, `node --test tests/*.test.mjs`.
Database integration tests: `node --env-file=.env --import tsx --test tests/voice-enquiries.integration.ts` against the local development database after migration. They create and remove only test enquiries.
Recording integration tests (mocked Spaces, real local database): `node --env-file=.env --experimental-test-module-mocks --import tsx --test tests/voice-recordings.integration.ts`.

Mocked provider lifecycle tests (no paid calls): `node --env-file=.env --experimental-test-module-mocks --import tsx --test tests/voice-runtime.integration.ts`.

The October audit exercised real Realtime WebRTC audio output, synthetic spoken input/transcription, server transcript persistence, AI summaries and usage events locally, alongside model answer evaluations and browser form checks. Production activation uses the normal Loom release workflow.

A real voice smoke test requires the API key: verify microphone permission, audible replies, mute/end, saved provider transcript and summary, timeout and owner-only inbox access. No live OpenAI request is made by the offline tests.

## Per-call cost tracking

CareerOS → Call costs (`/career/costs`) shows a rolling 30-day subtotal and paginated call breakdowns. Currency conversion and optional tax are user-entered assumptions, not a fetched bank rate. The forecast is labelled speech-only and excludes repeated context, text, transcription and summaries.

New calls store provider usage events separately for VOICE, TRANSCRIPTION and SUMMARY. Each event is deduplicated using enquiry + provider response/item ID, and saves its model, original usage counters, priced line items, standard USD cost and rate version. Cached tokens are subsets of input, not an additional charge. Historical rows are never repriced on page load. Missing usage, unsupported categories and unknown models remain unpriced. Older calls do not have enough information for an accurate backfill. Deleting an enquiry cascades to its usage records, so totals cover retained enquiries only.

Rates: `lib/voice/costs.ts`, verified 2026-09-16 from the official pricing and model pages. Model overrides without an explicit rate entry are shown as unpriced. Prices are calculated from recorded usage and are not invoice reconciliation; interrupted connections, missing final events, service-tier adjustments, discounts, FX and tax can affect the billed total. This app makes standard requests to api.openai.com.

Additive migration: `20260916160000_voice_costs`. Regenerate Prisma and restart the long-running local/production process after migration. Tests: `node --import tsx --test tests/voice-costs.test.ts`, plus the mocked provider lifecycle integration suite. No paid calls are needed for these tests.
