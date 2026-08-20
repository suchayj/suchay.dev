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
