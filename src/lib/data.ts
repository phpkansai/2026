import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

const DATA_DIR = path.resolve(process.cwd(), 'src/data');

function loadYaml<T>(file: string): T {
  const raw = fs.readFileSync(path.join(DATA_DIR, file), 'utf8');
  return parse(raw) as T;
}

export interface SponsorTier {
  id: string;
  label: string;
  columns: number;
  /** fortee のプラン名（name / name_en）のうち、このランクとして扱うもの。省略時は id と label */
  plans?: string[];
}

export interface CtaLink {
  label: string;
  /** "#xxx" ならページ内スクロール、http で始まれば外部リンク */
  href: string;
}

export interface RecruitItem {
  icon: 'proposal' | 'sponsor' | 'request' | string;
  title: string;
  /** open（募集中・上段に大きく） / closed（受付終了・下段に小さく）。省略時は open */
  status?: 'open' | 'closed';
  deadline?: string;
  description?: string;
  button: string;
  url: string;
  /** open のカードを1列で横いっぱいに表示する */
  wide?: boolean;
}

export interface SiteConfig {
  url: string;
  event: {
    name: string;
    name_en: string;
    date_label: string;
    date_iso: string;
    description: string;
  };
  venue: {
    name: string;
    postal: string;
    address: string;
    access: string;
    map_embed_url: string;
    map_link_url: string;
  };
  fortee: { slug: string; base_url: string };
  cta: {
    /** ヒーローの主ボタン（ピンク塗り）。ナビ末尾のリンクにも使う */
    primary: CtaLink;
    /** ヒーローの副ボタン（白抜き）。省略すると出ない */
    secondary?: CtaLink;
  };
  links: {
    proposal: string;
    timetable_external: string;
    x: string;
    note: string;
  };
  analytics: { gtm_container_id?: string; ga_measurement_id?: string };
  redirects: Record<string, string>;
  sections: {
    news: boolean;
    note_articles: boolean;
    proposal: boolean;
    sponsors: boolean;
    speakers: boolean;
    individual_sponsors: boolean;
    staff: boolean;
    recruit: boolean;
    tickets: boolean;
    timetable_section: boolean;
    timetable: boolean;
  };
  preview?: { dummy_data?: boolean };
  timetable: {
    mode: 'auto' | 'internal' | 'external';
    title: string;
    button_external: string;
    button_internal: string;
  };
  news: { limit: number };
  note_articles: { limit: number; more_label?: string };
  message: {
    title: string;
    lead: string[];
    pillars: { title: string; body: string }[];
    body: string[];
    signature: string[];
  };
  overview: {
    eligibility: { label: string; body: string[] };
    show_venue_card: boolean;
  };
  tickets: {
    title: string;
    peatix_url: string;
    button: string;
    sticker_deadline_label: string;
    regular: { title: string; price: string };
    invite: {
      title: string;
      price: string;
      discount_label: string;
      min_quantity: number;
      link_label: string;
      page: string;
    };
    party_ticket?: boolean;
  };
  recruit: {
    title: string;
    /** open のカードが1つも無いときの見出し */
    title_closed?: string;
    /** closed カードのバッジと下段の小見出し */
    closed_label?: string;
    items: RecruitItem[];
  };
  proposal: { title: string; body: string; button_label: string };
  proposal_countdown: {
    deadline: string;
    deadline_label: string;
    grace_minutes: number;
    about: string[];
    theme: string;
    requestalk: { body: string; link_label: string; url: string };
  };
  sponsor_tiers: SponsorTier[];
  sponsors: { title: string; description: string[]; empty: string };
  individual_sponsors: { title: string; description: string[]; empty: string; plans: string[] };
  speakers: { title: string; description: string[]; empty: string };
  staff: { title: string; description: string[]; empty: string };
  footer: {
    organizers: { label: string; url?: string }[];
    organizer_note: string;
    organizer_note_link?: { label: string; url: string };
    copyright: string;
    past_events: { label: string; url: string }[];
  };
}

/**
 * sponsors.yaml の1件。fortee に同名のスポンサーがいればロゴ・URLの補完に使い、
 * いなければそのまま追加表示する。
 */
export interface SponsorEntry {
  name: string;
  tier: string;
  url?: string;
  logo?: string;
}

export interface LocalNews {
  date: string;
  title: string;
  url?: string;
}

/**
 * timetable.yaml の1件。fortee のタイムテーブルが空のときに使うサイト独自のタイムテーブル。
 * start / end は "10:30" のような時刻（日付は event.date_iso）か ISO 8601 の日時。
 */
export interface LocalTimetableItem {
  track: string;
  start: string;
  end: string;
  title: string;
  /** talk（トーク） / timeslot（休憩・オープニングなどの枠）。省略時は speaker があれば talk */
  type?: 'talk' | 'timeslot';
  speaker?: string;
  /** X のハンドル（@ 無し） */
  speaker_twitter?: string;
  abstract?: string;
  url?: string;
}

export interface StaffLeader {
  /** 表示する役職名（バッジ） */
  role: string;
  /** X のハンドル（@ 無し）。fortee のスタッフのうちこのハンドルの人をこの役職として先頭に出す */
  twitter: string;
}

export interface StaffConfig {
  leaders: StaffLeader[];
  role_order: string[];
  extra: { name: string; role?: string; url?: string; image?: string }[];
  hide: string[];
}

export const site = loadYaml<SiteConfig>('site.yaml');
export const sponsors = loadYaml<SponsorEntry[]>('sponsors.yaml') ?? [];
export const localNews = loadYaml<LocalNews[]>('news.yaml') ?? [];
export const staffConfig = loadYaml<StaffConfig>('staff.yaml');
export const localTimetable = loadYaml<LocalTimetableItem[]>('timetable.yaml') ?? [];
