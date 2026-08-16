export function formatDuration(duration: number | null): string {
  if (duration === null || !Number.isFinite(duration)) {
    return "--:--";
  }

  const totalSeconds = Math.floor(duration);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
