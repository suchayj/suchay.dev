# Prebuilt production release

Commit all changes on `main`, start Docker Desktop, then run `npm run release`.
The command validates the app, builds a Linux x64 standalone package, includes
the generated Prisma client and migrations, pushes the exact commit, and publishes
the archive plus checksum on GitHub. Loom injects the production `.env`, runs
`prisma migrate deploy`, activates the release, restarts PM2, and verifies health.
