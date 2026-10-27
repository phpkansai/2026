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
  /** X / GitHub などのプロフィールURL（X の場合はここから @ハンドルを取り出す） */
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

// ---- SPONSORS ----
export interface ForteeSponsor {
  id: string;
  name: string;
  kana?: string;
  url?: string;
  pr?: string;
  twitter?: string;
  /** ロゴ画像のURL（fortee でロゴをアップロードすると付く。無い間はキー自体が無い） */
  avatar?: string;
}

export interface ForteeSponsorPlan {
  /** プラン名（fortee の管理画面で付けた名前。例: gold / ゴールドプラン / 個人スポンサー） */
  name: string;
  name_en?: string;
  sponsors: ForteeSponsor[];
}

/** スポンサー一覧（プランごと）。同じ会社が複数プランに入ることもある */
export async function fetchSponsorPlans(): Promise<ForteeSponsorPlan[]> {
  const data = await getJson<{ sponsor_plans: ForteeSponsorPlan[] }>('sponsors', {
    sponsor_plans: [],
  });
  return data.sponsor_plans ?? [];
}

// ---- PROPOSALS ----
export interface ForteeProposal {
  uuid: string;
  url: string;
  title: string;
  abstract?: string;
  accepted: boolean;
  speaker: {
    name: string;
    kana?: string;
    twitter?: string;
    avatar_url?: string;
  };
  created: string; // ISO
}

/** プロポーザルAPIのURL（ブラウザからの取得にも使う） */
export const proposalsApiUrl = `${BASE}/proposals`;

export async function fetchProposals(): Promise<ForteeProposal[]> {
  const data = await getJson<{ proposals: ForteeProposal[] }>('proposals', { proposals: [] });
  return data.proposals ?? [];
}

/** 採択済みプロポーザルのみ（スピーカー一覧に使う） */
export async function fetchAcceptedProposals(): Promise<ForteeProposal[]> {
  const data = await getJson<{ proposals: ForteeProposal[] }>('proposals/accepted', {
    proposals: [],
  });
  return (data.proposals ?? []).filter((p) => p.accepted !== false);
}

/** タイムテーブルのナビ先を決める */
export async function resolveTimetableHref(): Promise<string> {
  const mode = site.timetable.mode;
  if (mode === 'internal') return '/timetable/';
  if (mode === 'external') return site.links.timetable_external;
  const items = await fetchTimetable();
  return items.length > 0 ? '/timetable/' : site.links.timetable_external;
}
