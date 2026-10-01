/**
 * public/images/ に決まった名前で画像を置くと自動で表示される「スロット」。
 * 対応拡張子の順に探し、見つかったものの公開パスを返す。無ければ null。
 */
import fs from 'node:fs';
import path from 'node:path';

const PUBLIC_IMAGES = path.resolve(process.cwd(), 'public/images');
const EXTENSIONS = ['svg', 'png', 'webp', 'jpg', 'jpeg', 'gif'];

export type SlotName =
  | 'logo-header'   // ヘッダー左のロゴ（横長）
  | 'hero-logo'     // ヒーローのロゴ一式（マスコット＋タイトル文字が1枚になったもの）。あれば hero-mascot / hero-title は使われない
  | 'hero-mascot'   // ヒーロー上部のマスコット（hero-logo が無い場合）
  | 'hero-title'    // ヒーローのタイトルロゴ（hero-logo が無い場合）
  | 'cloud'         // 雲の装飾（1枚。各所で使い回し）
  | 'skyline'       // フッター上の京都の街並みシルエット（横長）
  | 'footer-mascot' // フッターのマスコット
  | 'ogp'           // OGP画像（1200x630推奨）
  | 'favicon';      // ファビコン

export function slot(name: SlotName): string | null {
  for (const ext of EXTENSIONS) {
    const file = path.join(PUBLIC_IMAGES, `${name}.${ext}`);
    if (fs.existsSync(file)) return `/images/${name}.${ext}`;
  }
  return null;
}
