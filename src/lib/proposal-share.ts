/**
 * プロポーザル締切カウントダウンのシェア用の共通処理。
 * ビルド時（ページ・OGP画像の生成）とブラウザ（シェアボタン）の両方から使うので、Node 専用の import は書かない。
 *
 * しくみ: X などはURLごとに OGP をキャッシュするため、残り日数ごとに別URL
 * （/proposal_countdown/share/7/ など）を用意し、それぞれに「あと7日」の OGP 画像を付ける。
 * シェアボタンはその時点の残り日数のURLをシェアする。
 */

export const DAY_MS = 24 * 60 * 60 * 1000;

/** 残り日数ごとのシェアURLを用意する最大日数（これより先はカウントダウンページ自体をシェアする） */
export const MAX_SHARE_DAYS = 60;

/** 'open'（日数なしの募集中）/ 'today'（締切当日）/ '1'〜（残り日数） */
export type ShareKey = string;

/** 締切までの残り日数。カウントダウンの「日」と同じく切り捨て */
export const daysLeft = (deadline: number, now: number) => Math.floor(Math.max(0, deadline - now) / DAY_MS);

/** その時点でシェアするキー。maxDays はビルド時に用意した日数の上限 */
export function shareKeyAt(deadline: number, now: number, maxDays: number): ShareKey {
  const days = daysLeft(deadline, now);
  if (days === 0) return 'today';
  return days <= maxDays ? String(days) : 'open';
}

export const sharePath = (key: ShareKey) =>
  key === 'open' ? '/proposal_countdown/' : `/proposal_countdown/share/${key}/`;

export const ogImagePath = (key: ShareKey) => `/proposal_countdown/ogp/${key}.png`;

const DOW = ['日', '月', '火', '水', '木', '金', '土'];

/** 締切を日本時間で分解する（実行環境のタイムゾーンに左右されないよう UTC+9 で計算） */
export function deadlineParts(deadline: number) {
  const jst = new Date(deadline + 9 * 60 * 60 * 1000);
  return {
    month: jst.getUTCMonth() + 1,
    date: jst.getUTCDate(),
    dow: DOW[jst.getUTCDay()],
    time: `${String(jst.getUTCHours()).padStart(2, '0')}:${String(jst.getUTCMinutes()).padStart(2, '0')}`,
  };
}

/** シェア文・ページタイトルに使う一文 */
export function shareMessage(key: ShareKey, deadline: number): string {
  const d = deadlineParts(deadline);
  if (key === 'open') return `プロポーザル募集中！締切は${d.month}/${d.date}(${d.dow}) ${d.time}`;
  if (key === 'today') return `プロポーザル締切は本日${d.time}まで！`;
  return `プロポーザル締切まであと${key}日！`;
}

/** X の投稿画面のURL */
export function xIntentUrl(text: string, url: string) {
  return `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}
