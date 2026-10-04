# suchay.dev

Suchay Janbandhu's personal engineering site, built with the official Next.js App Router.

## Requirements

- Node.js `>=22.13.0`
- npm

## Local development

```bash
npm install --include=dev
docker compose up -d postgres
npm run db:migrate
npm run db:seed
npm run dev
```

The development server runs at `http://localhost:3010`.

CareerOS is available at `/login`. Copy `.env.example` to `.env` when setting
up a fresh checkout. The example connection uses the local `careeros`
PostgreSQL 16 container on port `5436`; do not reuse its development password
for a hosted environment.

The local seed creates the single CareerOS owner account:
`suchayjanbandhu@gmail.com` / `Suchay@123`. Change this development default from the
Profile page when appropriate.

Public portfolio routes record privacy-conscious first-party page visits in
PostgreSQL. Anonymous visitor and 30-minute session keys are random HTTP-only
cookies; raw IP addresses and browser fingerprints are not stored. Geographic
fields remain empty for localhost/private IPs. Country, region and city are
resolved automatically from the public IP supplied by the production Nginx
proxy. No enable setting, API key or external lookup service is needed. Nginx
must overwrite `X-Real-IP` with `$remote_addr`, and the app must only be reachable
through this proxy (the production listener binds to `127.0.0.1`). Incoming
`X-Forwarded-For` and untrusted geographic headers are never used.

Location is resolved offline using DB-IP Lite data distributed in
`@ip-location-db/dbip-city-mmdb` and the `maxmind` reader. The database is pinned
with dependencies, explicitly included in standalone builds, and each IP-family
reader is loaded once on demand. No visitor IP is sent to a third party, logged,
or persisted. Database lookup failures still record the page visit with empty
location. IP location is approximate and may reflect a VPN/network exit point.
The pinned database snapshot is June 2026; refresh data from the project's
current GitHub releases as part of regular dependency maintenance because its
npm data distribution has been retired: https://github.com/ip-location-db/ip-location-db.
Data is CC BY 4.0; the visitor dashboard links to https://db-ip.com for attribution.

`TRUST_ANALYTICS_PROXY=true` remains available for deployments where Nginx
replaces all client-supplied `x-geo-country`, `x-geo-region`, and `x-geo-city`
headers with trusted values. These fields take priority over local IP lookup;
leave this setting false when Nginx does not supply them. CareerOS, login, API,
asset, and authenticated-owner traffic are excluded. Existing visits without
location cannot be backfilled because their IPs were not stored.

Run location regression tests with `node --test tests/visitor-location.test.mjs`.


## Validation

```bash
npm run lint
npm run typecheck
npm test
```

`npm test` creates an optimized production build and validates the rendered application through the official Next.js Node runtime.

## Production runtime

```bash
npm run build
npm start
```

The production server binds to `127.0.0.1:3006`. Loom deploys exact immutable commits, manages the `suchay-dev-prod` PM2 process, and verifies the local health endpoint before confirming a release. Nginx remains the public reverse proxy and TLS endpoint.
