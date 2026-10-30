/**
 * サイト内タイムテーブルのデータ。
 *   1. fortee の timetable API（ビルド時取得）
 *   2. 空なら src/data/timetable.yaml
 *   3. 開発サーバーで preview.dummy_data が true なら、空き枠（45分枠 / 20分枠 / LT など）をグレーの仮トークで埋める
 */
import { site, localTimetable, type LocalTimetableItem } from './data';
import { dummyEnabled } from './dummy';
import { fetchTimetable, type ForteeTimetableItem } from './fortee';

export interface TimetableSpeaker {
  name: string;
  twitter?: string;
  avatar_url?: string;
}

export interface TimetableItem {
  type: 'talk' | 'timeslot';
  title: string;
  abstract?: string;
  track: { name: string; sort: number };
  starts_at: string; // ISO
  ends_at: string; // ISO
  url?: string;
  speaker?: TimetableSpeaker;
  tags?: { name: string; color_text?: string; color_background?: string }[];
  /** 開発サーバー用の仮データ */
  dummy?: boolean;
}

export interface TimetableTrack {
  name: string;
  sort: number;
  items: TimetableItem[];
}

const addMinutes = (iso: string, min: number) => new Date(new Date(iso).getTime() + min * 60000).toISOString();

/** "10:30" → event.date_iso の日時（JST）。ISO 8601 ならそのまま */
function toIso(value: string): string {
  if (/^\d{1,2}:\d{2}$/.test(value)) {
    const [h, m] = value.split(':').map(Number);
    return `${site.event.date_iso}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00+09:00`;
  }
  return value;
}

function fromFortee(i: ForteeTimetableItem): TimetableItem {
  return {
    type: i.type === 'talk' ? 'talk' : 'timeslot',
    title: i.title,
    abstract: i.abstract?.trim() || undefined,
    track: i.track,
    starts_at: i.starts_at,
    ends_at: addMinutes(i.starts_at, i.length_min),
    url: i.url,
    speaker: i.speaker ? { name: i.speaker.name, twitter: i.speaker.twitter, avatar_url: i.speaker.avatar_url } : undefined,
    tags: i.tags,
  };
}

function fromLocal(items: LocalTimetableItem[]): TimetableItem[] {
  const trackOrder: string[] = [];
  return items.map((i) => {
    if (!trackOrder.includes(i.track)) trackOrder.push(i.track);
    const type = i.type ?? (i.speaker ? 'talk' : 'timeslot');
    return {
      type,
      title: i.title,
      abstract: i.abstract?.trim() || undefined,
      track: { name: i.track, sort: trackOrder.indexOf(i.track) + 1 },
      starts_at: toIso(i.start),
      ends_at: toIso(i.end),
      url: i.url,
      speaker: i.speaker ? { name: i.speaker, twitter: i.speaker_twitter } : undefined,
    };
  });
}

/** fortee の「45分枠」「20分枠」「LT」のような、トークが入る予定の空き枠か */
const isOpenSlot = (i: TimetableItem) => i.type === 'timeslot' && /枠|LT|セッション|トーク/i.test(i.title);

const DUMMY_ABSTRACT =
  'ダミーテキストダミーテキストダミーテキストダミーテキストダミーテキストダミーテキストダミーテキストダミーテキスト。';

function fillDummy(items: TimetableItem[]): TimetableItem[] {
  if (!dummyEnabled) return items;
  return items.map((i) =>
    isOpenSlot(i)
      ? {
          ...i,
          type: 'talk',
          title: /LT/i.test(i.title) ? 'LTのタイトルが入ります' : 'トークのタイトルが入ります',
          abstract: DUMMY_ABSTRACT,
          speaker: { name: 'なまえ', twitter: 'hoge' },
          dummy: true,
        }
      : i,
  );
}

export async function loadTimetable(): Promise<TimetableItem[]> {
  const fortee = (await fetchTimetable()).map(fromFortee);
  const items = fortee.length > 0 ? fortee : fromLocal(localTimetable);
  return fillDummy(items);
}

/** トラック順 → 開始時刻順に並べて、トラックごとにまとめる */
export function groupByTrack(items: TimetableItem[]): TimetableTrack[] {
  const tracks = [...new Map(items.map((i) => [i.track.name, i.track])).values()].sort((a, b) => a.sort - b.sort);
  return tracks.map((t) => ({
    name: t.name,
    sort: t.sort,
    items: items
      .filter((i) => i.track.name === t.name)
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()),
  }));
}

/**
 * 全トラックの開始・終了時刻を集めて、時刻 → グリッドの行番号の対応を作る。
 * 同じ時刻は同じ行境界に乗るので、トラックごとに内容量が違っても縦位置が揃う。
 * 行番号は 1 始まり（1行目はトラック名の見出しに使うので、時刻の行は firstRow から）。
 */
export interface TimeGrid {
  /** 行境界の時刻（ISO、昇順・重複なし） */
  boundaries: string[];
  /** 時刻の行は何行目から始まるか */
  firstRow: number;
  /** 枠の grid-row（"start / end"） */
  rowOf: (item: TimetableItem) => string;
  /** 軸に出す時刻（何かが始まる時刻だけ）と、その行番号 */
  axis: { time: string; row: number }[];
}

export function buildTimeGrid(items: TimetableItem[], firstRow = 2): TimeGrid {
  const ms = (iso: string) => new Date(iso).getTime();
  const times = [...new Set(items.flatMap((i) => [ms(i.starts_at), ms(i.ends_at)]))].sort((a, b) => a - b);
  const index = new Map(times.map((t, k) => [t, k]));
  const rowAt = (iso: string) => firstRow + (index.get(ms(iso)) ?? 0);
  const startTimes = new Set(items.map((i) => ms(i.starts_at)));
  return {
    boundaries: times.map((t) => new Date(t).toISOString()),
    firstRow,
    rowOf: (i) => `${rowAt(i.starts_at)} / ${rowAt(i.ends_at)}`,
    axis: times
      .filter((t) => startTimes.has(t))
      .map((t) => ({ time: new Date(t).toISOString(), row: firstRow + (index.get(t) ?? 0) })),
  };
}

/** ISO → "10:30"（JST） */
export function fmtTime(iso: string): string {
  const d = new Date(iso);
  const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return `${String(jst.getUTCHours()).padStart(2, '0')}:${String(jst.getUTCMinutes()).padStart(2, '0')}`;
}

/** タイムテーブルに「トーク」が1件でもあるか（サイト内ページへ誘導してよいかの判定） */
export const hasTalks = (items: TimetableItem[]) => items.some((i) => i.type === 'talk' && !i.dummy);
