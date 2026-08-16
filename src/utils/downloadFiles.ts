const windowsReservedNames = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;

export function sanitizeFileName(value: string) {
  const withoutControlCharacters = Array.from(value, (character) =>
    character.charCodeAt(0) < 32 ? "_" : character,
  ).join("");
  const sanitized = withoutControlCharacters
    .replace(/[<>:"/\\|?*]/g, "_")
    .replace(/\s+/g, " ")
    .replace(/[. ]+$/g, "")
    .trim()
    .slice(0, 180);

  if (!sanitized) return "未命名视频";
  return windowsReservedNames.test(sanitized) ? `_${sanitized}` : sanitized;
}

export function getUrlExtension(
  url: string | null,
  fallback: `.${string}`,
) {
  if (!url) return fallback;

  try {
    const match = new URL(url).pathname.match(/\.([a-zA-Z0-9]{2,5})$/);
    return match ? `.${match[1]!.toLowerCase()}` : fallback;
  } catch {
    return fallback;
  }
}

export function joinDownloadPath(base: string, ...parts: string[]) {
  const separator = base.includes("\\") ? "\\" : "/";
  const normalizedBase = base.trim().replace(/[\\/]+$/g, "");
  const normalizedParts = parts.map((part) =>
    part.replace(/^[\\/]+|[\\/]+$/g, ""),
  );

  return [normalizedBase, ...normalizedParts]
    .filter(Boolean)
    .join(separator);
}
