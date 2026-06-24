const MIN_INTERVAL_MS = 5_000;

const lastMessageTimestamps = new Map<string, number>();

setInterval(
  () => {
    const now = Date.now();
    for (const [id, ts] of lastMessageTimestamps) {
      if (now - ts > MIN_INTERVAL_MS) lastMessageTimestamps.delete(id);
    }
  },
  60 * 60 * 1000,
);

export function checkAndActivateCooldown(userId: string): boolean {
  const now = Date.now();
  const last = lastMessageTimestamps.get(userId) ?? 0;

  if (now - last < MIN_INTERVAL_MS) return false;

  lastMessageTimestamps.set(userId, now);
  return true;
}
