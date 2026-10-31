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
  cta: { label: string; href: string };
  links: {
    register: string;
    proposal: string;
    timetable_external: string;
    x: string;
    note: string;
  };
  analytics: { gtm_container_id?: string; ga_measurement_id?: string };
  redirects: Record<string, string>;
  sections: {
    news: boolean;
    proposal: boolean;
    sponsors: boolean;
    staff: boolean;
    recruit: boolean;
    timetable: boolean;
  };
  timetable: { mode: 'auto' | 'internal' | 'external' };
  news: { limit: number };
  message: { title: string; lead: string[]; body: string[]; signature: string[] };
  overview: {
    eligibility: { label: string; body: string[] };
    show_venue_card: boolean;
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
  footer: {
    organizer: string;
    copyright: string;
    past_events: { label: string; url: string }[];
  };
}

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

export interface StaffConfig {
  role_order: string[];
  extra: { name: string; role?: string; url?: string; image?: string }[];
  hide: string[];
}

export const site = loadYaml<SiteConfig>('site.yaml');
export const sponsors = loadYaml<SponsorEntry[]>('sponsors.yaml') ?? [];
export const localNews = loadYaml<LocalNews[]>('news.yaml') ?? [];
export const staffConfig = loadYaml<StaffConfig>('staff.yaml');
