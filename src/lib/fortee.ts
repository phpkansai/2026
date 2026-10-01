/**
 * fortee 公開APIからビルド時にデータを取得する。
 * 取得に失敗した場合は空配列を返し、ビルドは止めない（警告のみ）。
 */
import { site } from './data';

const BASE = `${site.fortee.base_url}/${site.fortee.slug}/api`;
const TIMEOUT_MS = 15000;

const cache = new Map<string, Promise<unknown>>();

async function getJson<T>(pathname: string, fallback: T): Promise<T> {
  const url = `${BASE}/${pathname}`;
  if (!cache.has(url)) {
    cache.set(
      url,
      (async () => {
        try {
          const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return (await res.json()) as T;
        } catch (e) {
          console.warn(`[fortee] ${url} の取得に失敗しました: ${(e as Error).message}`);
          return fallback;
        }
      })(),
    );
  }
  return cache.get(url) as Promise<T>;
}

// ---- NEWS ----
export interface ForteeNews {
  id: string;
  title: string;
  published: string; // ISO
  url?: string;
  body_html?: string;
  body_plain?: string;
}

export async function fetchNews(): Promise<ForteeNews[]> {
  const data = await getJson<{ news: ForteeNews[] }>('news', { news: [] });
  return data.news ?? [];
}

// ---- STAFF ----
export interface ForteeStaff {
  id: string;
  name: string;
  url?: string;
  avatar_url?: string;
}

/** { "コアスタッフ": [...], "実行委員長": [...] } の形で返る */
export async function fetchStaff(): Promise<Record<string, ForteeStaff[]>> {
  const data = await getJson<{ staff: Record<string, ForteeStaff[]> }>('staff?type=simple', {
    staff: {},
  });
  return data.staff ?? {};
}

// ---- TIMETABLE ----
export interface ForteeTimetableItem {
  type: 'talk' | 'timeslot' | string;
  uuid: string;
  url?: string;
  title: string;
  abstract?: string | null;
  track: { name: string; sort: number };
  starts_at: string; // ISO
  length_min: number;
  speaker?: {
    name: string;
    kana?: string;
    twitter?: string;
    avatar_url?: string;
  };
  tags?: { name: string; color_text?: string; color_background?: string }[];
}

export async function fetchTimetable(): Promise<ForteeTimetableItem[]> {
  const data = await getJson<{ timetable: ForteeTimetableItem[] }>('timetable', {
    timetable: [],
  });
  return data.timetable ?? [];
}

/** タイムテーブルのナビ先を決める */
export async function resolveTimetableHref(): Promise<string> {
  const mode = site.timetable.mode;
  if (mode === 'internal') return '/timetable/';
  if (mode === 'external') return site.links.timetable_external;
  const items = await fetchTimetable();
  return items.length > 0 ? '/timetable/' : site.links.timetable_external;
}
