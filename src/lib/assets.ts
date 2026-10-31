/**
 * src/assets/ 配下の画像をファイル名で引けるようにする。
 * ここに置かれた画像は Astro の <Image> で最適化（リサイズ・WebP化）される。
 */
import type { ImageMetadata } from 'astro';

const sponsorFiles = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/sponsors/*.{png,jpg,jpeg,webp,svg,gif}',
  { eager: true },
);
const staffFiles = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/staff/*.{png,jpg,jpeg,webp,svg,gif}',
  { eager: true },
);

function byBasename(files: Record<string, { default: ImageMetadata }>) {
  const map = new Map<string, ImageMetadata>();
  for (const [p, mod] of Object.entries(files)) {
    map.set(p.split('/').pop()!, mod.default);
  }
  return map;
}

export const sponsorLogos = byBasename(sponsorFiles);
export const staffImages = byBasename(staffFiles);

// PHPerシール説明ページ（/phper-sticker/）の画面例。ファイル名は src/assets/phper-sticker/README.md 参照
const phperStickerFiles = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/phper-sticker/*.{png,jpg,jpeg,webp,svg,gif}',
  { eager: true },
);
export const phperStickerImages = byBasename(phperStickerFiles);
