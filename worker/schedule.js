// Decides whether the scheduled run should release a new photo.
// lastPublishedAt and now are epoch milliseconds; lastPublishedAt may be null.
export function shouldPublish({ lastPublishedAt, now, everyDays, queued }) {
  if (!queued) return false;
  if (lastPublishedAt == null) return true;
  // Allow an hour of slack so a daily cron that fires a little early still counts.
  const interval = Number(everyDays) * 86_400_000 - 3_600_000;
  return now - lastPublishedAt >= interval;
}
