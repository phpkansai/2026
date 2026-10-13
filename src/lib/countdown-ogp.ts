/**
 * プロポーザル締切カウントダウンの OGP 画像を、ビルド時点の「残り日数」から選ぶ。
 *
 * public/images/ogp-countdown/<残り日数>.png を探し、あれば /images/ogp-countdown/<残り日数>.png を返す。
 * 残り日数は日本時間の暦日で数える（10/14 に 10/31 締切なら 17、締切当日は 0）。
 * 画像が無い日数（締切後・用意した枚数より前）は null を返し、通常の OGP（public/images/ogp.*）になる。
 *
 * ビルドは毎日 0 時過ぎに自動で走らせる（.github/workflows/daily-rebuild.yml）。
 */
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.resolve(process.cwd(), 'public/images/ogp-countdown');
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** 日本時間での「日付の通し番号」。ビルド環境のタイムゾーン（Netlify は UTC）に依存しない */
const jstDayNumber = (ms: number) => Math.floor((ms + JST_OFFSET_MS) / DAY_MS);

/** 締切日までの残り暦日数（日本時間）。当日は 0、締切後は負の値 */
export function daysUntil(deadline: string, now = Date.now()): number {
  return jstDayNumber(new Date(deadline).getTime()) - jstDayNumber(now);
}

export function countdownOgp(deadline: string, now = Date.now()): { daysLeft: number | null; image: string | null } {
  const days = daysUntil(deadline, now);
  if (days < 0) return { daysLeft: null, image: null };
  const file = `${days}.png`;
  if (!fs.existsSync(path.join(DIR, file))) return { daysLeft: null, image: null };
  return { daysLeft: days, image: `/images/ogp-countdown/${file}` };
}
