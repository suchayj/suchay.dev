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
fields remain empty locally. Set `TRUST_ANALYTICS_PROXY=true` only when Nginx
is configured to replace client-supplied `x-geo-country`, `x-geo-region`, and
`x-geo-city` headers with trusted values. CareerOS, login, API, asset, and
authenticated-owner traffic are excluded.

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
