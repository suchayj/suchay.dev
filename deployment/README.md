# Prebuilt production release

Commit all changes on `main`, start Docker Desktop, then run `npm run release`.
The command validates the app, builds a Linux x64 standalone package, includes
the generated Prisma client and migrations, pushes the exact commit, and publishes
the archive plus checksum on GitHub. Loom injects the production `.env`, runs
`prisma migrate deploy`, activates the release, restarts PM2, and verifies health.

## Local disk retention

`npm run release` and `npm run release:build` keep only the newest two local Linux
bundles per application. Exports are staged and checksummed before installation.
Failed builds preserve the previous bundles and remove temporary output. A finally
block clears unused Docker BuildKit cache after both successful and failed builds.
This clears the selected builder cache across projects; rebuilds may take longer.
Containers, images and database volumes are preserved. GitHub and deployed releases
are unchanged. Test safeguards with `npm run test:release-retention`.
