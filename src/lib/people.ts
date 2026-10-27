/**
 * 人物カード（スピーカー / 個人スポンサー / スタッフ）で共通に使う型とヘルパー。
 */
import type { ImageMetadata } from 'astro';

export interface Person {
  name: string;
  /** X のハンドル（@ 無し）。表示は "@handle" */
  handle?: string;
  /** カード全体のリンク先 */
  url?: string;
  /** 外部URLのアバター（fortee など） */
  avatarUrl?: string;
  /** src/assets 配下のローカル画像 */
  image?: ImageMetadata;
  /** 名前の下に出す役職バッジ（実行委員長など） */
  badge?: string;
  /** 開発用のダミー（グレーの丸で表示） */
  dummy?: boolean;
}

/** twitter フィールド、または X / Twitter のプロフィールURLから @ハンドルを取り出す */
export function twitterHandle(twitter?: string | null, url?: string | null): string | undefined {
  const t = twitter?.trim().replace(/^@/, '');
  if (t) return t;
  const m = url?.match(/^https?:\/\/(?:www\.|mobile\.)?(?:twitter|x)\.com\/@?([A-Za-z0-9_]{1,15})\/?(?:[?#].*)?$/i);
  return m?.[1];
}

/** ハンドルの比較用（大文字小文字・@ を無視） */
export function normalizeHandle(h?: string | null): string {
  return (h ?? '').trim().replace(/^@/, '').toLowerCase();
}

/** 名前の比較用（空白の違いを無視） */
export function normalizeName(n?: string | null): string {
  return (n ?? '').replace(/\s+/g, '').toLowerCase();
}
