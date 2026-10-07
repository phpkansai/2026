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
    items: {
      icon: 'proposal' | 'sponsor' | 'request' | string;
      title: string;
      deadline?: string;
      description?: string;
      button: string;
      url: string;
      wide?: boolean;
    }[];
  };
  proposal: { title: string; body: string; button_label: string };
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
