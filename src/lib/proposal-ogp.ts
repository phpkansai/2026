/**
 * プロポーザル締切カウントダウンの OGP 画像をビルド時に生成する。
 * 既存の OGP 画像（public/images/ogp.*）の下部、日付・会場の帯を「プロポーザル締切まで あと◯日」の帯で覆う。
 * 文字は src/assets/fonts の M PLUS Rounded 1c（サイトの見出しと同じ書体）で描く。
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { site } from './data';
import { slot } from './slots';
import { MAX_SHARE_DAYS, daysLeft, deadlineParts, type ShareKey } from './proposal-share';

const FONT_DIR = path.resolve(process.cwd(), 'src/assets/fonts');
const FONT_FILE = path.join(FONT_DIR, 'MPLUSRounded1c-ExtraBold.ttf');
const FONT_NAME = 'Rounded Mplus 1c ExtraBold';
// フォントはファイルで直接渡すが、設定ファイルが無いと libvips が毎回エラーを出すので最小の設定を渡す
const FONTCONFIG = path.join(FONT_DIR, 'fonts.conf');
if (!process.env.FONTCONFIG_FILE && fs.existsSync(FONTCONFIG)) process.env.FONTCONFIG_FILE = FONTCONFIG;

const W = 1200;
const H = 630;
// 既存の ogp.png の日付・会場の帯（y=465〜550）をちょうど覆う位置。OGP 画像のデザインが変わったら合わせて調整する
const BAND = { x: 120, y: 452, w: 960, h: 150, radius: 24 };
const BAND_PADDING_X = 40;

const C = { purple: '#8568cd', pink: '#ff4d8b', text: '#2b2538' };

const deadline = new Date(site.proposal_countdown.deadline).getTime();

/** ビルド時に用意するキー。残り日数は今日の時点から締切まで（最大 MAX_SHARE_DAYS 日） */
export function shareKeys(): ShareKey[] {
  const max = Math.min(daysLeft(deadline, Date.now()), MAX_SHARE_DAYS);
  return ['open', 'today', ...Array.from({ length: max }, (_, i) => String(i + 1))];
}

export const maxShareDays = () => shareKeys().length - 2;

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// Pango のマークアップ。size は 1/1024 pt 単位（dpi 72 なので 1pt = 1px）
const span = (text: string, color: string, px: number) =>
  `<span foreground="${color}" size="${px * 1024}">${escape(text)}</span>`;
const gap = (px: number) => span(' ', C.text, px);

function markup(key: ShareKey): string {
  const d = deadlineParts(deadline);
  if (key === 'open') {
    return span('プロポーザル募集中！', C.pink, 46) + gap(28) + span(`締切 ${d.month}/${d.date}(${d.dow}) ${d.time}`, C.text, 40);
  }
  if (key === 'today') {
    return span('プロポーザル締切は', C.purple, 44) + gap(20) + span('本日', C.pink, 88) + gap(16) + span(`${d.time}まで！`, C.text, 52);
  }
  return span('プロポーザル締切まで', C.purple, 44) + gap(24) + span('あと', C.text, 44) + gap(12) + span(key, C.pink, 104) + gap(12) + span('日', C.text, 52);
}

function baseImage(): sharp.Sharp {
  const ogp = slot('ogp');
  if (ogp) return sharp(path.join(process.cwd(), 'public', ogp)).resize(W, H, { fit: 'cover' });
  // OGP 画像が無い場合は背景色だけ
  return sharp({ create: { width: W, height: H, channels: 4, background: '#fdeffc' } });
}

export async function renderShareOgp(key: ShareKey): Promise<Buffer> {
  const raw = await sharp({
    text: { text: markup(key), font: FONT_NAME, fontfile: FONT_FILE, rgba: true, dpi: 72 },
  })
    .png()
    .toBuffer();
  // 余白を詰めて帯の中央に置く。帯に収まらなければ縮める
  let text = await sharp(raw).trim().png().toBuffer();
  let { width = 0, height = 0 } = await sharp(text).metadata();
  const maxW = BAND.w - BAND_PADDING_X * 2;
  if (width > maxW) {
    text = await sharp(text).resize({ width: maxW }).png().toBuffer();
    ({ width = 0, height = 0 } = await sharp(text).metadata());
  }

  const band = Buffer.from(
    `<svg width="${W}" height="${H}"><rect x="${BAND.x}" y="${BAND.y}" width="${BAND.w}" height="${BAND.h}" rx="${BAND.radius}" fill="#fff"/></svg>`,
  );

  return baseImage()
    .composite([
      { input: band, top: 0, left: 0 },
      {
        input: text,
        top: Math.round(BAND.y + (BAND.h - height) / 2),
        left: Math.round((W - width) / 2),
      },
    ])
    .png()
    .toBuffer();
}
