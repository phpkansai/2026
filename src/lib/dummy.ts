/**
 * 開発サーバー（npm run dev / docker compose up）でのみ使うダミーデータ。
 * site.yaml の preview.dummy_data が true のとき、空のセクションをグレーの仮要素で埋めて見た目を確認できる。
 * npm run build（本番ビルド）では常に無効。
 */
import { site } from './data';
import type { Person } from './people';

export const dummyEnabled = import.meta.env.DEV && Boolean(site.preview?.dummy_data);

export function dummyPeople(count: number, opts: { badge?: string; withHandle?: boolean } = {}): Person[] {
  if (!dummyEnabled) return [];
  return Array.from({ length: count }, () => ({
    name: 'なまえ',
    handle: opts.withHandle === false ? undefined : 'hoge',
    badge: opts.badge,
    dummy: true,
  }));
}
