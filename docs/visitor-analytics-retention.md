# Visitor analytics retention

CareerOS exposes every retained `PageVisit` through authenticated, database-backed pagination. The default retention window is six calendar months; set `ANALYTICS_RETENTION_MONTHS=9` to use nine months. Other values fall back to six.

The cutoff is calculated from the cleanup run instant by subtracting calendar months. Records with `visitedAt` strictly before that cutoff are eligible to expire. `PageVisit` currently has no dependent database records or foreign-key children, so cleanup removes only the eligible page-view rows; it does not alter users, sessions, jobs, companies, or authentication data.

Run `npm run analytics:retention:dry-run` to report the cutoff and eligible-row count without changing data. The underlying cleanup service deletes at most 500 eligible rows per explicit non-dry invocation (configurable up to 5,000), oldest first, and can be repeated until the remaining count reaches zero. No deletion command or schedule is enabled by this change.

Retention cannot restore records that were already deleted or visits that were never collected. Review the production dry-run result before authorizing any deletion or scheduler.
