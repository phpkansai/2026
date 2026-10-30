/**
 * note（note.com）の RSS からビルド時に最新記事を取得する。
 * RSS の URL は site.yaml の links.note に "/rss" を付けたもの。
 * 取得に失敗した場合は空配列を返し、ビルドは止めない（警告のみ）。
 */
import { site } from './data';

const TIMEOUT_MS = 15000;

export interface NoteArticle {
  title: string;
  url: string;
  /** 公開日時（ISO） */
  published: string;
  /** サムネイル画像の URL（見出し画像を設定していない記事では undefined） */
  thumbnail?: string;
}

let cache: Promise<NoteArticle[]> | undefined;

export function fetchNoteArticles(): Promise<NoteArticle[]> {
  cache ??= load();
  return cache;
}

async function load(): Promise<NoteArticle[]> {
  const url = `${site.links.note.replace(/\/+$/, '')}/rss`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return parseRss(await res.text());
  } catch (e) {
    console.warn(`[note] ${url} の取得に失敗しました: ${(e as Error).message}`);
    return [];
  }
}

/** RSS 2.0 の <item> を切り出して必要な項目だけ取り出す（依存を増やさないため正規表現で処理） */
export function parseRss(xml: string): NoteArticle[] {
  const items: NoteArticle[] = [];
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const body = m[1];
    const title = text(body, 'title');
    const url = text(body, 'link');
    const published = text(body, 'pubDate');
    if (!title || !url || !published) continue;
    const date = new Date(published);
    if (Number.isNaN(date.getTime())) continue;
    items.push({
      title,
      url,
      published: date.toISOString(),
      thumbnail: text(body, 'media:thumbnail') || undefined,
    });
  }
  return items;
}

function text(body: string, tag: string): string {
  const m = body.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`));
  if (!m) return '';
  const raw = m[1].trim();
  const cdata = raw.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/);
  return (cdata ? cdata[1] : decode(raw)).trim();
}

function decode(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&');
}
