import type { GameInfo } from "../api/types";

const defaultGameIconSize = 64;

/** 选择不小于目标尺寸的最小图标，缺少变体时回退到原图 */
export function getGameIconUrl(
  game: Pick<GameInfo, "icon" | "icon_variants">,
  targetSize = defaultGameIconSize,
) {
  const variants = game.icon_variants ?? [];
  let bestLargerVariant: (typeof variants)[number] | undefined;
  let largestVariant: (typeof variants)[number] | undefined;

  for (const variant of variants) {
    if (!largestVariant || variant.size > largestVariant.size) {
      largestVariant = variant;
    }

    if (
      variant.size >= targetSize &&
      (!bestLargerVariant || variant.size < bestLargerVariant.size)
    ) {
      bestLargerVariant = variant;
    }
  }

  return bestLargerVariant?.url ?? largestVariant?.url ?? game.icon;
}
