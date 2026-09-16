FROM --platform=linux/amd64 node:22.23.1-bullseye-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci --include=dev
COPY . .
ARG COMMIT_SHA
ENV NODE_ENV=production
RUN npx prisma generate
RUN npm run build
RUN npm prune --omit=dev
RUN node deployment/package.mjs "$COMMIT_SHA"
FROM scratch AS bundle
COPY --from=build /export/ /
