# Visitor analytics retention

CareerOS exposes every retained `PageVisit` through authenticated, database-backed pagination. The default retention window is six calendar months; set `ANALYTICS_RETENTION_MONTHS=9` to use nine months. Other values fall back to six.

The cutoff is calculated from the cleanup run instant by subtracting calendar months in Asia/Kolkata. Page views with `visitedAt` and engagement events with `occurredAt` strictly before that cutoff are independently eligible to expire. Neither analytics model has foreign-key children, so cleanup does not alter users, authentication sessions, jobs, or companies.

Run `npm run analytics:retention:dry-run` to report the cutoff and eligible-row count without changing data. The underlying cleanup service deletes at most 500 eligible rows per explicit non-dry invocation (configurable up to 5,000), oldest first, and can be repeated until the remaining count reaches zero. No deletion command or schedule is enabled by this change.

Retention cannot restore records that were already deleted or visits that were never collected. Review the production dry-run result before authorizing any deletion or scheduler.
